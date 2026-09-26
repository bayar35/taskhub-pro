# TaskHub Pro

[![Tests](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml/badge.svg)](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bayar35/taskhub-pro/branch/main/graph/badge.svg)](https://codecov.io/gh/bayar35/taskhub-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Senior-grade MERN monorepo with TypeScript, Redux Toolkit, RTK Query, and full E2E test coverage.

🌐 **Live Demo:** [taskhub-pro-sooty.vercel.app](https://taskhub-pro-sooty.vercel.app)

---

## ✨ Features

- 🔐 **Authentication** — JWT access + refresh tokens, secure password hashing
- ✅ **Todo Management** — Create, read, update, toggle, delete
- 🏷️ **Categories & Priorities** — Personal, Work, Study categories with priority levels
- 📊 **Statistics** — Real-time total / completed / pending counts
- 🎨 **Modern UI** — TailwindCSS, responsive design, smooth animations
- 🔄 **Real-time Updates** — Socket.io for live sync across clients
- 🧪 **Comprehensive Testing** — 78 tests across unit, integration, and E2E
- 🚀 **CI/CD** — GitHub Actions pipeline with caching, 79-second runs
- ☁️ **Auto Deploy** — Vercel deployment on every push to `main`

---

## 🛠 Tech Stack

### Frontend
- **React 19** + TypeScript
- **Redux Toolkit** + RTK Query (data fetching & caching)
- **React Router** v7 (client-side routing)
- **TailwindCSS** v3 (styling)
- **React Hook Form** + Zod (form validation)
- **Socket.io Client** (real-time updates)
- **Vite** v5 (build tool)

### Backend
- **Node.js** 22.x + TypeScript
- **Express** 5.x (REST API)
- **MongoDB** + Mongoose (database)
- **Zod** (schema validation)
- **JWT** (authentication)
- **Socket.io** (WebSocket server)
- **Bcrypt** (password hashing)

### Testing
- **Vitest** — Unit & integration tests
- **Testing Library** — React component tests
- **Supertest** — HTTP API tests
- **MongoDB Memory Server** — In-memory DB for tests
- **Playwright** — End-to-end browser tests

### DevOps
- **npm workspaces** + **Turbo** (monorepo)
- **GitHub Actions** (CI/CD)
- **Vercel** (frontend hosting)
- **Docker** (optional, for local dev)

---

## 📦 Project Structure

```
taskhub-pro/
├── packages/
│   ├── frontend/              # React app (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── app/          # Redux store, hooks, API
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── features/     # Feature slices (auth, todo)
│   │   │   ├── pages/        # Route pages
│   │   │   ├── routes/       # Route guards
│   │   │   └── lib/          # Utilities (API, socket, cn)
│   │   ├── tests/            # Unit & component tests (54)
│   │   └── e2e/              # Playwright E2E tests (5)
│   │
│   ├── backend/               # Express API
│   │   ├── src/
│   │   │   ├── config/       # Env validation
│   │   │   ├── models/       # Mongoose schemas
│   │   │   ├── modules/      # Feature modules (auth, todo)
│   │   │   ├── middleware/   # Auth, validation, error
│   │   │   └── app.ts        # Express app setup
│   │   └── tests/            # Integration tests (19)
│   │
│   └── shared/                # Shared TypeScript types & Zod schemas
│
├── .github/workflows/         # CI/CD pipelines
└── package.json               # Root workspace config
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 22.x ([download](https://nodejs.org/))
- **MongoDB** 7.x (local) or MongoDB Atlas
- **npm** 10.x (comes with Node.js)

### Installation

```bash
# Clone repository
git clone https://github.com/bayar35/taskhub-pro.git
cd taskhub-pro

# Install all dependencies (monorepo)
npm install

# Build shared package
npm run build --workspace=packages/shared
```

### Environment Setup

Create `.env` in `packages/backend/`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskhub
JWT_SECRET=your-32-character-secret-key-here-min-32
JWT_REFRESH_SECRET=your-32-character-refresh-secret-min-32
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Create `.env` in `packages/frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

### Development

```bash
# Run both frontend & backend
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

---

## 🧪 Testing

This project has **78 tests** across three levels:

| Level | Tests | Tool | Command |
|---|---|---|---|
| Unit/Integration (backend) | 19 | Vitest + Supertest | `npm run test --workspace=packages/backend` |
| Unit/Component (frontend) | 54 | Vitest + Testing Library | `npm run test --workspace=packages/frontend` |
| E2E (full-stack) | 5 | Playwright | `npm run test:e2e --workspace=packages/frontend` |

### Run all tests

```bash
# Backend
npm run test --workspace=packages/backend

# Frontend
npm run test --workspace=packages/frontend

# Frontend with coverage
npm run test:coverage --workspace=packages/frontend

# E2E (requires dev server running)
npm run test:e2e --workspace=packages/frontend
```

### Coverage

Frontend coverage: **75.43%**

- `components/Button.tsx` — 100%
- `pages/DashboardPage.tsx` — 96.47%
- `pages/LoginPage.tsx` — 88.15%
- `pages/RegisterPage.tsx` — 89.47%
- `pages/NotFoundPage.tsx` — 100%
- `routes/ProtectedRoute.tsx` — 100%
- `features/auth/authSlice.ts` — 100%

---

## 🔄 CI/CD

Every push to `main` triggers:

1. **Install dependencies** (with cache)
2. **Build shared package**
3. **Run backend tests** (19)
4. **Run frontend tests** (54)
5. **Install Playwright** (Chromium)
6. **Run E2E tests** (5)
7. **Upload coverage to Codecov**

**Total runtime:** ~79 seconds

View pipeline: [Actions](https://github.com/bayar35/taskhub-pro/actions)

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Get current user |

### Todos

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/todos?category=...` | Get all todos (filter by category) |
| GET | `/api/v1/todos/stats` | Get todo statistics |
| POST | `/api/v1/todos` | Create todo |
| PUT | `/api/v1/todos/:id/toggle` | Toggle completed |
| DELETE | `/api/v1/todos/:id` | Delete todo |

---

## 🏗 Architecture Decisions

### Why Monorepo?
- **Shared types** between frontend & backend (`@taskhub/shared`)
- **Single install** with npm workspaces
- **Atomic commits** across packages

### Why RTK Query?
- **Automatic caching** — reduces network requests
- **Optimistic updates** — instant UI feedback
- **Type-safe** — Zod schemas validated end-to-end

### Why MongoDB Memory Server?
- **Isolated tests** — no shared state between tests
- **Fast** — in-memory database
- **CI-compatible** — works on Ubuntu runners

### Why Playwright over Cypress?
- **Faster** — parallel execution, modern API
- **Multi-browser** — Chromium, Firefox, WebKit
- **Better DX** — auto-wait, trace viewer

---

## 📈 Roadmap

- [x] Authentication (JWT)
- [x] Todo CRUD
- [x] Categories & priorities
- [x] Statistics dashboard
- [x] 78 tests (unit + integration + E2E)
- [x] CI/CD pipeline
- [x] Auto-deploy to Vercel
- [ ] Refresh token rotation
- [ ] Search & filter
- [ ] Dark mode
- [ ] Push notifications
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

This is a personal portfolio project, but suggestions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📝 License

MIT © [bayar35](https://github.com/bayar35)

---

## 🙏 Acknowledgements

Built with ❤️ using modern web technologies.
Inspired by real-world senior engineering practices.