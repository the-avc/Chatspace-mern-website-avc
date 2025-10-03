import { Router } from "express";
import { getAllMessages, makeMsgSeen, getUsersForSidebar, sendMessage } from "../controllers/message-controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import upload, { checkUploadEnabled } from "../middlewares/multer.js";

const router = Router();
router.get("/users", verifyToken, getUsersForSidebar);
router.get("/:userId", verifyToken, getAllMessages);
router.put("/seen/:msgId", verifyToken, makeMsgSeen);

// Use upload.single('image') but make it optional for text-only messages
router.post("/send/:userId", verifyToken, checkUploadEnabled, upload.single('image'), sendMessage);

export default router;