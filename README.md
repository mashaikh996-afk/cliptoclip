# cliptoclip

A tiny, in-memory clipboard service for moving code snippets between devices.

Usage

1. Install dependencies (none required for the minimal server):

   npm install

2. Run:

   node server.js

3. Open http://localhost:3000 in your browser.

API

- POST /api/clips
  - body: { name, code, language?, expiration? }
  - expiration: "never" | "10m" | "1h" | "24h" | "7d" | "once"

- GET /api/clips/:name

Notes & caveats

- This project uses an in-memory Map for storage — all clips are lost when the server restarts.
- navigator.clipboard requires a secure context (HTTPS) on most mobile browsers. Use a local network or reverse proxy with TLS for production use.
- For production, add persistence (SQLite, Redis), rate limiting, and stronger input validation.
