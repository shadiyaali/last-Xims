import React, { useEffect, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../Utils/Config";
import "./companylogin.css";
import logo from "../../assets/images/logo.svg";

import img1 from "../../assets/images/Company-Login/cmy1.png"
import img2 from "../../assets/images/Company-Login/cmy2.png"
import img3 from "../../assets/images/Company-Login/cmy3.png"
import img4 from "../../assets/images/Company-Login/cmy4.png"
import img5 from "../../assets/images/Company-Login/cmy5.png"
import img6 from "../../assets/images/Company-Login/cmy6.png"
import CompanyLoginErrorModal from "./Modal/CompanyLoginErrorModal";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const [showCompanyLoginErrorModal, setShowCompanyLoginErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error("Username and Password are required");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/company/company/login/`, {
                username,
                password,
            });

            console.log("Login Response:", response.data);

            if (response.status === 200) {
                const { access, refresh, id, email_address, company_name, role, ...userData } = response.data;

                // Setting id as company_id since the response does not have company_id
                const company_id = id;

                console.log("Access Token:", access);
                console.log("Refresh Token:", refresh);
                console.log("Company ID:", company_id);
                console.log("User Data:", userData);

                localStorage.setItem("accessToken", access);
                localStorage.setItem("refreshToken", refresh);
                localStorage.setItem("role", role);



                if (role === "company" && company_id) {
                    localStorage.setItem("company_id", company_id);
                    localStorage.setItem("company_name", company_name);
                    localStorage.setItem("email_address", email_address);
                    Object.keys(userData).forEach((key) => {
                        localStorage.setItem(`company_${key}`, JSON.stringify(userData[key]));

                    });

                    localStorage.removeItem("user_id");

                    console.log("Navigating to /company/dashboard");
                    setTimeout(() => navigate("/company/dashboard"), 100);
                } else if (role === "user") {
                    localStorage.setItem("user_id", id);

                    Object.keys(userData).forEach((key) => {
                        localStorage.setItem(`user_${key}`, JSON.stringify(userData[key]));
                    });

                    localStorage.removeItem("company_id");  // Removing company_id when it's a user

                    console.log("Navigating to /user/dashboard");
                    setTimeout(() => navigate("/company/dashboard"), 100);
                }
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data || error);
            const message = error.response?.data?.error || "Login failed";
            setErrorMessage(message);
            setShowCompanyLoginErrorModal(true);
            setTimeout(() => {
                setShowCompanyLoginErrorModal(false);
            }, 3000);
            
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex flex-col h-screen items-center justify-center companyloginscreen">
            <Toaster position="top-center" />

            <CompanyLoginErrorModal
                showCompanyLoginErrorModal={showCompanyLoginErrorModal}
                onClose={() => { setShowCompanyLoginErrorModal(false) }}
                errorMessage={errorMessage}
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
                <div className="flex ">
                    <div className="rounded-lg shadow-lg mains">
                        <h2 className="mb-7 lg:ml-12 text-white loginheading">Company Login</h2>
                        <form className="space-y-6" onSubmit={handleSubmit} >
                            <div className="relative">
                                <label className="labels">Username</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
                                    to=""
                                    className="hover:underline forgotpassword"
                                >
                                    Forgot password?
                                </Link>
                                <Link
                                    to="/"
                                    className="hover:underline adminlogin">
                                    Admin Login
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
                    <div className="flex absolute flex-col justify-end items-center right-0 w-1/3 company-login-screen">
                        <div className="flex gap-2 relative">
                            <img src={img1} alt="comapny-login-picture" className="h-[165px] w-[148px] pic1 cursor-pointer duration-300" />
                            <img src={img2} alt="comapny-login-picture" className="h-[165px] w-[148px] pic2 cursor-pointer duration-300" />
                            <img src={img3} alt="comapny-login-picture" className="h-[165px] w-[148px] pic3 cursor-pointer duration-300" />
                        </div>
                        <div className="flex gap-2 absolute top-[134px]">
                            <img src={img4} alt="comapny-login-picture" className="h-[165px] w-[148px] pic4 cursor-pointer duration-300" />
                            <img src={img5} alt="comapny-login-picture" className="h-[165px] w-[148px] pic5 cursor-pointer duration-300" />
                        </div>
                        <div className="flex absolute top-[268px]">
                            <img src={img6} alt="comapny-login-picture" className="h-[165px] w-[148px] pic6 cursor-pointer duration-300" />
                        </div>
                    </div>
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
