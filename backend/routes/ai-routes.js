import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { chatWithAI } from "../controllers/ai-controllers.js";

const router = Router();

router.post("/chat", verifyToken, chatWithAI);

export default router;


