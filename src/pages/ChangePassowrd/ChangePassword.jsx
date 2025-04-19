import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import "./changepassword.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Utils/Config";
import logo from "../../assets/images/logo.svg";
import closeIcon from "../../assets/images/close.svg";
import { IoEye, IoEyeOff } from "react-icons/io5";
import ChangePasswordSuccessModal from "./ChangePasswordSuccessModal";
import ChangePasswordErrorModal from "./ChangePasswordErrorModal";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);
  const [showPasswordErrorModal, setShowPasswordErrorModal] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminAuthToken");
    if (!adminToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New Password and Confirm Password do not match.");
      return;
    }

    try {
      const response = await axios.put(`${BASE_URL}/accounts/admin-change-password/`, {
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      if (response.status === 200) {
        setShowPasswordSuccessModal(true);
        localStorage.removeItem("adminAuthToken");
        setFormData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        setTimeout(() => {
          setShowPasswordSuccessModal(false);
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      setShowPasswordErrorModal(true);
      setTimeout(() => {
        setShowPasswordErrorModal(false);
      }, 3000);
    }
  };


  const [passwordVisible, setPasswordVisible] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisible((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleClose = () => {
    navigate("/admin/dashboard");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center forgotscreens">
      <Toaster position="top-center" reverseOrder={false} />

      <ChangePasswordSuccessModal
        showPasswordSuccessModal={showPasswordSuccessModal}
        onClose={() => { setShowPasswordSuccessModal(false) }}
      />

      <ChangePasswordErrorModal
        showPasswordErrorModal={showPasswordErrorModal}
        onClose={() => { setShowPasswordErrorModal(false) }}
      />

      <div className="relative rounded-lg shadow-lg mainpasses">
        <div className="headers">
          <img
            src={closeIcon}
            alt="Close"
            className="absolute top-6 right-6 cursor-pointer closes"
            onClick={handleClose}
          />
          <h2 className="text-white forgotpassheads">Change Password</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label className="text-[#898989] currentpaswdlabel">
              Current Password
            </label>
            <input
              type={passwordVisible.current_password ? "text" : "password"}
              name="current_password"
              placeholder="Current Password"
              value={formData.current_password}
              onChange={handleChange}
              className="rounded-lg w-full mt-1 password forgotinputs border-transparent"
            />
            <span
              className="absolute top-11 right-3 transform -translate-y-1/2 cursor-pointer"
              onClick={() => togglePasswordVisibility("current_password")}
            >
              {passwordVisible.current_password ? (
                <IoEyeOff size={20} className="text-white" />
              ) : (
                <IoEye size={20} className="text-white" />
              )}
            </span>
          </div>
          <div className="relative">
            <label className="text-[#898989] currentpaswdlabel">
              New Password
            </label>
            <input
              type={passwordVisible.new_password ? "text" : "password"}
              name="new_password"
              placeholder="New Password"
              value={formData.new_password}
              onChange={handleChange}
              className="rounded-lg w-full mt-1 password forgotinputs border-transparent"
            />
            <span
              className="absolute top-11 right-3 transform -translate-y-1/2 cursor-pointer"
              onClick={() => togglePasswordVisibility("new_password")}
            >
              {passwordVisible.new_password ? (
                <IoEyeOff size={20} className="text-white" />
              ) : (
                <IoEye size={20} className="text-white" />
              )}
            </span>
          </div>
          <div className="relative">
            <label className="text-[#898989] currentpaswdlabel">
              Confirm Password
            </label>
            <input
              type={passwordVisible.confirm_password ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="rounded-lg w-full mt-1 password forgotinputs border-transparent"
            />
            <span
              className="absolute top-11 right-3 transform -translate-y-1/2 cursor-pointer"
              onClick={() => togglePasswordVisibility("confirm_password")}
            >
              {passwordVisible.confirm_password ? (
                <IoEyeOff size={20} className="text-white" />
              ) : (
                <IoEye size={20} className="text-white" />
              )}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-[#3C3B3B] text-white py-2 px-4 rounded-lg hover:bg-[#2d2d2d] transition passbtns "
          >
            Submit
          </button>
        </form>
      </div>
      <div className="right-bottom">
        <img src={logo} alt="" className="footerlogo" />
        <p className="rightstext">© 2024 All rights reserved</p>
      </div>
    </div>
  );
};

export default ChangePassword;
