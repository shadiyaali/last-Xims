import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import view from "../../../../assets/images/Company Documentation/view.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import "./qmslistawarenesstraining.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const QmsDraftAwarenessTraining = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [trainingItems, setTrainingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const itemsPerPage = 10;

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const id = getRelevantUserId();
                console.log("Fetching data for ID:", id);
                
            
                const response = await axios.get(`${BASE_URL}/qms/awareness-draft/${id}/`);
                console.log("API Response:", response.data);

                const data = response.data;
                if (Array.isArray(data)) {
                   
                    const formattedData = data.map(item => ({
                        id: item.id,
                        title: item.title || "Untitled",
                        description: item.description || "",
                        category: item.category || "",
                        youtube_link: item.youtube_link || "",
                        web_link: item.web_link || "",
                        upload_file: item.upload_file || "",
                    }));
                    setTrainingItems(formattedData);
                } else if (data?.data && Array.isArray(data.data)) {
                    // Handle nested data structure
                    const formattedData = data.data.map(item => ({
                        id: item.id,
                        title: item.title || "Untitled",
                        description: item.description || "",
                        category: item.category || "",
                        youtube_link: item.youtube_link || "",
                        web_link: item.web_link || "",
                        upload_file: item.upload_file || "",
                    }));
                    setTrainingItems(formattedData);
                } else {
                    console.error("Unexpected data format:", data);
                    setTrainingItems([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch draft awareness trainings:", error);
                setError("Failed to load awareness training data. Please try again.");
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Get the link value based on category
    const getLinkValue = (item) => {
        switch(item.category) {
            case 'YouTube video':
                return item.youtube_link;
            case 'Web Link':
                return item.web_link;
            case 'Presentation':
                return item.upload_file ? `File: ${item.upload_file.split('/').pop()}` : 'No file uploaded';
            default:
                return '';
        }
    };

    // Filter items based on search query
    const filteredItems = trainingItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Get current page items
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/qms/awareness/${id}/delete/`);
            setTrainingItems(trainingItems.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete awareness training:", error);
            alert("Failed to delete the item. Please try again.");
        }
    };

    const handleCloseDraftAwarenessTraining = () => {
        navigate('/company/qms/list-awareness-training');
    };

    const handleEditDraftAwarenessTraining = (id) => {
        navigate(`/company/qms/edit-draft-awareness-training/${id}`);
    };

    const handleViewDraftAwarenessTraining = (id) => {
        navigate(`/company/qms/view-draft-awareness-training/${id}`);
    };

    if (loading) {
        return (
            <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-awareness-training-head">Draft Awareness Training</h1>
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
                        className="text-white bg-[#24242D] px-2 rounded-md"
                        onClick={handleCloseDraftAwarenessTraining}
                    >
                        <X className='text-white' />
                    </button>
                </div>
            </div>
            
            {trainingItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    No draft awareness trainings found.
                </div>
            ) : (
                <>
                    <div className="overflow-hidden">
                        <table className="w-full">
                            <thead className='bg-[#24242D]'>
                                <tr className='h-[48px]'>
                                    <th className="px-3 text-left list-awareness-training-thead">No</th>
                                    <th className="px-3 text-left list-awareness-training-thead">Title</th>
                                    <th className="px-3 text-left list-awareness-training-thead">Description</th>
                                    <th className="px-3 text-left list-awareness-training-thead">Category</th>
                                    <th className="px-3 text-left list-awareness-training-thead">Link/File</th>
                                    <th className="px-3 text-left list-awareness-training-thead">Action</th>
                                    <th className="px-3 text-center list-awareness-training-thead">View</th>
                                    <th className="px-3 text-center list-awareness-training-thead">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={item.id} className="border-b border-[#383840] hover:bg-[#131318] cursor-pointer h-[50px]">
                                        <td className="px-3 list-awareness-training-datas">{indexOfFirstItem + index + 1}</td>
                                        <td className="px-3 list-awareness-training-datas">{item.title}</td>
                                        <td className="px-3 list-awareness-training-datas">
                                            {item.description ? (
                                                item.description.length > 30 
                                                    ? `${item.description.substring(0, 30)}...` 
                                                    : item.description
                                            ) : "No description"}
                                        </td>
                                        <td className="px-3 list-awareness-training-datas">{item.category || "N/A"}</td>
                                        <td className="px-3 list-awareness-training-datas">
                                            {item.category === 'YouTube video' && item.youtube_link && (
                                                <a href={item.youtube_link} className="text-[#1E84AF] hover:underline" target="_blank" rel="noopener noreferrer">
                                                    {item.youtube_link.length > 30 
                                                        ? `${item.youtube_link.substring(0, 30)}...` 
                                                        : item.youtube_link}
                                                </a>
                                            )}
                                            {item.category === 'Web Link' && item.web_link && (
                                                <a href={item.web_link} className="text-[#1E84AF] hover:underline" target="_blank" rel="noopener noreferrer">
                                                    {item.web_link.length > 30 
                                                        ? `${item.web_link.substring(0, 30)}...` 
                                                        : item.web_link}
                                                </a>
                                            )}
                                            {item.category === 'Presentation' && item.upload_file && (
                                                <span>
                                                    {item.upload_file.split('/').pop().length > 30 
                                                        ? `${item.upload_file.split('/').pop().substring(0, 30)}...` 
                                                        : item.upload_file.split('/').pop()}
                                                </span>
                                            )}
                                            {(!item.youtube_link && !item.web_link && !item.upload_file) && "N/A"}
                                        </td>
                                        <td className="px-3 list-awareness-training-datas text-left text-[#1E84AF]">
                                            <button onClick={() => handleEditDraftAwarenessTraining(item.id)}>
                                                Click to Continue
                                            </button>
                                        </td>
                                        <td className="list-awareness-training-datas text-center">
                                            <div className='flex justify-center items-center h-[50px]'>
                                                <button onClick={() => handleViewDraftAwarenessTraining(item.id)}>
                                                    <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
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
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                        <div className='text-white total-text'>Total: {totalItems}</div>
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
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default QmsDraftAwarenessTraining;