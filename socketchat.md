# Socket.IO Implementation for Real-Time Chat - ChatSpace App

This document explains the comprehensive Socket.IO implementation for real-time messaging in the ChatSpace application. The implementation covers both backend and frontend socket handling with detailed code explanations.

## Table of Contents
1. [Backend Socket Implementation](#backend-socket-implementation)
2. [Frontend Socket Implementation](#frontend-socket-implementation)
3. [Socket Event Flow](#socket-event-flow)
4. [Real-Time Message Broadcasting](#real-time-message-broadcasting)
5. [Online User Management](#online-user-management)
6. [Socket Connection Lifecycle](#socket-connection-lifecycle)

---

## Backend Socket Implementation

### 1. Server Setup and Socket.IO Initialization (`backend/server.js`)

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './lib/db.js';
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
```

**Code Explanation:**

**HTTP Server Creation:**
```javascript
const server = http.createServer(app);
```
- **Purpose**: Creates an HTTP server instance that wraps the Express app
- **Why needed**: Socket.IO requires an HTTP server instance to attach to, not just the Express app
- **Behind the scenes**: This creates a Node.js HTTP server that can handle both regular HTTP requests and WebSocket connections

**Socket.IO Server Initialization:**
```javascript
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});
```
- **Server instance**: Attaches Socket.IO to the HTTP server
- **CORS configuration**: Allows cross-origin requests from any domain (`origin: "*"`)
- **Methods**: Specifies allowed HTTP methods for the socket connection
- **Export**: Makes the `io` instance available for other modules to emit events

### 2. Online User Management System

```javascript
//store online users
export const userSocketMap = new Map(); //key:userId value:socketId

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected with ID:", userId);
    if (userId) {
        userSocketMap.set(userId, socket.id);
    }
    //emit event to all connected users (convert Map keys to array)
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
        console.log("User disconnected with ID:", userId);
        if (userId) {
            userSocketMap.delete(userId);
        }
    //emit event to all connected users (convert Map keys to array)
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
});
```

**Code Explanation:**

**User-Socket Mapping:**
```javascript
export const userSocketMap = new Map(); //key:userId value:socketId
```
- **Data structure**: Map provides O(1) lookup time for user-socket relationships
- **Key**: MongoDB user ID (string)
- **Value**: Socket.IO generated socket ID (string)
- **Purpose**: Enables targeted message delivery to specific users
- **Export**: Makes the map accessible to message controllers for event emission

**Connection Event Handler:**
```javascript
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected with ID:", userId);
    if (userId) {
        userSocketMap.set(userId, socket.id);
    }
    //emit event to all connected users (convert Map keys to array)
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
```

**Socket Handshake Analysis:**
- **socket.handshake.query**: Contains query parameters sent during connection
- **userId extraction**: Client sends userId as a query parameter during connection
- **Validation**: Checks if userId exists before mapping
- **Map storage**: Associates user ID with current socket ID
- **Broadcast update**: Immediately notifies all clients about updated online users list

**Online Users Broadcasting:**
```javascript
io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
```
- **io.emit()**: Broadcasts to ALL connected sockets
- **Event name**: "getOnlineUsers" - standardized event identifier
- **Payload**: Array of user IDs currently online
- **Array.from()**: Converts Map keys to array format
- **Real-time sync**: All clients receive instant updates when users come online

**Disconnection Event Handler:**
```javascript
socket.on("disconnect", () => {
    console.log("User disconnected with ID:", userId);
    if (userId) {
        userSocketMap.delete(userId);
    }
    //emit event to all connected users (convert Map keys to array)
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
});
```

**Disconnect Cleanup Process:**
- **Automatic trigger**: Socket.IO automatically fires "disconnect" when connection is lost
- **Map cleanup**: Removes user-socket mapping to prevent memory leaks
- **Broadcast update**: Notifies all remaining users about user going offline
- **Closure access**: Uses `userId` from parent scope (connection handler)

### 3. Real-Time Message Broadcasting (`backend/controllers/message-controllers.js`)

```javascript
import { userSocketMap, io } from "../server.js";

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.userId;

        let imageUrl = null;
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path);
            imageUrl = uploadResponse.secure_url;
        }

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
        res.status(201).json({success:true,newMessage});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success:false,message: "Server Error", error });
    }
}
```

**Code Explanation:**

**Socket Import and Usage:**
```javascript
import { userSocketMap, io } from "../server.js";
```
- **Imports**: Gets the socket server instance and user mapping from server.js
- **Purpose**: Enables message controllers to emit real-time events
- **Decoupling**: Separates socket logic from server initialization

**Message Persistence and Broadcasting:**
```javascript
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
```

**Database-First Approach:**
- **Save first**: Message is persisted to MongoDB before broadcasting
- **Ensures consistency**: Database has the message even if socket emission fails
- **Includes metadata**: Saved message contains timestamp, ID, and other MongoDB fields

**Targeted Message Delivery:**
```javascript
const receiverSocketId = userSocketMap.get(receiverId);
if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
}
```

**Delivery Process:**
1. **Lookup**: Finds receiver's current socket ID using their user ID
2. **Online check**: Only sends if user is currently connected
3. **Targeted emission**: `io.to(socketId).emit()` sends to specific socket only
4. **Event payload**: Sends complete message object with all fields
5. **Offline handling**: If user is offline, message waits in database for next login

---

## Frontend Socket Implementation

### 1. Socket Connection Management (`frontend/context/AuthContext.jsx`)

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
```

