# TaskHub Pro

> Senior-grade MERN SaaS platform with multi-tenancy, 2FA, PWA, AI integration, and **115 passing tests** (49 backend + 66 frontend).

[![Tests](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml/badge.svg)](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml)
[![E2E Tests](https://github.com/bayar35/taskhub-pro/actions/workflows/e2e.yml/badge.svg)](https://github.com/bayar35/taskhub-pro/actions/workflows/e2e.yml)
[![codecov](https://codecov.io/gh/bayar35/taskhub-pro/branch/main/graph/badge.svg)](https://codecov.io/gh/bayar35/taskhub-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **Live Demo:** [taskhub-pro-sooty.vercel.app](https://taskhub-pro-sooty.vercel.app)
📡 **API:** [taskhub-api-wnu9.onrender.com](https://taskhub-api-wnu9.onrender.com)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT access + refresh tokens (HttpOnly cookies)
- Two-Factor Authentication (2FA) with TOTP
- Bcrypt password hashing (12 rounds)
- Token refresh rotation
- Rate limiting & Helmet security

### 🏢 Multi-tenancy & Teams
- Organization-based data isolation
- Role-Based Access Control (Owner, Admin, Member)
- Subscription plans (Free, Basic, Pro, Enterprise)

### ✅ Task Management
- Full CRUD operations
- Categories, priorities, due dates
- Real-time search (debounced)
- Filter by category & priority

### 📅 Advanced Features
- **Calendar View** — react-big-calendar
- **File Attachments** — AWS S3
- **AI Chat Agent** — RAG with Pinecone
- **Real-time Notifications** — Socket.io
- **PWA** — Offline mode + install prompt

---

## 🧪 Testing (115 tests)

| Level       | Tests | Tool |
|-------      |-------|------|
| **Backend** | 49    | Vitest + Supertest + MongoDB Atlas |
| **Frontend** | 66   | Vitest + Testing Library |
| **E2E**     | 10    | Playwright (Chromium) |
| **Total**   | **115** |    |

### Run Tests

```bash
npm test                      # All tests
npm run test:coverage         # With coverage
cd packages/frontend && npx playwright test  # E2E
🛠 Tech Stack
Frontend: React 19, Redux Toolkit, RTK Query, React Router v7, TailwindCSS, Vite, PWA

Backend: Node.js 22, Express 5, MongoDB, Mongoose, JWT, Socket.io, Zod, AWS S3, OpenAI

Testing: Vitest, Testing Library, Supertest, Playwright, Codecov

DevOps: npm workspaces, Turbo, GitHub Actions, Vercel, Render

📦 Project Structure
text
taskhub-pro/
├── packages/
│   ├── frontend/          # React app (Vite + TypeScript)
│   │   ├── src/
│   │   ├── tests/         # Unit tests (66)
│   │   └── e2e/           # E2E tests (10)
│   │
│   ├── backend/           # Express API
│   │   ├── src/
│   │   └── tests/         # Integration tests (49)
│   │
│   └── shared/            # Shared types & Zod schemas
│
├── .github/workflows/     # CI/CD pipelines
└── package.json           # Root workspace config
🚀 Getting Started
Prerequisites
Node.js 22.x

MongoDB 7.x (local or Atlas)

npm 10.x

Installation
bash
git clone https://github.com/bayar35/taskhub-pro.git
cd taskhub-pro
npm install
npm run build --workspace=packages/shared
Environment Setup
Backend (packages/backend/.env):

env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskhub
JWT_SECRET=your-32-character-secret-key-here
JWT_REFRESH_SECRET=your-32-character-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
Frontend (packages/frontend/.env):

env
VITE_API_URL=http://localhost:5000
Development
bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
🏗 Architecture



🔒 Security
✅ Helmet.js (security headers)

✅ CORS (configured origins)

✅ Rate limiting (100 req/15min)

✅ XSS protection (xss-clean)

✅ NoSQL injection (mongo-sanitize)

✅ Bcrypt (12 rounds)

✅ JWT (15min expiry)

✅ Refresh token rotation

✅ 2FA (TOTP)

📡 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/v1/auth/register	Register (auto-creates org)
POST	/api/v1/auth/login	Login
POST	/api/v1/auth/refresh	Refresh token
GET	/api/v1/auth/me	Current user
Todos
Method	Endpoint	Description
GET	/api/v1/todos	List all
POST	/api/v1/todos	Create
PATCH	/api/v1/todos/:id	Update
DELETE	/api/v1/todos/:id	Delete
Payments
Method	Endpoint	Description
POST	/api/v1/payments/stripe/checkout	Stripe checkout
POST	/api/v1/payments/qpay/invoice	QPay invoice
GET	/api/v1/payments	Payment history
📈 Roadmap
✅ Completed
☑ Authentication (JWT + 2FA)
☑ Multi-tenancy + RBAC
☑ Todo CRUD + Categories
☑ Payment integration (Stripe + QPay)
☑ 115 tests (49 backend + 66 frontend + 10 E2E)
☑ CI/CD pipeline
🚧 In Progress
□ Docker + docker-compose
□ Database migrations
□ Swagger/OpenAPI
📅 Planned
□ Monitoring (Prometheus + Grafana)
□ Mobile app (React Native)
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit changes (git commit -m 'feat: add amazing feature')

Push to branch (git push origin feature/amazing)

Open a Pull Request

Commit Convention
feat: — New feature

fix: — Bug fix

docs: — Documentation

test: — Tests

refactor: — Code refactoring

chore: — Maintenance

📄 License
MIT © bayar35

🙏 Acknowledgements
Built with ❤️ using modern web technologies

Inspired by real-world senior engineering practices
