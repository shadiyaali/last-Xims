import React, { useState, useEffect } from 'react';
import "./qmsviewuser.css"
import { X, Eye, Trash, Edit } from 'lucide-react';
import edits from "../../../../assets/images/Company User Management/edits.svg"
import deletes from "../../../../assets/images/Company User Management/deletes.svg"
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import toast, { Toaster } from 'react-hot-toast';

const QMSViewUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [userData, setUserData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        address: '',
        city: '',
        province_state: '',
        zip_po_box: '',
        department_division: '',
        country: '',
        email: '',
        phone: '',
        office_phone: '',
        mobile_phone: '',
        fax: '',
        secret_question: '',
        answer: '',
        notes: '',
        status: '',
        user_logo: '',
        permissions: ''
    });
    const [loading, setLoading] = useState(true);

    // Fetch user data when component mounts
    useEffect(() => {
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/company/user/${id}/`);
            console.log("User Data Responseeee:", response.data);

            // Process the data to ensure we handle any objects correctly
            const processedData = {};
            for (const [key, value] of Object.entries(response.data)) {
                // If the value is an object (but not null), convert it to a string representation
                if (value && typeof value === 'object') {
                    processedData[key] = JSON.stringify(value);
                } else {
                    processedData[key] = value;
                }
            }

            setUserData(processedData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Failed to load user details.");
            setLoading(false);
        }
    };

    const closePanel = () => {
        navigate('/company/qms/listuser');
    };

    const handleEditUser = () => {
        navigate(`/company/qms/edituser/${id}`);
    };

    const handleDeleteUser = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`${BASE_URL}/company/users/delete/${id}/`);
            toast.success("User deleted successfully");
            // Navigate back to the list after deletion
            navigate('/company/qms/listuser');
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user. Please try again.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            // Get day, month, and year separately
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
            const year = date.getFullYear();

            // Return in DD-MM-YYYY format with hyphens
            return `${day}-${month}-${year}`;
        } catch (e) {
            return dateString;
        }
    };

    // Helper function to safely render any value
    const renderValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        // If it's already a string, return it directly
        if (typeof value === 'string') {
            return value;
        }

        // Otherwise, convert to string representation
        return String(value);
    };

    return (
        <div className="flex items-center justify-center">
            <div className="bg-[#1C1C24] text-white rounded-lg w-full">
                <Toaster position="top-center" reverseOrder={false} />
                <div className="mx-5 mt-5 flex justify-between items-center border-b border-[#383840] pb-[21px]">
                    <h2 className="user-info-head">User Information</h2>
                    <button onClick={closePanel} className="text-white bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md">
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-white">Loading user data...</p>
                    </div>
                ) : (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left Column */}
                        <div className="space-y-[40px] border-r border-[#383840]">
                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Username</label>
                                <div className="text-white view-user-datas">{renderValue(userData.username)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">First Name</label>
                                <div className="text-white view-user-datas">{renderValue(userData.first_name)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Last Name</label>
                                <div className="text-white view-user-datas">{renderValue(userData.last_name)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Address</label>
                                <div className="text-white view-user-datas">{renderValue(userData.address)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Province/State</label>
                                <div className="text-white view-user-datas">{renderValue(userData.province_state)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Department/Division</label>
                                <div className="text-white view-user-datas">{renderValue(userData.department_division)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Phone</label>
                                <div className="text-white view-user-datas">{renderValue(userData.phone)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Mobile Phone</label>
                                <div className="text-white view-user-datas">{renderValue(userData.mobile_phone)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Secret Question</label>
                                <div className="text-white view-user-datas">{renderValue(userData.secret_question)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Notes</label>
                                <div className="text-white view-user-datas">{renderValue(userData.notes)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Permissions</label>
                                <div className="text-white view-user-datas">
                                    {userData.permissions ?
                                        (() => {
                                            try {
                                                // Parse the permissions if it's a string
                                                const permissionsArray = typeof userData.permissions === 'string'
                                                    ? JSON.parse(userData.permissions)
                                                    : userData.permissions;

                                                // Check if it's an array and map through it
                                                if (Array.isArray(permissionsArray)) {
                                                    return permissionsArray.map(perm => perm.name).join(', ');
                                                }
                                                return 'N/A';
                                            } catch (e) {
                                                console.error("Error parsing permissions:", e);
                                                return 'Error displaying permissions';
                                            }
                                        })()
                                        : 'N/A'
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-[40px]">
                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Gender</label>
                                <div className="text-white view-user-datas">{renderValue(userData.gender)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">DOB</label>
                                <div className="text-white view-user-datas">{formatDate(userData.date_of_birth) || 'N/A'}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">City</label>
                                <div className="text-white view-user-datas">{renderValue(userData.city)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Zip/P.O. Box</label>
                                <div className="text-white view-user-datas">{renderValue(userData.zip_po_box)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Country</label>
                                <div className="text-white view-user-datas">{renderValue(userData.country)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Email</label>
                                <div className="text-white view-user-datas">{renderValue(userData.email)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Office Phone</label>
                                <div className="text-white view-user-datas">{renderValue(userData.office_phone)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Fax</label>
                                <div className="text-white view-user-datas">{renderValue(userData.fax)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Answer</label>
                                <div className="text-white view-user-datas">{renderValue(userData.answer)}</div>
                            </div>

                            <div>
                                <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Status</label>
                                <div className="text-white view-user-datas">{renderValue(userData.status)}</div>
                            </div>

                            <div className='flex justify-between'>
                                <div>
                                    <label className="block view-user-labels text-[#AAAAAA] mb-[6px]">Logo</label>
                                    {userData.user_logo ? (
                                        <button
                                            className="text-[#1E84AF] flex items-center view-user-logo"
                                            onClick={() => window.open(userData.user_logo, '_blank')}
                                        >
                                            <span>Click to view file</span>
                                            <Eye size={18} className="ml-2" />
                                        </button>
                                    ) : (
                                        <div className="text-white view-user-datas">No logo available</div>
                                    )}
                                </div>

                                <div className="flex space-x-16">
                                    <div className='flex flex-col items-center'>
                                        <label className="block view-user-labels text-[#AAAAAA] mb-[8px]">Edit</label>
                                        <button className="flex items-center" onClick={handleEditUser}>
                                            <img src={edits} alt="Edit icon" className='w-[18px] h-[18px]' />
                                        </button>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <label className="block view-user-labels text-[#AAAAAA] mb-[8px]">Delete</label>
                                        <button className="flex items-center" onClick={handleDeleteUser}>
                                            <img src={deletes} alt="Delete icon" className='w-[18px] h-[18px]' />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QMSViewUser;