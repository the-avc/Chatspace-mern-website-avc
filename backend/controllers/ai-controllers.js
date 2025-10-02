import Groq from "groq-sdk";
import { Message } from "../models/message-model.js";
import { User } from "../models/user-model.js";

// Initial load from env variable (env vars are strings)
let aiEnabled = String(process.env.AI_ENABLED || '').toLowerCase() === 'true';
export async function loadAiEnabled() {
	try {
		const aiAssistant = await User.findById(process.env.AI_ASSISTANT_ID).select('enabled').lean();
		if (aiAssistant && typeof aiAssistant.enabled === 'boolean') {
			aiEnabled = aiAssistant.enabled;
		}
	} catch (error) {
		console.error("Error loading AI enabled status:", error);
	}
}

// Simple AI chat completion controller
export const chatWithAI = async (req, res) => {
	try {
		const { messages: incomingMessages, model, prompt } = req.body || {}; //message and prompt are different it means that message is an array of objects and prompt is a string
		const userId = req.user._id; // Current user ID

		// Check if AI service is enabled
		if (!aiEnabled) {
			console.log("AI service is disabled by AVC");
			return res.status(503).json({ success: false, message: "AI service is currently disabled" });
		}

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
			return res.status(400).json({ success: false, message: "messages array is required" });
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
			seen: true // AI messages immediately "seen"
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

export const toggleAiStatus = async (req, res) => {
	try {
		const { enabled } = req.body || {};

		// Read current status if no enabled value provided
		if (enabled === undefined) {
			return res.json({ success: true, enabled: aiEnabled });
		}

		if (String(req.user._id) !== String(process.env.ADMIN_ID)) {
			return res.status(403).json({ success: false, message: 'Admin access required' });
		}

		if (typeof enabled !== 'boolean') {
			return res.status(400).json({ success: false, message: 'enabled must be boolean' });
		}

		aiEnabled = enabled;
		await User.findByIdAndUpdate(process.env.AI_ASSISTANT_ID, { enabled });
		return res.json({ success: true, enabled });
	} catch (error) {
		console.error("AI toggle error:", error);
		return res.status(500).json({ success: false, message: 'Server error' });
	}
};

export const getAiStatus = (req, res) => {
	try {
		return res.json({ success: true, enabled: aiEnabled });
	} catch (err) {
		return res.status(500).json({ success: false, message: 'ai status error' });
	}
};