import React, { Suspense, useContext } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
// import HomePage from './pages/HomePage'
// import LoginPage from './pages/LoginPage'
// import ProfilePage from './pages/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
// import Silk from '../react-bits/Silk/Silk'

// Lazy load pages for performance optimization
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const Silk = React.lazy(() => import('../react-bits/Silk/Silk'));

const App = () => {
  const { authUser } = useContext(AuthContext);
  const location = useLocation(); //is used to get the current route

  // Page colors mapping
  const pageColors = {
    '/login': '#FF3B82',
    '/': '#5227FF',
    '/profile': '#10B981'
  };

  const currentColor = pageColors[location.pathname] || '#5227FF';

  return (
    <>
      {/* Animated Background */}
      <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>}>
        <div className='inset-0 z-0 absolute'>
          <Silk
            key={location.pathname} //key is used to remount the component on route change
            speed={2.2}
            scale={1}
            color={currentColor}
            noiseIntensity={1.0}
            rotation={0.0}
          />
        </div>

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

        <div className='absolute bottom-2 font-mono right-4 text-white/25 text-xs pointer-events-none'>
          © 2025 Chatspace v4.1 All rights reserved.
        </div>
      </Suspense>
    </>
  )
}

export default App