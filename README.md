# ChatSpace - Modern MERN Stack Chat Application 💬

A full-featured real-tim   ├── lib/                   # Utility libraries
   │   ├── cloudinary.js      # Cloudinary upload with cleanup utilities
   │   ├── db.js              # MongoDB connection
   │   └── util.js            # JWT utilities ├── middlewares/           # Express middlewares
   │   ├── auth.js            # JWT verification (HTTP + Socket.IO)
   │   └── multer.js          # DiskStorage file upload handlingt application built with the MERN stack, featuring AI integration, advanced UI components, and comprehensive multimedia support.

<!-- ![Chat Application](https://img.shields.io/badge/Chat-Application-blue) ![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![Real-time](https://img.shields.io/badge/Real--time-Socket.IO-orange) -->

## ✨ Features

### Core Functionality
- 🔐 **Secure JWT Authentication** - Complete user registration/login with Socket.IO JWT verification
- 💬 **Real-time Messaging** - Instant messaging with authenticated Socket.IO connections
- 📸 **Advanced Media Support** - Secure image uploads with validation (5MB limit, multiple formats)
- 👥 **Profile Management** - Enhanced profile updates with avatar upload and form validation
- ✅ **Message Status Tracking** - Read receipts and message seen indicators
- 🌐 **Real-time Presence** - Authenticated user online/offline status with secure socket mapping

### Advanced Features
- 🤖 **AI Assistant Integration** - Secure chat with AI using Groq SDK
- 🎨 **Rich UI Components** - Custom React components with smooth animations and loading states
- ☁️ **Optimized Cloud Storage** - DiskStorage + Cloudinary with automatic cleanup and error handling
- 📱 **Enhanced Responsive Design** - Mobile-first with improved form validation and user feedback
- 🎭 **Interactive Visual Effects** - Multiple animated UI components with performance optimizations
- 🛡️ **Production-Ready Security** - Comprehensive input validation, file type checking, and memory management

### Tech Stack
- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB with Mongoose ODM  
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer + Cloudinary
- **AI Integration**: Groq SDK
- **Deployment**: Vercel-ready configuration

## ✅ Recent Security & Performance Improvements

### 🔒 Security Enhancements (Recently Fixed)
- ✅ **Socket Authentication Secured** - JWT verification in Socket.IO middleware with database user validation
- ✅ **Enhanced File Upload Security** - Comprehensive client & server-side validation (5MB limit, type checking)
- ✅ **Memory Leak Prevention** - Proper URL.createObjectURL cleanup and diskStorage implementation
- ✅ **Input Validation** - Enhanced form validation with user feedback and error handling
- ✅ **FormData Optimization** - Replaced base64 uploads with proper multipart/form-data handling

### 🚀 Performance Optimizations (Recently Implemented)
- ✅ **DiskStorage Migration** - Switched from memoryStorage to diskStorage for better scalability
- ✅ **Automatic File Cleanup** - Temporary files automatically removed after Cloudinary upload
- ✅ **Smart Component Updates** - Optimized React re-renders and scroll behavior
- ✅ **Loading States** - Comprehensive UI feedback during uploads and operations

## ⚠️ Remaining Areas for Enhancement

### Medium Priority Issues
- **CORS Configuration** - Currently allows all origins (`*`), should restrict to specific domains in production
- **AI Route Consistency** - Backend uses `/chat` while frontend calls `/api/ai/ask` endpoint
- **Multi-device Support** - `userSocketMap` stores one socket per user; consider supporting multiple connections
- **Rate Limiting** - Add `express-rate-limit` to upload and authentication endpoints

### Lower Priority Improvements
- **Refresh Token Flow** - Currently uses access tokens only; consider refresh token implementation
- **Presence Scaling** - In-memory presence won't scale across multiple instances (needs Redis adapter)
- **Error Response Standardization** - Some endpoints return different error formats
- **Advanced File Scanning** - Consider malware scanning for uploaded files in high-security environments

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

## � Technical Implementation Details

### Socket.IO Authentication Flow
```javascript
// JWT verification in Socket.IO middleware
io.use(socketAuthMiddleware); // Verifies JWT and attaches user data
// User authentication required for all socket connections
```

### File Upload Architecture
```javascript
// DiskStorage → Cloudinary → Cleanup Pipeline
multer.diskStorage() → cloudinary.upload() → fs.unlink()
// Automatic temporary file cleanup after cloud upload
```

### Security Layers
1. **Frontend Validation** - File type, size, format checking
2. **Backend Validation** - Server-side file verification  
3. **JWT Socket Auth** - Database user verification for WebSocket connections
4. **FormData Handling** - Efficient multipart uploads (no base64 overhead)
5. **Memory Management** - Automatic cleanup of resources and object URLs

## �🛠️ Installation & Setup

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

### Current Security Implementations
- ✅ **Password Security** - bcryptjs hashing with salt rounds
- ✅ **JWT Authentication** - Access tokens with Socket.IO integration and database verification
- ✅ **File Upload Security** - Multi-layer validation (client + server), type checking, size limits (5MB)
- ✅ **Memory Management** - Proper cleanup of temporary files and object URLs
- ✅ **Input Validation** - Comprehensive form validation with user feedback
- ✅ **CORS Configuration** - Cross-origin resource sharing setup
- ✅ **Error Handling** - Graceful error handling with user-friendly messages
- ✅ **DiskStorage** - Secure temporary file handling with automatic cleanup

### Security Best Practices Implemented
- Socket authentication with JWT verification
- FormData handling instead of base64 for large files
- Client-side and server-side file validation
- Automatic resource cleanup and memory leak prevention
- Protected API endpoints with middleware authentication

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

## 🎯 Key Achievements

This application successfully implements:
- ✅ **Production-Ready Security** - JWT Socket authentication, comprehensive file validation
- ✅ **Scalable Architecture** - DiskStorage with cloud integration and automatic cleanup
- ✅ **Excellent UX** - Loading states, error handling, form validation with user feedback
- ✅ **Memory Efficiency** - Proper resource management and leak prevention
- ✅ **Modern Best Practices** - FormData uploads, optimized React patterns, secure API design

## 🙏 Acknowledgments

- Socket.IO for secure real-time communication
- Cloudinary for robust media management
- Groq for AI integration capabilities
- Multer for efficient file upload handling
- The React and Node.js communities for excellent tooling

---

**Built with ❤️ by [the-avc](https://github.com/the-avc)**

*Recent major updates: Socket authentication security, DiskStorage implementation, enhanced file handling, and comprehensive input validation.*

For detailed implementation guides, check out:
- `multerchat.md` - Advanced Multer diskStorage implementation
- `socketchat.md` - Secure Socket.IO real-time features