**Code Explanation:**

**Socket Client Import:**
```javascript
import { io } from "socket.io-client";
```
- **Client library**: Socket.IO client for establishing WebSocket connections
- **Browser compatibility**: Handles fallbacks for different browser support
- **Event handling**: Provides methods for emitting and listening to events

**State Management:**
```javascript
const [onlineUsers, setOnlineUsers] = useState([]);
const [socket, setSocket] = useState(null);
```
- **onlineUsers**: Array of user IDs currently online (synchronized with server)
- **socket**: Stores the active socket connection instance
- **Global state**: Available throughout the app via Context API

### 2. Socket Connection Establishment

```javascript
//connect socket to handle real-time events
const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendURL, {
        query: {
            userId: userData._id
        },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
        // server should emit an array of userIds; coerce and log for debugging
        console.debug("getOnlineUsers payload:", userIds);
        if (Array.isArray(userIds)) {
            setOnlineUsers(userIds);
        } else if (userIds && typeof userIds === 'object') {
            // if server accidentally sends an object, try to extract keys
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
        console.error('Socket connect error', err);
    });
}
```

**Code Explanation:**

**Connection Guard Clauses:**
```javascript
if (!userData || socket?.connected) return;
```
- **userData check**: Ensures user is authenticated before connecting
- **Duplicate prevention**: Prevents multiple socket connections
- **Optional chaining**: `socket?.connected` safely checks connection status

**Socket Configuration:**
```javascript
const newSocket = io(backendURL, {
    query: {
        userId: userData._id
    },
});
```
- **URL specification**: Connects to backend server URL
- **Query parameters**: Sends user ID during handshake for server identification
- **Handshake data**: Server receives this in `socket.handshake.query.userId`

**Manual Connection:**
```javascript
newSocket.connect();
setSocket(newSocket);
```
- **Explicit connection**: Manually initiates the connection process
- **State update**: Stores socket instance in React state for global access

**Online Users Synchronization:**
```javascript
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
```

**Robust Data Handling:**
- **Type checking**: Validates server payload format
- **Array handling**: Direct assignment if payload is array
- **Object fallback**: Extracts keys if server sends object instead of array
- **Error handling**: Gracefully handles malformed data
- **Debug logging**: Helps identify data format issues

**Connection Error Handling:**
```javascript
newSocket.on('connect_error', (err) => {
    console.error('Socket connect error', err);
});
```
- **Error monitoring**: Logs connection failures for debugging
- **Network issues**: Catches connection timeout, server unavailable, etc.
- **Debugging aid**: Helps identify connectivity problems

### 3. Authentication Integration

```javascript
//login func to handle socket connection on login
const login = async (state, credentials) => {
    try {
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
        if (data?.success) {
            setAuthUser(data.userData);
            connectSocket(data.userData);
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
            setToken(data.token);
            localStorage.setItem("token", data.token);
            toast.success(data.message);
            return { success: true, user: data.userData, isSignup: state === 'signup' };
        } else {
            toast.error(data.message);
            return { success: false, message: data.message };
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "An error occurred";
        toast.error(errorMessage);
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

**Code Explanation:**

**Login Socket Integration:**
```javascript
if (data?.success) {
    setAuthUser(data.userData);
    connectSocket(data.userData);
    // ... other login logic
}
```
- **Sequence**: Authentication first, then socket connection
- **User data**: Passes authenticated user data to socket connection
- **Automatic connection**: Socket connects immediately after successful login

**Logout Socket Cleanup:**
```javascript
if (socket && socket.disconnect) socket.disconnect();
setSocket(null);
```
- **Safe disconnection**: Checks if socket exists and has disconnect method
- **Explicit disconnect**: Manually closes the socket connection
- **State cleanup**: Removes socket from React state
- **Prevents leaks**: Ensures proper cleanup of socket resources

### 4. Real-Time Message Reception (`frontend/context/ChatContext.jsx`)

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
```

