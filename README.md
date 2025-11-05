<div align="center">

# 📝 To‑Do Liste 

Simple, fast, and accessible task manager with a secure password‑reset flow and a tiny Node.js email backend

<br/>

![Made with](https://img.shields.io/badge/made%20with-HTML5%20%7C%20CSS3%20%7C%20JavaScript-blue)
![Node](https://img.shields.io/badge/Node.js-Email%20Backend-43853D?logo=node.js&logoColor=white)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![License](https://img.shields.io/badge/license-ISC-lightgrey)

</div>

---

## Overview

This project delivers a modern, client‑side To‑Do app with:

- Local authentication (register/login) stored securely (SHA‑256 hashed passwords in localStorage)
- Production‑ready password‑reset flow using 6‑digit verification codes sent via email
- Clean, consistent UX with custom modals (no browser alerts/prompts)
- Categories, priorities, filtering and drag‑and‑drop ordering
- Accessibility modes (Dark, High‑Contrast, and Color‑Blindness variants)

It's designed for quick local use and easy showcasing. A minimal Node.js server (Express + Nodemailer) powers the email delivery for verification codes.

---

## Why this project (for recruiters)

- **Thoughtful UX:** custom modals, consistent styling, responsive layout
- **Security‑aware:** hashed passwords, safe email fallback, blocked password reuse
- **Accessibility built‑in:** multiple visual modes and clean contrasts
- **Clean separation:** tiny API focused on a single concern (email), client does the rest
- **Readable code structure:** small modules and clear naming
- **Tested:** 40+ tests covering backend, frontend logic, and E2E user flows with CI/CD
- **Production‑ready:** environment config, error handling, test automation, and docs

---

## Features

- Authentication
	- Register, Login, Logout
	- Password reset via 6‑digit email code (5‑minute expiry)
	- Prevent reusing the old password on reset
- Tasks & Categories
	- Create, edit, delete tasks
	- Priorities (low, medium, high) and categories
	- Search and filter tasks; drag‑and‑drop reordering
- UX & Modals
	- Custom, reusable modals for confirm, info, and code entry
	- Dedicated user‑info popup (name, email, registration date, stats)
- Accessibility
	- Dark mode, High‑contrast, and color‑blindness friendly palettes
	- Keyboard‑friendly controls and clear focus states
- Email Backend
	- Express API with Nodemailer (Gmail SMTP via App Password)
	- CORS enabled for local dev
	- HTML + plaintext email template; health endpoint
	- Safe fallback: the code is only shown on‑screen when running locally

---

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend (email only): Node.js, Express 5, Nodemailer, dotenv, CORS
- Storage: Browser localStorage (users, tasks, categories)

---

## Architecture

```
Frontend (static) ── Live Server (VS Code)
	│
	├── Auth + App (HTML/CSS/JS)
	│     ├─ Custom modal system (confirm/info/code)
	│     ├─ localStorage users/tasks/categories
	│     └─ email-config.js → calls backend API
	│
	└── Accessibility modes (dark/high-contrast/color-blind)

Backend (Node.js) ── Express API
	├─ POST /api/send-verification-code  (Nodemailer → Gmail SMTP)
	├─ GET  /api/health                  (readiness probe)
	└─ .env with EMAIL_USER / EMAIL_PASSWORD / PORT
```

Data model (client‑side):
- users[]: { name, email, passwordHash, registeredDate }
- tasks[]: { id, title, description, category, priority, done }
- categories[]: [string]

---

## Project Structure

```
KMS-WiSe2526-Gr3/
├─ app.js                 # Main app (tasks/categories/filters + modals)
├─ auth.html              # Auth UI (login/register/forgot/reset)
├─ auth.js                # Auth logic + email flow + modals
├─ email-config.js        # Frontend client that calls the email API
├─ index.html             # To‑Do application UI
├─ server.js              # Express + Nodemailer email backend
├─ styles.css             # Shared styles and accessibility modes
├─ modules/
│  ├─ categories.js       # Category helpers
│  ├─ filters.js          # Filter helpers
│  └─ tasks.js            # Task helpers
├─ utils/
│  └─ helpers.js          # Pure functions for unit testing
├─ test/
│  ├─ api.test.js         # Backend API tests (9)
│  └─ unit.test.js        # Frontend unit tests (22)
├─ e2e/
│  └─ app.spec.js         # Playwright E2E tests (9)
├─ .github/workflows/
│  └─ test.yml            # CI/CD pipeline
├─ playwright.config.js   # Playwright configuration
├─ .env                   # Your local secrets (ignored by git)
├─ .env.example           # Template for .env
├─ package.json           # Node scripts and deps
├─ TESTING.md             # Testing guide and best practices
└─ README.md              # You are here
```

---

## Getting Started

Prerequisites
- Node.js 14+ (backend)
- A Gmail account with 2‑Step Verification and an App Password
- VS Code with Live Server (or any static server)

1) Install backend dependencies

```pwsh
npm install
```

2) Configure environment

