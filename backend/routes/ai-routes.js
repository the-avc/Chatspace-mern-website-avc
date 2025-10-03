import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { chatWithAI, getAiStatus, toggleAiStatus } from "../controllers/ai-controllers.js";

const router = Router();

router.post("/chat", verifyToken, chatWithAI);
router.post("/limiter", verifyToken, toggleAiStatus);
router.get("/limiter", verifyToken, getAiStatus);
export default router;


