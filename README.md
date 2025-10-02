# Chatspace (MERN) — README

Simple chat application (MERN stack) that supports real-time messaging, image uploads via Cloudinary, JWT-based auth, and a lightweight React + Vite frontend.

## Features
- Real-time messaging using Socket.IO (online users map + new message events).
- User authentication (signup/login) using JWT tokens.
- Profile update with optional image upload (Cloudinary).
- Send and receive text and image messages. Images are uploaded to Cloudinary and stored as secure URLs in messages.
- Message read receipts: messages can be marked as seen.
- Backend API and frontend (Vite + React) kept in separate folders: `backend/` and `frontend/`.

## Quick file map
- `backend/server.js` — Express server, Socket.IO initialization, stores online users in memory with `userSocketMap`.
- `backend/lib/db.js` — MongoDB connection helper (connects to `${MONGODB_URI}/chat-app`).
- `backend/lib/cloudinary.js` — Cloudinary v2 configuration (uses env vars).
- `backend/lib/util.js` — JWT helpers (generate tokens).
- `backend/controllers/` — Controller logic for users & messages (signup/login, profile update, send/get messages, mark seen).
- `backend/routes/` — API routes for auth and messages.
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

Note: The server expects auth middleware to attach `req.user` (the current user). Pass JWT as `Authorization: Bearer <token>`.

## How images are handled
- Both profile images and message images are uploaded to Cloudinary using `cloudinary.uploader.upload()` in the backend controllers.
- The backend expects the `image` or `profilePic` field to be either:
  - a publicly accessible URL, or
  - a base64 data URL string (data:image/...) — Cloudinary accepts data URLs as uploads.
- After upload, the secure Cloudinary URL (`secure_url`) is saved to the `profilePic` field on the user or the `image` field on a message.
- Express JSON body parser has a limit of 2MB (`express.json({ limit: '2mb' })`). Keep uploaded base64 payloads reasonably small or send an image URL instead.

## Socket.IO behavior (realtime)
- Server initializes Socket.IO in `backend/server.js` and expects a `userId` query param on connection (e.g., client connects with `io(serverUrl, { query: { userId } })`).
- The server stores a Map `userSocketMap` mapping userId -> socketId and emits:
  - `getOnlineUsers` (array of online userIds) whenever connections change
  - `newMessage` to the receiver socket when a message is saved and the receiver is online

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
npx nodemon
```

Frontend (from repo root):

```powershell
cd frontend
npm install
npm run dev
```

## Pitfalls & gotchas (production considerations)
The project is small and approachable, but a few implementation details can cause problems in production. It's helpful and professional to document these for contributors and operators.

- socket handshake values are untrusted:
  - `socket.handshake.query` contains client-supplied query params from the initial Socket.IO handshake. Do not trust `handshake.query.userId` for authentication or authorization — it can be spoofed.
  - Recommended: authenticate sockets server-side with `io.use()` (verify a JWT or session) and attach a verified `socket.userId` to the socket before using it.

- presence stored in-memory is ephemeral and single-instance:
  - `userSocketMap` is an in-process JavaScript Map. It is cleared on process restart and not shared between server instances. In a horizontally scaled environment (multiple Node/containers), presence will be inconsistent.
  - Recommended: for small deployments, switch to `Map<userId, Set<socketId>>` to support multiple devices; for production scaling, use a shared store + Socket.IO adapter (Redis) to route events across instances.

- multi-device & multi-tab behavior:
  - The current code stores a single socket id per user. That overwrites when the same user connects from another tab or device and may cause missed events on other clients.
  - Recommended: store a Set of socket ids per user and emit events to every socket for that user.

- image payloads, base64 overhead and body-parser limits:
  - Sending images as base64 inside JSON increases size (~33% overhead) and can easily exceed `express.json({ limit: '2mb' })`, causing 413 Payload Too Large errors.
  - Recommended options: client-side compression/resizing, uploading directly from client to Cloudinary, or use multipart/form-data (FormData) + a streaming upload on the server (multer/busboy + cloudinary upload stream).

## License & contribution
This README was updated to provide basic developer onboarding information. Make additional changes as needed.
