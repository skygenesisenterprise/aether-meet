import { apiListRequest, apiRequest } from "@/lib/api/client";
import type { AuthSessionInfo, TokenResponse, User } from "@/lib/api/types";

export interface AccessTokenProvider {
  getAccessToken(): Promise<string | null>;
  refreshAccessToken?(): Promise<string | null>;
}

let accessToken: string | null = null;
let currentUser: User | null = null;
let refreshPromise: Promise<string | null> | null = null;
let accessTokenProvider: AccessTokenProvider | null = null;

const memoryTokenProvider: AccessTokenProvider = {
  async getAccessToken() {
    return accessToken;
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

export function configureAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider;
}

export function getAccessTokenProvider(): AccessTokenProvider {
  if (!accessTokenProvider) {
    accessTokenProvider = memoryTokenProvider;
  }
  return accessTokenProvider
}

export function getStoredAccessToken(): string | null {
  return accessToken;
}

export function clearStoredTokens(): void {
  accessToken = null;
  currentUser = null;
}

export function setStoredAccessToken(nextToken: string | null): void {
  accessToken = nextToken;
}

export function getStoredUser(): User | null {
  return currentUser;
}

export function storeUser(user: User | null): void {
  currentUser = user;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = apiRequest<TokenResponse>("/auth/refresh", {
      method: "POST",
    })
      .then((response) => {
        accessToken = response.accessToken;
        currentUser = response.user;
        return response.accessToken;
      })
      .catch(() => {
        accessToken = null;
        currentUser = null;
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export const authApi = {
  async bootstrap(): Promise<User | null> {
    const nextToken = await refreshAccessToken();
    if (!nextToken) {
      return null;
    }
    if (currentUser) {
      return currentUser;
    }
    const user = await apiRequest<User>("/auth/me");
    currentUser = user;
    return user;
  },
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const response = await apiRequest<TokenResponse, LoginPayload>("/auth/login", {
      method: "POST",
      body: payload,
    });
    accessToken = response.accessToken;
    currentUser = response.user;
    return response;
  },
  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const response = await apiRequest<TokenResponse, RegisterPayload>("/auth/register", {
      method: "POST",
      body: payload,
    });
    accessToken = response.accessToken;
    currentUser = response.user;
    return response;
  },
  async logout(): Promise<void> {
    try {
      await apiRequest<{ loggedOut: boolean }>("/auth/logout", {
        method: "POST",
      });
    } finally {
      accessToken = null;
      currentUser = null;
    }
  },
  async logoutAll(exceptCurrent = false): Promise<void> {
    await apiRequest<{ loggedOut: boolean }, { exceptCurrent: boolean }>("/auth/logout-all", {
      method: "POST",
      body: { exceptCurrent },
    });
    if (!exceptCurrent) {
      accessToken = null;
      currentUser = null;
    }
  },
  async getCurrentUser(): Promise<User> {
    const user = await apiRequest<User>("/auth/me");
    currentUser = user;
    return user;
  },
  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ accepted: boolean }> {
    return apiRequest<{ accepted: boolean }, ForgotPasswordPayload>("/auth/forgot-password", {
      method: "POST",
      body: payload,
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
