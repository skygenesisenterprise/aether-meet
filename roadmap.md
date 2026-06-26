# Aether Meet — Go backend implementation roadmap

## Purpose

This document is the implementation contract for the Go part of Aether Meet. It is intended to give Codex and human contributors enough context to evolve the current backend from a partially connected API into a production-ready collaboration, messaging, meeting, realtime and WebRTC control plane.

The roadmap covers:

- API responsibilities;
- domain boundaries;
- database and migration work;
- Redis and asynchronous jobs;
- realtime events;
- meeting lifecycle;
- WebRTC orchestration;
- security and authorization;
- observability;
- testing;
- delivery order and acceptance criteria.

It must be updated when the implementation changes. Existing code is the source of truth when this document conflicts with reality.

---

## 1. Current state

The repository already contains Go routes for several platform domains, including:

- current user;
- workspaces and members;
- teams and channels;
- conversations, messages and reactions;
- meetings;
- applications;
- audit logs;
- realtime WebSocket access.

The frontend still relies heavily on local mocks and does not yet consume most of these contracts.

The current cloud image also distinguishes the following runtime roles:

- `server`: static frontend;
- `worker`: Go backend/API process;
- `webrtc`: intended WebRTC runtime role.

At the beginning of each implementation task, Codex must inspect the real repository structure before changing code. In particular, it must verify:

1. the actual Go entrypoint;
2. the actual route registration file;
3. the current persistence implementation;
4. the current Prisma ownership boundary;
5. whether Redis consumers already exist;
6. whether WebRTC code or a supported subcommand already exists;
7. whether `worker` currently means HTTP API, background jobs, or both.

Do not invent missing packages, binaries or commands without implementing and testing them.

---

## 2. Target backend architecture

The target architecture separates logical responsibilities even if the first production release runs some of them in the same binary.

```text
Go backend
├── API runtime
│   ├── HTTP REST API
│   ├── authentication middleware
│   ├── authorization and workspace isolation
│   ├── request validation
│   ├── idempotency
│   ├── WebSocket upgrade endpoint
│   └── health/readiness endpoints
├── Realtime runtime
│   ├── workspace subscriptions
│   ├── conversation subscriptions
│   ├── meeting presence
│   ├── Redis pub/sub fan-out
│   └── reconnect/resume support
├── Background worker runtime
│   ├── notifications
│   ├── invitations
│   ├── webhook delivery
│   ├── audit event persistence
│   ├── meeting expiration
│   ├── stale room cleanup
│   ├── media post-processing
│   └── scheduled retention jobs
└── WebRTC control plane
    ├── room allocation
    ├── participant authorization
    ├── join token generation
    ├── node selection
    ├── ICE/TURN configuration delivery
    ├── room lifecycle events
    └── SFU integration
```

The media plane may be implemented in Go or delegated to a dedicated SFU, but the API must remain the authoritative control plane.

---

## 3. Runtime roles and process model

### 3.1 Required roles

The Go executable should ultimately support explicit runtime modes:

```text
api
worker
scheduler
webrtc
all
```

A first iteration may keep `api`, background consumers and scheduler together, but the code must preserve clean boundaries so they can be split later.

### 3.2 Expectations per role

#### `api`

- exposes REST endpoints;
- exposes realtime WebSocket endpoints;
- performs synchronous validation and authorization;
- emits durable domain events;
- does not perform heavy media or long-running jobs inline.

#### `worker`

- consumes background jobs;
- retries transient failures;
- writes dead-letter records for permanent failures;
- never exposes public HTTP endpoints except health/metrics if needed.

#### `scheduler`

- enqueues periodic jobs;
- performs no expensive processing itself;
- guarantees leader-safe scheduling when multiple replicas exist.

#### `webrtc`

- starts the actual WebRTC/SFU component or adapter;
- exposes signaling or internal control endpoints if required;
- publishes room and participant events;
- fails clearly when no WebRTC implementation is present.

#### `all`

- local-development convenience only;
- must not be required for horizontal production scaling.

### 3.3 Entrypoint compatibility

The cloud entrypoint must not claim WebRTC support unless the repository contains a real implementation. Runtime commands, binary paths and flags must be verified from the code.

