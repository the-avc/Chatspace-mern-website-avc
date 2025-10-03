import React, { useRef, useEffect, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { AiContext } from '../../context/AiContext';

const Sidebar = () => {
    const { selectedUser, users, getUsers, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);
    const { authUser } = useContext(AuthContext);
    const [hide, setHide] = useState(false);
    const { logout, onlineUsers } = useContext(AuthContext);
    const { aiEnabled } = useContext(AiContext);

    const [searchTerm, setSearchTerm] = useState("");

    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Separate AI Assistant from regular users
    const aiAssistant = users.find(user => user._id === import.meta.env.VITE_AI_ASSISTANT_ID);
    const regularUsers = users.filter(user => user._id !== import.meta.env.VITE_AI_ASSISTANT_ID);

    const filteredUsers = searchTerm
        ? regularUsers.filter(user =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : regularUsers;


    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setHide(false);
        }
    };
    // Close dropdown when clicking outside
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <div className={`bg-black/30 backdrop-blur-sm h-full overflow-hidden text-white ${selectedUser ? "max-md:hidden" : ""}`}>
            {/*------------------------- Header Section -----------------------------------------------*/}
            <div className='p-3 border-b border-gray-700/50'>
                <div className='flex justify-between items-center mb-3'>
                    <div className='flex items-center gap-2'>
                        <img src={assets.logo} alt="" className='w-45 rounded-md flex items-center justify-center' />
                    </div>
                    <div className='relative' ref={dropdownRef}>
                        {/* user profile image and dropdown */}
                        <img src={authUser?.profilePic || assets.avatar_icon} alt="" className='w-8 h-8 rounded-full object-cover cursor-pointer border border-gray-600'
                            onClick={() => setHide(!hide)}
                        />
                        <div className={`absolute top-full right-0 z-20 w-28 p-2 rounded-lg bg-gray-800/90 backdrop-blur-sm border border-gray-600 text-gray-100 shadow-lg ${hide ? 'block' : 'hidden'}`}
                        >
                            <p className='cursor-pointer text-xs py-1 hover:text-blue-400 transition-colors'
                                onClick={() => navigate('/profile')}
                            >Edit Profile : {authUser.fullName}</p>
                            <hr className='my-1 border-gray-600' />
                            <p className='cursor-pointer text-xs py-1 hover:text-red-400 transition-colors'
                                onClick={() => logout()}
                            >Logout</p>
                        </div>
                    </div>
                </div>

                {/*-------------------------- Search Bar-------------------------------------------------- */}
                <div className='relative'>
                    <i className="fi fi-rr-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input
                        type="text"
                        placeholder='Search User...'
                        className='w-full bg-gray-800/50 rounded-full py-2 pl-8 pr-3 text-xs placeholder:text-gray-400 border border-gray-700/50 focus:outline-none focus:border-blue-500/50 transition-colors'
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users List */}
            <div className='flex flex-col overflow-y-auto h-[calc(100%-120px)]'>
                {/*--------------------- AI Assistant (at top) ------------------------------- */}
                {aiAssistant && (
                    <div
                        onClick={() => {
                            setSelectedUser(aiAssistant);
                        }}
                        className={`relative flex items-center gap-2 p-2 mx-2 my-0.5 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-all duration-200 ${selectedUser?._id === aiAssistant._id ? "bg-blue-500/20 border-l-4 border-blue-500" : ""}`}
                    >
                        <div className='relative'>
                            <img src={aiAssistant.profilePic} alt="AI" className='w-10 h-10 rounded-full object-cover border border-gray-600' />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-800 ${aiEnabled ? "bg-green-500" : "bg-gray-500"}`}></div>
                        </div>

                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between'>
                                <p className='font-medium text-sm truncate'> {aiAssistant.fullName} </p>
                                <i className="fi fi-ss-thumbtack text-sm"></i>
                            </div>
                            <p className={`text-xs ${aiEnabled ? "text-green-400" : "text-gray-400"}`}>{aiEnabled ? "Always Online" : "Curently Unavailable"}</p>
                        </div>
                    </div>
                )}

                {/*-------------------users--------------------------------------------------------- */}
                {filteredUsers.map((user, index) => (
                    <div
                        onClick={() => {
                            setSelectedUser(user);
                            setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
                        }}
                        key={index}
                        className={`relative flex items-center gap-2 p-2 mx-2 my-0.5 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-all duration-200 ${selectedUser?._id === user._id ? "bg-blue-500/20 border-l-4 border-blue-500" : ""
                            }`}
                    >
                        <div className='relative'>
                            <img
                                src={user?.profilePic || assets.avatar_icon}
                                srcSet={`${user?.profilePic || assets.avatar_icon} 1x, ${user?.profilePic || assets.avatar_icon} 2x`}
                                alt="userProfile"
                                className='w-10 h-10 rounded-full object-cover border border-gray-600' />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-800 ${onlineUsers.includes(user._id) ? 'bg-green-500' : 'bg-gray-500'
                                }`}></div>
                        </div>

                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between'
                                title={String(user._id) === String(import.meta.env.VITE_ADMIN_ID) ? "Admin" : ""}>
                                <p className='font-medium text-sm truncate'>{user.fullName}</p>
                                {unseenMessages[user._id] > 0 && (
                                    <span className='bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none'>
                                        {unseenMessages[user._id]}
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs ${onlineUsers.includes(user._id) ? 'text-green-400' : 'text-gray-400'}`}>
                                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Sidebar