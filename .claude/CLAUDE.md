# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenTee is a golf tee time alert manager - a full-stack application that searches for available golf tee times and sends email alerts when matching times become available.

## Important

Do not run deploy commands (`npm run deploy`, `make deploy`) without explicit user request.

## Commands

### Frontend (root directory)
```bash
npm start          # Local dev server (localhost:8000)
npm build          # Production build
npm run typecheck  # TypeScript type checking
```

### Backend (service/ directory)
```bash
make build         # Build both Lambda functions
make test          # Run Go tests with coverage
make serve-api     # Start local API Gateway (localhost:3000)
```

## Architecture

**Frontend:** 
Gatsby static site with React, TypeScript, and Ant Design. Deployed to GitHub Pages. All common components (buttons, inputs, etc) should be from antd. Search the antd component list before implementing.

**Backend:** Two AWS Lambda functions written in Go:
- `cmd/api-lambda` - REST API handling all HTTP endpoints
- `cmd/scheduler-lambda` - Cron-triggered processor for checking alerts and sending emails

**Infrastructure:** AWS SAM (template.yaml) deploys to us-east-2 with DynamoDB for storage and SES for email.

## Key Directories

```
src/
├── pages/          # Gatsby routes (index, account, create, delete)
├── features/       # Feature components organized by domain
│   ├── alert/      # Alert creation/deletion UI
│   ├── account/    # Login and auth components
│   └── layout/     # App shell and navigation
└── config/env.ts   # API endpoint configuration

service/
├── cmd/            # Lambda entry points
├── internal/
│   ├── handler/    # Business logic (alert.go, account.go, golfsearch.go)
│   ├── golfnow/    # GolfNow API integration
│   └── message/    # Email formatting
└── common/         # Shared utilities (lamb/, dynamo/, ses/)
```

## Authentication

HTTP Basic Auth with credentials validated against `service/internal/env/accounts.json` (git-ignored). Frontend stores auth token in localStorage under `opentee_auth`.

## API

All endpoints prefixed with `/opentee`. See `service/README.md` for full API documentation.

- `POST /tee-time-search` - Search tee times (public)
- `POST /create-alert` - Create alert (auth required)
- `DELETE /delete-alert/{id}` - Delete alert
- `GET /alert/{id}` - Get single alert (auth required)
- `GET /alerts` - List user's alerts (auth required)
- `POST /account` - Get account info (auth required)

## External Dependencies

- **GolfNow API** - Tee time availability data (integrated in `service/internal/golfnow/`)
- **AWS SES** - Email notifications
- **AWS DynamoDB** - Alert storage (single table with partition key `key`)
