# ED Chat - Full Stack Starter

This repository contains a full-stack starter for **ED Chat**, a monitored enterprise chat system for *Estrutura Dinâmica*.

## What's included
- `frontend/` — React + Tailwind login and basic pages (ED Chat login UI).
- `backend/` — Node.js (Express) server with JWT auth, admin endpoints, Socket.io for real-time chat.
- `docker-compose.yml` — PostgreSQL database and backend service ready for local development.
- Seeded admin user: `master@ed.com` / `MasterPass123!` (change on first run).

## How to run (development)

### 1) Start the database + backend with Docker:
```bash
docker-compose up --build
```
This will start Postgres and the backend on port `3001`. Backend connects to Postgres and creates required tables.

### 2) Run the frontend (separate terminal)
```bash
cd frontend
npm install
npm start
```
Open http://localhost:3000

## Notes
- The frontend uses the login component already customized with your logo. Place `logo.png` in `frontend/public/logo.png`.
- This is a starter; for production you should:
  - Secure secrets (do NOT use env vars in plaintext)
  - Use HTTPS and proper CORS origin settings
  - Harden authentication, password resets, and session management
  - Implement data retention / LGPD compliance as needed
