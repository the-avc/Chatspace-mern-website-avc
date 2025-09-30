import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext';
import { assets } from '../assets/assets';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);

  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    fullName: '',
    // confirmPassword: ''
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
      // Redirect to profile page for signup (first-time users) to set up their profile
      // Redirect to home page for login
      if (result.isSignup) {
        navigate('/profile');
      } else {
        navigate('/');
      }
    } else {
      console.log('Login/Signup failed:', result?.message);
    }
    console.log(isLogin ? 'Logging in with' : 'Signing up with', formData);
  };

  return (
    <div className='min-h-screen flex'>
      {/* Left Side - Logo/Branding */}
      <div className='hidden md:flex md:flex-1 bg-gradient-to-br items-center justify-center bg-black/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6'>
        <div className='text-center'>
          <div className='flex items-center justify-center gap-4 mb-6'>
              {/* <i className="fi fi-brands-rocketchat text-white text-3xl"></i> */}
              <img src={assets.logo} alt="" className='w-75 rounded-md flex items-center justify-center' />

            
            {/* <h1 className='text-4xl font-bold text-white'>Chatspace</h1> */}
          </div>
          <p className='text-blue-100 text-lg mb-8'>
            Connect with friends and family instantly
          </p>
          {/* <div className='space-y-4 text-blue-100'>
            <div className='flex items-center gap-3'>
              <i className="fi fi-rr-check-circle text-green-300"></i>
              <span>Real-time messaging</span>
            </div>
            <div className='flex items-center gap-3'>
              <i className="fi fi-rr-check-circle text-green-300"></i>
              <span>Secure and private</span>
            </div>
            <div className='flex items-center gap-3'>
              <i className="fi fi-rr-check-circle text-green-300"></i>
              <span>Easy to use interface</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>

          {/* Login/Signup Form */}
          <div className='bg-black/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6'>
            <div className='flex mb-6'>
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${isLogin
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${!isLogin
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
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
                  />
                </div>
              </div>

              {/* {!isLogin && (
                <div>
                  <div className='relative'>
                    <i className="fi fi-rr-edit absolute left-3 top-3 text-gray-400 text-sm"></i>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself (optional)"
                      rows="3"
                      className='w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors resize-none'
                    />
                  </div>
                </div>
              )} */}

              {/* {!isLogin && (
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <i className="fi fi-rr-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className='w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors'
                    required={!isLogin}
                  />
                </div>
              </div>
            )} */}

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
    </div>
  )
}

export default LoginPage