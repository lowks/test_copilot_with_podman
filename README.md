# test_copilot_with_podman

[![CI](https://github.com/lowks/test_copilot_with_podman/workflows/CI/badge.svg)](https://github.com/lowks/test_copilot_with_podman/actions/workflows/ci.yml)

A microservice architecture built with **Angular 19 (LTS)** as the frontend, **Node.js / Express** as the middle layer, and **CockroachDB** as the backend database, orchestrated via **podman-compose**.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       podman-compose                      │
│                                                           │
│  ┌─────────────────────┐  ┌──────────────────┐           │
│  │  Angular 19 (LTS)   │  │  Node.js Middle  │           │
│  │  frontend           │  │  Layer (Express) │           │
│  │  Port: 4200 → 80    │  │  Port: 3000      │           │
│  └─────────┬───────────┘  └────────┬─────────┘           │
│            │ nginx proxy /api/     │                      │
│            └──────────────────────┘                      │
│                                    │                      │
│                          ┌─────────▼─────────┐           │
│                          │   CockroachDB      │           │
│                          │   Port: 26257      │           │
│                          │   UI:   8080       │           │
│                          └───────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

## Services

### Frontend (`frontend/`)
- **Framework**: Angular 19 (latest LTS)
- **Served by**: Nginx (production build)
- **Port**: 4200 (mapped to container port 80)
- API calls to `/api/*` are proxied to the Node.js backend via Nginx

### Backend / Middle Layer (`backend/`)
- **Framework**: Node.js + Express
- **Port**: 3000
- Provides a RESTful API at `/api/items`
- Connects to CockroachDB via `DATABASE_URL` when set; falls back to an in-memory store otherwise (used by unit tests)

### Database (`cockroachdb`)
- **Engine**: CockroachDB v24.1 (PostgreSQL-compatible)
- **SQL Port**: 26257
- **Admin UI**: http://localhost:8080
- Schema defined in `backend/db/init.sql`

## Quick Start

### Prerequisites
- [Podman](https://podman.io/) and [podman-compose](https://github.com/containers/podman-compose)

### Run with podman-compose

```bash
podman-compose up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api/items
- Health check: http://localhost:3000/health
- CockroachDB Admin UI: http://localhost:8080

### Initialise the database (first run)

After the CockroachDB container is healthy, run the init script once:

```bash
podman exec -i cockroachdb ./cockroach sql --insecure < backend/db/init.sql
```

### Stop

```bash
podman-compose down
```

To also remove the persistent database volume:

```bash
podman-compose down -v
```

## Development

### Backend

```bash
cd backend
npm install
npm run dev        # Start with hot-reload
npm test           # Run unit tests
```

### Frontend

```bash
cd frontend
npm install
npm start          # ng serve on http://localhost:4200
npm test           # Run unit tests (requires Chrome)
npm run test:ci    # Run tests in headless Chrome (CI)
npm run build      # Production build
```

## API Reference

| Method | Path              | Description             |
|--------|-------------------|-------------------------|
| GET    | /health           | Health check            |
| GET    | /api/items        | List all items          |
| GET    | /api/items/:id    | Get item by id          |
| POST   | /api/items        | Create item             |
| PUT    | /api/items/:id    | Update item             |
| DELETE | /api/items/:id    | Delete item             |

## Testing

### Backend Tests (Jest + Supertest)
```bash
cd backend && npm test
```
- 12 unit tests covering all API endpoints, error cases, and health check
- Tests run against the in-memory store; no database required

### Frontend Tests (Jasmine + Karma)
```bash
cd frontend && npm run test:ci
```
- `AppComponent` tests (create, title, header render)
- `ItemService` tests (all HTTP methods with `HttpClientTestingModule`)
- `ItemListComponent` tests (CRUD operations, error handling)

## CI/CD

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every push and pull request:

| Job | Description |
|-----|-------------|
| **backend-tests** | Runs `npm test` inside `backend/` (Jest + Supertest, Node 20) |
| **frontend-tests** | Runs `npm run test:ci` inside `frontend/` (Karma headless Chrome) |

The CI status badge at the top of this README reflects the latest build status.
