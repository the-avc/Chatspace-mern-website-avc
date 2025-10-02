# Chatspace (MERN) — README

Lightweight chat application (MERN) with real-time messaging, image uploads (Cloudinary), JWT authentication, a Vite + React frontend, and an experimental AI assistant endpoint.

## Features
- Real-time messaging using Socket.IO (presence tracking + new message events).
- User authentication (signup/login) using JWT tokens.
- Profile update with optional image upload (Cloudinary).
- Send and receive text and image messages. Images are uploaded to Cloudinary and stored as secure URLs on messages and profiles.
- Message read receipts: messages can be marked as seen.
- AI assistant endpoint (experimental) under `/api/ai` for server-side AI integrations.
- Frontend built with React + Vite located in the `frontend/` folder.

## Quick file map
- `backend/server.js` — Express server, Socket.IO initialization, registers `user-routes`, `messages-routes`, and `ai-routes`.
- `backend/lib/db.js` — MongoDB connection helper (connects to `${MONGODB_URI}/chat-app`).
- `backend/lib/cloudinary.js` — Cloudinary v2 configuration (uses env vars).
- `backend/lib/util.js` — JWT helpers (generate tokens).
- `backend/controllers/` — Controller logic for users, messages, and AI handlers.
- `backend/middlewares/` — middleware including `verifyToken` for protected routes.
- `backend/routes/` — API routes: `auth`, `messages`, and `ai`.
- `backend/models/` — Mongoose models for `User` and `Message`.
- `frontend/` — Vite + React app (components, pages, contexts, assets).

## API Endpoints (summary)
Prefix all routes with `/api` when talking to the server.

- Auth (no auth required):
  - `POST /api/auth/signup` — body: { fullName, email, password, profilePic?, bio? }
  - `POST /api/auth/login` — body: { email, password }

- Auth (requires Authorization header `Bearer <token>`):
  - `PUT /api/auth/update-profile` — body: { fullName, bio, profilePic? }
  - `GET /api/auth/get-profile` — returns current user's profile

- Messages (requires Authorization header `Bearer <token>`):
  - `GET /api/messages/users` — get other users for the sidebar (returns unseen message counts)
  - `GET /api/messages/:userId` — get all messages between current user and `userId` (marks unseen as seen)
  - `PUT /api/messages/seen/:msgId` — mark a single message as seen
  - `POST /api/messages/send/:userId` — send message to `userId`; body: { text?, image? }

- AI (experimental):
  - `POST /api/ai/ask` — (example) server-side AI assistant endpoint (check `backend/routes/ai-routes.js` for exact contract)

Note: The server expects auth middleware to attach `req.user` (the current user) on protected endpoints. Pass JWT as `Authorization: Bearer <token>`.

## How images are handled
- Profile and message images are uploaded to Cloudinary via the backend controllers using `cloudinary.uploader.upload()`.
- The backend accepts either a publicly accessible image URL or a base64 data URL (data:image/...). After upload the Cloudinary `secure_url` is saved to the database.
- Express JSON body parser is configured with a 2MB limit: `express.json({ limit: '2mb' })`. Large base64 payloads may be rejected; prefer client-side compression, multipart uploads, or direct-to-Cloudinary uploads for large files.

## Socket.IO behavior (realtime)
- Socket.IO is initialized in `backend/server.js`. The current code reads `userId` from `socket.handshake.query.userId` on connection and stores it in an in-memory `userSocketMap`.
- The server emits `getOnlineUsers` (array of online userIds) when connections change and sends `newMessage` events to the receiver's socket id when messages are saved.

## Environment variables
Create a `.env` file in `backend/` with the following variables (example values omitted):

- `PORT` — optional, defaults to 5000
- `MONGODB_URI` — MongoDB connection string (server appends `/chat-app`)
- `JWT_SECRET_KEY` — secret for signing JWTs
- `ACCESS_TOKEN_EXPIRY` — optional (e.g. `1d`)
- `REFRESH_TOKEN_EXPIRY` — optional (e.g. `10d`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials

## Running locally (development)

Backend (from repo root):

```powershell
cd backend
npm install
npx nodemon server.js
```

Frontend (from repo root):

```powershell
cd frontend
npm install
npm run dev
```

Notes:
- The frontend uses Vite and expects the backend API + socket server to be reachable. Update client-side base URLs if needed.

## Current operational notes
The repository has seen a few improvements. Below are the current behaviors and recommended follow-ups:

- Error message handling: some middleware and controllers still return or log detailed error messages. For safety, prefer returning a generic 500 client message (e.g. `Server error`) and logging details server-side.

- Socket authentication & presence:
  - The current implementation reads `userId` from the socket handshake query and stores a single socket id per user in an in-memory Map. This is convenient but has limitations: handshake query values are client-supplied and can be spoofed; presence is ephemeral and not shared across instances; single-socket mapping overwrites when users open multiple tabs/devices.
  - Recommended: authenticate sockets using a verified JWT in `io.use()`, store a Set of socket ids per user `(Map<userId, Set<socketId>>)`, and use a Redis adapter for multi-instance deployments.

- Image uploads & body size:
  - Sending large images as base64 inside JSON inflates payload size (~33% overhead) and frequently hits the 2MB parser limit. Consider multipart/form-data uploads, streaming to Cloudinary, or client-side compression.

## Changes in this branch
- AI assistant endpoint added (`/api/ai`) — experimental server-side integration. Check `backend/routes/ai-routes.js` and `backend/controllers/ai-controller.js` (if present) for API contract and usage.
-Still image uploading is not supported and the chats are not stored in database so the user after logging out can't access his/her chats with the A.I

## License & contribution
This README was created for this branch to reflect recent changes (AI assistant integration and controller hardening). 
