# Socket.IO Real-Time Chat Implementation - ChatSpace

This document provides a comprehensive explanation of the Socket.IO implementation in your ChatSpace application, covering real-time messaging, online user tracking, and secure authentication.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Socket Authentication](#socket-authentication)
5. [Message Broadcasting](#message-broadcasting)
6. [Online User Management](#online-user-management)
7. [Socket Event Flow](#socket-event-flow)

---

## Architecture Overview

Your ChatSpace socket system implements:

- **Secure Authentication**: JWT-based socket authentication middleware
- **Real-Time Messaging**: Instant message delivery between users
- **Online Presence**: Live tracking of connected users
- **Targeted Broadcasting**: Point-to-point message delivery
- **Offline Handling**: Message persistence for offline users

---

## Backend Implementation

### 1. Server Setup and Initialization

#### File: `backend/server.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import jwt from 'jsonwebtoken';
import { connectDB } from './lib/db.js';
import { User } from './models/user-model.js';
import { verifySocket } from './middlewares/auth.js';
import userRouter from './routes/user-routes.js';
import messageRouter from './routes/messages-routes.js';
import aiRouter from "./routes/ai-routes.js";
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

//init socket
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});

//store online users
export const userSocketMap = new Map(); //key:userId value:socketId

// Use socket authentication middleware
io.use(verifySocket);
```

**What This Setup Does:**

1. **HTTP Server Creation**: 
   - Wraps Express app in HTTP server for Socket.IO compatibility
   - Enables handling of both HTTP requests and WebSocket connections

2. **Socket.IO Server Initialization**:
   - Creates Socket.IO server with CORS configuration
   - Allows cross-origin connections from frontend
   - Exports `io` instance for use in controllers

3. **User Mapping Storage**:
   - `userSocketMap` stores userId → socketId relationships
   - Enables targeted message delivery to specific users
   - Provides O(1) lookup performance

4. **Authentication Middleware**:
   - Applies JWT authentication to all socket connections
   - Ensures only authenticated users can connect
   - Validates tokens before allowing real-time communication

### 2. Connection Management

```javascript
io.on("connection", (socket) => {
    // Use verified userId from authentication middleware
    const userId = socket.userId;
    console.log(`User connected: ${socket.user.fullName} (${userId})`);

    if (userId) {
        userSocketMap.set(userId, socket.id);
    }
    //emit event to all connected users (convert Map keys to array)
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.fullName} (${userId})`);
        if (userId) {
            userSocketMap.delete(userId);
        }
        //emit event to all connected users (convert Map keys to array)
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
});
```

**Connection Process:**

1. **Authenticated Connection**: Uses pre-validated user data from auth middleware
2. **User Mapping**: Associates user ID with socket ID for message targeting
3. **Online Broadcasting**: Notifies all clients when users connect/disconnect
4. **Cleanup**: Removes disconnected users from mapping to prevent memory leaks

---

## Socket Authentication

### Authentication Middleware

#### File: `backend/middlewares/auth.js`

```javascript
export const verifySocket = async (socket, next) => {
    try {
        // Get token from auth payload (preferred) or query params
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
            console.log("Socket connection rejected: No token provided");
            return next(new Error("Authentication error: No token provided"));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            console.log("Socket connection rejected: Invalid token");
            return next(new Error("Authentication error: Invalid token"));
        }

        // Get user from database
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("Socket connection rejected: User not found");
            return next(new Error("Authentication error: User not found"));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);
        next();
    } catch (error) {
        console.log("Socket authentication error:", error.message);
        next(new Error("Authentication error: " + error.message));
    }
}
```

**Security Features:**

- **JWT Token Verification**: Validates token signature and expiration
- **Database User Lookup**: Ensures user account still exists and is valid
- **Secure User Attachment**: Stores verified user data on socket object
- **Error Handling**: Rejects connections with detailed error messages
- **Token Sources**: Accepts tokens from auth payload or query parameters

**Why This Security is Important:**
- Prevents unauthorized socket connections
- Eliminates user impersonation attacks
- Ensures only valid, active users can send/receive messages
- Provides audit trail of connection attempts

---

## Message Broadcasting

### Real-Time Message Controller

#### File: `backend/controllers/message-controllers.js`

```javascript
import { userSocketMap, io } from "../server.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { text } = req.body;
        const receiverId = req.params.userId;

        let imageUrl = "";
        
        // Handle image upload if present
        if (req.file) {
            if (!req.uploadsEnabled && req.file?.path) {
                try {
                    await fs.unlinkSync(req.file.path);
                } catch (e) {
                    // Ignore errors during file deletion
                }
                return res.status(403).json({ success: false, message: "Image uploads are disabled by AVC" });
            }
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            if (uploadResponse) {
                imageUrl = uploadResponse.secure_url;
            } else {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        // Validate that either text or image is provided
        if (!text && !imageUrl) {
            return res.status(400).json({ success: false, message: "Either text or image is required" });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: text || "",
            image: imageUrl
        });

        await newMessage.save();

        //emit new message to receiver if online
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        console.log("Send message error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
```

**Message Broadcasting Process:**

1. **Database-First Strategy**:
   - Messages are saved to MongoDB before socket emission
   - Ensures data persistence even if socket delivery fails
   - Offline users can retrieve messages when they reconnect

2. **Targeted Socket Delivery**:
   ```javascript
   const receiverSocketId = userSocketMap.get(receiverId);
   if (receiverSocketId) {
       io.to(receiverSocketId).emit("newMessage", newMessage);
   }
   ```
   - Looks up receiver's current socket connection
   - Only sends if user is currently online
   - Uses point-to-point messaging (not broadcast)

3. **Hybrid Message Support**:
   - Handles both text and image messages
   - Integrates with Cloudinary for file uploads
   - Validates message content before sending

---

## Frontend Implementation

### 1. Socket Context Management

#### File: `frontend/context/AuthContext.jsx`

```javascript
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    //connect socket to handle real-time events
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, cannot connect socket");
            return;
        }

        const newSocket = io(backendURL, {
            // Send JWT token for secure authentication
            auth: {
                token: token
            },
            // Keep userId in query for backward compatibility (optional)
            query: {
                userId: userData._id
            },
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            console.debug("getOnlineUsers payload:", userIds);
            if (Array.isArray(userIds)) {
                setOnlineUsers(userIds);
            } else if (userIds && typeof userIds === 'object') {
                try {
                    setOnlineUsers(Array.from(Object.keys(userIds)));
                } catch (e) {
                    setOnlineUsers([]);
                }
            } else {
                setOnlineUsers([]);
            }
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection failed:', err.message);
            
            // Handle authentication errors specifically
            if (err.message.includes('Authentication error')) {
                console.error('Socket authentication failed - token may be invalid or expired');
                // force logout on auth failure
                logout();
            }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
    }
```

**Frontend Socket Features:**

1. **Secure Authentication**: Sends JWT token in auth payload for server validation
2. **Connection Management**: Prevents duplicate connections and handles errors
3. **Online User Sync**: Receives and processes online user updates from server
4. **Error Handling**: Handles connection failures and authentication errors
5. **Auto-Logout**: Forces logout if socket authentication fails

### 2. Authentication Integration

```javascript
//login func to handle socket connection on login
const login = async (state, credentials) => {
    try {
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
        if (data?.success) {
            setAuthUser(data.userData);
            localStorage.setItem("token", data.token);
            setToken(data.token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
            connectSocket(data.userData); // Connect socket after successful login
            toast.success(data.message);
            return { success: true, user: data.userData };
        } else {
            toast.error(data.message);
            return { success: false, message: data.message };
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "An error occurred";
        toast.error("Login failed");
        return { success: false, message: errorMessage };
    }
}

//logout func to disconnect socket on logout
const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["Authorization"] = null;
    toast.success("Logged out successfully");
    if (socket && socket.disconnect) socket.disconnect();
    setSocket(null);
}
```

**Authentication Integration:**
- Socket connects automatically after successful login
- Socket disconnects cleanly on logout
- Handles token management for socket authentication
- Clears all socket-related state on logout

### 3. Message Reception Handling

#### File: `frontend/context/ChatContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // define the event handler
    const handleNewMessage = (newMessage) => {
        if (selectedUser && newMessage.senderId === selectedUser._id) {
            newMessage.seen = true;
            setMessages((prev) => [...prev, newMessage]);
            axios.put(`/api/messages/seen/${newMessage._id}`);
        } else {
            setUnseenMessages((prev) => ({
                ...prev,
                [newMessage.senderId]: prev[newMessage.senderId]
                    ? prev[newMessage.senderId] + 1
                    : 1,
            }));
        }
    };

    useEffect(() => {
        if (!socket) return;
        // subscribe
        socket.on("newMessage", handleNewMessage);

        // unsubscribe when component unmounts OR deps change
        return () => {
            socket.off("newMessage", handleNewMessage);
        };

    }, [socket, selectedUser]);
```

**Message Reception Logic:**

1. **Active Chat Handling**: Messages from currently selected user are marked as seen automatically
2. **Background Messages**: Messages from other users increment unseen counters
3. **Real-Time Updates**: UI updates immediately when messages arrive
4. **Event Cleanup**: Properly unsubscribes from events to prevent memory leaks

---

## Online User Management

### Server-Side User Tracking

```javascript
//store online users
export const userSocketMap = new Map(); //key:userId value:socketId

// On connection
if (userId) {
    userSocketMap.set(userId, socket.id);
}
io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

// On disconnection  
if (userId) {
    userSocketMap.delete(userId);
}
io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
```

**Online User Features:**
- **Real-Time Tracking**: Instant updates when users connect/disconnect
- **Efficient Storage**: Map data structure for O(1) lookups
- **Broadcast Updates**: All clients receive online status changes
- **Memory Management**: Automatic cleanup on disconnection

### Frontend Online Status

```javascript
newSocket.on("getOnlineUsers", (userIds) => {
    if (Array.isArray(userIds)) {
        setOnlineUsers(userIds);
    } else if (userIds && typeof userIds === 'object') {
        try {
            setOnlineUsers(Array.from(Object.keys(userIds)));
        } catch (e) {
            setOnlineUsers([]);
        }
    } else {
        setOnlineUsers([]);
    }
});
```

**Frontend Processing:**
- **Type Validation**: Ensures data format consistency
- **Fallback Handling**: Graceful degradation for malformed data
- **State Synchronization**: Keeps UI in sync with server
- **Error Recovery**: Handles data parsing errors

---

## Socket Event Flow

### Complete Message Flow

1. **User Sends Message** → HTTP POST to `/api/messages/send/:userId`
2. **Server Processes** → Validates, saves to database
3. **Socket Emission** → Server emits to receiver's socket if online
4. **Frontend Reception** → Client receives "newMessage" event
5. **UI Update** → Message appears in chat interface
6. **Seen Status** → Auto-marked as seen if chat is active

### Connection Lifecycle

1. **User Login** → JWT token generated and stored
2. **Socket Connection** → Token sent to server for authentication
3. **Authentication** → Server validates token and user
4. **User Mapping** → Server maps userId to socketId
5. **Online Broadcast** → All clients notified of new online user
6. **Message Subscription** → Client starts listening for events
7. **User Logout** → Socket disconnects, cleanup performed

### Event Types

| Event | Direction | Purpose |
|-------|-----------|---------|
| `connection` | Client → Server | Establish socket connection |
| `getOnlineUsers` | Server → Client | Broadcast online user list |
| `newMessage` | Server → Client | Deliver real-time messages |
| `disconnect` | Client → Server | Handle connection termination |

---

## Performance & Security Considerations

### Performance Optimizations

1. **Targeted Messaging**: Point-to-point delivery instead of broadcasting
2. **Efficient Mapping**: Map data structure for O(1) user lookups
3. **Event Cleanup**: Proper event listener removal prevents memory leaks
4. **Database-First**: Ensures message persistence before real-time delivery

### Security Measures

1. **JWT Authentication**: All socket connections require valid tokens
2. **Database Validation**: User existence verified on each connection
3. **Error Handling**: Detailed logging without exposing sensitive data
4. **Token Refresh**: Automatic logout on authentication failures

### Scalability Notes

- Current implementation supports single-server deployment
- For multi-server scaling, consider Redis adapter for Socket.IO
- Sticky sessions required for load balancing
- Room-based architecture can be added for group chats

---

This Socket.IO implementation provides a robust, secure, and efficient real-time messaging system for your ChatSpace application, handling authentication, message delivery, and online presence with proper error handling and cleanup mechanisms.