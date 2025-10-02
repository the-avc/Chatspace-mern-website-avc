export async function askAI(axios, { prompt, messages, model } = {}) {
	const body = Array.isArray(messages) && messages.length > 0 ? { messages, model } : { prompt, model }; // messages is an array of objects and prompt is a string
	const { data } = await axios.post("/api/ai/chat", body);
	return data;
}

//function to toggle aiEnabled state on server
export async function toggleAI(axios, enabled) {
	try {
		const { data } = await axios.post("/api/ai/limiter", { enabled });
		if (data?.success && typeof data.enabled === 'boolean') {
			return data.enabled;
		}
	} catch (error) {
		console.error("Error toggling AI status:", error);
		return null;
	}
}

//function to fetch aiEnabled state from server
export async function fetchAiStatus(axios) {
	try {
		const { data } = await axios.get("/api/ai/limiter");
		if (data?.success && typeof data.enabled === 'boolean') {
			return data.enabled;
		}
	} catch (error) {
		console.error("Error fetching AI status:", error);
		return null;
	}
}