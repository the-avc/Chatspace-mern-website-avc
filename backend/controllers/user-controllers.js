import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { generateRefreshToken, generateToken } from "../lib/util.js";
import { User } from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//signup new user
export const signup = async (req, res) => {
    const { fullName, email, password, profilePic, bio } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ fullName, email, password: hashedPassword, profilePic, bio });

        const accessToken = generateToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);
        newUser.refreshToken = refreshToken;
        await newUser.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({ success: true, message: "User created successfully", userData: newUser, token: accessToken });
    } catch (error) {
        console.log("Signup error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//login user
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Remove password before sending response
        const { password: _, ...userWithoutPassword } = user.toObject();
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ success: true, message: "User logged in successfully", userData: userWithoutPassword, token: accessToken });
    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

//update user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (!req.file) {
            // No file uploaded, update only text fields
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
        } else {
            if (!req.uploadsEnabled && req.file?.path) {
                try {
                    await fs.unlinkSync(req.file.path);
                } catch (e) {
                    // Ignore errors during file deletion
                }
                return res.status(403).json({ success: false, message: "Image uploads are disabled by AVC" });
            }
            // File uploaded via multer (diskStorage), upload to cloudinary
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            if (!uploadResponse) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }

            updatedUser = await User.findByIdAndUpdate(
                userId,
                { fullName, bio, profilePic: uploadResponse.secure_url },
                { new: true } //new : return the updated document
            );
        }
        res.status(200).json({ success: true, message: "User profile updated successfully", updatedUser });
    } catch (error) {
        console.log("Update profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getUserProfile = async (req, res) => {
    res.status(200).json({ success: true, message: "User profile fetched successfully", user: req.user });
}

//refresh token endpoint
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
        const user = await User.findById(decoded.id).select("+refreshToken");

        if (!user || user.refreshToken !== refreshToken) {
            await User.findByIdAndUpdate(decoded.id, { refreshToken: null }); // invalidate all refresh tokens for the user
            return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }

        // Generate new tokens
        const newAccessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id)
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Remove sensitive data before sending response
        const { password, refreshToken: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            token: newAccessToken,
            userData: userWithoutPassword
        });
    } catch (error) {
        console.log("Refresh token error:", error);
        res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
}

//logout user
export const logout = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID not found in request" });
        }
        await User.findByIdAndUpdate(userId, { refreshToken: null });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        console.log("Logout error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};