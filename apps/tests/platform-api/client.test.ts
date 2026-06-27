import test from "node:test";
import assert from "node:assert/strict";

import { configureAccessTokenProvider } from "../../lib/api/auth.ts";
import { apiListRequest, apiRequest } from "../../lib/api/client.ts";
import { ApiError } from "../../lib/api/errors.ts";
import { createMeetingJoinToken } from "../../lib/api/meetings.ts";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  configureAccessTokenProvider({
    async getAccessToken() {
      return null;
    },
  });
});

test("apiRequest sends bearer token and idempotency key", async () => {
  configureAccessTokenProvider({
    async getAccessToken() {
      return "test-token";
    },
  });

  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "/api/v1/me");
    assert.equal(init?.headers instanceof Headers, true);
    const headers = init?.headers as Headers;
    assert.equal(headers.get("authorization"), "Bearer test-token");
    assert.equal(headers.get("idempotency-key"), "idem-123");

    return new Response(JSON.stringify({ data: { ok: true }, meta: { requestId: "req-1" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const response = await apiRequest<{ ok: boolean }>("/me", {
    idempotencyKey: "idem-123",
  });

  assert.deepEqual(response, { ok: true });
});

test("apiListRequest unwraps list envelopes and meta", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: [{ id: "ws-1" }],
        meta: { requestId: "req-1", nextCursor: "next-1", hasMore: true },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  const response = await apiListRequest<{ id: string }>("/workspaces");

  assert.deepEqual(response.data, [{ id: "ws-1" }]);
  assert.equal(response.meta.requestId, "req-1");
  assert.equal(response.meta.nextCursor, "next-1");
  assert.equal(response.meta.hasMore, true);
});

test("apiRequest normalizes HTTP errors", async () => {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: { code: "WORKSPACE_NOT_FOUND", message: "missing" },
        meta: { requestId: "req-404" },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );

  await assert.rejects(
    () => apiRequest("/workspaces/ws-missing"),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 404 &&
      error.code === "WORKSPACE_NOT_FOUND" &&
      error.requestId === "req-404"
  );
});

test("meeting join token rejects private signaling URLs in production", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        data: {
          token: "token",
          meetingId: "meeting-1",
          sessionId: "session-1",
          roomName: "room-1",
          participantIdentity: "user-1",
          signalingUrl: "ws://localhost:7880",
          expiresAt: "2026-06-27T12:00:00Z",
        },
        meta: { requestId: "req-join" },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  await assert.rejects(() => createMeetingJoinToken("meeting-1"));

  process.env.NODE_ENV = previousNodeEnv;
});
