import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { chatWithAI } from "../controllers/ai-controllers.js";

const router = Router();

// POST /api/ai/chat  -> { messages: [{role, content}], model? }
router.post("/chat", verifyToken, chatWithAI);

export default router;


