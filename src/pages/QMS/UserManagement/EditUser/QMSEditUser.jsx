import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../../Utils/Config";
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import choosefile from "../../../../assets/images/Company User Management/choosefile.svg"
import QmsEditUserSuccessModal from '../Modals/QmsEditUserSuccessModal';
import QmsEditUserErrorModal from '../Modals/QmsEditUserErrorModal';

const QMSEditUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [companyPermissions, setCompanyPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [userId, setUserId] = useState(id);

    const [showEditUserSuccessModal, setShowEditUserSuccessModal] = useState(false);
    const [showEditUserErrorModal, setShowEditUserErrorModal] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
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
        // Remove password and confirm_password from initial state
    });

    const [permissionError, setPermissionError] = useState('');

    const [fieldErrors, setFieldErrors] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        confirm_email: '',
        phone: '',
        country: '',
        secret_question: '',
        answer: ''
    });


    console.log("User ID from params:", id);

    const fetchUserPermissions = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/company/user/permissions/${userId}/`);

            if (response.status === 200 && response.data) {
                let userPermissions = [];

                // Handle different API response formats
                if (Array.isArray(response.data)) {
                    userPermissions = response.data.map(p => p.name || p);
                } else if (response.data.permissions && Array.isArray(response.data.permissions)) {
                    userPermissions = response.data.permissions.map(p => p.name || p);
                } else if (typeof response.data === 'object') {
                    // Try to extract permissions from the object if it has them
                    const permissionsArr = Object.values(response.data).find(v => Array.isArray(v));
                    if (permissionsArr) {
                        userPermissions = permissionsArr.map(p => p.name || p);
                    }
                }

                console.log("Fetched user permissions:", userPermissions);
                setSelectedPermissions(userPermissions);
            }
        } catch (err) {
            console.error("Error fetching user permissions:", err);
            toast.error("Failed to load user permissions");
        }
    };

    useEffect(() => {
        if (id) {
            setUserId(id);
            fetchUserDetails(id);
            fetchLatestPermissions();
        } else {
            toast.error("No user selected for editing");
            navigate('/company/qms/listuser');
        }
    }, [id]);

    const fetchUserDetails = async (userId) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}/company/user/${userId}/`);

            if (response.status === 200 && response.data) {
                let userData;
                if (Array.isArray(response.data)) {
                    userData = response.data.find(user => user.id === parseInt(userId));
                    if (!userData) {
                        userData = response.data[0];
                    }
                } else {
                    userData = response.data;
                }

                console.log('User data:', userData);

                let day = '';
                let month = '';
                let year = '';

                if (userData.date_of_birth) {
                    const dateParts = userData.date_of_birth.split('-');
                    if (dateParts.length === 3) {
                        year = dateParts[0];
                        month = dateParts[1];
                        day = dateParts[2];
                    }
                }

                setFormData({
                    id: userData.id || '',
                    username: userData.username || '',
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    gender: userData.gender || '',
                    date_of_birth: { day, month, year },
                    address: userData.address || '',
                    city: userData.city || '',
                    zip_po_box: userData.zip_po_box || '',
                    province_state: userData.province_state || '',
                    country: userData.country || '',
                    department_division: userData.department_division || '',
                    email: userData.email || '',
                    confirm_email: userData.email || '',
                    phone: userData.phone || '',
                    office_phone: userData.office_phone || '',
                    mobile_phone: userData.mobile_phone || '',
                    fax: userData.fax || '',
                    secret_question: userData.secret_question || '',
                    answer: userData.answer || '',
                    notes: userData.notes || '',
                    status: userData.status || 'active',
                    user_logo: userData.user_logo || '',
                });

                if (userData.permissions && Array.isArray(userData.permissions)) {
                    const permissionNames = userData.permissions.map(p => p.name || p);
                    console.log("Setting permissions from user data:", permissionNames);
                    setSelectedPermissions(permissionNames);
                } else {
                    console.log("Fetching user permissions separately...");
                    fetchUserPermissions(userId);
                }
            }
        } catch (err) {
            console.error("Error fetching user details:", err);
            toast.error("Failed to load user details");
            setError("Failed to load user details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLatestPermissions = async () => {
        try {
            const companyId = getUserCompanyId();
            if (!companyId) {
                console.error("Company ID not found");
                return;
            }

            const response = await axios.get(`${BASE_URL}/accounts/permissions/${companyId}/`);
            console.log("Company permissions response:", response.data);

            if (response.status === 200) {
                if (response.data && response.data.permissions && Array.isArray(response.data.permissions)) {
                    setCompanyPermissions(response.data.permissions);
                } else {
                    console.error("Permissions not found or not in expected format");
                }
            }
        } catch (err) {
            console.error("Error fetching latest permissions:", err);
            toast.error("Failed to load permissions");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

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

    const getUserCompanyId = () => {
        const storedCompanyId = localStorage.getItem("company_id");
        if (storedCompanyId) return storedCompanyId;

        const userRole = localStorage.getItem("role");
        if (userRole === "user") {
            const userData = localStorage.getItem("user_company_id");
            if (userData) {
                try {
                    return JSON.parse(userData);
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

    const [emailError, setEmailError] = useState('');
    const [emailValid, setEmailValid] = useState(null);
    useEffect(() => {
        const validateEmail = async () => {
            if (formData.email) {
                // First validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    setEmailError('Invalid email format!');
                    setEmailValid(false);
                    return;
                }

                try {
                    // Include userId in the request to exclude the current user from the check
                    const response = await axios.get(`${BASE_URL}/company/validate-email-edit/`, {
                        params: {
                            email: formData.email,
                            id: userId // Add the current user's ID here
                        },
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
    }, [formData.email, userId]); // Add userId to the dependency array

    const [usernameError, setUsernameError] = useState('');
    const [usernameValid, setUsernameValid] = useState(null);
    // Add this useEffect hook for username validation
    useEffect(() => {
        const validateUsername = async () => {
            if (formData.username) {
                try {
                    const response = await axios.get(`${BASE_URL}/company/validate-username-edit/`, {
                        params: {
                            username: formData.username,
                            id: userId // Add the user ID here
                        },
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
    }, [formData.username, userId]); // Add userId to dependency array

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Required fields validation
        if (!formData.username) {
            errors.username = 'Username is required';
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

            // Create regular data object first (not FormData)
            const dataToSubmit = {
                company_id: companyId,
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                gender: formData.gender,
                date_of_birth: formattedDob,
                address: formData.address,
                city: formData.city,
                zip_po_box: formData.zip_po_box,
                province_state: formData.province_state,
                country: formData.country,
                department_division: formData.department_division,
                email: formData.email,
                confirm_email: formData.confirm_email,
                phone: formData.phone,
                office_phone: formData.office_phone,
                mobile_phone: formData.mobile_phone,
                fax: formData.fax,
                secret_question: formData.secret_question,
                answer: formData.answer,
                notes: formData.notes,
                status: formData.status,
                // Add permissions as an array of objects in the format the backend expects
                permissions: selectedPermissions.map(perm => ({ name: perm }))
            };

            console.log("Data to submit with permissions:", dataToSubmit);

            // If we have a file to upload, we need to use FormData
            if (formData.user_logo && typeof formData.user_logo !== 'string') {
                const formDataToSubmit = new FormData();

                // Add all regular data
                Object.keys(dataToSubmit).forEach(key => {
                    if (key === 'permissions') {
                        // Handle permissions specially
                        formDataToSubmit.append('permissions', JSON.stringify(dataToSubmit.permissions));
                    } else {
                        formDataToSubmit.append(key, dataToSubmit[key]);
                    }
                });

                // Add the file
                formDataToSubmit.append('user_logo', formData.user_logo);

                const response = await axios.put(`${BASE_URL}/company/users/update/${userId}/`, formDataToSubmit, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                if (response.status === 200) {
                    console.log("User updated successfully", response.data);
                    setShowEditUserSuccessModal(true);
                    setTimeout(() => {
                        setShowEditUserSuccessModal(false);
                        navigate("/company/qms/listuser");
                    }, 2000);
                }
            } else {
                // No file to upload, use regular JSON request
                const response = await axios.put(`${BASE_URL}/company/users/update/${userId}/`, dataToSubmit);

                if (response.status === 200) {
                    console.log("User updated successfully", response.data);
                    setShowEditUserSuccessModal(true);
                    setTimeout(() => {
                        setShowEditUserSuccessModal(false);
                        navigate("/company/qms/listuser");
                    }, 2000);
                }
            }
        } catch (err) {
            console.error("Error updating user:", err);
            setShowEditUserErrorModal(true);
            setTimeout(() => {
                setShowEditUserErrorModal(false);
            }, 3000);
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Failed to update user");
                toast.error(err.response.data.message || "Failed to update user");
            } else {
                setError("Failed to update user. Please try again.");
                toast.error("Failed to update user. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderUserLogo = () => {
        if (typeof formData.user_logo === 'string' && formData.user_logo) {
            return (
                <div className="mt-3 flex items-end">
                    <img
                        src={formData.user_logo}
                        alt="User Logo"
                        className="h-[49px] rounded-lg object-cover"
                    />
                </div>
            );
        }
        return null;
    };

    // Helper function to check if a permission is selected
    const isPermissionSelected = (permission) => {
        return selectedPermissions.includes(permission);
    };

    return (
        <div className="bg-[#1C1C24]">
            <Toaster position="top-center" />
            <div className="flex justify-between items-center add-user-header">
                <h1 className="add-user-text">Edit User</h1>

                <QmsEditUserSuccessModal
                    showEditUserSuccessModal={showEditUserSuccessModal}
                    onClose={() => { setShowEditUserSuccessModal(false) }}
                />

                <QmsEditUserErrorModal
                    showEditUserErrorModal={showEditUserErrorModal}
                    onClose={() => { setShowEditUserErrorModal(false) }}
                />

                <button
                    className="list-user-btn duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                    onClick={handleListUsers}
                >
                    List Users
                </button>
            </div>

            {/* {error && (
                <div className="mx-[122px] mt-4 p-3 bg-red-500 text-white rounded">
                    {error}
                </div>
            )} */}

            {isLoading && !formData.username ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-white text-lg">Loading user details...</div>
                </div>
            ) : (
                <form className="add-user-form" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-[122px] py-[23px]">
                        <div>
                            <label className="add-user-label">User Name <span className='required-field'>*</span></label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full add-user-inputs"
                            />
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
                            {fieldErrors.username && (
                                <p className="text-red-500 text-sm pt-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {fieldErrors.username}
                                </p>
                            )}
                        </div>
                        <div></div> {/* Empty div for alignment */}

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
                                            <option key={i} value={(i + 1).toString().padStart(2, "0")}>{i + 1}</option>
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
                                            <option key={i} value={(i + 1).toString().padStart(2, "0")}>{i + 1}</option>
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
                            />
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

                            {fieldErrors.email && (
                                <p className="text-red-500 text-sm pt-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {fieldErrors.email}
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
                            <label className="add-user-label">Logo</label>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="relative flex items-center w-full">
                                    <input
                                        type="file"
                                        name="user_logo"
                                        id="user_logo"
                                        onChange={handleFileChange}
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                    />
                                    <div className="flex items-center h-[49px] px-3 bg-[#24242D] text-white border border-[#24242D] rounded-[5px] cursor-pointer min-w-[450px] add-user-inputs gap-3">
                                        <img src={choosefile} alt="Choose File" />
                                        <span className="text-white text-base truncate">
                                            {formData.user_logo && typeof formData.user_logo !== 'string'
                                                ? formData.user_logo.name
                                                : "Choose file..."}
                                        </span>
                                    </div>
                                </div>
                                {renderUserLogo()}
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
                                                checked={isPermissionSelected(permission)}
                                                onChange={handlePermissionChange}
                                                className="mr-2 form-checkboxes"
                                            />
                                            <span className="permissions-texts cursor-pointer">{permission}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-yellow-500">Loading permissions...</p>
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
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default QMSEditUser;