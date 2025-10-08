import express from "express";
import { Router } from "express";
import { signup, login, updateProfile, getUserProfile, refreshToken, logout } from "../controllers/user-controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import upload, { checkUploadEnabled } from "../middlewares/multer.js";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.put('/update-profile', verifyToken, checkUploadEnabled, upload.single('profilePic'), updateProfile);
router.get('/get-profile', verifyToken, getUserProfile);
router.post('/logout', verifyToken, logout);

export default router;