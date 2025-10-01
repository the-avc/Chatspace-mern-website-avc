import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/user-routes.js';
import messageRouter from './routes/messages-routes.js';
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


//middlewares
app.use(express.json({ limit: '2mb' }));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});