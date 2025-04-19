import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BASE_URL } from "../../Utils/Config";

const AdminProfilePhotoModal = ({ isOpen, onClose, onSuccess, currentPhoto, adminId }) => {
    const [image, setImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('select'); // 'select', 'crop', 'preview'
    const cropperRef = useRef(null);
    const fileInputRef = useRef(null);
  
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = () => {
          setImage(reader.result);
          setStep('crop');
        };
        
        reader.readAsDataURL(file);
      }
    };
  
    const handleCrop = () => {
      if (cropperRef.current) {
        const canvas = cropperRef.current.getCanvas();
        if (canvas) {
          const croppedImageUrl = canvas.toDataURL();
          setCroppedImage(croppedImageUrl);
          setStep('preview');
        }
      }
    };
  
    // In AdminProfilePhotoModal.jsx - update the handleUpload function:
const handleUpload = async () => {
  try {
    setIsLoading(true);
    
    // Convert base64 to blob
    const fetchResponse = await fetch(croppedImage);
    const blob = await fetchResponse.blob();
    
    // Create form data
    const formData = new FormData();
    
    // Create a file from the blob
    const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
    
    // Append the file to FormData with the correct field name
    formData.append('profile_photo', file);
    
    // Add admin ID if available
    if (adminId) {
      formData.append('admin_id', adminId);
    }
    
    // Upload the photo
    const token = localStorage.getItem("adminAuthToken");
    const response = await axios.put(`${BASE_URL}/accounts/change-profile-photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    
    console.log("Profile photo upload response:", response.data);
    
    // Use the URL returned from the server instead of the local cropped image
    const serverPhotoUrl = response.data.profile_photo;
    
    setIsLoading(false);
    onSuccess(serverPhotoUrl); // Pass the server URL to the parent component
    resetAndClose();
  } catch (error) {
    console.error('Error uploading profile photo:', error.response ? error.response.data : error);
    setIsLoading(false);
    alert('Failed to upload profile photo. Please try again.');
  }
};
  
    const resetAndClose = () => {
      setImage(null);
      setCroppedImage(null);
      setStep('select');
      onClose();
    };
  
    const triggerFileInput = () => {
      fileInputRef.current.click();
    };
  
    const modalVariants = {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration: 0.3, 
          ease: "easeOut" 
        }
      },
      exit: { 
        opacity: 0, 
        scale: 0.95,
        transition: { 
          duration: 0.2, 
          ease: "easeIn" 
        }
      }
    };
  
    const backdropVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.2 }
      },
      exit: { 
        opacity: 0,
        transition: { duration: 0.2 }
      }
    };
  
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={resetAndClose}
            />
            
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {step === 'select' && 'Update Profile Photo'}
                    {step === 'crop' && 'Crop Your Photo'}
                    {step === 'preview' && 'Preview New Photo'}
                  </h3>
                </div>
                
                <div className="p-5">
                  {step === 'select' && (
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className="mb-6 w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img 
                          src={currentPhoto || '/default-profile.jpg'}
                          alt="Current profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                      >
                        Choose New Photo
                      </button>
                    </div>
                  )}
                  
                  {step === 'crop' && image && (
                    <div className="w-full h-80">
                      <Cropper
                        src={image}
                        ref={cropperRef}
                        className="w-full h-full"
                        stencilProps={{
                          aspectRatio: 1,
                          shape: 'circle'
                        }}
                      />
                    </div>
                  )}
                  
                  {step === 'preview' && croppedImage && (
                    <div className="flex flex-col items-center justify-center p-6">
                      <div className="mb-6 w-40 h-40 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img 
                          src={croppedImage} 
                          alt="Cropped profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                        Your new profile photo is ready to upload
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {step === 'crop' && (
                    <button
                      type="button"
                      onClick={handleCrop}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    >
                      Crop Photo
                    </button>
                  )}
                  
                  {step === 'preview' && (
                    <button
                      type="button"
                      onClick={handleUpload}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Uploading...' : 'Save Photo'}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  };

export default AdminProfilePhotoModal;