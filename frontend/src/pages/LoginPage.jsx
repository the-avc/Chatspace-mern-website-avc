import React, { Suspense, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext';
import { assets } from '../assets/assets';
// import TextType from '../../react-bits/TextType/TextType';

const TextType = React.lazy(() => import('../../react-bits/TextType/TextType'));

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const { login } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login/signup logic here
    const result = await login(isLogin ? 'login' : 'signup', formData);
    if (result?.success) {
      navigate('/');
    } else {
      console.log('Login/Signup failed:', result?.message);
    }
  };

  return (
    <>
      <div className='min-h-screen flex'>
        {/*------------------------ Left Side - Logo/Branding-------------------------------- */}
        <div className='hidden md:flex md:flex-1 bg-gradient-to-br items-center justify-center bg-black/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6'>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-4 mb-6'>
              <img
                src={assets.logo}
                alt="logo"
                className='w-88 rounded-md flex items-center justify-center'
                loading='lazy' />
              {/* <h1 className='text-4xl font-bold text-white'>Chatspace</h1> */}
            </div>
            <div className='text-white text-xl mb-8 font-medium'>
              Connect with
              <Suspense fallback={<span className='inline-block ml-2'>...</span>}>
                <TextType
                  text={["friends", "families", "colleagues", "Alison A.I.", "many more!"]}
                  typingSpeed={100}
                  deletingSpeed={40}
                  pauseDuration={2000}
                  showCursor={true}
                  cursorCharacter="|"
                  className='inline-block'
                />
              </Suspense>
            </div>
            <div className='space-y-4 text-blue-100'>
              <div className='flex items-center gap-3'>
                <i className="fi fi-rr-check-circle text-green-300"></i>
                <span>Real-time messaging</span>
              </div>
              <div className='flex items-center gap-3'>
                <i className="fi fi-rr-check-circle text-green-300"></i>
                <span>Easy to use interface</span>
              </div>
              <div className='flex items-center gap-3'>
                <i className="fi fi-rr-check-circle text-green-300"></i>
                <span>AI Assistant integrated</span>
              </div>
            </div>
          </div>
        </div>

        {/*-------------------------- Right Side - Form -----------------------------------------*/}
        <div className='flex-1 flex items-center justify-center p-8'>
          <div className='w-full max-w-md'>

            {/* Login/Signup Form */}
            <div className='bg-black/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6'>
              <div className='text-center mb-6'>
                <h2 className='text-3xl font-bold text-white mb-2'>
                  {isLogin ? 'Welcome Back' : 'Join Chatspace'}
                </h2>

              </div>

              <div className='flex mb-8 bg-white/10 rounded-2xl p-1'>
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${isLogin
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${!isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                {!isLogin && (
                  <div>
                    {/* <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Full Name
                  </label> */}
                    <div className='relative'>
                      <i className="fi fi-rr-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className='w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors'
                        required={!isLogin}
                        minLength={3}
                      />
                    </div>
                  </div>
                )}

                <div>
                  {/* <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Email Address
                </label> */}
                  <div className='relative'>
                    <i className="fi fi-rr-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className='w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors'
                      required
                    />
                  </div>
                </div>

                <div>
                  {/* <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Password
                </label> */}
                  <div className='relative'>
                    <i className="fi fi-rr-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className='w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors'
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className='flex items-center justify-between text-sm'>
                    <label className='flex items-center text-gray-400'>
                      <input type="checkbox" className='mr-2 rounded'
                        required
                      />
                      Agree to terms & conditions
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 cursor-pointer'
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Social Login */}
              {/* <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-700'></div>
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-black/30 text-gray-400'>Or continue with</span>
                </div>
              </div>

              <div className='mt-4 grid grid-cols-2 gap-3'>
                <button className='flex items-center justify-center px-4 py-2 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/30 transition-colors'>
                  <i className="fi fi-brands-google mr-2 text-red-400"></i>
                  Google
                </button>
                <button className='flex items-center justify-center px-4 py-2 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/30 transition-colors'>
                  <i className="fi fi-brands-github mr-2 text-white"></i>
                  GitHub
                </button>
              </div>
            </div> */}
            </div>

            {/* Footer */}
            <div className='text-center mt-6'>
              <p className='text-gray-400 text-sm'>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className='text-blue-400 hover:text-blue-300 transition-colors font-medium'
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div></>
  )
}

export default LoginPage