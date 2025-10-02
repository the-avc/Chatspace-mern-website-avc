import Groq from "groq-sdk";
import { Message } from "../models/message-model.js";
import { User } from "../models/user-model.js";
import { userSocketMap, io } from "../server.js";

// Simple AI chat completion controller
export const chatWithAI = async (req, res) => {
	try {
		const { messages: incomingMessages, model, prompt } = req.body || {}; //message and prompt are different it means that message is an array of objects and prompt is a string
		const userId = req.user._id; // Current user ID
		
		if (!process.env.GROQ_API_KEY) {
			return res.status(500).json({ success: false, message: "GROQ_API_KEY not configured" });
		}

		let messages = incomingMessages;
		if ((!Array.isArray(messages) || messages.length === 0) && typeof prompt === "string" && prompt.trim().length > 0) {
			messages = [
				{ role: "system", content: "You are a Alison A.I. created by Mr.AVC for assistance" }, //this is used for context so that AI knows who it is
				{ role: "user", content: prompt }
			];
		}

		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ success: false, message: "messages array is required (or provide 'prompt')" });
		}

		// Find or create AI assistant user
		// let aiAssistant = await User.findOne({ _id: process.env.AI_ASSISTANT_ID });
		// if (!aiAssistant) {
		// 	// Create AI assistant user if it doesn't exist
		// 	aiAssistant = new User({
		// 		_id: process.env.AI_ASSISTANT_ID,
		// 		fullName: 'AI Assistant',
		// 		email: 'ai@assistant.com',
		// 		password: 'dummy-password', // Won't be used for login
		// 		profilePic: 'https://res.cloudinary.com/dsx8vik1u/image/upload/v1754050250/cld-sample.jpg'
		// 	});
		// 	await aiAssistant.save();
		// }

		// Save user message to database
		const userMessage = new Message({
			senderId: userId,
			receiverId: process.env.AI_ASSISTANT_ID,
			text: prompt,
			seen: true // AI messages are immediately "seen"
		});
		await userMessage.save();

		// Get AI response
		const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
		const response = await groq.chat.completions.create({
			model: model || "llama-3.1-8b-instant",
			messages,
			temperature: 0.3
		});

		const choice = response?.choices?.[0];
		const aiReply = choice?.message?.content || "Sorry, I couldn't generate a response.";

		// Save AI response to database
		const aiMessage = new Message({
			senderId: process.env.AI_ASSISTANT_ID,
			receiverId: userId,
			text: aiReply,
			seen: true
		});
		await aiMessage.save();

		// Note: Not emitting socket events for AI messages since frontend handles them directly
		// This prevents duplicate messages from appearing

		return res.status(200).json({
			success: true,
			message: choice?.message || null,
			content: aiReply,
			userMessage,
			aiMessage
		});
	} catch (error) {
		console.log("AI chat error:", error);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
};


