import Groq from "groq-sdk";

// Simple AI chat completion controller
export const chatWithAI = async (req, res) => {
	try {
		const { messages: incomingMessages, model, prompt } = req.body || {};
		if (!process.env.GROQ_API_KEY) {
			return res.status(500).json({ success: false, message: "GROQ_API_KEY not configured" });
		}

		let messages = incomingMessages;
		if ((!Array.isArray(messages) || messages.length === 0) && typeof prompt === "string" && prompt.trim().length > 0) {
			messages = [
				{ role: "system", content: "You are a helpful assistant." },
				{ role: "user", content: prompt }
			];
		}

		if (!Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ success: false, message: "messages array is required (or provide 'prompt')" });
		}

		const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
		const response = await groq.chat.completions.create({
			model: model || "llama-3.1-8b-instant",
			messages,
			temperature: 0.3
		});

		const choice = response?.choices?.[0];
		return res.status(200).json({
			success: true,
			message: choice?.message || null,
			content: choice?.message?.content ?? null
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ success: false, message: "AI Service Error", error });
	}
};


