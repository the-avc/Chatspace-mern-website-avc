import React, { useContext, useState, useEffect, useRef } from 'react'
import { assets } from '../assets/assets';
import { formatTimestamp } from '../lib/utils';
import { askAI } from '../lib/ai.js';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, setMessages } = useContext(ChatContext);
  const { authUser, onlineUsers, axios } = useContext(AuthContext);

  const [input, setInput] = useState("");

  const scrollEnd = useRef(null);

  // handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (input.trim().length === 0) {
      toast.error("Please enter a message");
      return;
    }

    const text = input.trim();

    if (selectedUser?._id === import.meta.env.VITE_AI_ASSISTANT_ID) {
      setInput("");
      try {
        const response = await askAI(axios, { prompt: text });
        if (response?.success && response?.userMessage && response?.aiMessage) {
          setMessages(prev => [...prev, response.userMessage, response.aiMessage]);
        }
      } catch (error) {
        toast.error('AI service unavailable');
      }
      return;
    }
    await sendMessage({ text });
    setInput("");
  }

  //handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    await sendMessage(formData, true); // Pass true to indicate this is FormData
    e.target.value = null; //reset the input
  }

  useEffect(() => {
    if (!selectedUser) return;
    // Now AI assistant messages are also stored in DB, so fetch them like regular messages
    getMessages(selectedUser._id);
  }, [selectedUser]);

  useEffect(() => {
    // Scroll to bottom when user is selected or messages change
    if (selectedUser && scrollEnd.current && messages.length) {
      setTimeout(() => {
        scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedUser, messages]);


  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>

      {/* -------------------HEADER-------------------------------------  */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>

        <i className="fi fi-br-cross text-white cursor-pointer"
          onClick={() => setSelectedUser(null)}
        ></i>
      </div>

      {/* -------------------CHAT AREA-------------------------------------  */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-4 pb-6 space-y-3'>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === authUser._id;
          return (
            <div key={index} className={`flex gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {/* Profile picture for received messages */}
              {!isCurrentUser && (
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className='w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto'
                />
              )}

              <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                {msg.image && (
                  <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-2 cursor-pointer'
                    onClick={() => window.open(msg.image)}
                  />
                )}
                {msg.text && (
                  <div className={`max-w-[280px] p-3 rounded-2xl text-sm ${isCurrentUser
                    ? 'bg-[#635FC7] text-white rounded-br-md'
                    : 'bg-[#8185B2]/20 text-white rounded-bl-md'
                    }`}>
                    {msg.text}
                  </div>
                )}
                <p className='text-xs text-gray-400 mt-1 px-2'>{formatTimestamp(msg.createdAt)}</p>
              </div>

              {/* Profile picture for sent messages */}
              {isCurrentUser && (
                <img
                  src={authUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className='w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto'
                />
              )}
            </div>
          );
        })}
        <div ref={scrollEnd} className='h-1'></div>
      </div>

      {/* -------------------INPUT AREA-------------------------------------  */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex items-center flex-1 bg-gray-100/12 px-3 rounded-full'>
          <input
            type="text"
            placeholder='Type a message...'
            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => {
              e.key === "Enter" && handleSendMessage(e);
            }}
          />
          <input type="file" id="image" accept='image/png, image/jpeg' hidden
            disabled={selectedUser._id === import.meta.env.VITE_AI_ASSISTANT_ID}
            onChange={(e) => handleSendImage(e)}
          />
          <label htmlFor='image' className='p-2 rounded-full hover:bg-gray-800/50 transition-colors'
            onClick={(e) => {
              if (selectedUser._id === import.meta.env.VITE_AI_ASSISTANT_ID) {
                toast.error("Image upload is disabled for AI Assistant");
                e.preventDefault();
              }
            }
            }>
            <i className={`fi fi-rr-add-image text-lg ${selectedUser._id === '68dbf6866eb3084437c9da9c' ? 'text-gray-500 cursor-not-allowed' : 'text-white cursor-pointer'}`}></i>
          </label>

        </div>
        <i className="fi fi-ss-paper-plane-top text-white cursor-pointer"
          onClick={(e) => handleSendMessage(e)}
        ></i>

      </div>

    </div>
  ) :
    (
      <div className='h-full flex flex-col justify-center items-center gap-5 text-white text-center px-5'>
        <img src={assets.logo} alt="Chatspace Logo" className='w-66' />
        <h2 className='text-2xl font-semibold'>Select a chat to start messaging</h2>
        <p className='text-gray-400'>Happy chatting!</p>
      </div>
    )
}

export default ChatContainer