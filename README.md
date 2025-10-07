# ChatSpace - Modern MERN Stack Chat Application

A full-featured real-time application built with the MERN stack, featuring AI integration, advanced UI components, and media support.

![Chat Application](https://img.shields.io/badge/Chat-Application-blue) ![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![Real-time](https://img.shields.io/badge/Real--time-Socket.IO-orange)

## ✨ Features
### Core Functionality
-  **Secure JWT Authentication** - Complete user registration/login with Socket.IO JWT verification
-  **Real-time Messaging** - Instant messaging with authenticated Socket.IO connections
-  **Media Support** - image uploads with validation (5MB limit, multiple formats)
-  **Profile Management** - Enhanced profile updates with avatar upload 
-  **Real-time Presence** - Authenticated user online/offline status with secure socket mapping

### Advanced Features
-  **AI Assistant Integration** - Secure chat with AI using Groq SDK
- **AI Usage handling by Admin** - Admin can set the usage of AI for all users
- **Lazy Loading Components** - React.lazy() for TextType and Silk components
-  **Rich UI Components** - Added background and text animations using react-bits
-  **Optimized Cloud Storage** - DiskStorage + Cloudinary with automatic cleanup

### Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB with Mongoose ODM  
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer + Cloudinary
- **AI Integration**: Groq SDK
- **Deployment**: Vercel-ready configuration

## ✅ Recent Security & Performance Improvements

### Enhancements (Recently Fixed)
- ✅ **Socket Authentication Secured** - JWT verification in Socket.IO middleware with database user validation. Every socket connection is validated against JWT + database, ensuring only logged-in users participate
- ✅ **Enhanced File Upload Security** - Comprehensive client & server-side validation (5MB limit, type checking)
- ✅ **FormData Optimization** - Replaced base64 uploads with proper multipart/form-data handling. Base64 encoding increases file size by ~33%, consuming more bandwidth and memory.

- ✅ **DiskStorage Migration** - Switched from memoryStorage to diskStorage for better scalability.Multiple simultaneous uploads could exhaust server memory. No cleanup = disk space leak
- ✅ **Automatic File Cleanup** - Temporary files automatically removed after Cloudinary upload
- ✅ **Admin AI Control** - Admin can disable AI globally. Reduces API costs when not needed
- ✅ **Dynamic Upload Controls** - Admin can toggle uploads via `checkUploadEnabled` middleware
- ✅ **Lazy Component Loading** - React.lazy() implementation for better performance

## ⚠️ Remaining Areas for Enhancement
- **CORS Configuration** - Currently allows all origins (`*`), should restrict to specific domains in production
- **Multi-device Support** - `userSocketMap` stores one socket per user; consider supporting multiple connections
- **Rate Limiting** - Add `express-rate-limit` to upload and authentication endpoints
- **Refresh Token Flow** - Currently uses access tokens only; consider refresh token implementation
- **Presence Scaling** - In-memory presence won't scale across multiple instances (needs Redis adapter)
- **Error Response Standardization** - Some endpoints return different error formats

### Performance Optimizations
- **Lazy Loading** - React.lazy() for TextType and Silk components
- **Memory Management** - DiskStorage with automatic cleanup after Cloudinary upload

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
│   │   ├── ai-controllers.js  
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
│       ├── ai-routes.js       endpoints
│       ├── messages-routes.js
│       └── user-routes.js
└── frontend/                  # React application
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration
    ├── vercel.json            # Vercel deployment config
    ├── context/               # React contexts
    │   ├── AuthContext.jsx    # Authentication state management
    │   ├── AiContext.jsx      # AI assistant state management
    │   └── ChatContext.jsx    # Chat state management
    ├── react-bits/            # Custom UI components
    │   ├── Silk/              # Silk effect component
    │   └── TextType/          # TextType effect component
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

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/get-profile` - Get current user (protected)
- `PUT /api/auth/update-profile` - Update profile with avatar (protected)

### Messages (Protected)
- `GET /api/messages/users` - Get all users for sidebar
- `GET /api/messages/:userId` - Get conversation history
- `POST /api/messages/send/:userId` - Send message (text/image)
- `PUT /api/messages/seen/:msgId` - Mark message as read

### AI Assistant (Protected)
- `POST /api/ai/ask` - Send message to AI (requires aiEnabled=true)
- `PUT /api/ai/limiter` - Toggle AI globally (admin only)
- `GET /api/ai/limiter` - Get the AI availability status

### Admin Controls
- **Upload Toggle** - Admin can enable/disable uploads via database flag
- **AI Toggle** - Admin can control AI availability in real-time

**Note:** Protected endpoints require `Authorization: Bearer <token>` header.

## � Installation & Setup

### Backend Setup

1. **Navigate and install dependencies**
   ```powershell
   cd backend
   npm install
   ```
2. **Create environment file**
   ```powershell
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
   AI_ENABLED=true

   # Admin Configuration
   ADMIN_ID=admin-unique-id
   ```
3. **Start the backend server**
   ```powershell
   npm start
   npx nodemon
   ```

### Frontend Setup

1. **Navigate and install dependencies**
   ```powershell
   cd frontend
   npm install
   ```
2. **Create environment file**
   ```powershell
   # Backend Connection
   VITE_BACKEND_URL='http://localhost:5000'
   
   # User IDs
   VITE_ADMIN_ID=admin-unique-id
   VITE_AI_ASSISTANT_ID=ai-assistant-unique-id
   
   # Feature Flags
   VITE_AI_ENABLED=true
   ```
3. **Start the development server**
   ```powershell
   npm run dev
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License
This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Socket.IO for secure real-time communication
- Cloudinary for robust media management
- Groq for AI integration capabilities
- Multer for efficient file upload handling
- The React and Node.js communities for excellent tooling

---

**Built with ❤️ by [the-avc](https://github.com/the-avc)**

## 📚 Additional Documentation
For detailed implementation notes, see:
- [`multerchat.md`](multerchat.md) - File upload implementation details
- [`socketchat.md`](socketchat.md) - Socket.IO authentication guide

