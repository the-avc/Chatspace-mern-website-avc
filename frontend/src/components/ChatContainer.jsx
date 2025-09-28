import React from 'react'
import { assets, messagesDummyData } from '../assets/assets';
import help_icon from '../assets/help.png'
import avatar_icon from '../assets/avatar.png'
import profile_alison from '../assets/profile_alison.avif';
import { formatTimestamp } from '../lib/utils';

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = React.useRef(null);
  // React.useEffect(() => {
  //   scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  // }, [selectedUser]);

  React.useEffect(() => {
    // Scroll to bottom when user is selected or messages change
    if (selectedUser && scrollEnd.current) {
      setTimeout(() => {
        scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedUser, messagesDummyData]);


  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>

      {/* -------------------HEADER-------------------------------------  */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={assets.profile_alison} alt="" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.name}
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
        </p>
        {/* <img onClick={() => setSelectedUser(null)} className='md:hidden max-w-7' src={help_icon} alt="" /> */}

        <i className="fi fi-rr-arrow-left text-white max-md:hidden"
          onClick={() => setSelectedUser(null)}
        ></i>
        <i className="fi fi-rr-info text-white max-md:hidden"></i>\
      </div>

      {/* -------------------CHAT AREA-------------------------------------  */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-4 pb-6 space-y-3'>
        {messagesDummyData.map((msg, index) => {
          const isCurrentUser = msg.senderId === "680f50e4f10f3cd28382ecf9";
          return (
            <div key={index} className={`flex gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {/* Profile picture for received messages */}
              {!isCurrentUser && (
                <img
                  src={profile_alison}
                  alt=""
                  className='w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto'
                />
              )}

              <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                {msg.image && (
                  <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-2' />
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
                  src={avatar_icon}
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
          />
          <input type="file" id="image" accept='image/png, image/jpeg' hidden
          />
          <label htmlFor='image'>
            <i className="fi fi-rr-add-image text-white cursor-pointer text-lg"></i>

          </label>

        </div>
        <i className="fi fi-ss-paper-plane-top text-white cursor-pointer"></i>

      </div>

    </div>
  ) :
    (
      <div className='h-full flex flex-col justify-center items-center gap-5 text-white text-center px-5'>
        <i className="fi fi-brands-wepik text-2xl"> LOGO</i>
        <h2 className='text-2xl font-semibold'>Select a chat to start messaging</h2>
        <p className='text-gray-400'>Choose from your existing chats, or start a new one by selecting a contact from the sidebar. Happy chatting!</p>
      </div>
    )
}

export default ChatContainer