```pwsh
Copy-Item .env.example .env
```

Edit `.env` (no quotes; App Password has no spaces):

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your16characterapppassword
PORT=3000
```

3) Run the email backend

```pwsh
npm run dev    # auto-reload during development
# or
npm start
```

You should see the startup banner and “Email server is ready to send messages”.

4) Serve the frontend

- In VS Code: open `auth.html` → “Open with Live Server”
- Typical local URL: http://127.0.0.1:5500/auth.html

---

## Usage

1) Register a new user on the Register tab
2) Log in to use the To‑Do app (tasks, priorities, categories, filtering, drag-and-drop reordering)
3) Forgot Password:
	 - Enter your email → you’ll receive a 6‑digit code
	 - Enter the code in the modal (expires in 5 minutes)
	 - Choose a new password (cannot reuse the previous one)

Notes
- In development, if email sending fails or the backend is not running, the app only displays the code on‑screen when hosted on `localhost`/`127.0.0.1`. In production, the code is never shown.

---

## API Documentation (Email Backend)

Base URL: `http://localhost:3000`

### Health

GET `/api/health`

Response 200
```json
{ "status": "ok", "timestamp": "2025-01-01T12:34:56.789Z" }
```

### Send Verification Code

POST `/api/send-verification-code`

Headers
```
Content-Type: application/json
```

Body
```json
{
	"email": "user@example.com",
	"code": "123456"
}
```

Success 200
```json
{ "success": true, "messageId": "<smtp-id>" }
```

Errors
- 400: invalid email or invalid code format
- 500: sending failed (SMTP configuration or network)

Security considerations
- Uses a dedicated App Password for Gmail (never commit credentials)
- Production deployment should include rate limiting and endpoint authentication
- Should be served over HTTPS with domain-restricted CORS

---

## Configuration & Scripts

Environment variables (`.env`)
```
EMAIL_USER=...        # Gmail address
EMAIL_PASSWORD=...    # Gmail App Password (16 chars)
PORT=3000             # optional, default 3000
```

NPM scripts (`package.json`)
```
start       → node server.js
dev         → nodemon server.js
test        → run backend + unit tests
test:e2e    → run E2E tests (Playwright)
test:e2e:ui → run E2E tests with UI
test:all    → run all tests
```

---

## Accessibility

The app includes visually‑tested accessibility modes:
- Dark Mode
- High‑Contrast Mode
- Color‑blindness adjustments (Protanopia, Deuteranopia, Tritanopia)

All dialogs are custom modals, keyboard focusable, and consistent across the app.

---

## Security Notes

- Passwords are hashed (SHA‑256) before being stored locally
- Verification codes are 6 digits with a 5‑minute expiry
- Old password reuse is blocked during reset
- `.env` file is excluded from version control (already in `.gitignore`)
- Production deployments should use environment variables
- Recommended for production: rate limiting (e.g., `express-rate-limit`), HTTPS, domain‑restricted CORS, logging/monitoring

---

## Testing

This project includes comprehensive tests for backend, frontend units, and E2E flows.

### Test Structure

```
test/
├─ api.test.js       # Backend API tests (9 tests)
├─ unit.test.js      # Frontend unit tests (22 tests)
e2e/
└─ app.spec.js       # Playwright E2E tests (9 tests)
```

### Running Tests

**All tests:**
```pwsh
npm run test:all
```

**Backend & Unit tests only:**
```pwsh
npm test
```

**E2E tests only:**
```pwsh
npm run test:e2e
```

**E2E with UI (interactive):**
```pwsh
npm run test:e2e:ui
```

### Test Coverage

- **Backend (API):**
  - Health endpoint
  - Email sending validation (email format, code format, required fields)
  - CORS headers
  - Edge cases (missing params, invalid formats)

- **Frontend (Unit):**
  - Task filtering (by title, priority, category)
  - Email validation
  - Password policy enforcement
  - Code expiry logic
  - Category validation

- **E2E (Playwright):**
  - Register → Login → Create tasks
  - Forgot password → Enter code → Reset password → Login
  - Task management (create, mark done, filter)
  - Accessibility mode toggles (dark, high-contrast)

### CI/CD

GitHub Actions runs all tests on every push and PR:
- Backend & unit tests on Node 20
- E2E tests with Playwright (headless Chromium)
- Uploads test reports as artifacts

Workflow: `.github/workflows/test.yml`

---

## Troubleshooting

- No email arrives
	- Check server logs for "Email configuration error"
	- Verify `.env` values and App Password (no spaces)
	- Look in Spam/Junk
	- Ensure the backend is running on the same machine/port as configured in `email-config.js`

- Browser shows code on screen
	- You're likely running locally and the backend email call failed; start the server. In production the code is never shown

- Port already in use
	- Change `PORT` in `.env` and restart the server

- E2E tests fail
	- Ensure Live Server is running on http://127.0.0.1:5500
	- Check that backend started successfully (health endpoint)
	- Try running with UI: `npm run test:e2e:ui`

---
