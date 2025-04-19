import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const AddEnMSRecordFormat = () => {
    const navigate = useNavigate()
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileObject, setFileObject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        written_by: null,
        no: '',
        checked_by: '',
        rivision: '',
        approved_by: '',
        document_type: 'System',
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
        review_frequency_year: '',
        review_frequency_month: '',
        retention: '',
        publish: false,
        send_notification: false
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

            const response = await axios.get(`${BASE_URL}/company/users/${companyId}/`);

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
            setError("Failed to load manuals. Please check your connection and try again.");
        }
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

            // Update the appropriate part of the date
            dateObj[dropdown] = parseInt(value, 10);

            // Create new date string in YYYY-MM-DD format
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
        }

        setOpenDropdowns(prev => ({ ...prev, [dropdown]: false }));
    };

    const handleSaveClick = async () => {
        try {
            setLoading(true);

            // Fetch company ID based on role
            const companyId = getUserCompanyId();
            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const submitData = new FormData();
            console.log('adaSD', formData);

            submitData.append('company', companyId);

            // Add all other form data
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            if (fileObject) {
                submitData.append('upload_attachment', fileObject);
            }

            const response = await axios.post(`${BASE_URL}/company/record-formats/`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            alert('Record Format added successfully!');
            navigate('/company/enms/record-format');
        } catch (err) {
            setLoading(false);
            setError('Failed to save Record Format');
            console.error('Error saving Record Format:', err);
        }
    };

    const handleCancelClick = () => {
        navigate('/company/enms/record-format')
    }


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

    return (
        <div className="bg-[#1C1C24] rounded-lg text-white">
            <div>
                <h1 className="add-manual-sections">Add Record Formats</h1>

                {error && (
                    <div className="mx-[18px] px-[104px] mt-4 p-2 bg-red-500 rounded text-white">
                        {error}
                    </div>
                )}

                <div className="border-t border-[#383840] mx-[18px] pt-[22px] px-[104px]">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="add-qms-manual-label">
                                Record Name/Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
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
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Checked by <span className="text-red-500">*</span>
                            </label>
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

                        <div>
                            <label className="add-qms-manual-label">
                                Approved by <span className="text-red-500">*</span>
                            </label>
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
                                name="retention"
                                value={formData.retention}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div className="flex flex-col items-end mt-[55px] justify-center">
                            <div className='flex gap-[113px] mb-5'>
                                <div className="flex items-center">
                                    <span className="mr-3 add-qms-manual-label">Publish?</span>
                                    <input
                                        type="checkbox"
                                        className="qms-manual-form-checkbox"
                                        checked={formData.publish}
                                        onChange={() => setFormData(prev => ({ ...prev, publish: !prev.publish }))}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <span className="mr-3 add-qms-manual-label">Send Notification?</span>
                                    <input
                                        type="checkbox"
                                        className="qms-manual-form-checkbox"
                                        checked={formData.send_notification}
                                        onChange={() => setFormData(prev => ({ ...prev, send_notification: !prev.send_notification }))}
                                    />
                                </div>
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
        </div>
    );
};

export default AddEnMSRecordFormat
