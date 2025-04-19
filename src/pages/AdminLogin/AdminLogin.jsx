import React, { useEffect, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../Utils/Config";
import "./adminlogin.css";
import logo from "../../assets/images/logo.svg";
import AdminLoginErrorModal from "./Modals/AdminLoginErrorModal";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showAdminLoginErrorModal, setShowAdminLoginErrorModal] = useState(false);


  useEffect(() => {
    const adminToken = localStorage.getItem('adminAuthToken');
    console.log('Admin Token', adminToken);

    if (!adminToken) {
      navigate('/');
    } else {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Username and Password are required");
      return;
    }
    try {
      setLoading(true);
      console.log("Attempting to send request to backend...");
      const response = await axios.post(`${BASE_URL}/accounts/login/`, {
        email: email,
        password: password,
      });
      console.log("Full Response:", response);
      if (response.status === 200) {
        const { access, admin } = response.data;
        const expirationTime = 24 * 60 * 60 * 1000; // 1 day
        const logoutTime = new Date().getTime() + expirationTime;
        // Store admin details in localStorage
        localStorage.setItem("adminAuthToken", access);
        localStorage.setItem("logoutTime", logoutTime);
        localStorage.setItem("adminDetails", JSON.stringify(admin)); // Store admin details
        console.log("Stored Admin Details:", JSON.parse(localStorage.getItem("adminDetails")));
        navigate("/admin/dashboard");
      } else {
        throw new Error(response.data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error during login request:", error);
      setShowAdminLoginErrorModal(true);
      setTimeout(() => {
        setShowAdminLoginErrorModal(false);
      }, 3000);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const adminToken = localStorage.getItem("adminAuthToken");
    const logoutTime = localStorage.getItem("logoutTime");

    if (adminToken && logoutTime) {
      const currentTime = new Date().getTime();
      if (currentTime >= logoutTime) {
        // Token has expired, perform logout
        localStorage.removeItem("adminAuthToken");
        localStorage.removeItem("logoutTime");
        navigate("/");
      } else {
        navigate("/admin/dashboard");
      }
    }
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen items-center justify-center adminloginscreen">
      <Toaster position="top-center" />

      <AdminLoginErrorModal
        showAdminLoginErrorModal={showAdminLoginErrorModal}
        onClose={() => { setShowAdminLoginErrorModal(false) }}
      />

      {/* Logo Section */}
      <div className="adminloginstyle">
        <div className="mb-9 mt-14">
          <p className="text-[#52D3D8] loginheadtext">
            Solutions you can count on.
          </p>
          <p className="text-[#52D3D8] loginheadtext">Partners you can trust. </p>
        </div>

        {/* Login Card Section */}
        <div className="rounded-lg shadow-lg mains">
          <h2 className="mb-7 lg:ml-12 text-white loginheading">Admin Login</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label className="labels">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className="rounded-lg bg-[#161C23] mt-1 email outline-none inputs border-transparent"
              />
            </div>

            <div className="relative">
              <label className="labels">Password</label>
              <div className="relative w-full">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="rounded-lg w-full bg-[#161C23] text-[#72787C] mt-1 outline-none inputs border-transparent"
                />
                <span
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <IoEyeOff size={20} className="text-white" />
                  ) : (
                    <IoEye size={20} className="text-white" />
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm text-white">
              <Link
                to="/forgotpassword"
                className="hover:underline forgotpassword"
              >
                Forgot password?
              </Link>
              <Link
                to="/company-login"
                className="hover:underline adminlogin">
                Company Login
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3C3B3B] text-white py-2 px-4 rounded-lg my-6 hover:bg-[#2d2d2d] transition signin"
              disabled={loading}
            >
              {loading ? "Signing In..." : <p>Sign In</p>}
            </button>
          </form>
        </div>
      </div>
      <div className="right-bottom">
        <img src={logo} alt="" className="footerlogo" />
        <p className="rightstext">© 2024 All rights reserved</p>
      </div>
    </div>
  );
};

export default AdminLogin;
