import cloudinary from "../lib/cloudinary.js";
import { Message } from "../models/message-model.js";
import { User } from "../models/user-model.js";
import { userSocketMap, io } from "../server.js";

//get all users list
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        const filteredUsers = await User
            .find({
                _id: {
                    $ne: userId
                }
            })
            .select("-password");

        //count number of msgs not seen
        const unseenMsgs = {};
        const unseen = filteredUsers.map(async (user) => {
            const unseenCount = await Message.countDocuments({
                sender: user._id,
                receiver: userId,
                seen: false
            });
            unseenMsgs[user._id] = unseenCount;
            return unseenCount;
        });
        const usersWithUnseen = await Promise.all(unseen);
        res.status(200).json({ success: true, users: filteredUsers, unseenMsgs });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error", error });//500 means server error
    }
}

//get all msgs between two users
export const getAllMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message
            .find({
                $or: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            })
            .sort({ createdAt: 1 })

        await Message.updateMany({
            senderId: otherUserId,
            receiverId: userId,
            seen: false
        }, {
            $set: { seen: true }
        })
        res.status(200).json({success:true, messages});
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message: "Server Error", error });//500 means server error
    }
}

//make a msg seen using msgId
export const makeMsgSeen = async (req, res) => {
    try {
        const msgId = req.params.msgId;
        await Message.findByIdAndUpdate(msgId, { seen: true });
        res.status(200).json({ success:true,message: "Message marked as seen" });
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message: "Server Error", error });//500 means server error
    }
}

//send a msg from sender to receiver
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { image, text } = req.body;
        const receiverId = req.params.userId;

        let imageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
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
        res.status(500).json({ success:false,message: "Server Error", error });//500 means server error
    }
}