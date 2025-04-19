import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from "lucide-react";
import axios from 'axios';
import { BASE_URL } from "../../Utils/Config";
import { useTheme } from "../../ThemeContext";
import { toast, Toaster } from "react-hot-toast";
import "./changepaswd.css";
import PasswordChangeSuccessModal from './Modal/PasswordChangeSuccessModal';
import PasswordChangeErrorModal from './Modal/PasswordChangeErrorModal';

const CompanyChangePasswordModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);
  const [showPasswordErrorModal, setShowPasswordErrorModal] = useState(false);


  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [modalAnimation, setModalAnimation] = useState('');

  useEffect(() => {
    if (isOpen) {
      setModalAnimation('animate-modal-fade-in');
    } else {
      setModalAnimation('animate-modal-fade-out');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const getAuthenticatedUserId = () => {
    const userRole = localStorage.getItem("role");

    // If role is company, get company_id
    if (!userRole || userRole === "company") {
      const companyId = localStorage.getItem("company_id");
      if (companyId) return { id: companyId, type: "company" };
    }

    // If role is user, get user_id
    if (userRole === "user") {
      const userId = localStorage.getItem("user_id");
      if (userId) return { id: userId, type: "user" };

      // Alternative approach if user_id is stored as JSON object
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          return { id: parsedUserData.id, type: "user" };
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }

    return null;
  };

  const closeModal = () => {
    setModalAnimation('animate-modal-fade-out');
    setTimeout(() => {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      onClose();
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const authData = getAuthenticatedUserId();
    console.log("Authentication Data:", authData);
    if (!authData) {
      setError('User identification not found. Please log in again.');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "New passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      // Different endpoints for company vs user
      const endpoint = authData.type === "company"
        ? `${BASE_URL}/accounts/companies/change-password/${authData.id}/`
        : `${BASE_URL}/company/user/change-password/${authData.id}/`;

      const response = await axios.put(
        endpoint,
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        }
      );

      if (response.status === 200) {
        setShowPasswordSuccessModal(true);
        setTimeout(() => {
          setShowPasswordSuccessModal(false);
          closeModal();
          navigate("/company/dashboard");
        }, 1500);
      }

    } catch (error) {
      setErrors({
        currentPassword: error.response?.data?.error || "Failed to change password"
      });
      setShowPasswordErrorModal(true);
      setTimeout(() => {
        setShowPasswordErrorModal(false);
      }, 3000);
    }
    setIsLoading(false);
  };

  if (!isOpen && !modalAnimation) return null;

  // Define password fields with consistent naming
  const passwordFields = [
    { id: 'currentPassword', label: 'Current Password' },
    { id: 'newPassword', label: 'New Password' },
    { id: 'confirmPassword', label: 'Confirm Password' }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${modalAnimation}`}>
      <Toaster position="top-center" reverseOrder={false} />

      <PasswordChangeSuccessModal
        showPasswordSuccessModal={showPasswordSuccessModal}
        onClose={() => { setShowPasswordSuccessModal(false) }}
      />

      <PasswordChangeErrorModal
        showPasswordErrorModal={showPasswordErrorModal}
        onClose={() => { setShowPasswordErrorModal(false) }}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={closeModal}></div>

      <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${theme === "dark" ? "bg-[#1E1E26] text-white" : "bg-white text-[#13131A]"}`}>
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-[#383840]">Change Password</h2>

        {errors.general && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          {passwordFields.map((field) => (
            <div key={field.id} className="mb-4">
              <label className="text-sm font-medium mb-1 text-white">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={showPasswords[field.id] ? "text" : "password"}
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 mt-1 border outline-none rounded-md ${theme === "dark" ? "bg-[#282836] border-[#383840]" : "bg-white border-gray-300"
                    } ${errors[field.id] ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility(field.id)}
                >
                  {showPasswords[field.id] ?
                    <EyeOff className="h-5 w-5 text-gray-500" /> :
                    <Eye className="h-5 w-5 text-gray-500" />
                  }
                </button>
              </div>
              {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
            </div>
          ))}

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md hover:bg-gray-100 hover:text-black duration-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#1E4DA1] text-white rounded-md hover:bg-[#203e72] flex items-center duration-100"
            >
              {isLoading ? "Processing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyChangePasswordModal;