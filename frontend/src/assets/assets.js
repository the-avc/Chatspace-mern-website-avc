import profile_alison from './profile_alison.avif';
import img1 from './anime3.jpeg';
import img2 from './anime2.gif';
import img3 from './anime1.jpeg';
import img4 from './anime4.png';
import img5 from './anime5.webp';
import avatar_icon from './avatar.png';
import logo from './logo.png';
export const assets = {
    profile_alison,
    img1,
    img2,
    img3,
    img4,
    img5,
    avatar_icon,
    logo,
}

export const userDummyData = [
    {
        "_id": "68dbf6866eb3084437c9da9c",
        "email": "alisonai@avc.avc",
        "fullName": "Alison A.I.",
        "profilePic": assets.profile_alison,
        "bio": "Hi Everyone, I am Alison A.I.",
    },
    {
        "_id": "681f50aaf10f3cd28382ecf3",
        "email": "test2@greatstack.dev",
        "fullName": "John Smith",
        "profilePic": assets.profile_alison,
        "bio": "Software developer and tech enthusiast",
    },
    {
        "_id": "684f50aaf10f3cd28382ecf6",
        "email": "test5@greatstack.dev",
        "fullName": "Emma Wilson",
        "profilePic": assets.profile_alison,
        "bio": "Coffee lover and bookworm",
    },
    {
        "_id": "685f50aaf10f3cd28382ecf7",
        "email": "test6@greatstack.dev",
        "fullName": "Alex Brown",
        "profilePic": assets.profile_alison,
        "bio": "Music producer and chat enthusiast",
    },
    {
        "_id": "686f50aaf10f3cd28382ecf8",
        "email": "test7@greatstack.dev",
        "fullName": "Lisa Garcia",
        "profilePic": assets.profile_alison,
        "bio": "Travel blogger sharing stories worldwide",
    },
];

export const messagesDummyData = [
    {
        "_id": "680f571ff10f3cd28382f094",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
        "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "seen": true,
        "createdAt": "2025-04-28T10:23:27.844Z",
    },
    {
        "_id": "681f571ff10f3cd28382f095",
        "senderId": "680f50e4f10f3cd28382ecf9",
        "receiverId": "680f5116f10f3cd28382ed02",
        "text": "Hey there! How are you doing today?",
        "seen": true,
        "createdAt": "2025-04-28T10:25:15.234Z",
    },
    {
        "_id": "682f571ff10f3cd28382f096",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
         "image": img1,
        "text": "I'm doing great! Just working on some new features for the chat app.",
        "seen": false,
        "createdAt": "2025-04-28T10:27:42.156Z",
    },
    {
        "_id": "683f571ff10f3cd28382f097",
        "senderId": "680f50e4f10f3cd28382ecf9",
        "receiverId": "680f5116f10f3cd28382ed02",
        "image": img1,
        // "text": "That sounds exciting! What kind of features are you working on?",
        "seen": false,
        "createdAt": "2025-04-28T10:29:18.789Z",
    },
    {
        "_id": "684f571ff10f3cd28382f098",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
        "text": "Real-time messaging, file sharing, and maybe some emoji reactions!",
        "seen": false,
        "createdAt": "2025-04-28T10:31:05.432Z",
    },
    {
        "_id": "685f571ff10f3cd28382f099",
        "senderId": "680f50e4f10f3cd28382ecf9",
        "receiverId": "680f5116f10f3cd28382ed02",
        "image": img1,
        "text": "Wow, that's amazing! Can't wait to try them out 🚀",
        "seen": true,
        "createdAt": "2025-04-28T10:33:22.567Z",
    },
    {
        "_id": "686f571ff10f3cd28382f100",
        "senderId": "680f5116f10f3cd28382ed02",
        "receiverId": "680f50e4f10f3cd28382ecf9",
        "text": "Thanks! I'll keep you updated on the progress. Let's chat more later!",
        "seen": true,
        "createdAt": "2025-04-28T10:35:44.891Z",
    },
];