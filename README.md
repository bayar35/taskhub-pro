# TaskHub Pro

> Senior-grade MERN SaaS platform with multi-tenancy, 2FA, PWA, AI integration, and 107 passing tests.

[![Tests](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml/badge.svg)](https://github.com/bayar35/taskhub-pro/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/bayar35/taskhub-pro/branch/main/graph/badge.svg)](https://codecov.io/gh/bayar35/taskhub-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **Live Demo:** [taskhub-pro-sooty.vercel.app](https://taskhub-pro-sooty.vercel.app)
📡 **API:** [taskhub-api-wnu9.onrender.com](https://taskhub-api-wnu9.onrender.com)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT access + refresh tokens (HttpOnly cookies)
- Two-Factor Authentication (2FA) with TOTP
- Backup codes for 2FA recovery
- Bcrypt password hashing
- Token refresh rotation
- Rate limiting & Helmet security

### 🏢 Multi-tenancy & Teams
- Organization-based data isolation
- Role-Based Access Control (Owner, Admin, Member)
- Team member invitations via email
- Subscription plans (Free, Basic, Pro, Enterprise)
- Plan limits (members, todos, storage)

### ✅ Task Management
- Full CRUD operations
- Categories (Personal, Work, Study)
- Priorities (low, medium, high)
- Due dates & tags
- Toggle completion
- Real-time search (debounced)
- Filter by category & priority

### 📅 Advanced Features
- **Calendar View** — react-big-calendar integration
- **Recurring Tasks** — Cron-based automation
- **File Attachments** — AWS S3 upload
- **AI Chat Agent** — RAG with Pinecone
- **AI Content Generation** — DALL-E + GPT-4
- **Email Notifications** — Nodemailer
- **Real-time Notifications** — Socket.io
- **PWA** — Offline mode + install prompt

### 🎨 UI/UX
- React 19 + TypeScript
- Redux Toolkit + RTK Query
- TailwindCSS with Dark Mode
- Multi-language (Mongolian + English)
- Responsive design
- Smooth animations
- Toast notifications

### 🧪 Testing (107 tests)
- **Backend:** 37 tests (Vitest + Supertest + MongoDB Atlas)
- **Frontend:** 70 tests (Vitest + Testing Library)
- **E2E:** Playwright (coming soon)
- **Coverage:** Codecov integration

### 🚀 DevOps
- **CI/CD:** GitHub Actions (107 tests, 6 min)
- **Frontend:** Vercel auto-deploy
- **Backend:** Render auto-deploy
- **Database:** MongoDB Atlas
- **Cache:** Redis (optional)
- **Queue:** BullMQ
- **Monitoring:** Sentry

---

## 🛠 Tech Stack

### Frontend
- React 19 + TypeScript
- Redux Toolkit + RTK Query
- React Router v7
- TailwindCSS v3
- React Hook Form + Zod
- Socket.io Client
- Vite v5 + PWA plugin
- react-big-calendar
- date-fns

### Backend
- Node.js 22 + TypeScript
- Express 5
- MongoDB + Mongoose
- Zod (validation)
- JWT (access + refresh)
- Socket.io (real-time)
- Bcrypt (hashing)
- Cookie-parser
- Nodemailer (email)
- Speakeasy + QRCode (2FA)
- AWS SDK S3 (files)
- OpenAI + Pinecone (AI)
- BullMQ + Redis (queue)
- Winston (logging)
- Sentry (monitoring)

### Testing
- Vitest (unit & integration)
- Testing Library (React)
- Supertest (HTTP API)
- MongoDB Atlas (test DB)
- Codecov (coverage)

### DevOps
- npm workspaces + Turbo (monorepo)
- GitHub Actions (CI/CD)
- Vercel (frontend)
- Render (backend)
- MongoDB Atlas (database)

---

## 📦 Project Structure

```
taskhub-pro/
├── packages/
│ ├── frontend/ # React app (Vite + TypeScript)
│ │ ├── src/
│ │ │ ├── app/ # Redux store, API
│ │ │ ├── components/ # UI components
│ │ │ ├── contexts/ # React Context
│ │ │ ├── features/ # Feature slices
│ │ │ ├── hooks/ # Custom hooks
│ │ │ ├── lib/ # Utilities (API, socket, i18n)
│ │ │ ├── pages/ # Route pages
│ │ │ └── routes/ # Route guards
│ │ ├── tests/ # Unit & component tests (70)
│ │ └── public/ # Static assets (PWA icons)
│ │
│ ├── backend/ # Express API
│ │ ├── src/
│ │ │ ├── config/ # Env, logger, socket, redis, queue
│ │ │ ├── middleware/ # Auth, validation, error, tenant
│ │ │ ├── models/ # Mongoose schemas
│ │ │ ├── modules/ # Feature modules
│ │ │ │ ├── ai/ # Chat + Content
│ │ │ │ ├── auth/ # Auth + 2FA
│ │ │ │ ├── file/ # S3 uploads
│ │ │ │ ├── notification/
│ │ │ │ ├── organization/
│ │ │ │ ├── payment/ # QPay
│ │ │ │ ├── recurring/
│ │ │ │ └── todo/
│ │ │ └── utils/ # JWT, password, mailer, s3
│ │ └── tests/ # Integration tests (37)
│ │
│ └── shared/ # Shared types & Zod schemas
│
├── .github/workflows/ # CI/CD pipelines
└── package.json # Root workspace config

text

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 22.x
- **MongoDB** 7.x (local) or MongoDB Atlas
- **npm** 10.x

### Installation

```bash
# Clone repository
git clone https://github.com/bayar35/taskhub-pro.git
cd taskhub-pro

# Install all dependencies
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
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
REDIS_URL=
API_URL=http://localhost:5000
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
This project has 107 tests across two levels:

Level	Tests	Tool	Command
Backend	37	Vitest + Supertest	npm run test --workspace=packages/backend
Frontend	70	Vitest + Testing Library	npm run test --workspace=packages/frontend
Run all tests
bash
npm run test
Coverage
bash
# Backend
npm run test:coverage --workspace=packages/backend

# Frontend
npm run test:coverage --workspace=packages/frontend
📡 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/v1/auth/register	Register (auto-creates organization)
POST	/api/v1/auth/login	Login (JWT + refresh cookie)
POST	/api/v1/auth/refresh	Refresh access token
POST	/api/v1/auth/logout	Logout
GET	/api/v1/auth/me	Current user
POST	/api/v1/auth/2fa/setup	Setup 2FA
POST	/api/v1/auth/2fa/verify	Verify 2FA
Todos
Method	Endpoint	Description
GET	/api/v1/todos	List all todos
GET	/api/v1/todos?category=...	Filter by category
GET	/api/v1/todos?search=...	Search by text
GET	/api/v1/todos/stats	Get statistics
POST	/api/v1/todos	Create todo
PATCH	/api/v1/todos/:id	Update todo
PUT	/api/v1/todos/:id/toggle	Toggle completion
DELETE	/api/v1/todos/:id	Delete todo
Notifications
Method	Endpoint	Description
GET	/api/v1/notifications	Get all (unread count)
PATCH	/api/v1/notifications/:id/read	Mark as read
PATCH	/api/v1/notifications/read-all	Mark all as read
DELETE	/api/v1/notifications/:id	Delete notification
Real-time events (Socket.io)
notification:new — emitted when new notification created

🏗 Architecture Decisions
Why Monorepo?
Shared types between frontend & backend (@taskhub/shared)

Single install with npm workspaces

Atomic commits across packages

Why RTK Query?
Automatic caching

Optimistic updates

Type-safe with Zod

Why Refresh Tokens in HttpOnly Cookies?
XSS-safe

CSRF-mitigated (sameSite: strict)

Rotatable (stored in DB)

Why Multi-tenancy?
SaaS-ready architecture

Organization-based isolation

Role-Based Access Control

Why MongoDB Atlas?
Reliable (no local setup)

Fast (hosted cluster)

Free tier for development

📈 Roadmap
☑ Authentication (JWT + 2FA)
☑ Multi-tenancy + RBAC
☑ Todo CRUD + Categories
☑ Statistics dashboard
☑ Refresh token rotation
☑ Search & filter
☑ Dark mode
☑ Push notifications (Socket.io)
☑ PWA + offline mode
☑ File attachments (S3)
☑ Calendar view
☑ Recurring tasks
☑ AI Chat Agent (RAG)
☑ AI Content Generation
☑ Email notifications
☑ 107 tests (37 backend + 70 frontend)
☑ CI/CD pipeline
☑ Auto-deploy to Vercel + Render
□ Advanced AI (fine-tuning)
□ Team collaboration (real-time editing)
□ Payment integration (Stripe)
□ Mobile app (React Native)
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
