import { apiListRequest, apiRequest } from "@/lib/api/client";
import type { AuthSessionInfo, TokenResponse, User } from "@/lib/api/types";

export interface AccessTokenProvider {
  getAccessToken(): Promise<string | null>;
  refreshAccessToken?(): Promise<string | null>;
}

const ACCESS_TOKEN_KEY = "aether.auth.accessToken";
const REFRESH_TOKEN_KEY = "aether.auth.refreshToken";
const USER_KEY = "aether.auth.user";
let storageMigrated = false;

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getLegacySessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function migrateAuthStorage(): void {
  if (storageMigrated) return;
  storageMigrated = true;

  const browserStorage = getBrowserStorage();
  const sessionStorage = getLegacySessionStorage();
  if (!browserStorage) return;

  for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]) {
    const browserValue = browserStorage.getItem(key);
    if (browserValue !== null) continue;

    const sessionValue = sessionStorage?.getItem(key);
    if (sessionValue === null || sessionValue === undefined) continue;

    browserStorage.setItem(key, sessionValue);
    sessionStorage?.removeItem(key);
  }
}

function readStorageToken(): string | null {
  migrateAuthStorage();
  try {
    const raw = getBrowserStorage()?.getItem(ACCESS_TOKEN_KEY);
    return raw ?? null;
  } catch {
    return null;
  }
}

