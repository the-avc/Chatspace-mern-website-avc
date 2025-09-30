import React from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { useContext } from 'react'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {
    const {selectedUser} = useContext(ChatContext);
    return (
        <div className='border w-full h-screen sm:px-[8%] sm:py-[3%]'>
            <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr]' : 'md:grid-cols-2'}`}>

                <Sidebar />
                <ChatContainer />
                {/* no need of right sidebar for now */}
                {/* <RightSidebar /> */}
            </div>
        </div>
    )
}

export default HomePage