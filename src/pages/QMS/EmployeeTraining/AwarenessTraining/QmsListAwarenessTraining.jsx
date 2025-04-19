import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit2, Trash2 } from 'lucide-react';
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import view from "../../../../assets/images/Company Documentation/view.svg";
import "./qmslistawarenesstraining.css";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../../../../Utils/Config";
import axios from 'axios';

const QmsListAwarenessTraining = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [trainingItems, setTrainingItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getUserCompanyId = () => {
        const role = localStorage.getItem("role");
        if (role === "company") {
            return localStorage.getItem("company_id");
        } else if (role === "user") {
            try {
                const userCompanyId = localStorage.getItem("user_company_id");
                return userCompanyId ? JSON.parse(userCompanyId) : null;
            } catch (e) {
                console.error("Error parsing user company ID:", e);
                return null;
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchAwarenessTrainingData = async () => {
            setIsLoading(true);
            try {
                const companyId = getUserCompanyId();
                const response = await axios.get(`${BASE_URL}/qms/awareness/${companyId}/`);
                setTrainingItems(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to load awareness training data');
                console.error('Error fetching awareness training data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAwarenessTrainingData();
    }, []);

    const itemsPerPage = 10;
    const totalItems = trainingItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Filter items based on search query
    const filteredItems = trainingItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/qms/awareness/${id}/update/`);
            setTrainingItems(trainingItems.filter(item => item.id !== id));
        } catch (err) {
            console.error('Error deleting awareness training item:', err);
            alert('Failed to delete the training item');
        }
    };

    const handleAddAwarenessTraining = () => {
        navigate('/company/qms/add-awareness-training');
    };

    const handleDraftAwarenessTraining = () => {
        navigate('/company/qms/draft-awareness-training');
    };

    const handleEditAwarenessTraining = (id) => {
        navigate(`/company/qms/edit-awareness-training/${id}`);
    };

    const handleViewAwarenessTraining = (id) => {
        navigate(`/company/qms/view-awareness-training/${id}`);
    };

    // Helper function to render the appropriate link based on category
    const renderLink = (item) => {
        switch (item.category) {
            case 'YouTube video':
                return (
                    <a href={item.youtube_link} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                        {item.youtube_link}
                    </a>
                );
            case 'Presentation':
                return item.upload_file ? (
                    <a href={item.upload_file} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                        View Presentation
                    </a>
                ) : 'No file uploaded';
            case 'Web Link':
                return (
                    <a href={item.web_link} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                        {item.web_link}
                    </a>
                );
            default:
                return 'N/A';
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64 bg-[#1C1C24] text-white">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-64 bg-[#1C1C24] text-white">{error}</div>;
    }

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-awareness-training-head">List Awareness Training</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-[#1C1C24] text-white px-[10px] h-[42px] rounded-md w-[333px] border border-[#383840] outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className='absolute right-[1px] top-[1px] text-white bg-[#24242D] p-[11px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                            <Search size={18} />
                        </div>
                    </div>
                    <button
                        className="flex items-center justify-center !w-[100px] add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleDraftAwarenessTraining}
                    >
                        <span>Draft</span>
                    </button>
                    <button
                        className="flex items-center justify-center !px-[20px] add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleAddAwarenessTraining}
                    >
                        <span>Add Awareness Training</span>
                        <img src={plusIcon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                    </button>
                </div>
            </div>
            <div className="overflow-hidden">
                <table className="w-full">
                    <thead className='bg-[#24242D]'>
                        <tr className='h-[48px]'>
                            <th className="px-3 text-left list-awareness-training-thead">No</th>
                            <th className="px-3 text-left list-awareness-training-thead">Title</th>
                            <th className="px-3 text-left list-awareness-training-thead">Description</th>
                           
                            <th className="px-3 text-left list-awareness-training-thead">Link</th>
                            <th className="px-3 text-center list-awareness-training-thead">View</th>
                            <th className="px-3 text-center list-awareness-training-thead">Edit</th>
                            <th className="px-3 text-center list-awareness-training-thead">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id} className="border-b border-[#383840] hover:bg-[#131318] cursor-pointer h-[50px]">
                                    <td className="px-3 list-awareness-training-datas">{indexOfFirstItem + index + 1}</td>
                                    <td className="px-3 list-awareness-training-datas">{item.title}</td>
                                    <td className="px-3 list-awareness-training-datas">{item.description || 'N/A'}</td>
                                
                                    <td className="px-3 list-awareness-training-datas">
                                        {renderLink(item)}
                                    </td>
                                    <td className="list-awareness-training-datas text-center">
                                        <div className='flex justify-center items-center h-[50px]'>
                                            <button onClick={() => handleViewAwarenessTraining(item.id)}>
                                                <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="list-awareness-training-datas text-center">
                                        <div className='flex justify-center items-center h-[50px]'>
                                            <button onClick={() => handleEditAwarenessTraining(item.id)}>
                                                <img src={edits} alt="Edit Icon" className='w-[16px] h-[16px]' />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="list-awareness-training-datas text-center">
                                        <div className='flex justify-center items-center h-[50px]'>
                                            <button onClick={() => handleDeleteItem(item.id)}>
                                                <img src={deletes} alt="Delete Icon" className='w-[16px] h-[16px]' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="border-b border-[#383840] h-[50px]">
                                <td colSpan="8" className="px-3 list-awareness-training-datas text-center">No awareness training items found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-3">
                <div className='text-white total-text'>Total: {totalItems}</div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-5">
                        <button
                            className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                className={`w-8 h-8 rounded-md ${currentPage === number ? 'pagin-active' : 'pagin-inactive'}`}
                                onClick={() => handlePageChange(number)}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QmsListAwarenessTraining;