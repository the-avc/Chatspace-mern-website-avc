import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <div className="bg-[url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2VifGVufDB8fDB8fHww')] bg-cover bg-center bg-no-repeat min-h-screen">
      <div className='fixed top-2 left-2 z-50 text-white/20 text-sm font-mono pointer-events-none'>
        the-AVC
      </div>
      <Toaster />
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path='/*' element={authUser ? <Navigate to="/" /> : <Navigate to="/login" />} />
      </Routes>
      <div className='absolute bottom-2 font-mono right-4 text-white/20 text-xs pointer-events-none'>
        © 2025 Chatspace v1.1 All rights reserved.
      </div>
    </div>
  )
}

export default App