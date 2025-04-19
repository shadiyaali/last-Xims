import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../../Utils/Config";
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import choosefile from "../../../../assets/images/Company User Management/choosefile.svg"
import "./adduser.css";
import QmsAddUserSuccessModal from '../Modals/QmsAddUserSuccessModal';

const QMSAddUser = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyPermissions, setCompanyPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [showAddUserSuccessModal, setShowAddUserSuccessModal] = useState(false);


  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    gender: '',
    date_of_birth: { day: '', month: '', year: '' },
    address: '',
    city: '',
    zip_po_box: '',
    province_state: '',
    country: '',
    department_division: '',
    email: '',
    confirm_email: '',
    phone: '',
    office_phone: '',
    mobile_phone: '',
    fax: '',
    secret_question: '',
    answer: '',
    notes: '',
    status: 'active',
    user_logo: '',
  });
  const [permissionError, setPermissionError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    email: '',
    confirm_email: '',
    phone: '',
    country: '',
    secret_question: '',
    answer: ''
  });
  const [usernameError, setUsernameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(null);

  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(null);

  useEffect(() => {
    const validateUsername = async () => {
      if (formData.username) {
        try {
          const response = await axios.get(`${BASE_URL}/company/validate-username/`, {
            params: { username: formData.username },
          });
          if (response.data.exists) {
            setUsernameError('Username already exists!');
            setUsernameValid(false);
          } else {
            setUsernameError('');
            setUsernameValid(true);
          }
        } catch (error) {
          console.error('Error validating user id:', error);
          setUsernameError('Error checking user id.');
          setUsernameValid(false);
        }
      } else {
        setUsernameError('');
        setUsernameValid(null);
      }
    };


    const timeoutId = setTimeout(() => {
      validateUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  useEffect(() => {
    const validateEmail = async () => {

      if (formData.email) {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setEmailError('Invalid email format!');
          setEmailValid(false);
          return;
        }

        try {
          const response = await axios.get(`${BASE_URL}/company/validate-email/`, {
            params: { email: formData.email },
          });
          if (response.data.exists) {
            setEmailError('Email already exists!');
            setEmailValid(false);
          } else {
            setEmailError('');
            setEmailValid(true);
          }
        } catch (error) {
          console.error('Error validating email:', error);
          setEmailError('Error checking email.');
          setEmailValid(false);
        }
      } else {
        setEmailError('');
        setEmailValid(null);
      }
    };


    const timeoutId = setTimeout(() => {
      validateEmail();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);




  const fetchLatestPermissions = async () => {
    try {
      const companyId = getUserCompanyId();
      if (!companyId) {
        console.error("Company ID not found");
        return;
      }

      const response = await axios.get(`${BASE_URL}/accounts/permissions/${companyId}/`);

      console.log("Company API Response:", response.data);

      if (response.status === 200) {
        console.log("fetchLatestPermissions response:", response.data);


        if (response.data && response.data.permissions && Array.isArray(response.data.permissions)) {
          setCompanyPermissions(response.data.permissions);
          console.log("Permissions set:", response.data.permissions);
        } else {
          console.error("Permissions not found or not in expected format");
        }
      }
    } catch (err) {
      console.error("Error fetching latest permissions:", err);
    }
  };
  useEffect(() => {

    fetchLatestPermissions();

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Remove spaces from username field
    if (name === 'username') {
      const valueWithoutSpaces = value.replace(/\s/g, '');
      setFormData({
        ...formData,
        [name]: valueWithoutSpaces
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  
    // Clear the error for this field when user changes the value
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };
  const handleDobChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      date_of_birth: {
        ...formData.date_of_birth,
        [name]: value
      }
    });
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      setSelectedPermissions([...selectedPermissions, value]);
      setPermissionError(''); // Clear the error when permissions are selected
    } else {
      setSelectedPermissions(selectedPermissions.filter(permission => permission !== value));
      // Set error again if all permissions are deselected
      if (selectedPermissions.length === 1 && selectedPermissions[0] === value) {
        setPermissionError('Please select at least one permission');
      }
    }
  };

  const handleListUsers = () => {
    navigate('/company/qms/listuser');
  };

  const handleCancel = () => {
    navigate('/company/qms/listuser');
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Required fields validation
    if (!formData.username) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
      isValid = false;
    }

    if (!formData.first_name) {
      errors.first_name = 'First name is required';
      isValid = false;
    }

    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
      isValid = false;
    }

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.confirm_email) {
      errors.confirm_email = 'Please confirm your email';
      isValid = false;
    } else if (formData.email !== formData.confirm_email) {
      errors.confirm_email = 'Emails do not match';
      isValid = false;
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }

    if (!formData.country) {
      errors.country = 'Country is required';
      isValid = false;
    }

    if (!formData.secret_question) {
      errors.secret_question = 'Secret question is required';
      isValid = false;
    }

    if (!formData.answer) {
      errors.answer = 'Answer is required';
      isValid = false;
    }

    if (selectedPermissions.length === 0) {
      setPermissionError('Please select at least one permission');
      isValid = false;
    } else {
      setPermissionError('');
    }

    // Set all field errors
    setFieldErrors(errors);

    return isValid;
  };

  const getUserCompanyId = () => {
    // First check if company_id is stored directly
    const storedCompanyId = localStorage.getItem("company_id");
    if (storedCompanyId) return storedCompanyId;
    // If user data exists with company_id
    const userRole = localStorage.getItem("role");
    if (userRole === "user") {
      // Try to get company_id from user data that was stored during login
      const userData = localStorage.getItem("user_company_id");
      if (userData) {
        try {
          return JSON.parse(userData);  // Ensure it's valid JSON
        } catch (e) {
          console.error("Error parsing user company ID:", e);
          return null;
        }
      }
    }
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        user_logo: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const companyId = getUserCompanyId();
      if (!companyId) {
        setError('Company ID not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      let formattedDob = "";
      if (formData.date_of_birth.day && formData.date_of_birth.month && formData.date_of_birth.year) {
        formattedDob = `${formData.date_of_birth.year}-${formData.date_of_birth.month.padStart(2, "0")}-${formData.date_of_birth.day.padStart(2, "0")}`;
      }


      const formDataToSubmit = new FormData();


      formDataToSubmit.append('company_id', companyId);
      formDataToSubmit.append('username', formData.username);
      formDataToSubmit.append('first_name', formData.first_name);
      formDataToSubmit.append('last_name', formData.last_name);
      formDataToSubmit.append('password', formData.password);
      formDataToSubmit.append('confirm_password', formData.confirm_password);
      formDataToSubmit.append('gender', formData.gender);
      formDataToSubmit.append('date_of_birth', formattedDob);
      formDataToSubmit.append('address', formData.address);
      formDataToSubmit.append('city', formData.city);
      formDataToSubmit.append('zip_po_box', formData.zip_po_box);
      formDataToSubmit.append('province_state', formData.province_state);
      formDataToSubmit.append('country', formData.country);
      formDataToSubmit.append('department_division', formData.department_division);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('confirm_email', formData.confirm_email);
      formDataToSubmit.append('phone', formData.phone);
      formDataToSubmit.append('office_phone', formData.office_phone);
      formDataToSubmit.append('mobile_phone', formData.mobile_phone);
      formDataToSubmit.append('fax', formData.fax);
      formDataToSubmit.append('secret_question', formData.secret_question);
      formDataToSubmit.append('answer', formData.answer);
      formDataToSubmit.append('notes', formData.notes);
      formDataToSubmit.append('status', formData.status);


      selectedPermissions.forEach((permission) => {
        formDataToSubmit.append('permissions', permission);
      });


      if (formData.user_logo) {
        formDataToSubmit.append('user_logo', formData.user_logo);
      }

      console.log("Sending data:", formDataToSubmit);

      const response = await axios.post(`${BASE_URL}/company/users/create/`, formDataToSubmit, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 201) {
        console.log("User added successfully", response.data);
        setShowAddUserSuccessModal(true);
        setTimeout(() => {
          setShowAddUserSuccessModal(false);
          navigate("/company/qms/listuser");
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error("Failed to add user");
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Failed to add user");
      } else {
        setError("Failed to add user. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1C1C24]">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center add-user-header">
        <h1 className="add-user-text">Add User</h1>
        <button
          className="list-user-btn duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
          onClick={handleListUsers}
        >
          List Users
        </button>
      </div>

      <QmsAddUserSuccessModal
        showAddUserSuccessModal={showAddUserSuccessModal}
        onClose={() => { setShowAddUserSuccessModal(false) }}
      />


      {/* {error && (
        <div className="mx-[122px] mt-4 p-3 bg-red-500 text-white rounded">
          {error}
        </div>
      )} */}

      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-[122px] py-[23px]">
          <div>
            <label className="add-user-label">Username <span className='required-field'>*</span></label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.username && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.username}
              </p>
            )}
            {usernameError && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {usernameError}
              </p>
            )}
            {usernameValid === true && formData.username && (
              <p className="text-green-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Username is available!
              </p>
            )}
          </div>

          <div></div> {/* Empty div for alignment */}

          <div>
            <label className="add-user-label">Password <span className='required-field'>*</span></label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.password}
              </p>
            )}
          </div>
          <div>
            <label className="add-user-label">Confirm Password <span className='required-field'>*</span></label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.confirm_password && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

          <div>
            <label className="add-user-label">First Name <span className='required-field'>*</span></label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.first_name && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.first_name}
              </p>
            )}
          </div>
          <div>
            <label className="add-user-label">Last Name <span className='required-field'>*</span></label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.last_name && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.last_name}
              </p>
            )}
          </div>

          <div>
            <label className="add-user-label">Gender</label>
            <div className="relative">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full add-user-inputs appearance-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <div className="absolute inset-y-0 right-0 top-3 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="add-user-label">DOB</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  name="day"
                  value={formData.date_of_birth.day}
                  onChange={handleDobChange}
                  className="w-full add-user-inputs appearance-none"
                >
                  <option value="">dd</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i} value={(i + 1).toString()}>{i + 1}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 top-3 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  name="month"
                  value={formData.date_of_birth.month}
                  onChange={handleDobChange}
                  className="w-full add-user-inputs appearance-none"
                >
                  <option value="">mm</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={(i + 1).toString()}>{i + 1}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 top-3 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  name="year"
                  value={formData.date_of_birth.year}
                  onChange={handleDobChange}
                  className="w-full add-user-inputs appearance-none"
                >
                  <option value="">yyyy</option>
                  {[...Array(100)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={i} value={year.toString()}>{year}</option>;
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 top-3 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="add-user-label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full add-user-inputs add-user-address"
            />
          </div>

          <div>
            <label className="add-user-label">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
          </div>
          <div>
            <label className="add-user-label">Province/State</label>
            <input
              type="text"
              name="province_state"
              value={formData.province_state}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
          </div>

          <div>
            <label className="add-user-label">Zip/P.O.Box</label>
            <input
              type="text"
              name="zip_po_box"
              value={formData.zip_po_box}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
          </div>
          <div></div> {/* Empty div for alignment */}

          <div>
            <label className="add-user-label">Country <span className='required-field'>*</span></label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.country && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.country}
              </p>
            )}
          </div>
          <div>
            <label className="add-user-label">Department / Division</label>
            <input
              type="text"
              name="department_division"
              value={formData.department_division}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
          </div>

          <div>
            <label className="add-user-label">Email <span className='required-field'>*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full add-user-inputs"
            /> {fieldErrors.email && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.email}
              </p>
            )}
            {emailError && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {emailError}
              </p>
            )}
            {emailValid === true && formData.email && (
              <p className="text-green-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Email is available!
              </p>
            )}
          </div>
          <div>
            <label className="add-user-label">Confirm Email <span className='required-field'>*</span></label>
            <input
              type="email"
              name="confirm_email"
              value={formData.confirm_email}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.confirm_email && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.confirm_email}
              </p>
            )}
          </div>

          <div>
            <label className="add-user-label">Phone <span className='required-field'>*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.phone && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.phone}
              </p>
            )}
          </div>
          <div>
            <label className="add-user-label">Office Phone</label>
            <input
              type="tel"
              name="office_phone"
              value={formData.office_phone}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
          </div>

          <div>
            <label className="add-user-label">Mobile Phone</label>
            <input
              type="tel"
              name="mobile_phone"
              value={formData.mobile_phone}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
          </div>
          <div>
            <label className="add-user-label">Fax</label>
            <input
              type="tel"
              name="fax"
              value={formData.fax}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
          </div>

          <div>
            <label className="add-user-label">Secret Question <span className='required-field'>*</span></label>
            <input
              type="text"
              name="secret_question"
              value={formData.secret_question}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.secret_question && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.secret_question}
              </p>
            )}
          </div>
          <div>
            <label className="add-user-label">Answer <span className='required-field'>*</span></label>
            <input
              type="text"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              className="w-full add-user-inputs"
            />
            {fieldErrors.answer && (
              <p className="text-red-500 text-sm pt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {fieldErrors.answer}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="add-user-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full add-user-inputs add-user-notes"
            ></textarea>
          </div>

          <div>
            <label className="add-user-label">Status</label>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full add-user-inputs appearance-none"
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
              <div className="absolute inset-y-0 right-0 top-3 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 fill-current text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="add-user-label">User Logo</label>
            <div className="relative flex items-center">
              <input
                type="file"
                name="user_logo"
                id="user_logo"
                onChange={handleFileChange}
                className="opacity-0 absolute inset-0 w-full h-[49px] cursor-pointer"
              />
              <div className="flex items-center w-full rounded-[5px] cursor-pointer gap-3 add-user-inputs">
                <img src={choosefile} alt="Choose File" />
                <span className="text-white text-base">
                  {formData.user_logo ? formData.user_logo.name : "Choose file..."}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="permissions-texts cursor-pointer">Permissions <span className='required-field'>*</span></label>
            {permissionError && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {permissionError}
              </p>
            )}
            <div className="flex flex-wrap gap-5 mt-3">
              {companyPermissions && companyPermissions.length > 0 ? (
                companyPermissions.map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      name="permissions"
                      value={permission}
                      checked={selectedPermissions.includes(permission)}
                      onChange={handlePermissionChange}
                      className="mr-2 form-checkboxes"
                    />

                    <span className="permissions-texts cursor-pointer">{permission}</span>
                  </label>
                ))
              ) : (
                <p className="text-yellow-500"> </p>
              )}

            </div>

          </div>
        </div>

        <div className="flex justify-end gap-[22px] mt-5 mx-[122px] pb-[22px]">
          <button
            type="button"
            className="cancel-btns duration-200"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btns duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QMSAddUser
