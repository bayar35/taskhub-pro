# TaskHub Pro

[![Tests](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml/badge.svg)](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bayar35/taskhub-pro/branch/main/graph/badge.svg)](https://codecov.io/gh/bayar35/taskhub-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Senior-grade MERN monorepo with TypeScript, Redux Toolkit, RTK Query, and full E2E test coverage.

🌐 **Live Demo:** [taskhub-pro-sooty.vercel.app](https://taskhub-pro-sooty.vercel.app)

---

## ✨ Features

- 🔐 **Authentication** — JWT access + refresh tokens, secure password hashing
- 🔄 **Token Refresh** — HttpOnly cookie-based refresh token rotation
- ✅ **Todo Management** — Create, read, update, toggle, delete
- 🏷️ **Categories & Priorities** — Personal, Work, Study categories with priority levels
- 🔍 **Search** — Debounced search by text and category
- 🌗 **Dark Mode** — Light/dark theme with system preference detection
- 📊 **Statistics** — Real-time total / completed / pending counts
- 🎨 **Modern UI** — TailwindCSS, responsive design, smooth animations
- 🔄 **Real-time Updates** — Socket.io for live sync across clients
- 🧪 **Comprehensive Testing** — 111 tests across unit, integration, and E2E
- 🚀 **CI/CD** — GitHub Actions pipeline with caching and coverage reporting
- ☁️ **Auto Deploy** — Vercel deployment on every push to `main`

---

## 🛠 Tech Stack

### Frontend
- **React 19** + TypeScript
- **Redux Toolkit** + RTK Query (data fetching & caching)
- **React Router** v7 (client-side routing)
- **TailwindCSS** v3 (styling with dark mode)
- **React Hook Form** + Zod (form validation)
- **Socket.io Client** (real-time updates)
- **Vite** v5 (build tool)

### Backend
- **Node.js** 22.x + TypeScript
- **Express** 5.x (REST API)
- **MongoDB** + Mongoose (database)
- **Zod** (schema validation)
- **JWT** (authentication with access + refresh)
- **Socket.io** (WebSocket server)
- **Bcrypt** (password hashing)
- **Cookie-parser** (HttpOnly refresh tokens)

### Testing
- **Vitest** — Unit & integration tests
- **Testing Library** — React component tests
- **Supertest** — HTTP API tests
- **MongoDB Memory Server** — In-memory DB for tests
- **Playwright** — End-to-end browser tests
- **Codecov** — Coverage reporting

### DevOps
- **npm workspaces** + **Turbo** (monorepo)
- **GitHub Actions** (CI/CD)
- **Vercel** (frontend hosting)
- **MongoDB Atlas** (CI test database)
- **Docker** (optional, for local dev)

---

## 📦 Project Structure
taskhub-pro/
├── packages/
│ ├── frontend/ # React app (Vite + TypeScript)
│ │ ├── src/
│ │ │ ├── app/ # Redux store, hooks, API
│ │ │ ├── components/ # Reusable UI components (Button, SearchBar, ThemeToggle)
│ │ │ ├── contexts/ # React Context (ThemeContext)
│ │ │ ├── features/ # Feature slices (auth, todo)
│ │ │ ├── hooks/ # Custom hooks (useDebounce)
│ │ │ ├── pages/ # Route pages
│ │ │ ├── routes/ # Route guards
│ │ │ └── lib/ # Utilities (API, socket, cn)
│ │ ├── tests/ # Unit & component tests (70)
│ │ └── e2e/ # Playwright E2E tests (10)
│ │
│ ├── backend/ # Express API
│ │ ├── src/
│ │ │ ├── config/ # Env validation
│ │ │ ├── models/ # Mongoose schemas (User, Todo, RefreshToken)
│ │ │ ├── modules/ # Feature modules (auth, todo)
│ │ │ ├── middleware/ # Auth, validation, error
│ │ │ └── app.ts # Express app setup
│ │ └── tests/ # Integration tests (31)
│ │
│ └── shared/ # Shared TypeScript types & Zod schemas
│
├── .github/workflows/ # CI/CD pipelines
└── package.json # Root workspace config

text

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
Environment Setup
Create .env in packages/backend/:

env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskhub
JWT_SECRET=your-32-character-secret-key-here-min-32
JWT_REFRESH_SECRET=your-32-character-refresh-secret-min-32
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
Create .env in packages/frontend/:

env
VITE_API_URL=http://localhost:5000
Development
bash
# Run both frontend & backend
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
🧪 Testing
This project has 111 tests across three levels:

Level	Tests	Tool	Command
Unit/Integration (backend)	31	Vitest + Supertest	npm run test --workspace=packages/backend
Unit/Component (frontend)	70	Vitest + Testing Library	npm run test --workspace=packages/frontend
E2E (full-stack)	10	Playwright	npm run test:e2e --workspace=packages/frontend
Run all tests
bash
# Backend
npm run test --workspace=packages/backend

# Frontend
npm run test --workspace=packages/frontend

# Backend with coverage
npm run test:coverage --workspace=packages/backend

# Frontend with coverage
npm run test:coverage --workspace=packages/frontend

# E2E (requires dev server running)
npm run test:e2e --workspace=packages/frontend
Coverage
Package	Statements	Branches	Functions	Lines
Backend	72.83%	70.86%	77.55%	72.83%
Frontend	73.33%	81.52%	54.71%	73.33%
Highlights:

components/Button.tsx — 100%

components/SearchBar.tsx — 100%

components/ThemeToggle.tsx — 100%

hooks/useDebounce.ts — 100%

pages/DashboardPage.tsx — 94.73%

pages/LoginPage.tsx — 88.15%

pages/RegisterPage.tsx — 89.47%

pages/NotFoundPage.tsx — 100%

routes/ProtectedRoute.tsx — 100%

features/auth/authSlice.ts — 100%

contexts/ThemeContext.tsx — 90.69%

🔄 CI/CD
Every push to main triggers:

Install dependencies (with cache)

Build shared package

Run backend tests with coverage (31)

Run frontend tests with coverage (70)

Install Playwright (Chromium)

Run E2E tests (10)

Upload backend coverage to Codecov

Upload frontend coverage to Codecov

Total runtime: ~3-4 minutes

View pipeline: Actions

📡 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/v1/auth/register	Register new user
POST	/api/v1/auth/login	Login (returns JWT + sets refresh cookie)
POST	/api/v1/auth/refresh	Refresh access token
POST	/api/v1/auth/logout	Logout (clears refresh token)
GET	/api/v1/auth/me	Get current user
Todos
Method	Endpoint	Description
GET	/api/v1/todos	Get all todos
GET	/api/v1/todos?category=...	Filter by category
GET	/api/v1/todos?search=...	Search by text (case-insensitive)
GET	/api/v1/todos?search=...&category=...	Combined search + filter
GET	/api/v1/todos/stats	Get todo statistics
POST	/api/v1/todos	Create todo
PATCH	/api/v1/todos/:id	Update todo
PUT	/api/v1/todos/:id/toggle	Toggle completed
DELETE	/api/v1/todos/:id	Delete todo
🏗 Architecture Decisions
Why Monorepo?
Shared types between frontend & backend (@taskhub/shared)

Single install with npm workspaces

Atomic commits across packages

Why RTK Query?
Automatic caching — reduces network requests

Optimistic updates — instant UI feedback

Type-safe — Zod schemas validated end-to-end

Why Refresh Tokens in HttpOnly Cookies?
XSS-safe — JavaScript cannot access the token

CSRF-mitigated — sameSite: strict cookie option

Rotatable — token stored in DB, can be revoked on logout

Why MongoDB Atlas for CI?
Reliable — no local DB setup needed

Fast — hosted cluster with low latency

Free tier — M0 cluster supports development needs

Why Playwright over Cypress?
Faster — parallel execution, modern API

Multi-browser — Chromium, Firefox, WebKit

Better DX — auto-wait, trace viewer

📈 Roadmap
☑ Authentication (JWT)
☑ Todo CRUD
☑ Categories & priorities
☑ Statistics dashboard
☑ Refresh token rotation
☑ Search & filter
☑ Dark mode
☑ 111 tests (unit + integration + E2E)
☑ CI/CD pipeline
☑ Auto-deploy to Vercel
☑ Codecov coverage reporting
□ Push notifications
□ Mobile app (React Native)
□ Multi-language support (i18n)
🤝 Contributing
This is a personal portfolio project, but suggestions are welcome.

Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing)

Open a Pull Request

📝 License
MIT © bayar35

🙏 Acknowledgements
Built with ❤️ using modern web technologies.
Inspired by real-world senior engineering practices.