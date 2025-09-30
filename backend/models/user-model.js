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
        minlength: [8, "Password must be at least 8 characters long"],
    },
    profilePic: {
        type: String,
        default:"",
    },
    bio: {
        type: String,
        default: "Hey there! I am using Chatspace.",
    },
},{timestamps: true});

export const User = mongoose.model("User", UserSchema);