function writeStorageToken(token: string | null): void {
  migrateAuthStorage();
  try {
    const storage = getBrowserStorage();
    if (!storage) return;
    if (token) {
      storage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      storage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch { /* quota exceeded */ }
}

function readStorageRefreshToken(): string | null {
  migrateAuthStorage();
  try {
    const raw = getBrowserStorage()?.getItem(REFRESH_TOKEN_KEY);
    return raw ?? null;
  } catch {
    return null;
  }
}

function writeStorageRefreshToken(token: string | null): void {
  migrateAuthStorage();
  try {
    const storage = getBrowserStorage();
    if (!storage) return;
    if (token) {
      storage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      storage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch { /* quota exceeded */ }
}

function readStorageUser(): User | null {
  migrateAuthStorage();
  try {
    const raw = getBrowserStorage()?.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeStorageUser(user: User | null): void {
  migrateAuthStorage();
  try {
    const storage = getBrowserStorage();
    if (!storage) return;
    if (user) {
      storage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      storage.removeItem(USER_KEY);
    }
  } catch { /* quota exceeded */ }
}

let accessToken: string | null = null;
let currentUser: User | null = null;
let refreshPromise: Promise<string | null> | null = null;
let accessTokenProvider: AccessTokenProvider | null = null;

const memoryTokenProvider: AccessTokenProvider = {
  async getAccessToken() {
    return getStoredAccessToken();
  },
  async refreshAccessToken() {
    return refreshAccessToken();
  },
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  workspaceName?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export function configureAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider;
}

export function getAccessTokenProvider(): AccessTokenProvider {
  if (!accessTokenProvider) {
    accessTokenProvider = memoryTokenProvider;
  }
  return accessTokenProvider;
}

export function getStoredAccessToken(): string | null {
  return accessToken ?? readStorageToken();
}

export function clearStoredTokens(): void {
  accessToken = null;
  currentUser = null;
  writeStorageToken(null);
  writeStorageRefreshToken(null);
  writeStorageUser(null);
  try {
    getLegacySessionStorage()?.removeItem(ACCESS_TOKEN_KEY);
    getLegacySessionStorage()?.removeItem(REFRESH_TOKEN_KEY);
    getLegacySessionStorage()?.removeItem(USER_KEY);
  } catch {
    // ignore legacy cleanup failures
  }
}

export function setStoredAccessToken(nextToken: string | null): void {
  accessToken = nextToken;
  writeStorageToken(nextToken);
}

export function getStoredUser(): User | null {
  return currentUser ?? readStorageUser();
}

export function storeUser(user: User | null): void {
  currentUser = user;
  writeStorageUser(user);
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function doRefresh(): Promise<string | null> {
  const storedRefreshToken = readStorageRefreshToken();
  if (storedRefreshToken) {
    try {
      const response = await apiRequest<TokenResponse>("/auth/refresh", {
        method: "POST",
        skipAuth: true,
        skipRefresh: true,
        body: { refreshToken: storedRefreshToken },
      });
      applyRefreshResult(response);
      return response.accessToken;
    } catch {
      // stored refresh token failed – fall through to cookie fallback
      writeStorageRefreshToken(null);
    }
  }
  try {
    const response = await apiRequest<TokenResponse>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
      skipRefresh: true,
    });
    applyRefreshResult(response);
    return response.accessToken;
  } catch {
    return null;
  }
}

function applyRefreshResult(response: TokenResponse): void {
  accessToken = response.accessToken;
  currentUser = response.user;
  writeStorageToken(response.accessToken);
  writeStorageUser(response.user);
  if (response.refreshToken) {
    writeStorageRefreshToken(response.refreshToken);
  }
}

export const authApi = {
  async bootstrap(): Promise<User | null> {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      if (currentUser) {
        return currentUser;
      }
      const user = await apiRequest<User>("/auth/me");
      storeUser(user);
      return user;
    }
    const storedToken = getStoredAccessToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      accessToken = storedToken;
      currentUser = storedUser;
      return storedUser;
    }
    return null;
  },
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const response = await apiRequest<TokenResponse, LoginPayload>("/auth/login", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });
    applyRefreshResult(response);
    return response;
  },
  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const response = await apiRequest<TokenResponse, RegisterPayload>("/auth/register", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });
    applyRefreshResult(response);
    return response;
  },
  async logout(): Promise<void> {
    try {
      await apiRequest<{ loggedOut: boolean }>("/auth/logout", {
        method: "POST",
        skipRefresh: true,
      });
    } finally {
      clearStoredTokens();
    }
  },
  async logoutAll(exceptCurrent = false): Promise<void> {
    await apiRequest<{ loggedOut: boolean }, { exceptCurrent: boolean }>("/auth/logout-all", {
      method: "POST",
      body: { exceptCurrent },
    });
    if (!exceptCurrent) {
      clearStoredTokens();
    }
  },
  async getCurrentUser(): Promise<User> {
    const user = await apiRequest<User>("/auth/me");
    storeUser(user);
    return user;
  },
  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ accepted: boolean }> {
    return apiRequest<{ accepted: boolean }, ForgotPasswordPayload>("/auth/forgot-password", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });
  },
  async resetPassword(payload: ResetPasswordPayload): Promise<{ accepted: boolean }> {
    return apiRequest<{ accepted: boolean }, ResetPasswordPayload>("/auth/reset-password", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });
  },
  async changePassword(payload: ChangePasswordPayload): Promise<{ updated: boolean }> {
    return apiRequest<{ updated: boolean }, ChangePasswordPayload>("/auth/change-password", {
      method: "POST",
      body: payload,
    });
  },
  async verifyEmail(payload: VerifyEmailPayload): Promise<{ accepted: boolean }> {
    return apiRequest<{ accepted: boolean }, VerifyEmailPayload>("/auth/verify-email", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });
  },
  async resendVerification(payload: ResendVerificationPayload): Promise<{ accepted: boolean }> {
    return apiRequest<{ accepted: boolean }, ResendVerificationPayload>("/auth/resend-verification", {
      method: "POST",
      body: payload,
      skipAuth: true,
      skipRefresh: true,
    });
  },
  async listSessions(): Promise<AuthSessionInfo[]> {
    const response = await apiListRequest<AuthSessionInfo>("/auth/sessions");
    return response.data;
  },
  async revokeSession(sessionId: string): Promise<void> {
    await apiRequest<{ deleted: boolean }>(`/auth/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },
  getStoredToken: getStoredAccessToken,
  clearTokens: clearStoredTokens,
  setStoredAccessToken,
  getStoredUser,
  storeUser,
};

export type { TokenResponse };
