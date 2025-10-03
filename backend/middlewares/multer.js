import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/user-model.js';

// Ensure temp directory exists
const tempDir = './public/temp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
}); // Store files in memory for direct upload to cloudinary

// File filter function
const fileFilter = (req, file, cb) => {
    if(req.uploadsEnabled === false) {
        return cb(new Error('Image uploads are disabled by AVC'), false);
    }
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

export async function checkUploadEnabled(req, res, next) {
    try {
        const adminId = process.env.ADMIN_ID;
        if (!adminId) {
            req.uploadsEnabled = false;
            return next();
        }
        const adminUser = await User.findById(adminId).select('uploadsEnabled').lean();
        req.uploadsEnabled = adminUser ? adminUser.uploadsEnabled : false;
        if (!req.uploadsEnabled) {
            console.log("Uploads are disabled by admin");
            return res.status(403).json({ success: false, message: "Image uploads are disabled by admin" });
        }
        next();
    } catch (error) {
        console.error("Error checking upload status:", error);
        req.uploadsEnabled = false;
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default upload;