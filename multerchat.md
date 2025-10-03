# MulterChat - File Handling Documentation

## Table of Contents
- [Overview](#overview)
- [Multer Configuration](#multer-configuration)
- [Cloudinary Integration](#cloudinary-integration)
- [Route Implementation](#route-implementation)
- [Controller Logic](#controller-logic)
- [Upload Flow](#upload-flow)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Frontend Implementation](#frontend-implementation)
- [Best Practices](#best-practices)

## Overview

This chat application implements a robust file handling system using **Multer** for handling multipart form data and **Cloudinary** for cloud-based image storage. The system supports profile picture uploads and image messages with comprehensive error handling and security features.

### Key Components:
- **Multer**: Handles file uploads from frontend forms
- **Cloudinary**: Provides cloud storage for images
- **Admin Controls**: Upload toggle functionality
- **File Validation**: Size and type restrictions
- **Temporary Storage**: Local temp files before cloud upload

---

## Multer Configuration

### File: `backend/middlewares/multer.js`

The Multer middleware handles file uploads with disk storage configuration:

```javascript
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { User } from '../models/user-model.js';

// Ensure temp directory exists
const tempDir = './public/temp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}
```

**Purpose**: 
- Creates a temporary directory for storing uploaded files before cloud upload
- Uses `fs.mkdirSync` with `recursive: true` to create nested directories if needed

### Storage Configuration

```javascript
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
```

**Explanation**:
- **Destination**: Files are temporarily stored in `./public/temp` directory
- **Filename**: Generates unique filenames using timestamp + random number to prevent conflicts
- **Format**: `fieldname-timestamp-randomnumber.extension` (e.g., `profilePic-1696345678901-123456789.jpg`)

### File Filter

```javascript
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
```

**Security Features**:
- **Upload Toggle**: Checks if uploads are enabled by admin
- **File Type Validation**: Only accepts files with MIME types starting with `image/`
- **Error Handling**: Returns descriptive error messages for invalid files

### Multer Instance

```javascript
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
```

**Configuration**:
- **Storage**: Uses the disk storage configuration
- **File Filter**: Applies the image validation filter
- **Size Limit**: Maximum file size of 5MB to prevent abuse

### Upload Control Middleware

```javascript
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
```

**Purpose**:
- **Admin Control**: Allows admin to enable/disable uploads globally
- **Database Check**: Queries admin user settings from database
- **Request Flag**: Sets `req.uploadsEnabled` for downstream middleware
- **Error Handling**: Gracefully handles database errors

---

## Cloudinary Integration

### File: `backend/lib/cloudinary.js`

Cloudinary handles cloud storage and image optimization:

```javascript
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

**Configuration**:
- **Environment Variables**: Uses secure environment variables for API credentials
- **V2 API**: Uses the latest Cloudinary v2 API for better features

### Upload Function

```javascript
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
```

**Features**:
- **Auto Detection**: `resource_type: "auto"` automatically detects file type
- **Cleanup**: Removes local temp files after successful upload
- **Error Handling**: Cleans up files even if upload fails
- **Return Value**: Returns Cloudinary response object or null on failure

### Safe File Deletion

```javascript
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
```

**Safety Features**:
- **Existence Check**: Verifies file exists before deletion
- **Error Handling**: Catches and logs deletion errors without crashing
- **Logging**: Provides feedback on successful deletions

---

## Route Implementation

### User Routes - Profile Picture Upload

#### File: `backend/routes/user-routes.js`

```javascript
import express from "express";
import { Router } from "express";
import { signup, login, updateProfile, getUserProfile } from "../controllers/user-controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import upload, { checkUploadEnabled } from "../middlewares/multer.js";

const router = Router();

router.put('/update-profile', verifyToken, checkUploadEnabled, upload.single('profilePic'), updateProfile);
```

**Middleware Chain**:
1. **verifyToken**: Ensures user is authenticated
2. **checkUploadEnabled**: Verifies uploads are enabled by admin
3. **upload.single('profilePic')**: Handles single file upload with field name 'profilePic'
4. **updateProfile**: Controller function to process the update

### Message Routes - Image Messages

#### File: `backend/routes/messages-routes.js`

```javascript
import { Router } from "express";
import { getAllMessages, makeMsgSeen, getUsersForSidebar, sendMessage } from "../controllers/message-controllers.js";
import { verifyToken } from "../middlewares/auth.js";
import upload, { checkUploadEnabled } from "../middlewares/multer.js";

const router = Router();

// Use upload.single('image') but make it optional for text-only messages
router.post("/send/:userId", verifyToken, checkUploadEnabled, upload.single('image'), sendMessage);
```

**Key Points**:
- **Optional Upload**: Image field is optional, supports text-only messages
- **Dynamic Routing**: Uses `:userId` parameter for recipient identification
- **Same Middleware Chain**: Consistent security and validation

---

## Controller Logic

### User Controller - Profile Updates

#### File: `backend/controllers/user-controllers.js`

```javascript
import { uploadOnCloudinary } from "../lib/cloudinary.js";

export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio } = req.body;
        const userId = req.user._id;

        let updatedUser;

        if (!req.file) {
            // No file uploaded, update only text fields
            updatedUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true });
        } else {
            if (!req.uploadsEnabled && req.file?.path) {
                try {
                    await fs.unlinkSync(req.file.path);
                } catch (e) {
                    // Ignore errors during file deletion
                }
                return res.status(403).json({ success: false, message: "Image uploads are disabled by AVC" });
            }
            // File uploaded via multer (diskStorage), upload to cloudinary
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            if (!uploadResponse) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }

            updatedUser = await User.findByIdAndUpdate(
                userId,
                { fullName, bio, profilePic: uploadResponse.secure_url },
                { new: true } //new : return the updated document
            );
        }
        res.status(200).json({ success: true, message: "User profile updated successfully", updatedUser });
    } catch (error) {
        console.log("Update profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
```

**Logic Flow**:
1. **Extract Data**: Gets form data from request body
2. **File Check**: Determines if file was uploaded
3. **Text-Only Update**: Updates only text fields if no file
4. **File Processing**: Uploads to Cloudinary if file present
5. **Database Update**: Saves Cloudinary URL to user profile
6. **Response**: Returns updated user data

### Message Controller - Image Messages

#### File: `backend/controllers/message-controllers.js`

```javascript
import { uploadOnCloudinary } from "../lib/cloudinary.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { text } = req.body;
        const receiverId = req.params.userId;

        let imageUrl = "";

        // Handle image upload via multer (diskStorage)
        if (req.file) {
            if (!req.uploadsEnabled && req.file?.path) {
                try {
                    await fs.unlinkSync(req.file.path);
                } catch (e) {
                    // Ignore errors during file deletion
                }
                return res.status(403).json({ success: false, message: "Image uploads are disabled by AVC" });
            }
            const uploadResponse = await uploadOnCloudinary(req.file.path);
            if (uploadResponse) {
                imageUrl = uploadResponse.secure_url;
            } else {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        // Validate that either text or image is provided
        if (!text && !imageUrl) {
            return res.status(400).json({ success: false, message: "Either text or image is required" });
        }
```

**Features**:
- **Mixed Messages**: Supports text, image, or both in single message
- **Validation**: Ensures at least one content type is provided
- **Error Handling**: Cleans up files on upload failure
- **Security**: Respects admin upload settings

---

## Upload Flow

### Complete File Upload Process

1. **Frontend Form Submission**
   - User selects file in form
   - Form data sent as `multipart/form-data`

2. **Middleware Processing**
   ```
   verifyToken → checkUploadEnabled → upload.single() → controller
   ```

3. **Multer Processing**
   - Validates file type (images only)
   - Checks file size (5MB limit)
   - Saves to temporary directory
   - Adds file info to `req.file`

4. **Controller Processing**
   - Checks if file exists in request
   - Validates upload permissions
   - Calls Cloudinary upload function

5. **Cloudinary Upload**
   - Uploads file to cloud storage
   - Generates optimized URLs
   - Returns response with URLs

6. **Database Update**
   - Saves Cloudinary URL to database
   - Updates user/message record

7. **Cleanup**
   - Deletes temporary local file
   - Returns success response

### File Object Structure

When Multer processes a file, it creates a `req.file` object:

```javascript
{
  fieldname: 'profilePic',
  originalname: 'avatar.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './public/temp',
  filename: 'profilePic-1696345678901-123456789.jpg',
  path: './public/temp/profilePic-1696345678901-123456789.jpg',
  size: 2048576
}
```

---

## Security Features

### 1. Admin Upload Control

```javascript
export async function checkUploadEnabled(req, res, next) {
    const adminUser = await User.findById(adminId).select('uploadsEnabled').lean();
    req.uploadsEnabled = adminUser ? adminUser.uploadsEnabled : false;
    if (!req.uploadsEnabled) {
        return res.status(403).json({ success: false, message: "Image uploads are disabled by admin" });
    }
}
```

**Benefits**:
- Global upload toggle for emergency situations
- Admin can disable uploads to prevent abuse
- Database-driven configuration

### 2. File Type Validation

```javascript
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};
```

**Security**:
- Prevents executable file uploads
- MIME type checking
- Server-side validation

### 3. File Size Limits

```javascript
const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
```

**Protection**:
- Prevents large file attacks
- Saves bandwidth and storage
- Improves user experience

### 4. Authentication Requirements

```javascript
router.put('/update-profile', verifyToken, checkUploadEnabled, upload.single('profilePic'), updateProfile);
```

**Security Layers**:
- JWT token verification required
- User must be logged in
- Prevents unauthorized uploads

---

## Error Handling

### 1. Upload Validation Errors

```javascript
if (!req.uploadsEnabled && req.file?.path) {
    try {
        await fs.unlinkSync(req.file.path);
    } catch (e) {
        // Ignore errors during file deletion
    }
    return res.status(403).json({ success: false, message: "Image uploads are disabled by AVC" });
}
```

**Error Handling**:
- Cleans up temporary files even on failure
- Returns appropriate HTTP status codes
- Provides user-friendly error messages

### 2. Cloudinary Upload Errors

```javascript
const uploadResponse = await uploadOnCloudinary(req.file.path);
if (!uploadResponse) {
    return res.status(500).json({ success: false, message: "Image upload failed" });
}
```

**Resilience**:
- Handles network failures gracefully
- Provides fallback responses
- Maintains data consistency

### 3. File System Errors

```javascript
export const safeDeleteFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error.message);
    }
}
```

**Safe Operations**:
- Catches file system exceptions
- Logs errors for debugging
- Continues execution on file cleanup failures

---

## Best Practices

### 1. Temporary File Management
- Always clean up temporary files after processing
- Use unique filenames to prevent conflicts
- Create necessary directories programmatically

### 2. Security Considerations
- Validate file types on server-side
- Implement file size limits
- Require authentication for uploads
- Add admin controls for emergency situations

### 3. Error Handling
- Provide meaningful error messages
- Clean up resources on failures
- Log errors for debugging
- Return appropriate HTTP status codes

### 4. Performance Optimization
- Use Cloudinary's auto optimization features
- Implement proper file size limits
- Clean up temporary files promptly
- Use streaming for large files when possible

### 5. Code Organization
- Separate concerns (Multer config, Cloudinary logic, controllers)
- Use middleware for common functionality
- Keep configuration in environment variables
- Implement consistent error handling patterns

---

## Frontend Implementation

The frontend handles file uploads using FormData and provides user interfaces for both profile picture uploads and image messages.

### Profile Picture Upload

#### File: `frontend/src/pages/ProfilePage.jsx`

The ProfilePage component handles profile picture uploads with preview functionality:

```jsx
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import avatar_icon from '../assets/avatar.png'
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = React.useState({
    name: authUser?.fullName || '',
    bio: authUser?.bio || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (formData.name.trim().length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.name.trim());
      formDataToSend.append('bio', formData.bio.trim());

      if (selectedImage) {
        formDataToSend.append('profilePic', selectedImage);
      }

      await updateProfile(formDataToSend);
      navigate('/'); //redirect
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  }
}
```

**Key Features**:
- **FormData Creation**: Creates `FormData` object for multipart form submission
- **Conditional File Append**: Only appends image if one is selected
- **Validation**: Client-side validation for required fields
- **Error Handling**: User-friendly error messages

#### File Input Component:

```jsx
<label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
  <input
    type="file"
    id="avatar"
    accept=".image/jpeg,.image/png,.image/jpg,.image/webp"
    hidden
    onChange={(e) => {
      setSelectedImage(e.target.files[0]);
    }} />
  <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 flex-shrink-0 bg-gray-700 flex items-center justify-center'>
    <img src={selectedImage ? URL.createObjectURL(selectedImage) : authUser?.profilePic || avatar_icon}
      alt="profile"
      className='w-full h-full object-cover'
      onError={(e) => e.target.src = avatar_icon} />
  </div>
  <span className='text-sm text-gray-300 hover:text-white transition-colors'>
    Upload profile image
  </span>
</label>
```

**Features**:
- **File Type Restriction**: `accept` attribute limits to image files
- **Hidden Input**: Styled with custom label for better UX
- **Live Preview**: Uses `URL.createObjectURL()` for immediate preview
- **Fallback Image**: Shows default avatar if no image selected

### Image Message Upload

#### File: `frontend/src/components/ChatContainer.jsx`

The ChatContainer handles image message uploads with comprehensive validation:

```jsx
//handle sending an image
const handleSendImage = async (e) => {
  const file = e.target.files[0];

  // Basic validation
  if (!file || !selectedUser) {
    toast.error("Please select a file and user");
    return;
  }
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  // File validation
  if (!file.type.startsWith("image/") || file.size > maxSize) {
    toast.error("Please select a valid image file within 5MB");
    e.target.value = null; // Reset input on invalid file
    return;
  }

  // Prevent image upload to AI assistant
  if (selectedUser._id === import.meta.env.VITE_AI_ASSISTANT_ID) {
    toast.error("Image upload is disabled for AI Assistant");
    e.target.value = null;
    return;
  }

  try {
    const loadingToast = toast.loading("Uploading image...");

    const formData = new FormData();
    formData.append('image', file);
    await sendMessage(formData);
    toast.success("Image sent successfully", { id: loadingToast });

  } catch (error) {
    console.error("Image upload error:", error);
    toast.error("Failed to upload image");
  } finally {
    e.target.value = null;
  }
}
```

**Validation Features**:
- **File Existence Check**: Ensures file and user are selected
- **Size Validation**: 5MB limit matches backend configuration
- **Type Validation**: Client-side MIME type checking
- **Special Restrictions**: Prevents uploads to AI assistant
- **Input Reset**: Clears input after processing

### Context API Integration

#### File: `frontend/context/AuthContext.jsx`

The AuthContext provides the updateProfile function:

```jsx
//update profile func to update authUser state
const updateProfile = async (formData) => {
    try {
        const { data } = await axios.put("/api/auth/update-profile", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (data?.success) {
            setAuthUser(data.updatedUser);
            toast.success("Profile updated successfully");
            return { success: true, user: data.updatedUser };
        } else {
            toast.error(data.message);
            return { success: false, message: data.message };
        }

    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Profile update failed";
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
    }
}
```

**Key Points**:
- **Multipart Headers**: Explicitly sets `Content-Type: multipart/form-data`
- **State Management**: Updates user state on successful upload
- **Error Handling**: Comprehensive error message handling
- **Toast Notifications**: User feedback for success/failure

#### File: `frontend/context/ChatContext.jsx`

The ChatContext handles message sending:

```jsx
//func to send message to selected user
const sendMessage = async (msgData) => {
    try {
        // axios automatically detects FormData and sets proper headers
        // No need for manual config - axios handles both JSON and FormData
        const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, msgData);
        if (data?.success) {
            setMessages(prev => [...prev, data.newMessage]);
        } else {
            toast.error(data.message || "Failed to send message");
        }

    } catch (error) {
        console.error("Send message error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to send message";
        toast.error(errorMessage);
    }
}
```

**Smart Features**:
- **Auto-Detection**: Axios automatically handles FormData vs JSON
- **Dynamic Headers**: No manual header configuration needed
- **State Updates**: Adds new message to local state immediately
- **Error Propagation**: Proper error handling and user feedback

### Frontend File Flow

1. **User Selection**: User selects file through input element
2. **Client Validation**: File type and size checked on frontend
3. **FormData Creation**: File and form data packaged for transmission
4. **HTTP Request**: Axios sends multipart request to backend
5. **Response Handling**: Success/error feedback provided to user
6. **State Updates**: UI updated with new data on success

### Frontend Security Features

1. **File Type Validation**: 
   ```jsx
   accept=".image/jpeg,.image/png,.image/jpg,.image/webp"
   if (!file.type.startsWith("image/"))
   ```

2. **Size Limits**:
   ```jsx
   const maxSize = 5 * 1024 * 1024; // 5MB in bytes
   if (file.size > maxSize)
   ```

3. **Input Sanitization**:
   ```jsx
   formData.name.trim()
   formData.bio.trim()
   ```

4. **Error Recovery**:
   ```jsx
   e.target.value = null; // Reset input on invalid file
   ```

---

## Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_ID=admin_user_mongodb_id
```

### Configuration Notes:
- **Cloudinary**: Get credentials from Cloudinary dashboard
- **Admin ID**: MongoDB ObjectId of admin user
- **Security**: Never commit these values to version control
- **Deployment**: Set these in your hosting platform's environment settings

---

## Complete File Handling Summary

This documentation covers the entire file handling ecosystem in your MulterChat application, spanning both **backend** and **frontend** implementations:

### Backend Code Coverage:
✅ **Multer Configuration** - `backend/middlewares/multer.js`
✅ **Cloudinary Integration** - `backend/lib/cloudinary.js`  
✅ **Route Handlers** - `backend/routes/user-routes.js`, `backend/routes/messages-routes.js`
✅ **Controller Logic** - `backend/controllers/user-controllers.js`, `backend/controllers/message-controllers.js`

### Frontend Code Coverage:
✅ **Profile Upload UI** - `frontend/src/pages/ProfilePage.jsx`
✅ **Image Message UI** - `frontend/src/components/ChatContainer.jsx`
✅ **Context Integration** - `frontend/context/AuthContext.jsx`, `frontend/context/ChatContext.jsx`
✅ **Form Handling** - FormData creation and submission
✅ **Client Validation** - File type, size, and user input validation

### Key Features Documented:
- **Complete Upload Pipeline** from frontend form to cloud storage
- **Security Measures** at every layer (client, server, cloud)
- **Error Handling** with proper cleanup and user feedback
- **Admin Controls** for upload management
- **Real-time Updates** with immediate UI feedback
- **File Validation** on both client and server sides

This system is designed with security, performance, and reliability in mind, providing a robust file handling solution for your chat application.

---