**Code Explanation:**

**Context Integration:**
```javascript
const { socket, axios } = useContext(AuthContext);
```
- **Socket access**: Gets the authenticated socket connection from AuthContext
- **Axios instance**: Uses configured axios with authentication headers
- **Context chain**: ChatContext depends on AuthContext for socket functionality

### 5. Message Event Subscription

```javascript
//socket io event listeners -- this means subscribe to socket io events i.e. listen for events
const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
        if (selectedUser && newMessage.senderId === selectedUser._id) {
            newMessage.seen = true;
            setMessages(prev => [...prev, data.newMessage]);
            axios.put(`/api/messages/seen/${newMessage._id}`);
        }
        else {
            setUnseenMessages(prev => {
                return {
                    ...prev,
                    [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1
                }
            })
        }
    });
}

//func to unsubscribe from socket io events
const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
}

useEffect(() => {
    subscribeToMessages();
    return () => {
        unsubscribeFromMessages();
    }
}, [socket, selectedUser]);
```

**Code Explanation:**

**Event Subscription:**
```javascript
socket.on("newMessage", (newMessage) => {
    // Message handling logic
});
```
- **Event listener**: Registers handler for "newMessage" events from server
- **Payload**: Receives complete message object from server
- **Real-time**: Executes immediately when server emits the event

**Message Visibility Logic:**
```javascript
if (selectedUser && newMessage.senderId === selectedUser._id) {
    newMessage.seen = true;
    setMessages(prev => [...prev, newMessage]);
    axios.put(`/api/messages/seen/${newMessage._id}`);
}
```

**Active Chat Handling:**
- **Visibility check**: Determines if message is from currently selected user
- **Auto-seen**: Marks message as seen if chat is active
- **UI update**: Immediately adds message to current conversation
- **Server sync**: Updates seen status in database

**Background Message Handling:**
```javascript
else {
    setUnseenMessages(prev => {
        return {
            ...prev,
            [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1
        }
    })
}
```

**Notification System:**
- **Unseen counter**: Increments count for messages from non-active users
- **Object structure**: `{userId: unseenCount}` format
- **Conditional increment**: Handles first message vs. additional messages
- **UI indicators**: Powers badge counts in user list

**Event Cleanup:**
```javascript
const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
}
```
- **Memory management**: Removes event listeners to prevent memory leaks
- **Specific removal**: Only removes "newMessage" listener
- **Safe execution**: Checks socket existence before cleanup

**useEffect Integration:**
```javascript
useEffect(() => {
    subscribeToMessages();
    return () => {
        unsubscribeFromMessages();
    }
}, [socket, selectedUser]);
```
- **Dependency array**: Re-subscribes when socket or selectedUser changes
- **Cleanup function**: Automatically unsubscribes when component unmounts
- **Re-subscription**: Handles socket reconnection scenarios

### 6. Message Sending Integration

```javascript
//func to send message to selected user
const sendMessage = async (msgData, isFormData = false) => {
    try {
        const config = isFormData ? {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        } : {};
        
        const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, msgData, config);
        if (data?.success) {
            setMessages(prev => [...prev, data.newMessage]);
        } else {
            toast.error(data.message);
        }

    } catch (error) {
        toast.error(error.message);
    }
}
```

**Code Explanation:**

**HTTP + Socket Hybrid:**
- **HTTP request**: Sends message via REST API for persistence
- **Socket notification**: Server uses socket to notify receiver in real-time
- **Optimistic update**: Sender's UI updates immediately with API response
- **Real-time delivery**: Receiver gets instant notification via socket

**Content Type Handling:**
```javascript
const config = isFormData ? {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
} : {};
```
- **Conditional headers**: Different content types for text vs. image messages
- **FormData support**: Handles file uploads with multipart encoding
- **JSON default**: Regular messages use default JSON content type

---

## Socket Event Flow

### Complete Message Sending Flow

1. **User Types Message** → UI Event
2. **sendMessage() Called** → HTTP POST to `/api/messages/send/:userId`
3. **Server Saves Message** → MongoDB persistence
4. **Server Emits Socket Event** → `io.to(receiverSocketId).emit("newMessage", newMessage)`
5. **Receiver's Socket Listener** → Handles "newMessage" event
6. **UI Updates** → Message appears in receiver's chat

### Connection Lifecycle

