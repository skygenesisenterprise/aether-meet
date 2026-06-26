
<div align="center">

# Aether Meet

**A next-generation virtual meeting platform built for modern collaboration**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)](https://www.rust-lang.org/)

[Documentation](docs/) • [Report Bug](.github/ISSUE_TEMPLATE/bug_report.yml) • [Request Feature](.github/ISSUE_TEMPLATE/feature_request.yml)

</div>

## Overview

Aether Meet is a cutting-edge virtual meeting platform designed to facilitate seamless real-time collaboration. Built with a modern tech stack combining Next.js 15 and Rust, it delivers high-performance video conferencing capabilities for remote work, online education, and virtual events.

## Architecture

- **Frontend**: Next.js 15 with TypeScript, React 19, and Tailwind CSS
- **Backend**: Rust API with high-performance networking
- **Database**: PostgreSQL with structured schema
- **Real-time**: WebRTC for peer-to-peer video/audio communication
- **Deployment**: Containerized with Docker support

## Features

### 🎥 **Core Meeting Capabilities**
- **HD Video & Audio**: Crystal-clear quality with adaptive bitrate
- **Screen Sharing**: Present documents, slides, and applications
- **Real-time Chat**: Text messaging with rich formatting
- **Meeting Recording**: Capture sessions for later review
- **Participant Management**: Host controls and participant permissions

### 🔒 **Security & Privacy**
- **End-to-End Encryption**: Secure communication channels
- **Password Protection**: Meeting access controls
- **Authentication**: User account management
- **Data Privacy**: GDPR-compliant data handling

### 🚀 **Performance**
- **Low Latency**: Optimized for real-time interaction
- **Scalable Architecture**: Handles meetings of any size
- **Cross-Platform**: Works on desktop and mobile devices
- **Responsive Design**: Adaptive UI for all screen sizes

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Rust 1.70+ and Cargo
- PostgreSQL 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/skygenesisenterprise/aether-meet.git
   cd aether-meet
   ```

2. **Install frontend dependencies**
   ```bash
   pnpm install
   ```

3. **Set up the backend**
   ```bash
   cd api
   cargo build
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize the database**
   ```bash
   psql -U your_user -d your_db < data/schema-pgsql.sql
   ```

### Development

Start the development servers:

```bash
# Frontend (Next.js with Turbopack)
pnpm run dev

# Backend (Rust API)
cd api && cargo run
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## Usage

### Creating a Meeting

1. Sign up or log in to your account
2. Click "Create Meeting" on the dashboard
3. Configure meeting settings (name, duration, permissions)
4. Share the generated meeting link with participants

### Joining a Meeting

1. Click the meeting link or enter the meeting ID
2. Configure your audio/video devices
3. Join the meeting room

### Meeting Controls

- **Mute/Unmute**: Toggle audio input
- **Video On/Off**: Toggle camera feed
- **Screen Share**: Present your screen to participants
- **Chat**: Send text messages to participants
- **Record**: Start/stop meeting recording
- **Participants**: View and manage attendee list

## Development

### Project Structure

```
aether-meet/
├── app/                 # Next.js frontend application
├── api/                 # Rust backend API
├── data/                # Database schemas and migrations
├── docs/                # Documentation
├── public/              # Static assets
└── .github/             # GitHub workflows and templates
```

### Available Scripts

**Frontend:**
- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint checks

**Backend:**
- `cargo build` - Compile the Rust application
- `cargo run` - Start the development server
- `cargo test` - Run unit and integration tests

### Code Style

- **TypeScript**: Strict mode with proper typing
- **Rust**: 2024 edition with `cargo fmt` and `cargo clippy`
- **React**: Functional components with hooks
- **CSS**: Tailwind CSS utility classes
- **Commits**: Conventional commit messages

## Contributing

We welcome community contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for detailed guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and ensure tests pass
4. Commit your changes: `git commit -m 'feat: add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Quality

- Run `pnpm run lint` before submitting
- Ensure `cargo clippy` passes without warnings
- Add tests for new functionality
- Update documentation as needed

## Deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Go Worker Backend

The repository also includes a Go backend under `server/` with standalone API and worker modes:

```bash
./aether-meet server
./aether-meet worker
```

`server` mode starts the HTTP API and WebSocket hub. `worker` mode starts Redis Streams consumers, the recurring scheduler, worker heartbeats, and the transactional outbox dispatcher.

Redis usage is intentionally split:

- Redis Pub/Sub: real-time ephemeral application events for WebSocket fan-out
- Redis Streams: durable background jobs for notifications, integrations, presence maintenance, meetings, attachments, and maintenance work

Queue names:

- `{REDIS_KEY_PREFIX}:jobs:notifications`
- `{REDIS_KEY_PREFIX}:jobs:integrations`
- `{REDIS_KEY_PREFIX}:jobs:presence`
- `{REDIS_KEY_PREFIX}:jobs:meetings`
- `{REDIS_KEY_PREFIX}:jobs:attachments`
- `{REDIS_KEY_PREFIX}:jobs:maintenance`

Dead-letter streams:

- `{REDIS_KEY_PREFIX}:dead:notifications`
- `{REDIS_KEY_PREFIX}:dead:integrations`
- `{REDIS_KEY_PREFIX}:dead:presence`
- `{REDIS_KEY_PREFIX}:dead:meetings`
- `{REDIS_KEY_PREFIX}:dead:attachments`
- `{REDIS_KEY_PREFIX}:dead:maintenance`

Supported worker jobs:

- `notification.message.created`
- `notification.meeting.reminder`
- `presence.expire_stale`
- `presence.persist_last_seen`
- `session.cleanup`
- `integration.webhook.process`
- `meeting.reminder`
- `meeting.expire`
- `meeting.auto_end`
- `meeting.cleanup`
- `attachment.process`
- `attachment.metadata`
- `attachment.cleanup`
- `maintenance.expired_sessions`
- `maintenance.orphaned_uploads`

Retry behavior:

- attempt 1: immediate
- attempt 2: 5 seconds
- attempt 3: 30 seconds
- attempt 4: 2 minutes
- attempt 5+: 10 minutes, then dead-lettered after `WORKER_MAX_ATTEMPTS`

Outbox behavior:

- business writes store outbox rows in PostgreSQL within the same transaction
- the outbox worker claims unpublished rows with row locking
- claimed rows enqueue durable jobs
- successful rows are marked published
- failures increment attempts and keep the row for retry

Standalone-first behavior:

- the API can run without Redis
- WebSocket fan-out keeps its in-memory event-bus fallback when Redis is disabled
- worker mode logs clearly when it falls back to the in-memory queue so local development does not silently pretend durability

Important worker environment variables:

- `WORKER_ENABLED`
- `WORKER_ID`
- `WORKER_CONCURRENCY`
- `WORKER_MAX_ATTEMPTS`
- `WORKER_RETRY_BASE_DELAY`
- `WORKER_BLOCK_TIMEOUT`
- `WORKER_CLAIM_IDLE_TIMEOUT`
- `WORKER_SHUTDOWN_TIMEOUT`
- `WORKER_SCHEDULER_ENABLED`
- `WORKER_HEARTBEAT_INTERVAL`
- `WORKER_HEARTBEAT_TTL`
- `OUTBOX_ENABLED`
- `OUTBOX_BATCH_SIZE`
- `OUTBOX_POLL_INTERVAL`
- `OUTBOX_MAX_ATTEMPTS`
- `NOTIFICATION_RETENTION_DAYS`
- `AUDIT_RETENTION_DAYS`
- `SESSION_RETENTION_DAYS`
- `UPLOAD_RETENTION_HOURS`

Example local startup:

```bash
docker compose up -d server worker redis postgresql
./aether-meet worker
```

### Production Build

```bash
# Build frontend
pnpm run build

# Build backend
cd api && cargo build --release

# Start production servers
pnpm run start
```

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/skygenesisenterprise/aether-meet/issues)
- 💬 [Discussions](https://github.com/skygenesisenterprise/aether-meet/discussions)
- 📧 [Email Support](mailto:support@skygenesisenterprise.com)

## Roadmap

- [ ] Mobile applications (iOS/Android)
- [ ] Advanced meeting analytics
- [ ] AI-powered transcription
- [ ] Virtual backgrounds and filters
- [ ] Integration with calendar systems
- [ ] Breakout rooms
- [ ] Polls and Q&A features

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Rust](https://www.rust-lang.org/)
- UI components inspired by modern design systems
- WebRTC implementation for real-time communication
- Community contributors and feedback

---

<div align="center">

**Built with ❤️ by the Sky Genesis Enterprise team**

[Website](https://skygenesisenterprise.com) • [Twitter](https://twitter.com/skyGenterprise) • [LinkedIn](https://linkedin.com/company/skygenesisenterprise)

</div>
