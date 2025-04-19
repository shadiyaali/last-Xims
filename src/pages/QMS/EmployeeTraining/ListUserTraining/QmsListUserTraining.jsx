import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./qmslistusertraining.css";
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const QmsListUserTraining = () => {
    const [selectedUser, setSelectedUser] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [trainingData, setTrainingData] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    const itemsPerPage = 10;

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



    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const companyId = getUserCompanyId();
                const response = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);


    useEffect(() => {
        const fetchTrainingData = async () => {
            if (!selectedUser) {
                setTrainingData([]);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/qms/training/by-attendee/${selectedUser}/`);

                const formattedData = response.data.map((item, index) => ({
                    id: index + 1,
                    userId: selectedUser,
                    title: item.training_title || 'Untitled Training',
                    type: item.type_of_training || 'N/A',
                    datePlanned: item.date_planned ? formatDate(item.date_planned) : 'N/A',
                    status: item.status || 'N/A'
                }));
                setTrainingData(formattedData);
            } catch (error) {
                console.error('Error fetching training data:', error);
                setTrainingData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingData();
        setCurrentPage(1); // Reset to page 1 on user change
    }, [selectedUser]);

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    // Get user's company ID from storage/context


    const totalItems = trainingData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return trainingData.slice(startIndex, endIndex);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleListTraining = () => {
        navigate('/company/qms/list-training');
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= Math.min(4, totalPages); i++) {
            pages.push(
                <button
                    key={i}
                    className={`${currentPage === i ? 'pagin-active' : 'pagin-inactive'}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex items-center gap-5">
                <button
                    className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {pages}
                <button
                    className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center">
                <h1 className="list-user-training-head">List User Training</h1>
                <div className="flex gap-5">
                    <div className="relative w-[332px]">
                        <select
                            className="bg-[#24242D] text-white py-2 px-5 rounded-md appearance-none border-none pr-8 cursor-pointer select-user h-[42px]"
                            value={selectedUser}
                            onChange={(e) => {
                                setSelectedUser(e.target.value);
                                setIsOpen(false);
                            }}
                            onMouseDown={() => setIsOpen(true)}
                            onBlur={() => setIsOpen(false)}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name && user.last_name
                                        ? `${user.first_name} ${user.last_name}`
                                        : user.first_name || user.last_name || user.username || user.email}
                                </option>
                            ))}

                        </select>

                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <ChevronDown
                                className={`w-[18px] h-[18px] text-[#AAAAAA] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleListTraining}
                        className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200">
                        List Training
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto mt-4">
                <table className="w-full">
                    <thead className='bg-[#24242D]'>
                        <tr className="h-[48px]">
                            <th className="pl-4 pr-2 text-left add-manual-theads w-[15%]">No</th>
                            <th className="px-2 text-left add-manual-theads">Training Title</th>
                            <th className="px-2 text-left add-manual-theads w-[25%]">Type</th>
                            <th className="px-2 text-left add-manual-theads">Date Planned</th>
                            <th className="px-2 !pr-[34px] text-right add-manual-theads">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center p-5">Loading...</td>
                            </tr>
                        ) : getCurrentPageData().length > 0 ? (
                            getCurrentPageData().map((item, index) => (
                                <tr key={item.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                    <td className="pl-5 pr-2 add-manual-datas">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-2 add-manual-datas">{item.title}</td>
                                    <td className="px-2 add-manual-datas">{item.type}</td>
                                    <td className="px-2 add-manual-datas">{item.datePlanned}</td>
                                    <td className="px-2 add-manual-datas !text-right">
                                        <span className={`rounded-[4px] px-[10px] py-[3px] ${item.status === 'Completed'
                                                ? 'bg-[#36DDAE11] text-[#36DDAE]'
                                                : 'bg-[#ddd23611] text-[#ddd236]'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="not-found text-center p-5">
                                    {selectedUser ? 'No training found for selected user' : 'Please select a user to view their training'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className="text-white total-text">Total - {totalItems}</div>
                {totalItems > 0 && renderPagination()}
            </div>
        </div>
    );
};

export default QmsListUserTraining;