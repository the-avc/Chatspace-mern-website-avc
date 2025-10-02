import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import avatar_icon from '../assets/avatar.png'
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: authUser?.fullName || '',
    bio: authUser?.bio || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (formData.name.trim().length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.name.trim());
      formDataToSend.append('bio', formData.bio.trim());

      if (selectedImage) {
        formDataToSend.append('profilePic', selectedImage);
      }

      await updateProfile(formDataToSend);
      toast.success('Profile updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>

        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input
              type="file"
              id="avatar"
              accept=".image/jpeg,.image/png,.image/jpg,.image/webp"
              hidden
              onChange={(e) => {
                setSelectedImage(e.target.files[0]);
              }} />
            <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 flex-shrink-0 bg-gray-700 flex items-center justify-center'>
              <img src={selectedImage ? URL.createObjectURL(selectedImage) : authUser?.profilePic || avatar_icon}
                alt="profile"
                className='w-full h-full object-cover'
                onError={(e) => e.target.src = avatar_icon} />
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
            <button type='submit' className='bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm px-5 py-2 rounded-full cursor-pointer'>
              Save
            </button>
            <button type='button' onClick={() => navigate(-1)} className='text-sm px-5 py-2 rounded-full border border-gray-600 hover:border-gray-400 transition-colors'>
              Cancel
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}

export default ProfilePage