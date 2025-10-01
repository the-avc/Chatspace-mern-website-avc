export async function askAI(axios, { prompt, messages, model } = {}) {
	const body = Array.isArray(messages) && messages.length > 0 ? { messages, model } : { prompt, model }; // messages is an array of objects and prompt is a string
	const { data } = await axios.post("/api/ai/chat", body);
	return data;
}


