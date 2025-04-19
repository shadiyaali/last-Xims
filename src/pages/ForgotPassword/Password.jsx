import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import closeIcon from "../../assets/images/close.svg"; // Import your close icon image
import "./password.css";

const Password = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center forgotscreen">
      {/* Login Card Section */}

      <div className="relative rounded-lg shadow-lg mainpass">
        <div className="header">
          {/* Close Icon */}
          <img
            src={closeIcon}
            alt="Close"
            className="absolute top-6 right-6 cursor-pointer closess"
            onClick={handleClose}
          />

          <h2 className="text-white forgotpasshead">Forgot Password</h2>
        </div>
        <form className="space-y-6">
          <div className="relative">
            <label className="text-[#898989] emaillabel">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="rounded-lg w-full mt-1 email forgotinputs border-transparent"
            />
          </div>

          <div className="flex justify-end text-sm text-white">
            <a href="/" className="hover:underline backlogin">
              Back to Login
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#3C3B3B] text-white py-2 px-4 rounded-lg my-6 hover:bg-[#2d2d2d] transition passbtn"
          >
            Send Password
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

export default Password;
