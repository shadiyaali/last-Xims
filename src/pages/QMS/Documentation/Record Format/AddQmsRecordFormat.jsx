import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import AddQmsManualSuccessModal from './Modals/AddQmsManualSuccessModal';
import AddQmsManualDraftSuccessModal from './Modals/AddQmsManualDraftSuccessModal';
import AddQmsManualDraftErrorModal from './Modals/AddQmsManualDraftErrorModal';
const AddQmsRecordFormat = () => {
    const navigate = useNavigate()
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileObject, setFileObject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showAddManualSuccessModal, setShowAddManualSuccessModal] = useState(false);
    const [showDraftManualSuccessModal, setShowDraftManualSuccessModal] = useState(false);
    const [showDraftManualErrorModal, setShowDarftManualErrorModal] = useState(false);

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

    const companyId = getUserCompanyId();
    console.log("Stored Company ID:", companyId);

    const [formData, setFormData] = useState({
        title: '',
        no: '',
        send_notification_to_checked_by: true,
        send_email_to_checked_by: true,
        send_notification_to_approved_by: true,
        send_email_to_approved_by: true,
        rivision: '',
        document_type: 'System',
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
        review_frequency_year: '',
        review_frequency_month: '',
        retention_period: '',
    });

    const [openDropdowns, setOpenDropdowns] = useState({
        written_by: false,
        checked_by: false,
        approved_by: false,
        document_type: false,
        day: false,
        month: false,
        year: false
    });
    useEffect(() => {
        if (companyId) {
            fetchUsers();
        }
    }, [companyId]);

    const fetchUsers = async () => {
        try {
            if (!companyId) return;

            const response = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);

            console.log("API Response:", response.data);

            if (Array.isArray(response.data)) {
                setUsers(response.data);
                console.log("Users loaded:", response.data);
            } else {
                setUsers([]);
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load record formats. Please check your connection and try again.");
        }
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

    // Parse date to get day, month, year
    const parseDate = () => {
        const dateObj = new Date(formData.date);
        return {
            day: dateObj.getDate(),
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear()
        };
    };

    const dateParts = parseDate();

    const days = Array.from(
        { length: getDaysInMonth(dateParts.month, dateParts.year) },
        (_, i) => i + 1
    );

    // Generate months (1-12)
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Generate years (current year - 10 to current year + 10)
    const years = Array.from(
        { length: 21 },
        (_, i) => currentYear - 10 + i
    );

    const documentTypes = [
        'System',
        'Paper',
        'External',
        'Work Instruction'
    ];

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};

        // Check required fields
        if (!formData.title.trim()) {
            newErrors.title = "Record Name/Title is required";
        }

        if (!formData.no.trim()) {
            newErrors.no = "Record Number is required";
        }

        if (!formData.written_by) {
            newErrors.written_by = "Written/Prepare By is required";
        }

        if (!formData.checked_by) {
            newErrors.checked_by = "Checked/Reviewed By is required";
        }

        if (!formData.approved_by) {
            newErrors.approved_by = "Approved By is required";
        }

        // Validate review frequency if provided
        if (formData.review_frequency_year && isNaN(parseInt(formData.review_frequency_year))) {
            newErrors.review_frequency_year = "Year must be a number";
        }

        if (formData.review_frequency_month && isNaN(parseInt(formData.review_frequency_month))) {
            newErrors.review_frequency_month = "Month must be a number";
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));


        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };


    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file.name);
            setFileObject(file);
        }
    };

    const handleDropdownChange = (e, dropdown) => {
        const value = e.target.value;

        if (dropdown === 'day' || dropdown === 'month' || dropdown === 'year') {
            const dateObj = parseDate();

            dateObj[dropdown] = parseInt(value, 10);

            const newDate = `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;

            setFormData(prev => ({
                ...prev,
                date: newDate
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [dropdown]: value
            }));


            if (errors[dropdown]) {
                setErrors(prev => ({
                    ...prev,
                    [dropdown]: ''
                }));
            }
        }

        setOpenDropdowns(prev => ({ ...prev, [dropdown]: false }));
    };


    const handleCancelClick = () => {
        navigate('/company/qms/record-format')
    }

    const handleSaveClick = async () => {
        if (!validateForm()) {
            // Show the form has validation errors
            setError('Please correct the errors below');
            return;
        }
        try {
            setLoading(true);

            const companyId = getUserCompanyId();
            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const submitData = new FormData();
            console.log("procedure post ...................", formData)
            submitData.append('company', companyId);


            Object.keys(formData).forEach(key => {
                if (key === 'send_notification_to_checked_by' || key === 'send_notification_to_approved_by' ||
                    key === 'send_email_to_checked_by' || key === 'send_email_to_approved_by') {
                    submitData.append(key, formData[key]);
                    return;
                }
                submitData.append(key, formData[key]);
            });

            if (fileObject) {
                submitData.append('upload_attachment', fileObject);
            }

            const response = await axios.post(`${BASE_URL}/qms/record-create/`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            setShowAddManualSuccessModal(true);
            setTimeout(() => {
                setShowAddManualSuccessModal(false);
                navigate('/company/qms/record-format');
            }, 1500);

        } catch (err) {
            setLoading(false);
            setError('Failed to save record formats');
        }
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

    const handleDraftClick = async () => {
        try {
            const companyId = getUserCompanyId();
            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const userId = getRelevantUserId();
            if (!userId) {
                setError('User ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const submitData = new FormData();

            submitData.append('company', companyId);
            submitData.append('user', userId);
            submitData.append('is_draft', true);


            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            if (fileObject) {
                submitData.append('upload_attachment', fileObject);
            }

            const response = await axios.post(`${BASE_URL}/qms/record/draft-create/`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            setShowDraftManualSuccessModal(true);
            setTimeout(() => {
                setShowDraftManualSuccessModal(false);
                navigate('/company/qms/draftrecordformat');
            }, 1500);


        } catch (err) {
            setLoading(false);
            setShowDarftManualErrorModal(true);
            setTimeout(() => {
                setShowDarftManualErrorModal(false);
            }, 3000);
            console.error('Error saving manual:', err);
        }
    };


    // Get month name from number
    const getMonthName = (monthNum) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthNum - 1];
    };

    // Format user name for display
    const formatUserName = (user) => {
        return `${user.first_name} ${user.last_name}`;
    };
    const ErrorMessage = ({ message }) => {
        if (!message) return null;
        return (
            <div className="text-red-500 text-sm mt-1">
                {message}
            </div>
        );
    };
    return (
        <div className="bg-[#1C1C24] rounded-lg text-white">
            <div>
                <h1 className="add-manual-sections">Add Record Formats</h1>

                {/* {error && (
                    <div className="mx-[18px] px-[104px] mt-4 p-2 bg-red-500 rounded text-white">
                        {error}
                    </div>
                )} */}

                <AddQmsManualSuccessModal
                    showAddManualSuccessModal={showAddManualSuccessModal}
                    onClose={() => { setShowAddManualSuccessModal(false) }}
                />

                <AddQmsManualDraftSuccessModal
                    showDraftManualSuccessModal={showDraftManualSuccessModal}
                    onClose={() => { setShowDraftManualSuccessModal(false) }}
                />

                <AddQmsManualDraftErrorModal
                    showDraftManualErrorModal={showDraftManualErrorModal}
                    onClose={() => { setShowDarftManualErrorModal(false) }}
                />

                <div className="border-t border-[#383840] mx-[18px] pt-[22px] px-[47px] 2xl:px-[104px]">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="add-qms-manual-label">
                            Record Name/Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                            <ErrorMessage message={errors.title} />

                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Written/Prepare By <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="written_by"
                                    value={formData.written_by || ''}
                                    onFocus={() => toggleDropdown('written_by')}
                                    onChange={(e) => handleDropdownChange(e, 'written_by')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, written_by: false }))}
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={`written-${user.id}`} value={user.id}>
                                            {formatUserName(user)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.written_by ? 'rotate-180' : ''}`}
                                />
                            </div>
                            <ErrorMessage message={errors.written_by} />

                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                            Record Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="no"
                                value={formData.no}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                            <ErrorMessage message={errors.no} />

                        </div>

                        <div className="flex">
                            <div className="flex-grow">
                                <div className='flex items-center justify-between h-[24px]'>
                                    <label className="add-qms-manual-label">
                                        Checked/Reviewed By <span className="text-red-500">*</span>
                                    </label>
                                    <div className='flex items-end justify-end space-y-1'>
                                        <div className="ml-5 flex items-center h-[24px] ">
                                            <div className="flex items-center h-14 justify-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="send_notification_to_checked_by"
                                                    checked={formData.send_notification_to_checked_by}
                                                    onChange={handleCheckboxChange}
                                                    className="cursor-pointer qms-manual-form-checkbox p-[7px]"
                                                />
                                                <label className="add-qms-manual-label check-label">System Notify</label>
                                            </div>
                                        </div>
                                        <div className="ml-5 flex items-center h-[24px] ">
                                            <div className="flex items-center h-14 justify-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="send_email_to_checked_by"
                                                    checked={formData.send_email_to_checked_by}
                                                    onChange={handleCheckboxChange}
                                                    className="cursor-pointer qms-manual-form-checkbox p-[7px]"
                                                />
                                                <label className="add-qms-manual-label check-label">Email Notify</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="checked_by"
                                        value={formData.checked_by || ''}
                                        onFocus={() => toggleDropdown('checked_by')}
                                        onChange={(e) => handleDropdownChange(e, 'checked_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, checked_by: false }))}
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={`checked-${user.id}`} value={user.id}>
                                                {formatUserName(user)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.checked_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <ErrorMessage message={errors.checked_by} />

                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Revision
                            </label>
                            <input
                                type="text"
                                name="rivision"
                                value={formData.rivision}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div className="flex">
                            <div className="flex-grow">
                                <div className='flex items-center justify-between h-[24px]'>
                                    <label className="add-qms-manual-label">
                                        Approved By <span className="text-red-500">*</span>
                                    </label>
                                    <div className='flex items-end justify-end space-y-1'>
                                        <div className="ml-5 flex items-center h-[24px]">
                                            <div className="flex items-center h-14 justify-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="send_notification_to_approved_by"
                                                    checked={formData.send_notification_to_approved_by}
                                                    onChange={handleCheckboxChange}
                                                    className=" cursor-pointer qms-manual-form-checkbox p-[7px]"
                                                />
                                                <label className="add-qms-manual-label check-label">System Notify</label>
                                            </div>
                                        </div>
                                        <div className="ml-5 flex items-center h-[24px]">
                                            <div className="flex items-center h-14 justify-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name="send_email_to_approved_by"
                                                    checked={formData.send_email_to_approved_by}
                                                    onChange={handleCheckboxChange}
                                                    className=" cursor-pointer qms-manual-form-checkbox p-[7px]"
                                                />
                                                <label className="add-qms-manual-label check-label">Email Notify</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="approved_by"
                                        value={formData.approved_by || ''}
                                        onFocus={() => toggleDropdown('approved_by')}
                                        onChange={(e) => handleDropdownChange(e, 'approved_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, approved_by: false }))}
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={`approved-${user.id}`} value={user.id}>
                                                {formatUserName(user)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.approved_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <ErrorMessage message={errors.approved_by} />
                            </div>

                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Document Type
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="document_type"
                                    value={formData.document_type}
                                    onFocus={() => toggleDropdown('document_type')}
                                    onChange={(e) => handleDropdownChange(e, 'document_type')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, document_type: false }))}
                                >
                                    {documentTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.document_type ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Date
                            </label>
                            <div className="flex space-x-5">
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.day}
                                        onFocus={() => toggleDropdown('day')}
                                        onChange={(e) => handleDropdownChange(e, 'day')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, day: false }))}
                                    >
                                        {days.map(day => (
                                            <option key={`day-${day}`} value={day}>
                                                {day < 10 ? `0${day}` : day}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.day ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.month}
                                        onFocus={() => toggleDropdown('month')}
                                        onChange={(e) => handleDropdownChange(e, 'month')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, month: false }))}
                                    >
                                        {months.map(month => (
                                            <option key={`month-${month}`} value={month}>
                                                {month < 10 ? `0${month}` : month} - {getMonthName(month).substring(0, 3)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.month ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.year}
                                        onFocus={() => toggleDropdown('year')}
                                        onChange={(e) => handleDropdownChange(e, 'year')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, year: false }))}
                                    >
                                        {years.map(year => (
                                            <option key={`year-${year}`} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.year ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Attach Document
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    className="w-full add-qmsmanual-attach"
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    <span className="file-input">
                                        {selectedFile ? selectedFile : "Choose File"}
                                    </span>
                                    <img src={file} alt="File Icon" />
                                </button>
                                {!selectedFile && <p className="text-right no-file">No file chosen</p>}
                            </div>
                        </div>



                        <div>
                            <label className='add-qms-manual-label'>
                                Review Frequency
                            </label>
                            <div className="flex space-x-5">
                                <input
                                    type="text"
                                    name="review_frequency_year"
                                    placeholder='Years'
                                    value={formData.review_frequency_year}
                                    onChange={handleChange}
                                    className="w-full add-qms-manual-inputs"
                                />
                                <input
                                    type="text"
                                    name="review_frequency_month"
                                    placeholder='Months'
                                    value={formData.review_frequency_month}
                                    onChange={handleChange}
                                    className="w-full add-qms-manual-inputs"
                                />
                            </div>
                        </div>


                        <div>
                            <label className="add-qms-manual-label">
                               Retention Period
                            </label>
                            <input
                                type="text"
                                name="retention_period"
                                value={formData.retention_period}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>
                    </div>

                    <div className="flex items-center mt-[22px] justify-between">

                        <div className='mb-6'>
                            <button
                                className="request-correction-btn duration-200"
                                onClick={handleDraftClick}
                            >
                                Save as Draft
                            </button>
                        </div>

                        <div className='flex gap-[22px] mb-6'>
                            <button
                                className="cancel-btn duration-200"
                                onClick={handleCancelClick}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn duration-200"
                                onClick={handleSaveClick}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AddQmsRecordFormat
