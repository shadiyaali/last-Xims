import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const QmsDraftListTraining = () => {
    // State
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

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
    // Fetching data
    useEffect(() => {
        const fetchDraftTrainings = async () => {
            try {
                const id = getRelevantUserId();
                setLoading(true);
                 

                const response = await axios.get(`${BASE_URL}/qms/training-draft/${id}/`);
                setTrainings(response.data);
                setTotalItems(response.data.length);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching draft trainings:', error);
                setError('Failed to load draft trainings');
                setLoading(false);
            }
        };

        fetchDraftTrainings();
    }, []);

   

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // Pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Search functionality
    const filteredTrainings = trainings
        .filter(training =>
            training.training_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            training.type_of_training?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            training.venue?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(indexOfFirstItem, indexOfLastItem);

    const handleCloseDraftTraining = () => {
        navigate('/company/qms/list-training');
    };

    const handleQmsViewDraftTraining = (id) => {
        navigate(`/company/qms/view-draft-training/${id}`);
    };

    const handleQmsEditDraftTraining = (id) => {
        navigate(`/company/qms/edit-draft-training/${id}`);
    };

    // Delete training
    const handleDeleteTraining = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/qms/training/draft-delete/${id}/`);
            setTrainings(trainings.filter(training => training.id !== id));
            setTotalItems(prev => prev - 1);
        } catch (error) {
            console.error('Error deleting draft training:', error);
            alert('Failed to delete draft training');
        }
    };

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">
                <p>Loading draft trainings...</p>
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-manual-head">Draft Training</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="serach-input-manual focus:outline-none bg-transparent"
                        />
                        <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                            <Search size={18} />
                        </div>
                    </div>
                     
                    <button
                        className="text-white bg-[#24242D] px-2 rounded-md"
                        onClick={handleCloseDraftTraining}
                    >
                        <X className='text-white' />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className='bg-[#24242D]'>
                        <tr className="h-[48px]">
                            <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                            <th className="px-2 text-left add-manual-theads">Training Title</th>
                            <th className="px-2 text-left add-manual-theads">Type</th>
                            <th className="px-2 text-left add-manual-theads">Venue</th>
                            <th className="px-2 text-left add-manual-theads">Date Planned</th>
                            <th className="px-2 text-left add-manual-theads">Action</th>
                            <th className="px-2 text-center add-manual-theads">View</th>
                            <th className="pr-2 text-center add-manual-theads">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrainings.length > 0 ? (
                            filteredTrainings.map((training, index) => (
                                <tr key={training.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                    <td className="pl-5 pr-2 add-manual-datas">{indexOfFirstItem + index + 1}</td>
                                    <td className="px-2 add-manual-datas">{training.training_title || 'Untitled'}</td>
                                    <td className="px-2 add-manual-datas">{training.type_of_training || 'N/A'}</td>
                                    <td className="px-2 add-manual-datas">{training.venue || 'N/A'}</td>
                                    <td className="px-2 add-manual-datas">{formatDate(training.date_planned)}</td>
                                    <td className="px-2 add-manual-datas !text-left !text-[#1E84AF]">
                                        <button onClick={() => handleQmsEditDraftTraining(training.id)}>
                                           Click to Continue
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleQmsViewDraftTraining(training.id)}>
                                            <img src={viewIcon} alt="View Icon" style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(32%) saturate(4%) hue-rotate(53deg) brightness(94%) contrast(86%)' }} />
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleDeleteTraining(training.id)}>
                                            <img src={deleteIcon} alt="Delete Icon" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="border-b border-[#383840] h-[50px]">
                                <td colSpan="8" className="text-center add-manual-datas">No draft trainings found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredTrainings.length > 0 && (
                <div className="flex justify-between items-center mt-6 text-sm">
                    <div className='text-white total-text'>Total-{totalItems}</div>
                    <div className="flex items-center gap-5">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`${currentPage === number ? 'pagin-active' : 'pagin-inactive'}`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QmsDraftListTraining;