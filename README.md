# Email Tracker (Minimal GMass/Mailtrack Clone)

A lightweight email tracking system with Node.js/Express/MongoDB backend, React/Tailwind frontend, and Nodemailer for sending tracked emails.

## Prerequisites
- Node.js 18+
- pnpm or npm
- Docker (for MongoDB) or a MongoDB URI

## Quick Start

### 1) Start MongoDB
```bash
docker compose up -d
```

### 2) Backend
```bash
cd backend
cp .env.example .env
pnpm install # or npm install
pnpm dev     # or npm run dev
```

### 3) Frontend
```bash
cd ../frontend
pnpm install # or npm install
pnpm dev     # or npm run dev
```

## Environment (backend/.env)
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/email-tracker
APP_BASE_URL=http://localhost:4000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
FROM_EMAIL="Tracker <no-reply@example.com>"
```

## Send a Test Email
Use the POST `/api/send-email` endpoint:
```bash
curl -X POST http://localhost:4000/api/send-email \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "you@example.com",
    "subject": "Hello with tracking",
    "html": "<p>Hi there! <a href=\"https://example.com\">Visit</a></p>"
  }'
```

## Frontend URL
- React app runs at http://localhost:5173 by default.

## Features
- Tracking pixel `/track/open?id=<id>` returns a 1x1 transparent GIF and logs events
- Click tracking `/track/click?id=<id>&url=<realUrl>` logs and redirects
- REST API for email list and stats
- Dashboard with opens/clicks and charts

## Scripts
- Backend: `dev`, `build`, `start`, `seed`
- Frontend: `dev`, `build`, `preview`

## Notes
- For approximate location, we use IP-based lookup (GeoIP), which is coarse.
- Ensure `APP_BASE_URL` is reachable by email clients for the pixel/clicks.

## Chrome extension (Gmail)

- Folder: `extension/`
- Load in Chrome: chrome://extensions → Enable Developer Mode → Load unpacked → select `extension/` folder.
- Backend must run at `http://localhost:4000`.
- In the extension popup, click Connect Gmail (requires GOOGLE_* env vars on backend).
- In Gmail compose, use the injected "Send Tracked" button to send via Gmail API.
