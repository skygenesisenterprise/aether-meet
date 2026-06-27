import assert from "node:assert/strict";
import test from "node:test";

import { authApi, clearStoredTokens, configureAccessTokenProvider, getStoredAccessToken } from "../../lib/api/auth.ts";
import { apiRequest } from "../../lib/api/client.ts";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  clearStoredTokens();
  configureAccessTokenProvider({
    async getAccessToken() {
      return getStoredAccessToken();
    },
    async refreshAccessToken() {
      return null;
    },
  });
});

test("auth bootstrap refreshes once for concurrent requests", async () => {
  let refreshCalls = 0;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/auth/refresh")) {
      refreshCalls += 1;
      return new Response(
        JSON.stringify({
          data: {
            accessToken: "access-1",
            expiresIn: 900,
            user: {
              id: "user-1",
              email: "alice@example.com",
              displayName: "Alice",
              status: "active",
              createdAt: "2026-06-27T00:00:00Z",
              updatedAt: "2026-06-27T00:00:00Z",
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    throw new Error(`unexpected request ${url}`);
  };

  const [first, second] = await Promise.all([authApi.bootstrap(), authApi.bootstrap()]);

  assert.equal(refreshCalls, 1);
  assert.equal(first?.id, "user-1");
  assert.equal(second?.id, "user-1");
  assert.equal(getStoredAccessToken(), "access-1");
});

test("apiRequest retries once after a 401 with refresh", async () => {
  let requestCount = 0;

  globalThis.fetch = async (input, init) => {
    requestCount += 1;
    const url = String(input);

    if (url.endsWith("/auth/refresh")) {
      return new Response(
        JSON.stringify({
          data: {
            accessToken: "access-2",
            expiresIn: 900,
            user: {
              id: "user-1",
              email: "alice@example.com",
              displayName: "Alice",
              status: "active",
              createdAt: "2026-06-27T00:00:00Z",
              updatedAt: "2026-06-27T00:00:00Z",
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (requestCount === 1) {
      return new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "expired" } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    assert.equal((init?.headers as Headers).get("authorization"), "Bearer access-2");
    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  configureAccessTokenProvider({
    async getAccessToken() {
      return getStoredAccessToken();
    },
    async refreshAccessToken() {
      return authApi.bootstrap().then(() => getStoredAccessToken());
    },
  });

  const response = await apiRequest<{ ok: boolean }>("/me");

  assert.deepEqual(response, { ok: true });
});
