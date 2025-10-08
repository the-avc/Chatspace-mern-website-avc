import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access Token required" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid access token" });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        if(error.name==='TokenExpiredError'){
            return res.status(401).json({ message: "Token expired" });
        } else if(error.name==='JsonWebTokenError'){
            return res.status(401).json({ message: "Invalid token" });
        }
        console.log("Auth error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

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