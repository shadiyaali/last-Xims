import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import "./qmsaddawarenesstraining.css";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";


const QmsAddAwarenessTraining = () => {
    const [draftLoading, setDraftLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Select Category',
        description: '',
        youtube_link: '',
        web_link: '',
        upload_file: null
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [fieldVisible, setFieldVisible] = useState(false);

    const [error, setError] = useState('');

    const handleCategoryChange = (e) => {
        const { value } = e.target;

        setFieldVisible(false);

        setTimeout(() => {
            setFormData(prevData => ({
                ...prevData,
                category: value
            }));

            setFieldVisible(value !== 'Select Category');
        }, 300);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        setFormData(prevData => ({
            ...prevData,
            upload_file: e.target.files[0]
        }));

        if (errors.upload_file) {
            setErrors(prevErrors => ({
                ...prevErrors,
                upload_file: ''
            }));
        }
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
                    return JSON.parse(userData);
                } catch (e) {
                    console.error("Error parsing user company ID:", e);
                    return null;
                }
            }
        }
        return null;
    };

    const getRelevantUserId = () => {
        const userRole = localStorage.getItem("role");

        if (userRole === "user") {
            const userId = localStorage.getItem("user_id");
            if (userId) return userId;
        }

        const companyId = localStorage.getItem("company_id");
        if (companyId) return companyId;

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';

        // Add validation for category selection
        if (formData.category === 'Select Category') {
            newErrors.category = 'Please select a category';
        } else {
            // Validate based on category
            if (formData.category === 'YouTube video' && !formData.youtube_link.trim()) {
                newErrors.youtube_link = 'YouTube link is required';
            } else if (formData.category === 'Web Link' && !formData.web_link.trim()) {
                newErrors.web_link = 'Web link is required';
            } else if (formData.category === 'Presentation' && !formData.upload_file) {
                newErrors.upload_file = 'Presentation file is required';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const userId = getRelevantUserId();
            const companyId = getUserCompanyId();

            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);

                return;
            }

            const submissionData = new FormData();
            submissionData.append('company', companyId);
            submissionData.append('user', userId);
            submissionData.append('title', formData.title);
            submissionData.append('description', formData.description || '');
            submissionData.append('category', formData.category);

            // Append the appropriate field based on category
            if (formData.category === 'YouTube video') {
                submissionData.append('youtube_link', formData.youtube_link);
            } else if (formData.category === 'Web Link') {
                submissionData.append('web_link', formData.web_link);
            } else if (formData.category === 'Presentation' && formData.upload_file) {
                submissionData.append('upload_file', formData.upload_file);
            }

            const response = await axios.post(`${BASE_URL}/qms/awareness/create/`, submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });


            setTimeout(() => {

                navigate('/company/qms/list-awareness-training');
            }, 1500);
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.response?.data?.message || 'Failed to save awareness training. Please try again.');

            setTimeout(() => {

            }, 3000);
        } finally {
            setLoading(false);
        }
    };


    const handleSaveAsDraft = async () => {
        try {
            setDraftLoading(true);

            const companyId = getUserCompanyId();
            const userId = getRelevantUserId();

            if (!companyId || !userId) {
                setError('Company ID or User ID not found. Please log in again.');
                setDraftLoading(false);
                return;
            }

            const submitData = new FormData();

            submitData.append('company', companyId);
            submitData.append('user', userId);
            submitData.append('is_draft', true);

            Object.keys(formData).forEach((key) => {
                if (
                    formData[key] !== null &&
                    formData[key] !== '' &&
                    !(key === 'category' && formData[key] === 'Select Category')
                ) {
                    submitData.append(key, formData[key]);
                }
            });
            


            if (formData.file) {
                submitData.append('upload_attachment', formData.file);
            }

            console.log('Sending draft data:', Object.fromEntries(submitData.entries()));

            const response = await axios.post(
                `${BASE_URL}/qms/awareness/draft-create/`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',

                    },
                }
            );

            setDraftLoading(false);

            setTimeout(() => {

                navigate('/company/qms/draft-compliance');
            }, 1500);


        } catch (err) {
            setDraftLoading(false);
        
            setTimeout(() => {
              
            }, 3000);
            const errorMessage = err.response?.data?.detail || 'Failed to save Draft';
            setError(errorMessage);
            console.error('Error saving Draft:', err.response?.data || err);
        }
    };
    const handleListAwarenessTraining = () => {
        navigate('/company/qms/list-awareness-training')
    }

    const handleCancel = () => {
        navigate('/company/qms/list-awareness-training')
    };

    // Updated categories to match the Django model choices
    const categories = ['Select Category', 'YouTube video', 'Presentation', 'Web Link'];

    // Render the appropriate input field based on category
    const renderCategoryField = () => {
        // Don't show any field if "Select Category" is selected
        if (formData.category === 'Select Category') {
            return null;
        }

        const animationClass = fieldVisible ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0';

        switch (formData.category) {
            case 'YouTube video':
                return (
                    <div className={`transition-all duration-300 ease-in-out ${animationClass}`}>
                        <label className="block employee-performace-label">
                            YouTube Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="youtube_link"
                            value={formData.youtube_link}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className='w-full employee-performace-inputs'
                        />
                        {errors.youtube_link && <p className="text-red-500 text-sm mt-1">{errors.youtube_link}</p>}
                    </div>
                );
            case 'Presentation':
                return (
                    <div className={`transition-all duration-300 ease-in-out ${animationClass}`}>
                        <label className="block employee-performace-label">Upload File <span className="text-red-500">*</span></label>
                        <div className="flex">
                            <input
                                type="file"
                                id="file-upload"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className="add-training-inputs w-full flex justify-between items-center cursor-pointer !bg-[#1C1C24] border !border-[#383840]"
                            >
                                <span className="text-[#AAAAAA] choose-file">Choose File</span>
                                <img src={file} alt="" />
                            </label>
                        </div>
                        {formData.upload_file && (
                            <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">{formData.upload_file.name}</p>
                        )}
                        {!formData.upload_file && (
                            <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">No file chosen</p>
                        )}
                        {errors.upload_file && <p className="text-red-500 text-sm mt-1">{errors.upload_file}</p>}
                    </div>
                );
            case 'Web Link':
                return (
                    <div className={`transition-all duration-300 ease-in-out ${animationClass}`}>
                        <label className="block employee-performace-label">
                            Web Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="web_link"
                            value={formData.web_link}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className='w-full employee-performace-inputs'
                        />
                        {errors.web_link && <p className="text-red-500 text-sm mt-1">{errors.web_link}</p>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">

            <div className="flex justify-between items-center px-[104px] pb-5 border-b border-[#383840]">
                <h1 className="add-awareness-training-head">Add Awareness Training</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded px-[10px] h-[42px] w-[213px] list-training-btn duration-200"
                    onClick={handleListAwarenessTraining}
                    type="button"
                >
                    List Awareness Training
                </button>
            </div>

            <form onSubmit={handleSubmit} className='px-[104px] pt-5'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block employee-performace-label">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className='w-full employee-performace-inputs'
                            maxLength={100}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block employee-performace-label">
                            Choose Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={(e) => {
                                    handleCategoryChange(e);
                                    setDropdownOpen(prev => !prev);
                                    setTimeout(() => setDropdownOpen(false), 200);
                                }}
                                onFocus={() => setDropdownOpen(true)}
                                onBlur={() => setDropdownOpen(false)}
                                className="w-full employee-performace-inputs appearance-none cursor-pointer"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ease-in-out ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </div>
                        </div>
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>

                    <div>
                        <label className="block employee-performace-label">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full employee-performace-inputs !h-[84px]"
                        />
                    </div>

                    {/* Dynamic Category Field */}
                    <div>
                        {renderCategoryField()}
                    </div>
                </div>

                <div className="flex justify-between mt-5 gap-5">
                    <div>
                        <button
                            type="button"
                            onClick={handleSaveAsDraft}
                            disabled={draftLoading}
                            className="request-correction-btn duration-200"
                        >
                            {draftLoading ? 'Saving...' : 'Save as Draft'}
                        </button>
                    </div>
                    <div className='flex gap-5'>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn duration-200"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn duration-200"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default QmsAddAwarenessTraining;