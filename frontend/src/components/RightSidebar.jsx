import React from 'react'
import avatar_icon from '../assets/avatar.png'
import { imagesDummyData } from '../assets/assets'

const RightSidebar = ({ selectedUser }) => {
  return selectedUser && (
    <div className={`bg-black/30 backdrop-blur-sm h-full overflow-y-auto text-white ${selectedUser ? "max-md:hidden" : "hidden"}`}>
      {/* Profile Section */}
      <div className='flex flex-col items-center p-4 text-center border-b border-gray-700/30'>
        <img src={selectedUser?.profilePic || avatar_icon} alt=""
          className='w-16 h-16 rounded-full object-cover border-2 border-gray-600' />
        <h2 className='text-white text-lg font-medium mt-3 flex items-center justify-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-green-500'></span>
          {selectedUser?.fullName}
        </h2>
        <p className='text-gray-400 text-xs mt-1 px-2 leading-relaxed'>
          {selectedUser?.bio || "Hey there! I am using QuickChat."}
        </p>
      </div>

      {/* Media Section */}
      <div className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-white text-sm font-medium'>Media</h3>
          
        </div>
        
        <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto">
          {imagesDummyData.map((img, index) => (
            <div key={index} onClick={() => window.open(img)}
              className='relative cursor-pointer group overflow-hidden rounded-lg bg-gray-800/50'>
              <img 
                src={img} 
                alt="" 
                className='w-full h-16 object-cover transition-transform duration-200 group-hover:scale-110' 
              />
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200'></div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Actions */}
      <div className='p-4 border-t border-gray-700/30'>
        <div className='space-y-2'>
          
         
          <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/20 cursor-pointer transition-colors'>
            <i className="fi fi-rr-trash text-red-400 text-sm"></i>
            <span className='text-sm text-red-400'>Delete conversation</span>
          </div>

          <button className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm px-20 py-2 rounded-full cursor-pointer'>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default RightSidebar