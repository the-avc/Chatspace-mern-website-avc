import express from "express";
import { Router } from "express";
import { signup, login, updateProfile, getUserProfile } from "../controllers/user-controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/update-profile', verifyToken, updateProfile);
router.get('/get-profile', verifyToken, getUserProfile);

export default router;
