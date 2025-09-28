import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import avatar_icon from '../assets/avatar.png'
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const [selectedImage, setSelectedImage] = React.useState(null);
  const navigate = useNavigate();
  const { authUser, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = React.useState({
    name: authUser?.fullName || '',
    bio: authUser?.bio || '',
  });

  // Update form data when authUser changes
  React.useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.fullName || '',
        bio: authUser.bio || '',
      });
    }
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let result;
      
      if (!selectedImage) {
        result = await updateProfile({
          fullName: formData.name,
          bio: formData.bio,
        });
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImage);
        reader.onload = async () => {
          const base64Image = reader.result;
          result = await updateProfile({
            fullName: formData.name,
            bio: formData.bio,
            profilePic: base64Image,
          });
          
          if (result?.success) {
            navigate('/');
          }
          setIsLoading(false);
        };
        return; // Exit early for image upload case
      }
      
      if (result?.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>

        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input type="file" id="avatar" accept='.png, .jpeg, .jpg'
              hidden onChange={(e) => {
                setSelectedImage(e.target.files[0]);
              }} />
            <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 flex-shrink-0'>
              <img 
                src={
                  selectedImage 
                    ? URL.createObjectURL(selectedImage) 
                    : authUser?.profilePic || avatar_icon
                } 
                alt="Profile" 
                className='w-full h-full object-cover' 
              />
            </div>
            <span className='text-sm text-gray-300 hover:text-white transition-colors'>
              Upload profile image
            </span>
          </label>


          <input type="text" name="name" placeholder='Your Name' className='w-full bg-gray-800/50 rounded-full py-2 px-3 text-sm placeholder:text-gray-400 border border-gray-700/50 focus:outline-none focus:border-blue-500/50 transition-colors'
            value={formData.name} onChange={handleChange} />

          <textarea name="bio" rows="3" placeholder='Bio' className='w-full bg-gray-800/50 rounded-lg py-2 px-3 text-sm placeholder:text-gray-400 border border-gray-700/50 focus:outline-none focus:border-blue-500/50 transition-colors resize-none'
            value={formData.bio} onChange={handleChange}></textarea>


          <div className='flex items-center gap-5'>
            <button 
              type='submit' 
              disabled={isLoading}
              className={`bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm px-5 py-2 rounded-full cursor-pointer transition-opacity ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-500 hover:to-violet-700'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button 
              type='button' 
              onClick={() => navigate(-1)} 
              disabled={isLoading}
              className='text-sm px-5 py-2 rounded-full border border-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50'
            >
              Cancel
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}

export default ProfilePage