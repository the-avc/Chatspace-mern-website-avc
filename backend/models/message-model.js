import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: {
        type: String,
    },
    text: {
        type: String,
    },
    seen: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })

export const Message = mongoose.model("Message", MessageSchema)