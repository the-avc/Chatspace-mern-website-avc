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
import { loadAiEnabled } from './controllers/ai-controllers.js';

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


//middlewares
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRouter);

connectDB();
loadAiEnabled(); // Load AI enabled status on server start

if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default server; //for vercel