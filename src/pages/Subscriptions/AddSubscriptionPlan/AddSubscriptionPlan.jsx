import React, { useState } from 'react';
import "./addsubscriptionplan.css";
import { useTheme } from '../../../ThemeContext';
import { BASE_URL } from "../../../Utils/Config";
import axios from 'axios';
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import AddPlanSuccessModal from './AddPlanSuccessModal';
import AddPlanErrorModal from './AddPlanErrorModal';

const AddSubscriptionPlan = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [showAddPlanSuccessModal, setShowAddPlanSuccessModal] = useState(false);
  const [showAddPlanErrorModal, setShowAddPlanErrorModal] = useState(false);

  // Dynamic form fields configuration
  const [formData, setFormData] = useState({
    subscription_name: '',
    validity: '',
  });

  // Handle input changes dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission and API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // API endpoint (replace with your actual API URL)
      const response = await axios.post(`${BASE_URL}/accounts/subscriptions/`, formData);
      // Log response or show success message
      setShowAddPlanSuccessModal(true);
      setTimeout(() => {
        setShowAddPlanSuccessModal(false);
        navigate('/admin/manage-subscription');
      }, 1500);
      console.log('Subscription Plan Added:', response.data);
      // Optionally, reset form after successful submission
      setFormData({
        subscription_name: '',
        validity: '',
      });
    } catch (error) {
      setShowAddPlanErrorModal(true);
      setTimeout(() => {
        setShowAddPlanErrorModal(false);
      }, 3000);
      console.error('Error adding subscription plan:', error);
    }
  };

  return (
    <div className={`addsubplan ${theme === "dark" ? "dark" : "light"}`}>
      <Toaster position="top-center" reverseOrder={false} />

      <AddPlanSuccessModal
        showAddPlanSuccessModal={showAddPlanSuccessModal}
        onClose={() => { setShowAddPlanSuccessModal(false) }}
      />

      <AddPlanErrorModal
        showAddPlanErrorModal={showAddPlanErrorModal}
        onClose={() => { setShowAddPlanErrorModal(false) }}
      />

      <div className="lg:w-1/3 p-5">
        <h2 className="addsubplanhead">Add Subscription Plan</h2>
        <form className="mt-5" onSubmit={handleSubmit}>
          <div className="mb-5">
            {/* Subscription Name Input */}
            <div className='mb-4'>
              <label htmlFor="subscription_name" className="addsubplanlabel">
                Subscription Name
              </label>
              <input
                type="text"
                id="subscription_name"
                name="subscription_name"
                value={formData.subscription_name}
                onChange={handleInputChange}
                placeholder="Type here"
                className="w-full addsubplaninput outline-none"
              />
            </div>

            {/* Validity Input */}
            <div>
              <label htmlFor="validity" className="addsubplanlabel">
                Validity (Days)
              </label>
              <input
                type="number"
                id="validity"
                name="validity"
                value={formData.validity}
                onChange={handleInputChange}
                className="w-full addsubplaninput outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg addsubplanbtn md:duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionPlan;
