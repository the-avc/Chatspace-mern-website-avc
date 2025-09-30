import { Router } from "express";
import { getAllMessages, makeMsgSeen, getUsersForSidebar, sendMessage } from "../controllers/message-controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();
router.get("/users", verifyToken, getUsersForSidebar);
router.get("/:userId", verifyToken, getAllMessages);
router.put("/seen/:msgId", verifyToken, makeMsgSeen);

router.post("/send/:userId", verifyToken, sendMessage);

export default router;