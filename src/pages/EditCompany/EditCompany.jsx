import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import "./editcompany.css";
import { BASE_URL } from "../../Utils/Config";
import uploadIcon from "../../assets/images/Companies/choose file.svg";
import { useTheme } from "../../ThemeContext";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import EditSuccessModal from "./EditSuccessModal";
import EditErrorModal from "./EditErrorModal";
import CompanyChangePasswordSuccessModal from "./CompanyChangePasswordSuccessModal";
import CompanyChangePasswordErrorModal from "./CompanyChangePasswordErrorModal";
// import Cropper from "react-easy-crop";

const EditCompany = () => {
  const cropperRef = useRef(null);
  const [fileName, setFileName] = useState("Choose File");
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);
  const { theme } = useTheme();
  const [originalFile, setOriginalFile] = useState(null);
  const [formDataState, setFormDataState] = useState({
    company_name: "",
    company_admin_name: "",
    email_address: "",
    phone_no1: "",
    phone_no2: "",
    user_id: "",
    password: "",
    permissions: [],
    company_logo: "",
  });
  const [permissionList, setPermissionList] = useState([]);
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showEditErrorModal, setShowEditErrorModal] = useState(false);

  const [showChangePasswordSuccessModal, setShowChangePasswordSuccessModal] = useState(false);
  const [showChangePasswordErrorModal, setShowChangePasswordErrorModal] = useState(false);

  // States for the image crop modal
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({

    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toggle password visibility functions
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  const cropperSettings = {
    stencilProps: {
      aspectRatio: 1,
      grid: true
    }
  };

  // Fetch permissions from backend
  const fetchPermission = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accounts/permissions/`);
      const permissions = response.data;
      setPermissionList(Array.isArray(permissions) ? permissions : []);

    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to fetch permissions.");
    }
  };

  const handlePermissionChange = (permName) => {
    setFormDataState((prevState) => {
      // Create a copy of the current permissions array
      const updatedPermissions = [...prevState.permissions];

      // Check if this permission is already selected
      const permIndex = updatedPermissions.indexOf(permName);

      // If permission exists, remove it; otherwise add it
      if (permIndex !== -1) {
        updatedPermissions.splice(permIndex, 1);
      } else {
        updatedPermissions.push(permName);
      }

      return {
        ...prevState,
        permissions: updatedPermissions,
      };
    });
  };

  // Fetch existing company data when the component mounts
  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/accounts/companies/${companyId}/`
      );
      const companyData = response.data[0]; // Assuming data is in an array
      setFormDataState({
        company_name: companyData.company_name || "",
        company_admin_name: companyData.company_admin_name || "",
        email_address: companyData.email_address || "",
        phone_no1: companyData.phone_no1 || "",
        phone_no2: companyData.phone_no2 || "",
        user_id: companyData.user_id || "",
        password: companyData.password || "",
        permissions: companyData.permissions ? companyData.permissions : [],
        company_logo: companyData.company_logo || "",
      });

      if (companyData.company_logo) {
        setFileName(truncateFileName(companyData.company_logo));
        setCompanyLogoPreview(companyData.company_logo);
      } else {
        setFileName("Choose File");
        setCompanyLogoPreview(null);
      }
      console.log("detailssssssssssssssssssssss", response.data)
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to fetch company data.");
    }
  };

  useEffect(() => {
    fetchPermission();
    fetchCompanyData();
  }, [companyId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    // Check if the field is user_id and remove spaces
    if (id === "user_id") {
      const valueWithoutSpaces = value.replace(/\s+/g, "");
      setFormDataState((prevState) => ({
        ...prevState,
        [id]: valueWithoutSpaces,
      }));
    } else {
      // For other fields, keep the original value
      setFormDataState((prevState) => ({
        ...prevState,
        [id]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName("No file chosen");
      setCompanyLogoPreview(null);
    }
  };
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(null);
  useEffect(() => {
    const validateEmail = async () => {
      // Check if email exists
      if (formDataState.email_address) {
        // Email format validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formDataState.email_address)) {
          setEmailError('Invalid email format!');
          setEmailValid(false);
          return; // Stop further validation if format is invalid
        }
        try {
          const response = await axios.get(`${BASE_URL}/accounts/validate-edit/`, {
            params: {
              email_address: formDataState.email_address,
              company_id: companyId  // Add the company ID here
            },
          });
          if (response.data.exists) {
            setEmailError('Email already exists!');
            setEmailValid(false);
          } else {
            setEmailError('');
            setEmailValid(true); // This will trigger the success message
          }
        } catch (error) {
          console.error('Error validating email:', error);
          setEmailError('Error checking email.');
          setEmailValid(false);
        }
      } else {
        setEmailError('');
        setEmailValid(null); // Reset when empty
      }
    };
    // Add a small delay to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      validateEmail();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formDataState.email_address]);

  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(null);
  // Add this useEffect hook for username validation
  useEffect(() => {
    const validateUsername = async () => {
      // Check if username exists
      if (formDataState.user_id) {
        try {
          const response = await axios.get(`${BASE_URL}/accounts/validate-userid-edit/`, {
            params: {
              user_id: formDataState.user_id,
              company_id: companyId  // Add the company ID here
            },
          });
          if (response.data.exists) {
            setUsernameError('Username already exists!');
            setUsernameValid(false);
          } else {
            setUsernameError('');
            setUsernameValid(true); // This will trigger the success message
          }
        } catch (error) {
          console.error('Error validating username:', error);
          setUsernameError('Error checking username.');
          setUsernameValid(false);
        }
      } else {
        setUsernameError('');
        setUsernameValid(null); // Reset when empty
      }
    };
    // Add a small delay to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      validateUsername();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formDataState.user_id]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    console.log('Formdataaaa', formData);

    formData.append("company_name", formDataState.company_name);
    formData.append("company_admin_name", formDataState.company_admin_name);
    formData.append("email_address", formDataState.email_address);
    formData.append("password", formDataState.password);
    formData.append("phone_no1", formDataState.phone_no1);
    formData.append("phone_no2", formDataState.phone_no2);
    formData.append("user_id", formDataState.user_id);
    formData.append(
      "permissions",
      JSON.stringify(formDataState.permissions)
    );

    if (croppedImage && typeof croppedImage !== "string") {
      formData.append("company_logo", croppedImage);
    } else if (originalFile && originalFile !== companyLogoPreview) {
      formData.append("company_logo", originalFile);
    }

    // Log each entry to see what's actually in the FormData
    console.log('Form data contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Or debug the permissions specifically before submission
    console.log('Permissions being sentvvvvvvvvvvvvvvvv:', formDataState.permissions);
    console.log('Permissions JSON:', JSON.stringify(formDataState.permissions));

    try {
      const response = await axios.put(
        `${BASE_URL}/accounts/companies/update/${companyId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setShowEditSuccessModal(true)
        setTimeout(() => {
          setShowEditSuccessModal(false)
          navigate("/admin/companies");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating company:", error);
      setShowEditErrorModal(true);
      setTimeout(() => {
        setShowEditErrorModal(false);
      }, 3000);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (passwordError) setPasswordError("");
  };




  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/accounts/admin-company/change-password/${companyId}/`,
        {

          new_password: passwordData.newPassword
        }
      );

      if (response.status === 200) {
        setShowChangePasswordSuccessModal(true);
        setTimeout(() => {
          setShowChangePasswordSuccessModal(false);
          navigate("/admin/companies");
        }, 1500);
        setIsPasswordModalOpen(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setShowChangePasswordErrorModal(true);
      setPasswordError(error.response?.data?.error || "Failed to change password");
      setTimeout(() => {
        setShowChangePasswordErrorModal(false);
      }, 3000);
    }
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    getCroppedImg(imageSrc, croppedAreaPixels).then((croppedImageUrl) => {
      setCroppedImage(croppedImageUrl); // Set the cropped image URL to state
    });
  };

  const getCroppedImg = (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
        canvas.toBlob((blob) => {
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve(croppedImageUrl); // Resolve with the cropped image URL
        }, "image/jpeg");
      };
    });
  };

  const truncateFileName = (name, maxLength = 20) => {
    const fileName = name.includes("://") ? name.split("/").pop() : name;
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split(".").pop();
    const baseName = fileName.substring(0, maxLength - extension.length - 5);
    return `${baseName}...${extension}`;
  };


  const handleCancelCrop = useCallback(() => {
    setIsCropModalOpen(false);
    setCroppedImage(null);
    setImageSrc(null);

  }, []);


  // Handle saving the cropped image
  const handleCropSave = useCallback(() => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas();
      if (canvas) {
        canvas.toBlob((blob) => {
          const file = new File([blob], `${Date.now()}_croppedImage.png`, {
            type: "image/png",
          });
          setCroppedImage(file);
          setCompanyLogoPreview(URL.createObjectURL(file)); // Update the preview
          setIsCropModalOpen(false); // Close the modal
          setFormDataState(prevState => ({
            ...prevState,
            company_logo: file, // Save the cropped logo
          }));
          setFileName(file.name);  // Set the new file name after crop
        }, "image/png");
      }
    }
  }, []);

  return (
    <div
      className={`flex flex-col md:flex-row w-full border rounded-lg gap-10 maineditcmpy ${theme === "dark" ? "dark" : "light"
        }`}
    >
      <Toaster position="top-center" reverseOrder={false} />

      <EditSuccessModal
        showEditSuccessModal={showEditSuccessModal}
        onClose={() => { setShowEditSuccessModal(false) }}
      />

      <EditErrorModal
        showEditErrorModal={showEditErrorModal}
        onClose={() => { setShowEditErrorModal(false) }}
      />

      <CompanyChangePasswordSuccessModal
        showChangePasswordSuccessModal={showChangePasswordSuccessModal}
        onClose={() => { setShowChangePasswordSuccessModal(false) }}
      />

      <CompanyChangePasswordErrorModal
        showChangePasswordErrorModal={showChangePasswordErrorModal}
        onClose={() => { setShowChangePasswordErrorModal(false) }}
      />

      {/* Left Form Section */}
      <div className="w-full rounded-lg p-5 ediform lg:w-2/3">
        <h2 className="editcmpnyhead">Edit Company</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <h3 className="text-[#677487] head lg:mb-5">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_name">Company Name *</label>
                <input
                  type="text"
                  id="company_name"
                  value={formDataState.company_name}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none editcmpyinput"
                  required
                />
              </div>
              <div>
                <label htmlFor="company_admin_name">Company Admin Name *</label>
                <input
                  type="text"
                  id="company_admin_name"
                  value={formDataState.company_admin_name}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none editcmpyinput"
                  required
                />
              </div>
              <div>
                <label htmlFor="email_address">Email Address *</label>
                <input
                  type="email"
                  id="email_address"
                  value={formDataState.email_address}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none editcmpyinput"
                  required
                />
                {emailValid === true && formDataState.email_address && (
                  <p className="text-green-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email is available!
                  </p>
                )}
                {emailValid === false && formDataState.email_address && (
                  <p className="text-red-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="user_id">Company Username *</label>
                <input
                  type="text"
                  id="user_id"
                  value={formDataState.user_id}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none editcmpyinput"
                  required
                />
                {usernameValid === true && formDataState.user_id && (
                  <p className="text-green-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Username is available!
                  </p>
                )}
                {usernameValid === false && formDataState.user_id && (
                  <p className="text-red-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {usernameError}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone_no1">Phone No 1</label>
                <input
                  type="tel"
                  id="phone_no1"
                  value={formDataState.phone_no1}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none editcmpyinput"
                />
              </div>
              <div>
                <label htmlFor="phone_no2">Phone No 2</label>
                <input
                  type="tel"
                  id="phone_no2"
                  value={formDataState.phone_no2}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none editcmpyinput"
                />
              </div>

              <div className="flex">
                <div>
                  <label htmlFor="company_logo">Company Logo</label>
                  <input
                    type="file"
                    id="company_logo"
                    className="hidden editcmpyinput"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="company_logo"
                    className="flex items-center justify-between text-sm cursor-pointer rounded px-3 lg:w-44 h-11 mt-2 editchoose"
                  >
                    <p
                      className={`filename ${fileName === "Choose File" ||
                        fileName === "No file chosen"
                        ? "editnoup"
                        : "editup"
                        }`}
                    >
                      {fileName}
                    </p>
                    <img src={uploadIcon} alt="Upload" />
                  </label>
                </div>
                <div className="flex flex-col justify-end w-full lg:mb-[8px] lg:ml-3 preview">
                  {(croppedImage || companyLogoPreview) && (
                    <div className="w-20">
                      <img
                        src={
                          croppedImage
                            ? URL.createObjectURL(croppedImage)
                            : companyLogoPreview
                        }
                        alt="Company Logo Preview"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#677487] my-8">Permissions</h3>
              <div className="permissions-list permissionboxes flex flex-wrap">
                {permissionList.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center space-x-2 mr-4 mb-2"
                  >
                    <input
                      type="checkbox"
                      value={permission.name}
                      className="form-checkbox"
                      checked={formDataState.permissions.includes(permission.name)}
                      onChange={() => handlePermissionChange(permission.name)}
                    />
                    <span>{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-5 change-pswds-sbt">
            <button
              type="button" // Changed to button type to prevent form submission
              className="md:w-auto text-white px-7 py-2 rounded duration-200 cursor-pointer updatebtns"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change Password
            </button>
            <button
              type="submit"
              className="md:w-auto text-white px-7 py-2 rounded duration-200 cursor-pointer updatebtn"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Image Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg max-w-2xl">
            <div className="h-96">
              <Cropper
                ref={cropperRef}
                src={imageSrc}
                {...cropperSettings}
                className="h-full"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancelCrop}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg pswd-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="change-pswrd-edit-cmpy">Change Password</h2>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-[#25282B] focus:outline-none cross-icon"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                {passwordError && (
                  <motion.div
                    className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {passwordError}
                  </motion.div>
                )}
                <div className="mb-4">

                </div>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="new-pswd-label">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 border border-[#E9E9E9] rounded focus:outline-none new-pswd-inputs text-white"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={toggleNewPasswordVisibility}
                    >
                      {showNewPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="cnfrm-paswd-label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-[#E9E9E9] rounded focus:outline-none confrm-paswd-inputs text-white"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors pswd-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E4DA1] text-white rounded hover:bg-[#1d3e75] transition-colors pswd-update-btn"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditCompany;