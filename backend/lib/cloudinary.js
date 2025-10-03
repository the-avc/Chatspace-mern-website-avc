import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error("File path is required for uploading to Cloudinary");
        }
        // Upload the file to Cloudinary
        const res = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        })
        //file is uploaded successfully
        // console.log("File uploaded successfully to Cloudinary", res.url);
        // Clean up the local file after successful upload
        safeDeleteFile(filePath);
        return res;
    }
    catch (error) {
        // Clean up the file that was saved locally if upload fails
        safeDeleteFile(filePath);
        console.error("Error uploading file to Cloudinary:", error);
        return null; // Return null or handle the error as needed 
    }
}

// Helper function to safely delete files
export const safeDeleteFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Successfully deleted local file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error.message);
    }
}

export default cloudinary;