1. **User Logs In** → `login()` function
2. **Socket Connects** → `connectSocket(userData)` called
3. **Server Maps User** → `userSocketMap.set(userId, socket.id)`
4. **Online Users Broadcast** → All clients receive updated online list
5. **Message Subscription** → `subscribeToMessages()` starts listening
6. **User Logs Out** → Socket disconnects, mappings cleaned up

### Online Status Synchronization

1. **User Connects** → Server adds to `userSocketMap`
2. **Broadcast Update** → `io.emit("getOnlineUsers", Array.from(userSocketMap.keys()))`
3. **All Clients Receive** → Update their `onlineUsers` state
4. **UI Indicators** → Green dots appear next to online users
5. **User Disconnects** → Server removes from map, broadcasts update

---

## Real-Time Message Broadcasting

### Server-Side Broadcasting Strategy

```javascript
//emit new message to receiver if online
const receiverSocketId = userSocketMap.get(receiverId);
if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
}
```

**Broadcasting Logic:**
- **Targeted delivery**: Only sends to intended recipient
- **Online check**: Only attempts delivery if user is connected
- **Efficient routing**: Direct socket-to-socket communication
- **Offline handling**: Messages stored in database for later retrieval

### Client-Side Message Reception

```javascript
socket.on("newMessage", (newMessage) => {
    if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages(prev => [...prev, newMessage]);
        axios.put(`/api/messages/seen/${newMessage._id}`);
    } else {
        setUnseenMessages(prev => ({
            ...prev,
            [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1
        }));
    }
});
```

**Reception Logic:**
- **Context awareness**: Different handling based on active chat
- **Automatic seen**: Messages from active chat are marked as seen
- **Notification system**: Background messages increment unseen counters
- **State synchronization**: UI updates reflect real-time changes

---

## Online User Management

### Server-Side User Tracking

```javascript
export const userSocketMap = new Map(); //key:userId value:socketId

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap.set(userId, socket.id);
    }
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
});
```

**Tracking Mechanism:**
- **Map data structure**: Efficient O(1) lookups for user-socket relationships
- **Query parameter**: User ID passed during handshake for identification
- **Immediate broadcast**: All clients notified when user comes online
- **Array conversion**: Map keys converted to array for client consumption

### Client-Side Online Status

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

**Status Management:**
- **Type validation**: Ensures data format consistency
- **Fallback handling**: Graceful degradation for malformed data
- **State updates**: React state synchronizes with server
- **UI integration**: Online indicators appear throughout the app

---

## Socket Connection Lifecycle

### Connection Establishment

1. **Authentication Success** → User credentials validated
2. **Socket Initialization** → `connectSocket(userData)` called
3. **Handshake** → Client sends userId in query parameters
4. **Server Recognition** → Server maps userId to socketId
5. **Event Subscription** → Client starts listening for events
6. **Online Broadcast** → All users notified of new online user

### Connection Maintenance

- **Heartbeat**: Socket.IO automatically maintains connection health
- **Reconnection**: Automatic reconnection on network interruption
- **Error Handling**: Connection errors logged and handled gracefully
- **Resource Management**: Proper cleanup prevents memory leaks

### Disconnection Process

1. **User Logout** → `logout()` function called
2. **Manual Disconnect** → `socket.disconnect()` executed
3. **Server Cleanup** → User removed from `userSocketMap`
4. **Offline Broadcast** → All users notified of user going offline
5. **State Cleanup** → Client resets socket-related state

---

## Performance Considerations

### Efficient User Mapping
- **Map data structure**: O(1) lookup performance for user-socket relationships
- **Memory efficiency**: Only stores active connections
- **Automatic cleanup**: Disconnected users removed immediately

### Targeted Message Delivery
- **Point-to-point**: Messages sent only to intended recipients
- **No broadcasting**: Avoids unnecessary network traffic
- **Online checks**: No attempted delivery to offline users

### Event Subscription Management
- **Selective listening**: Only subscribes to relevant events
- **Cleanup on unmount**: Prevents memory leaks in React components
- **Dependency management**: Re-subscription handles component updates

### Scalability Considerations
- **Single server**: Current implementation suitable for moderate scale
- **Room-based**: Could be extended with Socket.IO rooms for chat groups
- **Redis adapter**: Could add Redis for multi-server scaling
- **Load balancing**: Sticky sessions required for current architecture

---

This comprehensive Socket.IO implementation provides real-time messaging capabilities with efficient user management, targeted message delivery, and robust error handling. The system maintains state consistency between database persistence and real-time updates, ensuring reliable message delivery in the ChatSpace application.