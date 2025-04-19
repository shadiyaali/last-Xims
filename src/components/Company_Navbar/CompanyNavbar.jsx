import React, { useEffect, useState, useRef } from 'react';
import { Search } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import logo from "../../assets/images/Company-Navbar/xims-logo.svg";
import menu from "../../assets/images/Company-Navbar/close-icon.svg";
import bell from "../../assets/images/Company-Navbar/bell.svg";
import profile from "../../assets/images/Company-Navbar/no-profile.png";
import sunIcon from "../../assets/images/Navbar/sun.svg"
import moonIcon from "../../assets/images/Navbar/moon.svg"
import imgupload from "../../assets/images/Company-Navbar/img-upload.svg"
import changepswd from "../../assets/images/Navbar/changepaswd.svg"
import "./companynavbar.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../Utils/Config";
import ProfilePhotoModal from './CompanyProfilePhotoModal';
import CompanyChangePasswordModal from './CompanyChangePasswordModal';
import logout from "../../assets/images/Company-Navbar/logout.svg"
import NotificationsMenu from './NotificationsMenu';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyNavbar = ({ selectedMenuItem, toggleSidebar, collapsed, setCollapsed }) => {
  const { theme, toggleTheme } = useTheme();
  const [isRotating, setIsRotating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownAnimation, setDropdownAnimation] = useState('');
  const dropdownRef = useRef(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [totalNotificationCount, setTotalNotificationCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNotificationsOpen &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        // Ensure the click is not on the bell icon
        !event.target.closest('.bell-icon')
      ) {
        setIsNotificationsOpen(false);
      }
    };

    // Add event listener when notifications are open
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const [qmsNotificationCount, setQmsNotificationCount] = useState(0);
  // const fetchUnreadCount = async (userId) => {
  //   try {
  //     // Fetch both manual and procedure notification counts


  //     // Sum both counts
  //     const totalUnread = manualResponse.data.unread_count + procedureResponse.data.unread_count;
  //     setUnreadCount(totalUnread);
  //   } catch (error) {
  //     console.error("Error fetching unread notification count:", error);
  //   }
  // };

  const fetchQmsNotificationCount = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const manualResponse = await axios.get(`${BASE_URL}/qms/count-notifications/${userId}/`);
      const procedureResponse = await axios.get(`${BASE_URL}/qms/procedure/count-notifications/${userId}/`);
      const recordResponse = await axios.get(`${BASE_URL}/qms/record/count-notifications/${userId}/`);
      const totalUnread = manualResponse.data.unread_count + procedureResponse.data.unread_count + recordResponse.data.unread_count;
      setQmsNotificationCount(totalUnread);
    } catch (error) {
      console.error("Error fetching QMS notification count:", error);
    }
  };
  useEffect(() => {
    fetchQmsNotificationCount();

    // Optionally, set up a periodic check (every 5 minutes)
    const intervalId = setInterval(fetchQmsNotificationCount, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Profile photo modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(profile); // Default profile image
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [entityLogo, setEntityLogo] = useState('');
  const [entityData, setEntityData] = useState(null);
  const [companyPermissions, setCompanyPermissions] = useState([]);

  // Change password modal state
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isUserLogin, setIsUserLogin] = useState(false);
  const [isCompanyLogin, setIsCompanyLogin] = useState(false);

  const navigate = useNavigate();

  const storedCompanyId = localStorage.getItem('company_id');
  const storedUserId = localStorage.getItem('user_id');

  // Determine which entity is logged in
  useEffect(() => {
    if (storedUserId && !storedCompanyId) {
      setIsUserLogin(true);
      setIsCompanyLogin(false);
    } else if (storedCompanyId) {
      setIsUserLogin(false);
      setIsCompanyLogin(true);
    }
  }, [storedUserId, storedCompanyId]);

  // Fetch the appropriate entity data
  useEffect(() => {
    if (isUserLogin) {
      fetchUserData();
    } else if (isCompanyLogin) {
      fetchCompanyData();
    }
  }, [isUserLogin, isCompanyLogin]);

  // Fetch company data
  const fetchCompanyData = async () => {
    try {
      if (!storedCompanyId) {
        console.error("Company ID not found");
        return;
      }

      const response = await axios.get(`${BASE_URL}/accounts/permissions/${storedCompanyId}/`);

      console.log("Company API Response:", response.data);

      if (response.status === 200) {
        // Set company data
        if (response.data) {
          setEntityData(response.data);

          // Update company information from API response
          if (response.data.email_address) {
            setUserEmail(response.data.email_address);
          }

          if (response.data.company_admin_name) {
            setUserName(response.data.company_admin_name);
          }

          if (response.data.company_logo) {
            const logoUrl = response.data.company_logo;
            setEntityLogo(logoUrl);
            setProfileImage(logoUrl); // Use company logo as profile image
          }
        }

        if (response.data && response.data.permissions && Array.isArray(response.data.permissions)) {
          setCompanyPermissions(response.data.permissions);
        } else {
          console.error("Permissions not found or not in expected format");
        }
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
      fallbackToLocalStorage('company');
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      if (!storedUserId) {
        console.error("User ID not found");
        return;
      }

      const response = await axios.get(`${BASE_URL}/company/user/${storedUserId}/`);

      console.log("User API Response:", response.data);

      if (response.status === 200) {
        // Set user data
        if (response.data) {
          setEntityData(response.data);

          // Update user information from API response
          if (response.data.email) {
            setUserEmail(response.data.email);
          }

          if (response.data.first_name && response.data.last_name) {
            setUserName(`${response.data.first_name} ${response.data.last_name}`);
          } else if (response.data.first_name) {
            setUserName(response.data.first_name);
          }


          if (response.data.user_logo) {
            const logoUrl = response.data.user_logo;
            setEntityLogo(logoUrl);
            setProfileImage(logoUrl); // Use user logo as profile image
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      fallbackToLocalStorage('user');
    }
  };

  // Fallback function to use localStorage data if API fails
  const fallbackToLocalStorage = (entityType) => {
    const storedEmail = localStorage.getItem('email_address');

    if (entityType === 'company') {
      const storedCompanyName = localStorage.getItem('company_company_admin_name')
        ? JSON.parse(localStorage.getItem('company_company_admin_name'))
        : '';
      const storedCompanyLogo = localStorage.getItem('company_company_logo')
        ? JSON.parse(localStorage.getItem('company_company_logo'))
        : '';

      if (storedEmail) setUserEmail(storedEmail);
      if (storedCompanyName) setUserName(storedCompanyName);
      if (storedCompanyLogo) {
        setEntityLogo(storedCompanyLogo);
        setProfileImage(storedCompanyLogo);
      }
    } else if (entityType === 'user') {
      const storedUserName = localStorage.getItem('user_name') || storedUserId;
      const storedUserLogo = localStorage.getItem('user_logo') || '';

      if (storedEmail) setUserEmail(storedEmail);
      if (storedUserName) setUserName(storedUserName);
      if (storedUserLogo) {
        setEntityLogo(storedUserLogo);
        setProfileImage(storedUserLogo);
      }
    }
  };


  const handleThemeToggle = () => {
    setIsRotating(true);
    toggleTheme();
  };

  // Handle dropdown toggle with animation
  const toggleDropdown = () => {
    if (isDropdownOpen) {
      // Start closing animation
      setDropdownAnimation('animate-fade-out');
      setTimeout(() => {
        setIsDropdownOpen(false);
        setDropdownAnimation('');
      }, 300); // Match with CSS animation duration
    } else {
      setIsDropdownOpen(true);
      setDropdownAnimation('animate-fade-in');
    }
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };




  // Handle change profile photo - Open the modal
  const handleChangeProfilePhoto = () => {
    toggleDropdown(); // Close the dropdown
    setIsProfileModalOpen(true); // Open the profile photo modal
  };

  // Handle saving the new profile photo
  const handleSaveProfilePhoto = async (newImageUrl) => {
    try {
      // Here you would typically upload the image to your server
      // const formData = new FormData();
      // formData.append('profileImage', file);

      console.log("New profile image:", newImageUrl);

      // Update the profile image state and localStorage
      setProfileImage(newImageUrl);
      setEntityLogo(newImageUrl);

      // Store in appropriate localStorage based on logged in entity
      if (isCompanyLogin) {
        localStorage.setItem('company_company_logo', JSON.stringify(newImageUrl));
      } else if (isUserLogin) {
        localStorage.setItem('user_logo', newImageUrl);
      }

      // Show success message or notification
      // ...
    } catch (error) {
      console.error("Error updating profile image:", error);
      // Show error message
      // ...
    }
  };

  // Handle change password - Open the modal
  const handleChangePassword = () => {
    toggleDropdown(); // Close the dropdown menu first
    // Use a small delay to ensure the dropdown is closed before opening the modal
    setTimeout(() => {
      setIsChangePasswordModalOpen(true); // Open the change password modal
    }, 100);
  };

  const handleLogout = () => {
    // Remove authentication tokens based on entity type
    if (isCompanyLogin) {
      localStorage.removeItem("companyAccessToken");
      navigate("/company-login");
    } else if (isUserLogin) {
      localStorage.removeItem("userAccessToken");
      navigate("/company-login");
    }
    localStorage.removeItem('logoutTime');
  };

  // Handle closing the change password modal
  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isDropdownOpen) {
          // Trigger the closing animation
          setDropdownAnimation('animate-fade-out');
          setTimeout(() => {
            setIsDropdownOpen(false);
            setDropdownAnimation('');
          }, 300);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isRotating) {
      const timer = setTimeout(() => {
        setIsRotating(false);
      }, 600);
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [isRotating]);

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleLogoClick = () => {
    navigate('/company/dashboard');
  };

  return (
    <>
      <nav className={`flex items-center bg-[white] h-[88px] company-navbar ${theme}`}>
        {/* Left Section */}
        <div className="flex justify-between w-full border-b border-[#383840] h-[88px] px-5">
          <div className="flex items-center">
            <button
              className="mr-[41px]"
              onClick={handleLogoClick}>
              <img src={logo} alt="Ximspro Logo" className='xims-logo' />
            </button>

            {/* Close Menu Icon - With rotation animation */}
            <button
              className="close-menu h-[57px] w-[46px] mr-[14px] flex items-center justify-center"
              onClick={handleToggle}
            >
              <img
                src={menu}
                alt="Menu Icon"
                className={`w-[18px] h-[18px] menu-icon ${selectedMenuItem?.id || "default"} transition-transform duration-300 ease-in-out ${!collapsed ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dynamic Title */}
            <div
              className="border rounded-[5px] px-[22px] h-[57px] flex items-center justify-center text-center"
              style={{
                borderColor: selectedMenuItem?.borderColor || "#38E76C",
                color: selectedMenuItem?.borderColor || "#38E76C",
              }}
            >
              <p className="current-menu text-left">
                {selectedMenuItem?.label || "Environmental Management System"}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-gray-300 px-4 py-2 rounded-full outline-none w-64 nav-search"
              />
              <Search className="absolute right-3 top-3 text-[#414345] w-5 h-5" />
            </div>

            <button
              aria-label="Toggle Theme"
              className={`icon-buttons rotates outline-none toggle-theme-btns ${theme === "dark" ? "dark" : "light"
                }`}
              onClick={handleThemeToggle}
            >
              <img
                src={theme === "dark" ? sunIcon : moonIcon}
                alt="Theme Icon"
                className={`theme-icons ${isRotating ? "rotates" : ""}`}
              />
            </button>

            {/* Notification bell icon with badge */}
            <div
              className={`bell-icon flex justify-center items-center cursor-pointer relative ${isNotificationsOpen ? "notification-active" : ""}`}
              onClick={toggleNotifications}
            >
              <div>
                <img src={bell} alt="notification icon" className="w-[20px] h-[20px] bell" />
                {/* QMS Notification count badge */}
                <span
                  className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ${qmsNotificationCount > 0 ? 'opacity-100' : 'opacity-0'}`}
                >
                  {qmsNotificationCount}
                </span>
              </div>
            </div>

            {/* Profile section with dropdown */}
            <div className="flex items-center space-x-2 border-l border-[#383840] pl-4 relative">
              <div onClick={toggleDropdown} className="cursor-pointer">
                <img
                  src={profileImage}
                  alt="User"
                  className="w-[46px] h-[46px] rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[white] text-1 admin-username">{userName}</span>
                <span className="text-[#6D6D6D] text-2">{userEmail}</span>
              </div>

              {/* Profile Dropdown Menu with Animation */}
              {isDropdownOpen && (
                <motion.div
                  ref={dropdownRef}
                  className={`absolute right-0 top-20 rounded-md w-[381px] z-50 dropdown-container border border-[#383840] p-5 ${dropdownAnimation}
                ${theme === "dark" ? "bg-[#1C1C24] text-white" : "bg-white text-[#13131A]"}`}
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {/* Profile Photo Section */}
                  <div className="mb-8">
                    <h1 className='profile-settings-head border-b border-[#383840] pb-[14px]'>Profile Settings</h1>
                    <div className="flex flex-col items-center">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-[130px] h-[130px] rounded-full mt-8 object-cover relative"
                      />
                      <button
                        className="text-sm text-white  mt-1 mb-1 transition-colors duration-200 change-profile"
                        onClick={handleChangeProfilePhoto}
                      >
                        <div className='w-[81px] h-[32px] rounded-[140px] bg-[#24242D] flex justify-center items-center absolute left-[150px] top-[203px]'>
                          <img src={imgupload} alt="image upload" className='w-[18px] h-[18px]' />
                        </div>
                      </button>
                      <div className='mt-5 flex flex-col items-center'>
                        <p className='username'>
                          {userName}
                        </p>
                        <p className='useremail'>
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <ul className='space-y-5'>
                    <li
                      className="bg-[#24242D] px-5 py-3 rounded-md cursor-pointer flex items-center gap-3 cmpy-nav-menu"
                      onClick={handleChangePassword}
                    >
                      <img src={changepswd} alt="Change Password" className='change-pswd-img' />
                      Change Password
                    </li>
                    <li
                      className="bg-[#24242D] text-[#F9291F] px-5 py-3 rounded-md cursor-pointer flex items-center gap-3 cmpy-nav-menu"
                      onClick={handleLogout}
                    >
                      <img src={logout} alt="logout" />
                      Logout
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Photo Modal */}
      {isProfileModalOpen && (
        <ProfilePhotoModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfilePhoto}
          currentProfilePic={profileImage}
          companyId={isCompanyLogin ? storedCompanyId : storedUserId} // Pass the appropriate ID
          entityType={isCompanyLogin ? 'company' : 'user'} // Pass entity type to the modal
        />
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <CompanyChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={handleCloseChangePasswordModal}
          entityId={isCompanyLogin ? storedCompanyId : storedUserId} // Pass the appropriate ID
          entityType={isCompanyLogin ? 'company' : 'user'} // Pass entity type to the modal
        />
      )}
      <AnimatePresence>
        {isNotificationsOpen && (
          <NotificationsMenu
            ref={notificationsRef}
            onClose={handleCloseNotifications}
            onNotificationRead={() => {
              // Decrease the QMS notification count
              setQmsNotificationCount(prevCount => Math.max(0, prevCount - 1));
            }}
            onNotificationsUpdate={(notifications) => {
              const totalCount = Object.values(notifications).reduce(
                (total, categoryNotifications) => total + categoryNotifications.length,
                0
              );
              setTotalNotificationCount(totalCount);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CompanyNavbar;