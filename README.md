# test_jules_with_podman

A microservice architecture built with **Angular 19 (LTS)** as the frontend and **Node.js / Express** as the middle layer, orchestrated via **podman-compose**.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  podman-compose                  │
│                                                  │
│  ┌─────────────────────┐  ┌──────────────────┐  │
│  │  Angular 19 (LTS)   │  │  Node.js Middle  │  │
│  │  frontend           │  │  Layer (Express) │  │
│  │  Port: 4200 → 80    │  │  Port: 3000      │  │
│  └─────────┬───────────┘  └────────┬─────────┘  │
│            │ nginx proxy /api/     │             │
│            └──────────────────────┘             │
└─────────────────────────────────────────────────┘
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

### Stop

```bash
podman-compose down
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

### Frontend Tests (Jasmine + Karma)
```bash
cd frontend && npm run test:ci
```
- `AppComponent` tests (create, title, header render)
- `ItemService` tests (all HTTP methods with `HttpClientTestingModule`)
- `ItemListComponent` tests (CRUD operations, error handling)