---

## 4. Package boundaries

Codex should progressively organize the Go code around domain-oriented packages. Exact names may be adapted to the existing tree.

Recommended shape:

```text
server/
├── cmd/
│   └── aether-meet/
├── internal/
│   ├── app/
│   ├── config/
│   ├── auth/
│   ├── authorization/
│   ├── database/
│   ├── redis/
│   ├── httpapi/
│   ├── realtime/
│   ├── jobs/
│   ├── scheduler/
│   ├── audit/
│   ├── notifications/
│   ├── webhooks/
│   ├── media/
│   ├── webrtc/
│   └── domains/
│       ├── users/
│       ├── workspaces/
│       ├── teams/
│       ├── channels/
│       ├── conversations/
│       ├── messages/
│       ├── meetings/
│       ├── contacts/
│       ├── tasks/
│       ├── projects/
│       ├── files/
│       ├── documents/
│       ├── resources/
│       └── applications/
└── tests/
```

For each domain, prefer clear separation between:

- HTTP transport;
- application/service logic;
- repository/persistence logic;
- domain models;
- event definitions.

Handlers must not contain complex business logic or raw SQL beyond trivial operations.

---

## 5. Cross-cutting API requirements

Every new or rewritten endpoint must implement the following where applicable.

### 5.1 Request handling

- strict JSON decoding;
- explicit validation errors;
- maximum request body size;
- consistent response envelopes;
- stable machine-readable error codes;
- request correlation ID;
- structured logs without secrets.

### 5.2 Authentication

- reject unauthenticated access by default;
- validate issuer, audience, expiry and signature;
- derive a stable internal user identity;
- support service-to-service authentication separately from user authentication;
- never trust workspace IDs supplied by the client without authorization checks.

### 5.3 Authorization

Every workspace-scoped operation must verify membership and role.

Minimum roles:

```text
owner
admin
member
guest
```

Authorization should support future granular permissions without rewriting handlers.

Examples:

- only authorized roles may manage workspace members;
- only authorized roles may create or delete teams/channels;
- only conversation members may read or write messages;
- only meeting participants or invited workspace members may join a meeting;
- audit logs must be restricted to privileged roles.

### 5.4 Idempotency

Support idempotency for operations that may be retried by clients:

- message creation;
- meeting creation;
- meeting start;
- invitation creation;
- webhook registration;
- file upload initialization.

Persist idempotency keys with scope, request fingerprint, result and expiration.

### 5.5 Pagination

Use cursor pagination for large collections.

Each paginated response should expose:

```json
{
  "items": [],
  "nextCursor": null,
  "hasMore": false
}
```

Do not introduce offset pagination for high-volume messages, audit logs, notifications or call history.

---

## 6. Existing platform domains to complete first

### 6.1 Current user

Existing contract:

- `GET /api/v1/me`
- `PATCH /api/v1/me`

Required work:

- confirm persistent user profile storage;
- support display name, avatar URL and status;
- validate avatar URL and status values;
- emit `user.updated` realtime event;
- record profile changes in audit logs where appropriate.

### 6.2 Workspaces and members

Required work:

- enforce tenant isolation;
- support workspace lifecycle and soft deletion;
- define member states: invited, active, suspended, removed;
- define roles and permissions;
- support invitation acceptance and expiration;
- prevent removal of the final owner;
- emit member and workspace events;
- maintain audit records.

### 6.3 Teams and channels

Required work:

- validate unique slugs inside workspace scope;
- support channel visibility and type enums;
- verify team ownership of channels;
- define the mapping between a channel and its conversation;
- create the linked conversation transactionally when required;
- prevent orphaned conversations;
- emit `team.*` and `channel.*` events.

### 6.4 Conversations and messages

Required work:

- enforce membership on every read/write;
- cursor-based message history;
- idempotent message creation;
- edit and delete rules;
- soft deletion with tombstone representation;
- reaction uniqueness per user/emoji;
- read receipts and last-read pointers;
- unread counters;
- message metadata validation;
- attachment references;
- mention extraction;
- realtime publication after transaction commit;
- rate limiting and abuse protection.

