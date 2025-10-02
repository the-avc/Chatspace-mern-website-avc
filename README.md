# ChatSpace - Modern MERN Stack Chat Application 💬

A full-featured real-time chat application built with the MERN stack, featuring AI integration, advanced UI components, and comprehensive multimedia support.

<!-- ![Chat Application](https://img.shields.io/badge/Chat-Application-blue) ![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![Real-time](https://img.shields.io/badge/Real--time-Socket.IO-orange) -->

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication** - Secure user registration and login system
- 💬 **Real-time Messaging** - Instant messaging powered by Socket.IO
- 📸 **Media Support** - Send images and multimedia content
- 👥 **User Management** - Profile updates with avatar support
- ✅ **Message Status** - Read receipts and message seen indicators
- 🌐 **Online Presence** - Real-time user online/offline status

### Advanced Features
- 🤖 **AI Assistant Integration** - Chat with AI using Groq SDK
- 🎨 **Rich UI Components** - Custom React components with animations
- ☁️ **Cloud Storage** - Cloudinary integration for media uploads
- 📱 **Responsive Design** - Mobile-first responsive interface
- 🎭 **Visual Effects** - Multiple animated UI components

### Tech Stack
- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB with Mongoose ODM  
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer + Cloudinary
- **AI Integration**: Groq SDK
- **Deployment**: Vercel-ready configuration

## ⚠️ Remaining pitfalls & known limitations (what still needs work)

- Socket authentication is weak
   - Current implementation trusts `userId` sent in the socket handshake query. This is easily spoofed. Recommended: verify JWT in `io.use()` and attach a verified `socket.userId`.

- Single-socket mapping & multi-device problems
   - `userSocketMap` stores one socket id per user and will overwrite when the user opens another tab or device. Consider `Map<userId, Set<socketId>>` to support multiple connections per user.

- Presence and scaling
   - Presence is kept in memory and is not shared between instances. For multi-instance deployments you must use a Socket.IO adapter (Redis) to share presence and events.

- Large image uploads and performance
   - Base64 uploads inflate payloads (~33% overhead) and commonly hit the 2MB JSON parser limit; for large files prefer multipart/form-data, resumable uploads, or direct-to-Cloudinary client uploads.

- No refresh-token flow implemented
   - The repo currently issues access tokens only. Long-lived sessions should use refresh tokens (rotating refresh tokens recommended) to improve UX and security.

- Inconsistent error responses & logging
   - Some controllers return detailed errors (stack traces) to clients. For production, return safe, generic messages to clients and log details server-side.

- Missing rate limiting and abuse protection
   - No `express-rate-limit` or similar throttling is present by default. Add rate limiting to authentication and AI endpoints to avoid abuse and extra costs.

- Validation gaps
   - File-type and file-size validation is minimal. Add server-side checks to reject disallowed file types and scan for malicious payloads when necessary.

## �📁 Project Structure

```
chat-app/
├── README.md                    # This file
├── multerchat.md               # Multer implementation docs
├── socketchat.md               # Socket.IO implementation docs
├── backend/                    # Node.js/Express server
│   ├── server.js              # Main server file with Socket.IO
│   ├── package.json           # Backend dependencies
│   ├── vercel.json            # Vercel deployment config
│   ├── controllers/           # Business logic
│   │   ├── ai-controllers.js  # AI chat functionality
│   │   ├── message-controllers.js
│   │   └── user-controllers.js
│   ├── lib/                   # Utility libraries
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   ├── db.js              # MongoDB connection
│   │   └── util.js            # JWT utilities
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.js            # JWT verification
│   │   └── multer.js          # File upload handling
│   ├── models/                # MongoDB schemas
│   │   ├── message-model.js
│   │   └── user-model.js
│   └── routes/                # API routes
│       ├── ai-routes.js       # AI assistant endpoints
│       ├── messages-routes.js
│       └── user-routes.js
└── frontend/                  # React application
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration
    ├── vercel.json            # Vercel deployment config
    ├── context/               # React contexts
    │   ├── AuthContext.jsx    # Authentication state
    │   └── ChatContext.jsx    # Chat state management
    ├── react-bits/            # Custom UI components
    │   ├── Aurora/            # Aurora effect component
    │   ├── Galaxy/            # Galaxy background
    │   ├── GradientBlinds/    # Gradient animations
    │   ├── Hyperspeed/        # Speed effect
    │   ├── LetterGlitch/      # Text glitch effect
    │   ├── LiquidEther/       # Liquid animations
    │   └── ... (more components)
    ├── src/
    │   ├── App.jsx            # Main app component
    │   ├── components/        # Core components
    │   │   ├── ChatContainer.jsx
    │   │   ├── RightSidebar.jsx
    │   │   └── Sidebar.jsx
    │   ├── pages/             # Page components
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── lib/               # Frontend utilities
    │   │   ├── ai.js          # AI integration
    │   │   └── utils.js       # Helper functions
    │   └── assets/            # Static assets
    └── public/                # Public assets
```

## 🚀 API Endpoints

### Authentication Endpoints
```http
# Public endpoints
POST /api/auth/signup
POST /api/auth/login

# Protected endpoints (require Authorization: Bearer <token>)
PUT /api/auth/update-profile
GET /api/auth/get-profile
```

### Message Endpoints (Protected)
```http
GET /api/messages/users          # Get all users for sidebar
GET /api/messages/:userId        # Get chat history with user
POST /api/messages/send/:userId  # Send message to user
PUT /api/messages/seen/:msgId    # Mark message as read
```

### AI Assistant Endpoints (Protected)
```http
POST /api/ai/ask                 # Chat with AI assistant
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account
- Groq API key (for AI features)

### Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create environment file**
   ```powershell
   # Create .env file with the following variables:
   ```
   ```env
   # Server Configuration
   PORT=5000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017
   
   # JWT Configuration
   JWT_SECRET_KEY=your-super-secret-jwt-key
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=10d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # AI Configuration
   GROQ_API_KEY=your-groq-api-key
   AI_ASSISTANT_ID=ai-assistant-unique-id
   ```

4. **Start the backend server**
   ```powershell
   npm start
   # or for development with auto-reload:
   npx nodemon server.js
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Start the development server**
   ```powershell
   npm run dev
   ```

4. **Build for production**
   ```powershell
   npm run build
   ```

## 🔒 Security Considerations

### Current Implementations
- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication  
- ✅ CORS configuration
- ✅ Input validation on API endpoints
- ✅ Secure file upload handling

3. **Environment Variables**: Set all required environment variables in Vercel dashboard

### Alternative Deployment Options
- **Backend**: Railway, Render, DigitalOcean
- **Frontend**: Netlify, GitHub Pages, Firebase Hosting
- **Database**: MongoDB Atlas (recommended for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Cloudinary for media management
- Groq for AI integration
- The React and Node.js communities

---

**Built with ❤️ by [the-avc](https://github.com/the-avc)**

For detailed implementation guides, check out:
- `multerchat.md` - Multer file upload implementation
- `socketchat.md` - Socket.IO real-time features

