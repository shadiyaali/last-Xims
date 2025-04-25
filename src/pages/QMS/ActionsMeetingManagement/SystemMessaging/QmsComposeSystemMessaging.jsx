import React, { useState, useEffect } from 'react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg"
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../../../../Utils/Config";
import axios from 'axios';

const QmsComposeSystemMessaging = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        to_user: '',
        subject: '',
        file: null,
        message: '',
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [focusedDropdown, setFocusedDropdown] = useState(null);

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
        const userId = localStorage.getItem("user_id");
        
        if (userRole === "user" && userId) {
            return userId;
        }
        return null;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const companyId = getUserCompanyId();
                if (!companyId) {
                    setError("Company ID not found");
                    return;
                }
                
                const response = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError("Failed to fetch users");
            }
        };

        fetchUsers();
    }, []);

    const handleInbox = () => {
        navigate('/company/qms/list-inbox')
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            file: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const companyId = getUserCompanyId();
            const fromUserId = getRelevantUserId();

            if (!companyId || !fromUserId) {
                throw new Error("Missing required user information");
            }

            const formDataToSend = new FormData();
            formDataToSend.append('company', companyId);
            formDataToSend.append('from_user', fromUserId);
            formDataToSend.append('to_user', formData.to_user);
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('message', formData.message);
            if (formData.file) {
                formDataToSend.append('file', formData.file);
            }

            const response = await axios.post(`${BASE_URL}/qms/messages/create/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            navigate('/company/qms/list-inbox');
        } catch (error) {
            console.error('Error submitting message:', error);
            setError(error.response?.data?.message || "Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/company/qms/list-inbox')
    };

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Compose Message</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200"
                    onClick={handleInbox}
                >
                    Inbox
                </button>
            </div>

            {error && (
                <div className="px-[104px] py-2 text-red-500">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">
                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">To <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            name="to_user"
                            value={formData.to_user}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("to_user")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            required
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name}  
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform transition-transform duration-300 
                                ${focusedDropdown === "to_user" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>
                <div></div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                        required
                    />
                </div>
                <div></div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Attach Document</label>
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
                    {formData.file && (
                        <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">{formData.file.name}</p>
                    )}
                    {!formData.file && (
                        <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">No file chosen</p>
                    )}
                </div>
                <div></div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Message <span className="text-red-500">*</span></label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="add-training-inputs !h-[151px]"
                        required
                    />
                </div>
                <div></div>

                <div className='flex justify-between'>
                    <div>
                        <button 
                            type="button"
                            className='request-correction-btn duration-200 2xl:!w-[140px] !p-[8px]'
                            disabled={loading}
                        >
                            Save as Draft
                        </button>
                    </div>
                    <div className='flex gap-5 w-[63%] 2xl:w-full justify-end'>
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
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QmsComposeSystemMessaging;