### 6.5 Meetings

Required work:

- extend meeting creation beyond title and conversation ID;
- support scheduled start/end;
- support timezone-safe timestamps;
- support participants and invitations;
- support meeting status transitions;
- support start, end and cancellation;
- support join token issuance;
- support room allocation;
- support participant presence;
- persist meeting sessions and call history;
- emit lifecycle events.

### 6.6 Applications and audit logs

Required work:

- encrypt sensitive application configuration;
- validate provider-specific configuration;
- support enable/disable state;
- implement signed webhook delivery;
- protect secrets from API responses;
- create append-only audit events;
- paginate and filter audit logs;
- include actor, target, action, timestamp and correlation ID.

---

## 7. New backend domains required by the platform

The frontend currently exposes surfaces that cannot be production-ready without new Go APIs.

### 7.1 Notifications

Implement:

- notification inbox;
- unread count;
- mark one/all as read;
- notification preferences;
- realtime notification delivery;
- durable creation from domain events.

Suggested routes:

```text
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
POST   /api/v1/notifications/:notificationId/read
POST   /api/v1/notifications/read-all
GET    /api/v1/me/notification-preferences
PATCH  /api/v1/me/notification-preferences
```

### 7.2 Contacts

Start with workspace directory, then add personal contacts.

Implement:

- workspace directory search;
- personal contacts;
- contact groups;
- optional external email/phone fields;
- privacy controls.

### 7.3 Tasks

Implement:

- task CRUD;
- assignees;
- status and priority;
- due date;
- comments/activity;
- relation to project, channel, conversation or meeting;
- Kanban ordering with concurrency-safe updates.

### 7.4 Projects

Implement:

- project CRUD;
- members and roles;
- status and milestones;
- linked tasks, channels and files;
- audit trail.

### 7.5 Files and Aether Drive integration

The backend must not store large file bodies in PostgreSQL.

Implement:

- upload initialization;
- object storage abstraction;
- signed upload/download URLs;
- metadata persistence;
- workspace quotas;
- ownership and access control;
- checksum verification;
- antivirus scanning job hook;
- attachment linking;
- soft deletion and retention;
- future Aether Drive provider integration.

### 7.6 Documents and resources

Implement metadata and collaboration contracts before rich editing.

- document CRUD;
- version metadata;
- permissions;
- linked workspace/project/channel;
- resource library entries;
- tags and search indexing hooks.

### 7.7 Preferences

Implement user preferences separately from identity profile:

- locale;
- timezone;
- theme;
- notification preferences;
- audio/video device preferences metadata;
- accessibility preferences;
- privacy settings.

Do not store browser device identifiers as trusted security factors.

### 7.8 Call history and voicemail

Implement after meeting lifecycle is stable:

- incoming/outgoing/missed call records;
- participant summary;
- duration;
- failure reason;
- voicemail metadata;
- recording/transcription links where authorized.

---

## 8. Realtime system

### 8.1 Transport

The existing WebSocket route should evolve into a versioned realtime protocol.

Required capabilities:

- authenticated connection;
- workspace subscription authorization;
- heartbeat/ping-pong;
- reconnect support;
- event IDs;
- server timestamp;
- resume cursor where feasible;
- bounded outbound queues;
- slow-consumer handling;
- graceful shutdown.

### 8.2 Event envelope

Use a consistent envelope:

```json
{
  "id": "event-id",
  "type": "message.created",
  "workspaceId": "workspace-id",
  "resourceId": "resource-id",
  "occurredAt": "2026-01-01T00:00:00Z",
  "data": {}
}
```

### 8.3 Minimum events

```text
user.updated
workspace.updated
workspace.member.added
workspace.member.updated
workspace.member.removed
team.created
team.updated
team.deleted
channel.created
channel.updated
channel.deleted
conversation.created
conversation.updated
message.created
message.updated
message.deleted
message.reaction.added
message.reaction.removed
conversation.read
meeting.created
meeting.updated
meeting.started
meeting.ended
meeting.participant.joined
meeting.participant.left
notification.created
application.updated
```

### 8.4 Redis fan-out

Redis may be used for cross-instance fan-out, but API writes must not depend on ephemeral pub/sub for durability.

