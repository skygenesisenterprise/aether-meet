import { getMe } from "@/lib/api/me";
import type { TokenResponse, User } from "@/lib/api/types";

export interface AccessTokenProvider {
  getAccessToken(): Promise<string | null>;
  refreshAccessToken?(): Promise<string | null>;
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const IDENTITY_BASE_URL = process.env.NEXT_PUBLIC_IDENTITY_API_URL?.replace(/\/$/, "");

let accessTokenProvider: AccessTokenProvider | null = null;

function readStorageItem(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function writeStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, value);
}

function removeStorageItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}

async function requestIdentity<T>(path: string, init: RequestInit): Promise<T> {
  if (!IDENTITY_BASE_URL) {
    throw new Error("Identity API URL is not configured.");
  }

  const response = await fetch(`${IDENTITY_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) {
    throw new Error(`Identity request failed with status ${response.status}`);
  }

  return payload as T;
}

interface AuthApiResponse<TData> {
  success: boolean;
  data?: TData;
  error?: string;
}

const localStorageTokenProvider: AccessTokenProvider = {
  async getAccessToken() {
    return readStorageItem(ACCESS_TOKEN_KEY);
  },
  async refreshAccessToken() {
    const refreshToken = readStorageItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await requestIdentity<{
        data?: { accessToken?: string; refreshToken?: string };
      }>("/oauth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      const nextAccessToken = response.data?.accessToken ?? null;
      if (!nextAccessToken) {
        clearStoredTokens();
        return null;
      }

      storeTokens(nextAccessToken, response.data?.refreshToken ?? refreshToken);
      return nextAccessToken;
    } catch {
      clearStoredTokens();
      return null;
    }
  },
};

export function configureAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider;
}

export function getAccessTokenProvider(): AccessTokenProvider {
  if (!accessTokenProvider) {
    accessTokenProvider = localStorageTokenProvider;
  }

  return accessTokenProvider;
}

export function getStoredAccessToken(): string | null {
  return readStorageItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return readStorageItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  if (accessToken) {
    writeStorageItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    writeStorageItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredTokens(): void {
  removeStorageItem(ACCESS_TOKEN_KEY);
  removeStorageItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = readStorageItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function storeUser(user: User): void {
  writeStorageItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  removeStorageItem(USER_KEY);
}

export async function resolveAuthenticatedUser(): Promise<User | null> {
  const token = await getAccessTokenProvider().getAccessToken();
  if (!token) {
    return null;
  }

  const user = await getMe();
  storeUser(user);
  return user;
}

export const authApi = {
  login(email: string, password: string) {
    return requestIdentity<AuthApiResponse<TokenResponse>>("/oauth/token", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register(input: { email: string; password: string; firstName?: string; lastName?: string }) {
    return requestIdentity<AuthApiResponse<unknown>>("/oauth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  logout() {
    return IDENTITY_BASE_URL
      ? requestIdentity<AuthApiResponse<unknown>>("/oauth/logout", { method: "POST" })
      : Promise.resolve({ success: true });
  },
  refreshToken(refreshToken: string) {
    return requestIdentity<AuthApiResponse<Partial<TokenResponse>>>("/oauth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },
  getAccount() {
    return getMe().then((user) => ({ success: true, data: { user } }));
  },
  getStoredToken: getStoredAccessToken,
  storeTokens,
  clearTokens: clearStoredTokens,
  getStoredUser,
  storeUser,
  clearUser: clearStoredUser,
};

export type { TokenResponse };
