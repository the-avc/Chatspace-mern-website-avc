import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: [8, "Password must be at least 8 characters long"],
    },
    profilePic: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "Hey there! I am using Chatspace.",
    },
    refreshToken:{
        type: String,
        select: false,
        default: null,
    }
}, { strict: false }, { timestamps: true });

export const User = mongoose.model("User", UserSchema);