Preferred flow:

1. write domain state in PostgreSQL;
2. write an outbox event in the same transaction;
3. asynchronously publish the event;
4. mark the outbox record processed;
5. deliver to connected WebSocket clients.

Implement an outbox pattern before scaling realtime across multiple API replicas.

---

## 9. Background jobs

### 9.1 Job guarantees

Every job must be:

- idempotent;
- observable;
- retryable;
- cancellable where applicable;
- bounded by timeout;
- associated with correlation and tenant IDs.

### 9.2 Queue behavior

Implement:

- delayed jobs;
- exponential backoff with jitter;
- maximum attempt count;
- dead-letter storage;
- poison-message protection;
- concurrency limits by job type;
- graceful worker shutdown;
- job metrics.

### 9.3 Priority jobs

- invitation email delivery;
- notification fan-out;
- webhook delivery;
- audit event enrichment;
- expired invitation cleanup;
- expired join token cleanup;
- stale meeting cleanup;
- stale WebRTC room cleanup;
- object storage cleanup;
- attachment scanning dispatch;
- retention enforcement.

### 9.4 Future media jobs

- meeting recording finalization;
- audio/video transcoding;
- thumbnails;
- transcription;
- meeting summaries;
- search indexing;
- export generation.

---

## 10. WebRTC control plane and media integration

Docker networking alone does not implement WebRTC. The Go backend must provide the control plane, while a real SFU/media implementation must handle media packets.

### 10.1 Required concepts

- meeting room;
- media session;
- participant;
- endpoint/device;
- published track;
- subscribed track;
- room node;
- join token;
- ICE server configuration;
- room lifecycle event.

### 10.2 Join flow

Target flow:

1. authenticated client requests a join token;
2. API verifies workspace membership and meeting authorization;
3. API creates or locates the active meeting session;
4. API selects a WebRTC node;
5. API generates a short-lived scoped token;
6. API returns signaling URL, token and ICE servers;
7. client connects directly to the selected media node;
8. media node emits participant/track events;
9. backend persists relevant lifecycle events.

### 10.3 Join token requirements

Tokens must include or bind:

- user ID;
- workspace ID;
- meeting ID;
- room ID;
- role/capabilities;
- expiry;
- nonce or token ID;
- selected node.

Tokens must be short-lived, signed and revocable where practical.

### 10.4 Node registry

Implement a WebRTC node registry with:

- node ID;
- internal control address;
- public signaling/media address;
- region;
- capacity;
- current load;
- health timestamp;
- draining state.

A first release may use one configured node, but the interface must allow future node selection.

### 10.5 ICE and TURN

The API must return valid ICE configuration to clients.

- never expose Docker-only hostnames to browsers;
- never advertise container bridge addresses;
- support public, LAN or VPN addresses depending on deployment;
- support TURN credentials with short expiry;
- do not log TURN passwords or join tokens.

### 10.6 SFU implementation decision

Before implementing media, create an architecture decision record comparing at least:

- Pion-based native Go SFU;
- LiveKit integration;
- Janus integration;
- mediasoup integration.

Decision criteria:

- operational complexity;
- Go integration quality;
- horizontal scaling;
- recording support;
- simulcast/SVC support;
- observability;
- security maintenance;
- licensing.

Do not implement a fake `webrtc` mode that only opens a TCP port.

### 10.7 WebRTC acceptance criteria

A WebRTC milestone is complete only when:

- two clients can join an authorized room;
- audio is exchanged through the selected implementation;
- video can be published and subscribed;
- participant join/leave is observable;
- invalid/expired tokens are rejected;
- unauthorized users cannot join;
- room cleanup occurs after meeting end;
- container restart behavior is documented;
- network requirements are documented.

---

## 11. Database and migrations

### 11.1 Ownership

Clarify whether Prisma migrations remain authoritative or whether Go owns migrations. Do not maintain two competing schema sources.

Until a migration strategy is explicitly changed:

- preserve current Prisma compatibility;
- keep migration execution out of every horizontally scaled replica where possible;
- avoid destructive `db push --accept-data-loss` in production workflows;
- prefer explicit, reviewed migrations.

