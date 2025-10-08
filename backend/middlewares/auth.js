import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers?.authorization;
        const token = authHeader.split(" ")[1];
        if (!token) {
            // console.log("Auth error: No token in authorization header");
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            console.log("Auth error: Token verification failed");
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("Auth error: User not found for token:", decoded.id);
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Auth error:", error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized - Token expired" });
        }
        
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