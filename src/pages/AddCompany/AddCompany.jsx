import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import "./addcompany.css";
import { BASE_URL } from "../../Utils/Config";
import illustrate from "../../assets/images/AddCompany/Clip path group-cropped.svg";
import illustratedark from "../../assets/images/AddCompany/illustratedark.svg";
import group from "../../assets/images/AddCompany/bottompic.svg";
import uploadIcon from "../../assets/images/Companies/choose file.svg";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../ThemeContext";
import { IoEye, IoEyeOff } from "react-icons/io5";
import AddSuccessModal from "./AddSuccessModal";
import AddErrorModal from "./AddErrorModal";

const AddCompany = () => {
  const [fileName, setFileName] = useState("Choose File");
  const [previewImage, setPreviewImage] = useState(null);
  const [imageForCrop, setImageForCrop] = useState(null);
  const [isCropPopupOpen, setIsCropPopupOpen] = useState(false);
  const cropperRef = useRef(null);

  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);
  const [showAddErrorModal, setShowAddErrorModal] = useState(false);

  const [formDataState, setFormDataState] = useState({
    company_name: "",
    company_admin_name: "",
    email_address: "",
    phone_no1: "",
    phone_no2: "",
    user_id: "",
    password: "",
    permissions: [],
    company_logo: null,
  });
  const [permissionList, setPermissionList] = useState([]);
  const [permission, setPermission] = useState([]);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(null);

  const [useridError, setUseridError] = useState('');
  const [userValid, setUseridValid] = useState(null);



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
          const response = await axios.get(`${BASE_URL}/accounts/validate-email/`, {
            params: { email_address: formDataState.email_address },
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


  useEffect(() => {
    const validateUserid = async () => {
      if (formDataState.user_id) {
        try {
          const response = await axios.get(`${BASE_URL}/accounts/validate-userid/`, {
            params: { user_id: formDataState.user_id },
          });
          if (response.data.exists) {
            setUseridError('Username already exists!');
            setUseridValid(false);
          } else {
            setUseridError('');
            setUseridValid(true); // This will trigger the success message
          }
        } catch (error) {
          console.error('Error validating user id:', error);
          setUseridError('Error checking user id.');
          setUseridValid(false);
        }
      } else {
        setUseridError('');
        setUseridValid(null); // Reset when empty
      }
    };

    // Add a small delay to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      validateUserid();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formDataState.user_id]);




  const fetchPermission = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accounts/permissions/`);
      const permissions = response.data;

      if (Array.isArray(permissions)) {
        setPermissionList(permissions); // Update permissionList state
        console.log("Fetched Permissionssssssssssssssssss:", permissions); // Log permissions to the console
      } else {
        console.warn("Unexpected data format:", permissions);
        setPermissionList([]);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to fetch permissions.");
    }
  };

  useEffect(() => {
    fetchPermission(); // Fetch permissions when the component mounts
  }, []);

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
      setFileName(file ? truncateFileName(file.name) : "No file chosen");
      setImageForCrop(URL.createObjectURL(file));
      setIsCropPopupOpen(true);
    }
  };

  const handlePermissionChange = (e, permissionId, permissionName) => {
    const { checked } = e.target;

    setFormDataState((prevState) => {
      let updatedPermissions;

      if (checked) {
        updatedPermissions = [...prevState.permissions, permissionName];
      } else {
        updatedPermissions = prevState.permissions.filter(
          (name) => name !== permissionName
        );
      }

      return { ...prevState, permissions: updatedPermissions };
    });
  };

  const handleCropSave = async () => {
    if (cropperRef.current && imageForCrop) {
      try {
        const canvas = cropperRef.current.getCanvas();
        if (canvas) {
          // Create a new canvas with exactly 200x200 dimensions
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = 400;
          finalCanvas.height = 400;
          const ctx = finalCanvas.getContext('2d');

          // Draw the cropped area onto the new canvas, resizing if necessary
          ctx.drawImage(canvas, 0, 0, 400, 400);

          finalCanvas.toBlob(async (blob) => {
            const file = new File([blob], `${Date.now()}_croppedImage.png`, {
              type: "image/png",
            });

            setPreviewImage(URL.createObjectURL(file));
            setIsCropPopupOpen(false);
            setFormDataState((prevState) => ({
              ...prevState,
              company_logo: file,
            }));
          }, "image/png");
        }
      } catch (error) {
        console.error("Error cropping image:", error);
        toast.error("Error processing the image.");
      }
    }
  };

  // const handleOriginalSize = async () => {
  //   try {
  //     const response = await fetch(imageForCrop);
  //     const blob = await response.blob();
  //     const file = new File([blob], `${Date.now()}_originalImage.png`, {
  //       type: blob.type,
  //     });

  //     setPreviewImage(URL.createObjectURL(file));
  //     setFormDataState(prevState => ({
  //       ...prevState,
  //       company_logo: file
  //     }));
  //     setIsCropPopupOpen(false);
  //   } catch (error) {
  //     console.error("Error handling original image:", error);
  //     toast.error("Failed to process the image.");
  //   }
  // };

  // console.log("Company Logo:", formDataState.company_logo);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the form data using FormData
    const formData = new FormData();
    console.log("formdataaaaaaaaaaaaaa",formData)
    formData.append("company_name", formDataState.company_name);
    formData.append("company_admin_name", formDataState.company_admin_name);
    formData.append("email_address", formDataState.email_address);
    formData.append("password", formDataState.password);
    formData.append("phone_no1", formDataState.phone_no1);
    formData.append("phone_no2", formDataState.phone_no2);
    formData.append("user_id", formDataState.user_id);

    // Add permissions to the form data
    // If the backend expects permissions as JSON
    formDataState.permissions.forEach(permission => {
      formData.append("permissions", permission);
    });

    if (formDataState.company_logo) {
      formData.append("company_logo", formDataState.company_logo);
    }

    console.log("FormData content:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${BASE_URL}/accounts/create-company/`,
        formData,
        config
      );

      if (response.status === 200 || response.status === 201) {
        setShowAddSuccessModal(true);
        setTimeout(() => {
          setShowAddSuccessModal(false);
          navigate("/admin/companies");
        }, 1500);
        setFormDataState({
          company_name: "",
          company_admin_name: "",
          email_address: "",
          phone_no1: "",
          phone_no2: "",
          user_id: "",
          password: "",
          permissions: [],
          company_logo: null,
        });
        setFileName("Choose File");
      }
    } catch (error) {
      console.error("Error adding company:", error);
      setShowAddErrorModal(true);
      setTimeout(() => {
        setShowAddErrorModal(false);
      }, 3000);
    }
  };


  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const baseName = name.substring(0, maxLength - extension.length - 5);
    return `${baseName}...${extension}`;
  };

  // const isFormValid = emailValid && userIdValid;

  return (
    <div
      className={`flex flex-col md:flex-row w-full rounded-lg addmaincmpy ${theme === "dark" ? "dark" : "light"
        }`}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {isCropPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className=" p-4 rounded-lg max-w-2xl">
            <div className="h-96">
              <Cropper
                src={imageForCrop}
                ref={cropperRef}
                className="h-full"
                stencilProps={{
                  aspectRatio: 1,
                }}
                defaultSize={{
                  width: 400,
                  height: 400,
                }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsCropPopupOpen(false); // Close the modal
                  setImageForCrop(null); // Reset the loaded image
                  setFileName("Choose File"); // Reset file name
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Form Section */}
      <div className="w-full md:w-2/3 p-5 addcmyform">
        <h2 className="addcmpnyhead">Add New Company</h2>

        <AddSuccessModal
          showAddSuccessModal={showAddSuccessModal}
          onClose={() => { setShowAddSuccessModal(false) }}
        />

        <AddErrorModal
          showAddErrorModal={showAddErrorModal}
          onClose={() => { setShowAddErrorModal(false) }}
        />

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Company Information */}
          <div>
            <h3 className="text-[#677487] head">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_name">Company Name *</label>
                <input
                  type="text"
                  id="company_name"
                  value={formDataState.company_name}
                  onChange={handleInputChange}
                  className="w-full border text-sm focus:outline-none addcmyinputs"
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
                  className="w-full border text-sm focus:outline-none addcmyinputs"
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
                  className="w-full text-sm focus:outline-none addcmyinputs"
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {emailError}
                  </p>
                )}
                {emailValid === true && formDataState.email_address && (
                  <p className="text-green-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email is available!
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
                  className="w-full text-sm focus:outline-none addcmyinputs"
                />
              </div>
              <div>
                <label htmlFor="phone_no2">Phone No 2</label>
                <input
                  type="tel"
                  id="phone_no2"
                  value={formDataState.phone_no2}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none addcmyinputs"
                />
              </div>
              <div>
                <label htmlFor="company_logo">Company Logo</label>
                <input
                  type="file"
                  id="company_logo"
                  className="hidden addcmyinputs"
                  onChange={handleFileChange}
                  required
                />
                <label
                  htmlFor="company_logo"
                  className="flex items-center justify-between text-sm cursor-pointer rounded px-3 lg:w-1/2 h-11 mt-2 choosefile"
                >
                  <p
                    className={`filename ${fileName === "Choose File" ||
                      fileName === "No file chosen"
                      ? "noupfile"
                      : "upfile"
                      }`}
                  >
                    {fileName}
                  </p>
                  <img src={uploadIcon} alt="Upload" className="" />
                </label>
                {previewImage && (
                  <div className="image-preview mt-2">
                    <img
                      src={previewImage}
                      alt="Cropped"
                      className="w-20"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div>
            <h3 className="text-[#677487] credentials">Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div>
                <label htmlFor="user_id">Username</label>
                <input
                  type="text"
                  id="user_id"
                  value={formDataState.user_id}
                  onChange={handleInputChange}
                  className="w-full border text-sm focus:outline-none addcmyinputs"
                />
                {useridError && (
                  <p className="text-red-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {useridError}
                  </p>
                )}
                {userValid === true && formDataState.user_id && (
                  <p className="text-green-500 text-sm pt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Username is available!
                  </p>
                )}
              </div>
              <div className="relative">
                <label htmlFor="password">Password</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  value={formDataState.password}
                  onChange={handleInputChange}
                  className="w-full text-sm focus:outline-none addcmyinputs pl-10"
                />
                <span
                  className="absolute right-3 transform -translate-y-1/2 cursor-pointer addcmyeyeicon"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? (
                    <IoEyeOff size={20} className="text-[#898989]" />
                  ) : (
                    <IoEye size={20} className="text-[#898989]" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-[#677487] mb-4">Permissions</h3>
            <div className="flex flex-wrap permissionboxes">
              {permissionList
               
                .map((permission) => (
                  <label
                    key={permission.id}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      value={permission.name}
                      onChange={(e) => handlePermissionChange(e, permission.id, permission.name)}
                      checked={formDataState.permissions.includes(permission.name)}
                    />
                    <span className="ml-2">
                      {permission.name
                        .replace(/_/g, " ") // Replace underscores with spaces
                        .split(" ") // Split into words
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        ) // Capitalize each word
                        .join(" ")}
                    </span>
                  </label>
                ))
              }
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="lg:w-1/6 md:w-auto px-7 py-2 rounded duration-200 cursor-pointer submits"
            // disabled={!isFormValid}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Right Illustration Section */}
      <div className="flex md:w-1/3 justify-end illustrateimg">
        <div className="business-container">
          <img src={illustrate} alt="Illustration" className="background-img" />

          <p className="business-text">
            Want more? <br /> Increase your business
          </p>
          <img src={group} alt="Group" className="group-img lights" />
          <img src={illustratedark} alt="" className="group-img dark" />
        </div>
      </div>
    </div>
  );
};

export default AddCompany;