### 11.2 Required persistence patterns

- transactions for multi-record domain operations;
- foreign keys and tenant-scoped uniqueness;
- optimistic concurrency where concurrent edits matter;
- soft deletion for user-visible collaborative data;
- outbox table for events;
- idempotency table;
- job/dead-letter persistence where required;
- indexes for message, audit and notification pagination.

### 11.3 Data retention

Define retention policies for:

- messages;
- deleted content;
- audit logs;
- meeting sessions;
- call history;
- recordings;
- transcripts;
- webhook attempts;
- job failures.

Retention jobs must be auditable and safe to rerun.

---

## 12. Security requirements

### 12.1 Secrets

- secrets only through environment or secret manager;
- never return integration secrets after creation;
- encrypt sensitive fields at rest;
- redact secrets from logs and errors;
- rotate signing keys and TURN credentials.

### 12.2 Abuse prevention

Implement configurable limits for:

- login/authenticated request rate;
- message send rate;
- conversation creation;
- meeting creation;
- join-token issuance;
- WebSocket connections per user/IP;
- webhook attempts;
- upload size and frequency.

### 12.3 Input and output safety

- sanitize filenames and content disposition;
- validate URLs;
- prevent SSRF in webhooks and integrations;
- prevent unrestricted internal network access;
- validate media metadata;
- use secure defaults for CORS and trusted proxies.

### 12.4 Auditability

Record security-sensitive actions:

- member role changes;
- workspace deletion;
- application secret rotation;
- meeting recording enablement;
- retention policy changes;
- administrative data export;
- authorization failures above configured thresholds.

---

## 13. Observability and operations

### 13.1 Health endpoints

Provide separate endpoints:

```text
GET /health/live
GET /health/ready
```

Readiness should reflect required dependencies for the active runtime role.

### 13.2 Metrics

Expose Prometheus-compatible metrics for:

- request count, latency and errors;
- active WebSocket connections;
- realtime queue depth and dropped events;
- job counts, duration, retries and failures;
- database pool usage;
- Redis errors;
- meeting and room counts;
- WebRTC node health and capacity;
- join-token success/failure.

### 13.3 Logging

Use structured logs with:

- timestamp;
- level;
- service role;
- request/correlation ID;
- user ID when safe;
- workspace ID;
- event/job type;
- error code.

Never log message bodies, access tokens, passwords, database URLs or TURN credentials by default.

### 13.4 Graceful shutdown

All roles must:

- stop accepting new work;
- drain HTTP/WebSocket requests;
- stop polling queues;
- finish or release jobs safely;
- close database/Redis connections;
- exit within the container grace period.

---

## 14. Testing strategy

### 14.1 Unit tests

Cover:

- validation;
- authorization policies;
- status transitions;
- token generation/validation;
- idempotency behavior;
- event mapping;
- retry decisions.

### 14.2 Repository tests

Use a real PostgreSQL test instance for persistence behavior:

- constraints;
- transactions;
- cursor pagination;
- tenant isolation;
- migrations;
- outbox processing.

### 14.3 API integration tests

Cover happy paths and failures for every route family.

Minimum scenarios:

- unauthenticated request;
- wrong workspace membership;
- insufficient role;
- invalid payload;
- resource not found;
- idempotent retry;
- concurrent update;
- pagination continuation.

### 14.4 Realtime tests

- authenticated connection;
- subscription authorization;
- event delivery;
- reconnect;
- slow client;
- multi-instance Redis fan-out;
- graceful shutdown.

### 14.5 Worker tests

- successful job;
- transient retry;
- permanent failure;
- dead-letter path;
- duplicate delivery;
- worker restart;
- scheduled cleanup safety.

### 14.6 WebRTC tests

When a real media implementation exists:

- join-token validation;
- room allocation;
- two-participant audio;
- video publication/subscription;
- disconnect/reconnect;
- room termination;
- invalid node handling;
- network-restricted/TURN fallback where supported.

### 14.7 Required checks

For relevant changes, run:

```text
go fmt ./...
go vet ./...
go test ./...
go test -race ./...
```

Also run migration and integration checks available in the repository.

