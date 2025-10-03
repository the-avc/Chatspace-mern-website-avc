import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { generateToken } from "../lib/util.js";
import { User } from "../models/user-model.js";
import bcrypt from "bcryptjs";

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

        const token = generateToken(newUser._id);
        res.status(201).json({ success: true, message: "User created successfully", userData: newUser, token });
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
        const token = generateToken(user._id);
        res.status(200).json({ success: true, message: "User logged in successfully", userData: userWithoutPassword, token });
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