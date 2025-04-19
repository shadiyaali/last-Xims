import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { BASE_URL } from '../../Utils/Config';

const CompanyProfilePhotoModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentProfilePic, 
  companyId, 
  entityType // New prop to distinguish between user and company
}) => {
    const [image, setImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('upload'); // 'upload', 'crop', 'preview'
    const cropperRef = useRef(null);
    const fileInputRef = useRef(null);
  
    if (!isOpen) return null;
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
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
  
    const handleSave = async () => {
      try {
        setIsLoading(true);
        
        // Convert the cropped image to a file
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('logo', file);
        
        // Dynamically choose the API endpoint based on entity type
        const apiEndpoint = entityType === 'company' 
          ? `${BASE_URL}/accounts/edit-logo/${companyId}/`  // Company logo update
          : `${BASE_URL}/company/edit-logo/${companyId}/`;  // User logo update
        
        const result = await axios.put(apiEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Get the updated entity data from the response
        const updatedEntityData = result.data;
        
        // Update data in localStorage based on entity type
        if (entityType === 'company') {
          const storedCompanyData = JSON.parse(localStorage.getItem('companyData') || '{}');
          const updatedStoredData = { ...storedCompanyData, logo: updatedEntityData.logo || croppedImage };
          localStorage.setItem('companyData', JSON.stringify(updatedStoredData));
          localStorage.setItem('company_company_logo', JSON.stringify(updatedEntityData.logo || croppedImage));
        } else {
          localStorage.setItem('user_logo', updatedEntityData.logo || croppedImage);
        }
        
        // Call the onSave callback with the updated entity data
        onSave(updatedEntityData.logo || croppedImage);
        
        setIsLoading(false);
        onClose();
        
        // Reset the state for next time
        setImage(null);
        setCroppedImage(null);
        setStep('upload');
      } catch (error) {
        console.error('Error saving profile image:', error);
        setIsLoading(false);
      }
    };

    const triggerFileInput = () => {
      fileInputRef.current.click();
    };
  
    const handleBackClick = () => {
      if (step === 'crop') {
        setStep('upload');
        setImage(null);
      } else if (step === 'preview') {
        setStep('crop');
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-[#1E1E26] rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#383840]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step === 'upload' && 'Update Profile Picture'}
              {step === 'crop' && 'Crop Your Image'}
              {step === 'preview' && 'Preview'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
              <X size={20} />
            </button>
          </div>
  
          <div className="p-4">
            {step === 'upload' && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-4">
                  <img 
                    src={currentProfilePic} 
                    alt="Current Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                <button onClick={triggerFileInput} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  Change Profile Photo
                </button>
              </div>
            )}
  
            {step === 'crop' && image && (
              <div className="py-4">
                <div className="h-64 mb-4">
                  <Cropper src={image} ref={cropperRef} className="h-full" stencilProps={{ aspectRatio: 1 }} />
                </div>
              </div>
            )}
  
            {step === 'preview' && croppedImage && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-4">
                  <img src={croppedImage} alt="Cropped Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                  Your new profile picture is ready. Click Save to update your profile.
                </p>
              </div>
            )}
          </div>
  
          <div className="flex justify-end p-4 border-t border-gray-200 dark:border-[#383840] gap-5">
            {step !== 'upload' && (
              <button onClick={handleBackClick} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors">
                Back
              </button>
            )}
            {step === 'crop' && (
              <button onClick={handleCrop} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                Crop
              </button>
            )}
            {step === 'preview' && (
              <button onClick={handleSave} disabled={isLoading} className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
};
  
export default CompanyProfilePhotoModal;