---

## 15. Delivery phases

### Phase 0 — Repository audit and stabilization

- map current packages, entrypoints and runtime roles;
- document current database ownership;
- make configuration validation explicit;
- add liveness/readiness endpoints;
- establish structured error responses;
- establish test harness.

Acceptance:

- current routes still work;
- startup failures are explicit;
- tests can run locally and in CI.

### Phase 1 — Identity, workspace and authorization foundation

- complete `/me`;
- complete workspace/member lifecycle;
- implement role-based authorization;
- enforce tenant isolation;
- add audit events.

Acceptance:

- cross-workspace access tests fail as expected;
- role changes are audited;
- final owner cannot be removed.

### Phase 2 — Teams, channels and conversation mapping

- complete teams/channels;
- define linked conversation rules;
- transactionally create required resources;
- publish realtime events.

Acceptance:

- channels cannot reference another workspace's team;
- linked conversations are never orphaned.

### Phase 3 — Production chat

- complete message CRUD;
- cursor pagination;
- idempotency;
- read receipts;
- reactions;
- WebSocket delivery;
- outbox pattern.

Acceptance:

- client can operate without local mock state;
- duplicate send retries do not duplicate messages;
- multi-instance event delivery works.

### Phase 4 — Meeting domain

- expand meeting schema;
- participants/invitations;
- lifecycle transitions;
- join-token contract;
- call history base model.

Acceptance:

- meeting lifecycle is persisted and authorized;
- invalid state transitions are rejected.

### Phase 5 — WebRTC control plane

- select SFU strategy;
- implement node registry;
- implement room allocation;
- issue scoped join tokens;
- return ICE/TURN configuration;
- persist presence/lifecycle events.

Acceptance:

- authorized two-party audio/video call succeeds through a real media implementation.

### Phase 6 — Worker and scheduler separation

- durable queues;
- retries/dead-letter;
- webhook delivery;
- notifications;
- cleanup jobs;
- separate runtime commands.

Acceptance:

- jobs survive process restarts;
- duplicates are safe;
- failed jobs are inspectable.

### Phase 7 — Remaining platform domains

Implement in this order unless product priorities change:

1. notifications;
2. preferences;
3. contacts;
4. tasks;
5. projects;
6. files/Drive integration;
7. documents/resources;
8. advanced call history and voicemail.

### Phase 8 — Media processing and enterprise hardening

- recording;
- transcription;
- summaries;
- retention policies;
- exports;
- regional WebRTC nodes;
- load and chaos testing;
- disaster recovery procedures.

---

## 16. Client integration order

Once each backend phase is stable, connect the frontend in this order:

1. platform layout and current workspace;
2. chat;
3. teams and channels;
4. workspace directory;
5. calendar and meetings;
6. call room;
7. profile and preferences;
8. notifications;
9. applications and audit;
10. secondary platform surfaces.

Frontend integration must use a typed API client and must not duplicate backend authorization rules as a source of truth.

---

## 17. Definition of done for Codex tasks

A backend task is not complete until Codex has:

1. inspected the current implementation before editing;
2. described the chosen design and compatibility impact;
3. implemented the smallest coherent vertical slice;
4. added or updated migrations when required;
5. added authorization and validation;
6. emitted appropriate audit/realtime events;
7. added tests for success and failure paths;
8. run formatting, vetting and tests;
9. documented configuration changes;
10. updated this roadmap when assumptions or contracts changed.

Codex must explicitly report:

- files changed;
- routes or runtime commands added;
- migrations added;
- environment variables added;
- tests executed;
- known limitations;
- follow-up work.

Do not claim a feature is production-ready when only route scaffolding, mocks or placeholder processes exist.

---

## 18. Immediate next task recommended

The next implementation task should be a repository audit followed by Phase 0 and Phase 1 work.

Codex should first produce a factual inventory of:

- Go entrypoints and commands;
- route families and handlers;
- database repositories and schema ownership;
- authentication middleware;
- authorization checks;
- Redis usage;
- realtime implementation;
- existing tests;
- WebRTC-related code.

Then it should implement one complete, testable vertical slice for workspace identity and authorization before expanding further.
