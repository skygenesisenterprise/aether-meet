<div align="center">

# 🚀 Aether Meet

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)
[![Go](https://img.shields.io/badge/Go-1.22+-blue?style=for-the-badge&logo=go)](https://golang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Rust](https://img.shields.io/badge/Rust-2024-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![LiveKit](https://img.shields.io/badge/LiveKit-SFU-00D4AA?style=for-the-badge)](https://livekit.io/)

**🔥 Next-Generation Virtual Meeting Platform - Hybrid Architecture with Multi-Protocol Media & LiveKit SFU**

A cutting-edge virtual meeting platform that brings together **high-performance Go APIs**, **Rust media orchestration**, and **Next.js frontend** with **LiveKit SFU** for low-latency WebRTC video conferencing. Features a **complete Go backend ecosystem**, **worker/outbox pattern**, **Redis-backed job queues**, and **enterprise-ready production deployment**.

[🚀 Quick Start](#-quick-start) • [📋 What's New](#-whats-new) • [📊 Current Status](#-current-status) • [🛠️ Tech Stack](#️-tech-stack) • [🏗️ Architecture](#️-architecture) • [🤝 Contributing](#-contributing)

[![GitHub stars](https://img.shields.io/github/stars/skygenesisenterprise/aether-meet?style=social)](https://github.com/skygenesisenterprise/aether-meet/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/skygenesisenterprise/aether-meet?style=social)](https://github.com/skygenesisenterprise/aether-meet/network)
[![GitHub issues](https://img.shields.io/github/issues/skygenesisenterprise/aether-meet)](https://github.com/skygenesisenterprise/aether-meet/issues)

</div>

---

## 🌟 What is Aether Meet?

**Aether Meet** is a comprehensive virtual meeting platform built on an **evolved hybrid architecture** that combines **Go, Rust, TypeScript, and LiveKit** for unparalleled real-time collaboration. From initial concept to production-ready deployment, it has grown into a **complete ecosystem** featuring advanced WebRTC media handling, Redis-backed background processing, multi-platform SDKs, and enterprise-grade security.

### 🎯 Our Evolved Vision

- **🚀 Hybrid Multi-Protocol Architecture** - Go API backend + Next.js frontend + **Rust WebRTC orchestration** + **LiveKit SFU**
- **📦 Complete SDK Ecosystem** - **TypeScript**, **Go**, **Python**, **PHP**, and **Rust SDKs** for maximum integration
- **🔐 Enterprise Security** - JWT authentication, end-to-end encryption, meeting password protection
- **⚡ High-Performance Media** - LiveKit SFU with UDP/TCP media transport, adaptive bitrate, ICE/STUN/TURN
- **🎨 Modern Frontend** - Next.js 15 + React 19 + Tailwind CSS + shadcn/ui component library
- **🏗️ Background Processing** - Redis Streams for durable job queues, transactional outbox pattern, worker heartbeats
- **📱 Multi-Platform** - Desktop web, mobile web, and React Native mobile applications
- **🗂️ Database Layer** - PostgreSQL with Prisma ORM and GORM (Go) for dual-database access
- **🛠️ Developer-Friendly** - Make commands, hot reload, Docker Compose, TypeScript strict mode

---

## 🆕 What's New - Recent Evolution

### 🎯 **Major Additions in v2.0+**

#### 🎥 **LiveKit WebRTC Integration** (NEW)

- ✅ **LiveKit SFU** - Production-grade Selective Forwarding Unit for media transport
- ✅ **WebRTC Control Plane** - Rust runtime for node registration, heartbeats, reconciliation
- ✅ **Join Token Management** - Secure token generation with `WEBRTC_TOKEN_TTL`
- ✅ **Multi-Region Support** - Configurable node ID and region for geo-distributed deployment
- ✅ **TURN Support** - Configurable TURN server for NAT traversal

#### ⚙️ **Worker & Outbox System** (NEW)

- ✅ **Redis Streams Workers** - Durable background job processing with retry and dead-lettering
- ✅ **Transactional Outbox** - Reliable event publishing with row locking and retry
- ✅ **Scheduler** - Recurring job scheduling for maintenance, presence, and cleanup
- ✅ **Heartbeat System** - Worker health monitoring with configurable TTL
- ✅ **Standalone-First** - Full API functionality without Redis, in-memory event bus fallback

#### 📦 **Multi-Language SDK Ecosystem** (NEW)

- ✅ **TypeScript SDK** - Universal client for Node.js and browser environments
- ✅ **Go SDK** - Native Go client library for server-side integration
- ✅ **Python SDK** - Python client for data science and automation workflows
- ✅ **PHP SDK** - PHP client for web application integration
- ✅ **Rust SDK** - Native Rust client for high-performance systems
- ✅ **CLI Tools** - Command-line utilities for meeting management and administration

#### 🗄️ **Go Backend Enhancement** (IMPROVED)

- ✅ **Prisma + GORM** - Dual ORM support for flexible database access
- ✅ **Complete REST API** - Meeting management, user administration, WebSocket hub
- ✅ **Structured Logging** - Correlation IDs, request logging, error tracking
- ✅ **Middleware Stack** - Authentication, CORS, rate limiting, security headers

#### 📚 **Documentation Evolution** (IMPROVED)

- ✅ **Architecture Overviews** - Comprehensive system documentation
- ✅ **API References** - Complete REST API documentation
- ✅ **Deployment Guides** - Docker, Docker Compose, production setup
- ✅ **SDK Documentation** - Package-specific READMEs for all SDKs

---

## 📊 Current Status

> **✅ Rapid Evolution**: From basic hybrid architecture to complete LiveKit-powered platform with worker system, multi-language SDKs, and enterprise deployment.

### ✅ **Currently Implemented**

#### 🏗️ **Core Platform**

- ✅ **WebRTC Media Server** - LiveKit SFU with UDP/TCP media transport
- ✅ **WebRTC Control Plane** - Rust-based node management and reconciliation
- ✅ **Go API Server** - High-performance HTTP API with Gin framework
- ✅ **Next.js 15 Frontend** - Modern React 19 with shadcn/ui + Tailwind CSS
- ✅ **Database Layer** - PostgreSQL with Prisma ORM and GORM

#### ⚙️ **Background Processing** (NEW)

- ✅ **Redis Streams Workers** - Durable job queues with retry and dead-lettering
- ✅ **Transactional Outbox** - Reliable event publishing with PostgreSQL transactions
- ✅ **Scheduler** - Recurring jobs for maintenance, presence, cleanup
- ✅ **Worker Heartbeat** - Health monitoring with configurable TTL
- ✅ **Standalone Mode** - Full API without Redis, in-memory fallback

#### 📦 **SDK Ecosystem** (NEW)

- ✅ **TypeScript SDK** - Universal client with comprehensive examples
- ✅ **Go SDK** - Native Go client library
- ✅ **Python SDK** - Python client for automation
- ✅ **PHP SDK** - PHP client for web apps
- ✅ **Rust SDK** - Native Rust client
- ✅ **CLI Tools** - Command-line administration tools

#### 🎥 **Meeting Capabilities**

- ✅ **HD Video & Audio** - Crystal-clear quality with adaptive bitrate
- ✅ **Screen Sharing** - Present documents, slides, and applications
- ✅ **Real-time Chat** - Text messaging with rich formatting
- ✅ **Participant Management** - Host controls and participant permissions
- ✅ **Meeting Recording** - Capture sessions for later review

#### 🔒 **Security & Privacy**

- ✅ **End-to-End Encryption** - Secure communication channels
- ✅ **JWT Authentication** - Complete login/register system
- ✅ **Password Protection** - Meeting access controls
- ✅ **Rate Limiting** - API protection against abuse
- ✅ **CORS Configuration** - Cross-origin security controls
- ✅ **Input Validation** - Request sanitization and validation

#### 🛠️ **Development Infrastructure**

- ✅ **Docker Compose** - Complete local development environment
- ✅ **Make Commands** - 60+ commands for streamlined development
- ✅ **Hot Reload** - Air for Go, Turbopack for Next.js
- ✅ **TypeScript Strict Mode** - Full type safety
- ✅ **ESLint + Prettier** - Code quality enforcement
- ✅ **Playwright Tests** - E2E testing framework

### 🔄 **In Development**

- **Mobile Applications** - iOS/Android with React Native
- **Meeting Analytics** - Advanced usage metrics and insights
- **AI Transcription** - Automated meeting transcription
- **Virtual Backgrounds** - Background blur and replacement
- **Calendar Integration** - Google/Outlook calendar sync
- **Breakout Rooms** - Sub-meeting rooms for group work

### 📋 **Planned Features**

- **Polls & Q&A** - Interactive meeting features
- **Advanced Security Scanning** - Meeting content moderation
- **Whiteboarding** - Collaborative digital whiteboard
- **Live Streaming** - Broadcast to YouTube/Twitch
- **Custom Branding** - White-label meeting rooms
- **Enterprise SSO** - SAML/OIDC single sign-on

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Go** 1.22.0 or higher (for backend)
- **Node.js** 18.0.0 or higher (for frontend)
- **pnpm** 9.0.0 or higher (recommended package manager)
- **PostgreSQL** 14.0 or higher (for database)
- **Redis** 7.0 or higher (optional, for worker queues)
- **LiveKit** (optional, for WebRTC media)
- **Docker** (optional, for containerized deployment)
- **Make** (for command shortcuts - included with most systems)

### 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/skygenesisenterprise/aether-meet.git
   cd aether-meet
   ```

2. **Quick start (recommended)**

   ```bash
   # One-command setup and start
   make quick-start
   ```

3. **Manual setup**

   ```bash
   # Install Go dependencies
   go mod download

   # Install Node.js dependencies
   pnpm install

   # Environment setup
   cp .env.example .env
   # Edit .env with your configuration

   # Database initialization
   make db-migrate

   # Start development servers
   make dev
   ```

### 🌐 Access Points

Once running, you can access:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:8080](http://localhost:8080)
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **LiveKit**: [http://localhost:7880](http://localhost:7880) (management API)

### 🎯 **Enhanced Make Commands**

```bash
# 🚀 Quick Start & Development
make quick-start          # Install, migrate, and start dev servers
make dev                  # Start all services (frontend + backend + worker)
make dev-frontend         # Frontend only (port 3000)
make dev-backend          # Backend only (port 8080)
make dev-worker           # Worker mode only

# 🔧 Go Backend Commands
make go-server            # Start Go server directly
make go-build             # Build Go binary
make go-test              # Run Go tests
make go-mod-tidy          # Clean Go dependencies

# 🏗️ Building & Production
make build                # Build all packages
make build-frontend       # Frontend production build
make build-backend        # Backend production build
make start                # Start production servers

# 🗄️ Database
make db-migrate           # Run database migrations
make db-generate          # Generate Prisma client
make db-studio            # Open Prisma Studio
make db-seed              # Seed development data

# 🔧 Code Quality & Testing
make lint                 # Lint all packages
make typecheck            # TypeScript type checking
make format               # Format code with Prettier
make test                 # Run all tests

# 📦 Package & SDK Commands
make build-packages       # Build all SDK packages
make test-packages        # Test all SDK packages
make dev-github           # Start GitHub App development

# 🐳 Docker & Deployment
make docker-build         # Build Docker image
make docker-run           # Run with Docker Compose
make docker-stop          # Stop Docker services
```

> 💡 **Tip**: Run `make help` to see all 60+ available commands organized by category.

---

## 🛠️ Tech Stack

### 🎨 **Frontend Layer**

```
Next.js 15 + React 19 + TypeScript 5
├── 🎨 Tailwind CSS + shadcn/ui (Styling & Components)
├── 🔐 JWT Authentication (Complete Implementation)
├── 🛣️ Next.js App Router (Routing)
├── 📝 TypeScript Strict Mode (Type Safety)
├── 🔄 React Context (State Management)
├── 🌐 i18n (Internationalization)
└── 🔧 ESLint + Prettier (Code Quality)
```

### ⚙️ **Backend Layer**

```
Go 1.22+ + Gin Framework
├── 🗄️ GORM + Prisma ORM (Dual Database Layer)
├── 🔐 JWT Authentication (Complete Implementation)
├── 🛡️ Middleware (Auth, CORS, Rate Limiting, Logging)
├── 🌐 HTTP Router (Gin + WebSocket Hub)
├── 📦 JSON Serialization (Native Go)
├── 📊 Structured Logging (Correlation IDs)
└── ⚡ Redis Integration (Pub/Sub + Streams)
```

### 🎥 **Media Layer**

```
LiveKit SFU + Rust Control Plane
├── 🔄 WebRTC Signaling (ICE/STUN/TURN)
├── 🎥 HD Video/Audio (Adaptive Bitrate)
├── 🖥️ Screen Sharing (Desktop/Application)
├── 📡 UDP Media Transport (RTP/RTCP)
├── 🔌 TCP Fallback (Port 7881)
├── 🌍 Multi-Region Node Management
├── ❤️ Heartbeat + Readiness Checks
└── 🔐 Token Authentication (WEBRTC_TOKEN_TTL)
```

### ⚙️ **Worker & Queue Layer**

```
Redis Streams + Go Workers
├── 📬 Notifications Queue
├── 🔗 Integrations Queue
├── 👤 Presence Queue
├── 📅 Meetings Queue
├── 📎 Attachments Queue
├── 🔧 Maintenance Queue
├── 💀 Dead-Letter Streams (per queue)
├── 📤 Transactional Outbox (PostgreSQL-backed)
└── 💓 Worker Heartbeat Monitoring
```

### 🗄️ **Data Layer**

```
PostgreSQL + Prisma ORM
├── 🏗️ Schema Management (Prisma Migrations)
├── 🔍 Query Builder (Prisma Client + GORM)
├── 🔄 Connection Pooling (Performance)
├── 👤 User Models (Complete Implementation)
├── 📅 Meeting Models (Scheduling + Recording)
└── 📈 Seed Scripts (Development Data)
```

### 📦 **SDK Ecosystem**

```
Multi-Language SDK Packages
├── 📦 TypeScript SDK (Universal Client)
│   ├── Meeting Management
│   ├── Authentication
│   └── Browser + Node.js
├── 🐹 Go SDK
│   ├── Native Go Client
│   └── CLI Tools
├── 🐍 Python SDK
│   └── Python Client
├── 🐘 PHP SDK
│   └── PHP Client
└── 🦀 Rust SDK
    └── Native Rust Client
```

### 🏗️ **Monorepo Infrastructure**

```
pnpm Workspaces + Go Modules + Multi-SDK Ecosystem
├── 📱 apps/ (Next.js Frontend + React Native)
├── ⚙️ server/ (Go API + Workers + WebRTC)
├── 📦 package/ (Multi-Language SDKs)
│   ├── node/ (TypeScript SDK)
│   ├── golang/ (Go SDK)
│   ├── python/ (Python SDK)
│   ├── php/ (PHP SDK)
│   └── rust/ (Rust SDK)
├── 🐳 docker/ (Container Configuration)
└── 🗂️ infrastructure/ (Deployment Scripts)
```

---

## 📁 Architecture

### 🏗️ **Monorepo Structure**

```
aether-meet/
├── apps/                     # Frontend Applications
│   ├── app/                 # Next.js 15 Web Application
│   │   ├── components/     # React components with shadcn/ui
│   │   ├── context/        # React contexts (auth, meeting)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── i18n/           # Internationalization
│   │   ├── lib/            # Utility functions
│   │   ├── mobile/         # React Native mobile app
│   │   ├── public/          # Static assets
│   │   ├── styles/          # Tailwind CSS styling
│   │   └── types/           # TypeScript type definitions
│   └── components.json      # shadcn/ui configuration
├── server/                   # Go Backend
│   ├── cmd/                 # Entry points
│   ├── src/                 # Source code
│   │   ├── config/         # Server configuration
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── middleware/     # Gin middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── tests/          # Unit and integration tests
│   ├── internal/           # WebRTC control plane
│   ├── prisma/             # Prisma schema and migrations
│   ├── main.go             # Main server entry point
│   ├── go.mod              # Go modules file
│   └── go.sum              # Go modules checksum
├── package/                  # 📦 Multi-Language SDKs
│   ├── cli/                # CLI tools (TypeScript)
│   ├── github/             # GitHub App (TypeScript)
│   ├── node/               # Node.js/TypeScript SDK
│   ├── golang/             # Go SDK
│   ├── python/             # Python SDK
│   ├── php/                # PHP SDK
│   └── rust/               # Rust SDK
├── docker/                   # Docker Configuration
├── infrastructure/           # Deployment Scripts
├── data/                     # Database schemas
├── docs/                     # Documentation
├── assets/                   # Media assets
├── scripts/                  # Development scripts
├── tools/                    # Development utilities
└── tests/                    # E2E tests (Playwright)
```

### 🔄 **Enhanced Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
│  ┌───────────────────┐  ┌──────────────────┐                │
│  │  Next.js Web App  │  │  React Native    │                │
│  │  (Port 3000)      │  │  Mobile App      │                │
│  └────────┬──────────┘  └────────┬─────────┘                │
│           │                      │                          │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Port 8080)                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Go API Server (Gin)                   │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │     │
│  │  │ REST API │ │ WebSocket│ │  Auth (JWT)      │   │     │
│  │  └──────────┘ │   Hub    │ └──────────────────┘   │     │
│  │               └──────────┘                        │     │
│  └──────────────────────┬─────────────────────────────┘     │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌──────────┐ ┌──────────────────┐
│   PostgreSQL    │ │   Redis  │ │   LiveKit SFU    │
│  (Primary DB)   │ │(Pub/Sub+ │ │  (Media Plane)   │
│  Prisma + GORM  │ │ Streams) │ │   Port 7880      │
│                 │ │          │ │   UDP 50000-50100 │
└─────────────────┘ └──────────┘ └──────────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Worker Layer                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐     │
│  │ Go Workers   │ │  Scheduler   │ │  Outbox Dispatcher│    │
│  │(6 Queues)    │ │ (Recurring)  │ │ (Transactional)  │     │
│  │ Retry+Dead   │ │ Heartbeats   │ │ Row Locking      │     │
│  └──────────────┘ └──────────────┘ └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   WebRTC Control Plane                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Rust Runtime (internal/)                  │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │     │
│  │  │ Node Reg │ │ Heartbeat│ │  Reconciliation  │   │     │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │     │
│  │  │ Webhook  │ │  Stale   │ │  LiveKit API     │   │     │
│  │  │ Intake   │ │ Cleanup  │ │  Integration     │   │     │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Development Roadmap

### 🎯 **Phase 1: Foundation (✅ Complete - Q1 2025)**

- ✅ **Hybrid Architecture Setup** - Go backend + Next.js frontend workspaces
- ✅ **Authentication System** - Complete JWT implementation with forms
- ✅ **Frontend Framework** - Next.js 15 + React 19 + shadcn/ui
- ✅ **Go Backend API** - Gin with meeting and user endpoints
- ✅ **Database Layer** - PostgreSQL with Prisma ORM
- ✅ **Database Layer (Go)** - GORM with PostgreSQL models
- ✅ **CLI Tools** - Complete command-line interface
- ✅ **Development Environment** - TypeScript strict mode, Go modules, hot reload

### 🚀 **Phase 2: Media & Processing (✅ Complete - Q2 2025)**

- ✅ **LiveKit SFU Integration** - Production WebRTC media server
- ✅ **WebRTC Control Plane** - Rust runtime for node management
- ✅ **Redis Streams Workers** - Durable job queues with retry/dead-letter
- ✅ **Transactional Outbox** - Reliable event publishing
- ✅ **Meeting Recording** - Session capture and storage
- ✅ **Screen Sharing** - Desktop and application sharing
- ✅ **Multi-Region Support** - Geo-distributed LiveKit nodes
- ✅ **Standalone-First Design** - Full API without Redis

### 📦 **Phase 3: SDK Ecosystem (✅ Complete - Q3 2025)**

- ✅ **TypeScript SDK** - Universal client with comprehensive examples
- ✅ **Go SDK** - Native Go client library
- ✅ **Python SDK** - Python client for automation
- ✅ **PHP SDK** - PHP client for web apps
- ✅ **Rust SDK** - Native Rust client
- ✅ **GitHub App** - Verified Marketplace app with release orchestration
- ✅ **CLI Tools** - Command-line administration tools
- ✅ **Package Documentation** - Comprehensive docs for all packages

### ⚙️ **Phase 4: Enhanced Features (🔄 In Progress - Q4 2025)**

- 🔄 **Mobile Applications** - iOS/Android with React Native
- 🔄 **Meeting Analytics** - Advanced usage metrics and insights
- 🔄 **AI Transcription** - Automated meeting transcription
- 🔄 **Calendar Integration** - Google/Outlook calendar sync
- 🔄 **Breakout Rooms** - Sub-meeting rooms for group work
- 📋 **Virtual Backgrounds** - Background blur and replacement
- 📋 **Testing Suite** - Comprehensive unit and integration tests

### 🌟 **Phase 5: Enterprise (Q1 2026)**

- 📋 **Enterprise SSO** - SAML/OIDC single sign-on
- 📋 **Custom Branding** - White-label meeting rooms
- 📋 **Live Streaming** - Broadcast to YouTube/Twitch
- 📋 **Advanced Security** - Meeting content moderation
- 📋 **High Availability** - Clustering and failover
- 📋 **Polls & Q&A** - Interactive meeting features

---

## 💻 Development

### 🎯 **Enhanced Development Workflow**

```bash
# New developer setup
make quick-start

# Daily development
make dev                 # Start working (Go + TypeScript)
make lint-fix            # Fix code issues
make typecheck           # Verify types
make test                # Run tests

# Go-specific development
cd server
go run main.go           # Start Go server
go test ./...            # Run Go tests
go fmt ./...             # Format Go code
go mod tidy              # Clean dependencies

# Frontend-specific development
make dev-frontend        # Frontend only
make lint                # Check code quality
make typecheck           # Verify types

# Worker development
make dev-worker          # Start worker mode

# Before committing
make format              # Format code
make lint                # Check code quality
make typecheck           # Verify types

# Database changes
make db-migrate          # Apply migrations
make db-studio           # Browse database

# Production deployment
make build               # Build everything
make docker-build        # Create Docker image
make docker-run          # Deploy
```

### 📋 **Enhanced Development Guidelines**

- **Make-First Workflow** - Use `make` commands for all operations
- **Go Best Practices** - Follow Go conventions for backend code
- **TypeScript Strict Mode** - All frontend code must pass strict type checking
- **Package Standards** - Follow package-specific guidelines and conventions
- **Hybrid Monorepo Best Practices** - Use workspace-specific dependencies
- **Conventional Commits** - Use standardized commit messages
- **Component Structure** - Follow established patterns for React components
- **API Design** - RESTful endpoints with proper HTTP methods
- **Error Handling** - Comprehensive error handling and logging
- **Security First** - Validate all inputs and implement proper authentication

### 🎥 **WebRTC Server Architecture**

The production WebRTC stack is split into four roles:

- **`server`** - Classic frontend/API container for HTTP, application APIs, and WebSocket fan-out
- **`worker`** - Redis Streams consumers, retries, dead-letter handling, and outbox-backed jobs
- **`webrtc`** - Go control-plane runtime for node registration, readiness, heartbeat, reconciliation, webhook intake, and stale session cleanup
- **`livekit`** - The actual SFU/media plane for signaling, ICE, RTP/RTCP, and audio/video transport

#### Required Environment

```env
# LiveKit Configuration
WEBRTC_PROVIDER=livekit
LIVEKIT_INTERNAL_URL=http://livekit:7880
LIVEKIT_PUBLIC_URL=wss://webrtc.meet.skygenesisenterprise.com
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
WEBRTC_NODE_ID=aether-meet-node-1
WEBRTC_REGION=eu-west
WEBRTC_TOKEN_TTL=10m
LIVEKIT_RTC_TCP_PORT=7881
LIVEKIT_RTP_PORT_MIN=50000
LIVEKIT_RTP_PORT_MAX=50100
TURN_ENABLED=false
TURN_URL=
TURN_USERNAME=
TURN_PASSWORD=

# Worker Configuration
WORKER_ENABLED=true
WORKER_CONCURRENCY=10
WORKER_MAX_ATTEMPTS=5
OUTBOX_ENABLED=true
OUTBOX_BATCH_SIZE=50
```

#### Network and Ports

| Service | Domain | Protocol | Port |
| ------- | ------ | -------- | ---- |
| Frontend | `meet.skygenesisenterprise.com` | HTTP/WS | 443 (CF Tunnel) |
| API | `api.meet.skygenesisenterprise.com` | HTTP | 443 (CF Tunnel) |
| LiveKit Signaling | `webrtc.meet.skygenesisenterprise.com` | WSS | 7880 |
| LiveKit Media | Public IP | UDP | 50000-50100 |
| LiveKit TCP | Public IP | TCP | 7881 |
| TURN (Future) | `turn.meet.skygenesisenterprise.com` | TCP/UDP | 3478 |
| TURN TLS (Future) | `turn.meet.skygenesisenterprise.com` | TLS | 5349 |

#### API Routes

```
POST   /api/v1/meetings/:meetingId/start
POST   /api/v1/meetings/:meetingId/end
POST   /api/v1/meetings/:meetingId/cancel
GET    /api/v1/meetings/:meetingId/participants
POST   /api/v1/meetings/:meetingId/participants
POST   /api/v1/meetings/:meetingId/join-token
POST   /api/v1/internal/webrtc/livekit/webhook
```

---

## 🔐 Authentication System

### 🎯 **Complete Hybrid Implementation**

The authentication system is fully implemented with Go backend and TypeScript frontend:

- **JWT Tokens** - Secure token-based authentication with refresh mechanism
- **Login/Register Forms** - Complete user authentication flow with validation
- **Auth Context** - Global authentication state management in React
- **Protected Routes** - Route-based authentication guards
- **Go API Endpoints** - Complete authentication API with Gin framework
- **Password Security** - bcrypt hashing for secure password storage
- **Session Management** - LocalStorage-based session persistence

---

## 🤝 Contributing

We're looking for contributors to help build this comprehensive virtual meeting platform! Whether you're experienced with Go, Rust, TypeScript, WebRTC, LiveKit, or SDK development, there's a place for you.

### 🎯 **How to Get Started**

1. **Fork the repository** and create a feature branch
2. **Check the issues** for tasks that need help
3. **Join discussions** about architecture and features
4. **Start small** - Documentation, tests, or minor features
5. **Follow our code standards** and commit guidelines

### 🏗️ **Areas Needing Help**

- **Go Backend Development** - API endpoints, business logic, worker systems
- **Rust WebRTC Development** - Control plane, LiveKit integration
- **TypeScript Frontend Development** - React components, UI/UX design
- **Mobile Development** - React Native iOS/Android applications
- **SDK Development** - Package improvements across all languages
- **DevOps Engineering** - Docker, Kubernetes, CI/CD, infrastructure
- **WebRTC/SFU Specialists** - LiveKit configuration, TURN, performance
- **Security Specialists** - Authentication, encryption, penetration testing
- **Documentation** - API docs, user guides, tutorials

### 📝 **Contribution Process**

1. **Choose an area** - Core server, frontend, or specific package
2. **Read package-specific docs** - Understand package conventions
3. **Create a branch** with a descriptive name
4. **Implement your changes** following our guidelines
5. **Test thoroughly** in all relevant environments
6. **Submit a pull request** with clear description and testing
7. **Address feedback** from maintainers and community

---

## 📞 Support & Community

### 💬 **Get Help**

- 📖 **[Documentation](docs/)** - Comprehensive guides and API docs
- 📦 **[SDK Documentation](package/README.md)** - Package-specific guides
- 🐛 **[GitHub Issues](https://github.com/skygenesisenterprise/aether-meet/issues)** - Bug reports and feature requests
- 💡 **[GitHub Discussions](https://github.com/skygenesisenterprise/aether-meet/discussions)** - General questions and ideas
- 📧 **Email** - support@skygenesisenterprise.com

### 🐛 **Reporting Issues**

When reporting bugs, please include:

- Clear description of the problem
- Steps to reproduce
- Environment information (Go version, Node.js version, OS, etc.)
- Error logs or screenshots
- Expected vs actual behavior
- Package-specific information (if applicable)

---

## 📊 Project Status

| Component | Status | Technology | Evolution | Notes |
| --------- | ------ | ---------- | --------- | ----- |
| **Hybrid Architecture** | ✅ Working | Go + TypeScript | **Enhanced** | Monorepo with multi-language SDKs |
| **Authentication System** | ✅ Working | JWT (Go/TS) | **Complete** | Full implementation with forms |
| **Go Backend API** | ✅ Working | Gin + GORM + Prisma | **Enhanced** | High-performance with PostgreSQL |
| **Frontend Framework** | ✅ Working | Next.js 15 + React 19 | **Enhanced** | shadcn/ui + Tailwind CSS |
| **LiveKit SFU** | ✅ Working | LiveKit | **NEW** | Production WebRTC media server |
| **WebRTC Control Plane** | ✅ Working | Rust | **NEW** | Node management + reconciliation |
| **Worker System** | ✅ Working | Go + Redis Streams | **NEW** | 6 queues with retry/dead-letter |
| **Transactional Outbox** | ✅ Working | PostgreSQL + Go | **NEW** | Reliable event publishing |
| **TypeScript SDK** | ✅ Working | TypeScript | **NEW** | Universal client |
| **Go SDK** | ✅ Working | Go | **NEW** | Native client library |
| **Python SDK** | ✅ Working | Python | **NEW** | Automation client |
| **PHP SDK** | ✅ Working | PHP | **NEW** | Web application client |
| **Rust SDK** | ✅ Working | Rust | **NEW** | High-performance client |
| **CLI Tools** | ✅ Working | TypeScript | **Enhanced** | Complete command-line interface |
| **Database Layer** | ✅ Working | PostgreSQL + Prisma/GORM | **Enhanced** | Dual ORM support |
| **Docker Deployment** | ✅ Working | Multi-Stage | **Enhanced** | Full Docker Compose setup |
| **Mobile Applications** | 🔄 In Progress | React Native | **Planned** | iOS + Android |
| **AI Transcription** | 📋 Planned | TBD | **Planned** | Automated meeting transcription |
| **Testing Suite** | 📋 Planned | Playwright + Go test | **Planned** | E2E + unit tests |
| **Documentation** | ✅ Working | Markdown | **Enhanced** | Package-specific docs |

---

## 🏆 Sponsors & Partners

**Development led by [Sky Genesis Enterprise](https://skygenesisenterprise.com)**

We're looking for sponsors and partners to help accelerate development of this open-source virtual meeting platform.

[🤝 Become a Sponsor](https://github.com/sponsors/skygenesisenterprise)

---

## 📄 License

This project is licensed under the **MIT Licence** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Sky Genesis Enterprise

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Sky Genesis Enterprise** - Project leadership and development
- **LiveKit Team** - Excellent WebRTC SFU platform
- **Go Community** - High-performance programming language and ecosystem
- **Gin Framework** - Lightweight HTTP web framework
- **Rust Community** - Systems programming excellence
- **Next.js Team** - Excellent React framework
- **React Team** - Modern UI library
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **Prisma Team** - Modern database toolkit
- **Redis** - High-performance data structure store
- **PostgreSQL Team** - World's most advanced open source database
- **GitHub** - Platform and integration tools
- **pnpm** - Fast, disk space efficient package manager
- **Docker Team** - Container platform and tools
- **Open Source Community** - Tools, libraries, and inspiration

---

<div align="center">

### 🚀 **Join Us in Building the Future of Virtual Collaboration!**

[⭐ Star This Repo](https://github.com/skygenesisenterprise/aether-meet) • [🐛 Report Issues](https://github.com/skygenesisenterprise/aether-meet/issues) • [💡 Start a Discussion](https://github.com/skygenesisenterprise/aether-meet/discussions)

---

**🔧 Rapid Evolution - LiveKit WebRTC, Worker System, and Multi-Language SDK Ecosystem!**

**Made with ❤️ by the [Sky Genesis Enterprise](https://skygenesisenterprise.com) team**

_Building the next-generation virtual meeting platform with LiveKit SFU, Go workers, and multi-language SDKs_

</div>
