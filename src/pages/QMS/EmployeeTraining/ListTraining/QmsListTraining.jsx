import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { BASE_URL } from "../../../../Utils/Config";

const QmsListTraining = () => {
    // State
    const [trainings, setTrainings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    useEffect(() => {
        const fetchTrainingData = async () => {
            setIsLoading(true);
            try {
                const companyId = getUserCompanyId();
                const response = await axios.get(`${BASE_URL}/qms/training/${companyId}/`);
                const formattedData = response.data.map(item => ({
                    id: item.id,
                    title: item.training_title,
                    type: item.type_of_training,
                    venue: item.venue,
                    datePlanned: formatDate(item.date_planned),
                    status: item.status,
                    isDraft: item.is_draft
                }));
                setTrainings(formattedData);
                setError(null);
            } catch (err) {
                setError('Failed to load training data');
                console.error('Error fetching training data:', err);
                // Fallback to sample data if fetch fails
                setTrainings([
                    { id: 1, title: 'Cloud Computing', type: 'Webinar', venue: 'Online Platform', datePlanned: '03-12-2024', status: 'Completed' },
                    { id: 2, title: 'Agile Methodology', type: 'Workshop', venue: 'Meeting Room B', datePlanned: '03-12-2024', status: 'Requested' },
                    { id: 3, title: 'Cybersecurity Basics', type: 'Online', venue: 'Virtual Class', datePlanned: '03-12-2024', status: 'Completed' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrainingData();
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setSearchTerm(value);
        setCurrentPage(1);
    };

 
    const handleMarkAsCompleted = (id) => {
        navigate(`/company/qms/review-training/${id}`);
    };
    // Pagination
    const itemsPerPage = 10;
    const totalItems = trainings.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = trainings.slice(indexOfFirstItem, indexOfLastItem);

    // Search functionality
    const filteredTrainings = currentItems.filter(training =>
        training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleQmsAddTraining = () => {
        navigate('/company/qms/add-training');
    };

    const handleDraftTraining = () => {
        navigate('/company/qms/draft-training');
    };

    const handleQmsViewTraining = (id) => {
        navigate(`/company/qms/view-training/${id}`);
    };

    const handleQmsEditTraining = (id) => {
        navigate(`/company/qms/edit-training/${id}`);
    };

    // Delete training
    const handleDeleteTraining = async (id) => {
        if (window.confirm('Are you sure you want to delete this training?')) {
            try {
                await axios.delete(`${BASE_URL}/qms/training-get/${id}/`);
                setTrainings(trainings.filter(training => training.id !== id));
            } catch (err) {
                console.error('Error deleting training:', err);
                alert('Failed to delete training');
            }
        }
    };

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-manual-head">List Training</h1>
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
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white !w-[100px]"
                        onClick={handleDraftTraining}
                    >
                        <span>Drafts</span>
                    </button>
                    <button
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white !w-[140px]"
                        onClick={handleQmsAddTraining}
                    >
                        <span>Add Training</span>
                        <img src={plusIcon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                    </button>
                </div>
            </div>

            {/* Loading and Error States */}
            {isLoading && <div className="text-center py-4">Loading training data...</div>}
            {error && <div className="text-red-500 text-center py-4">{error}</div>}

            {/* Table */}
            {!isLoading && !error && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className='bg-[#24242D]'>
                            <tr className="h-[48px]">
                                <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                                <th className="px-2 text-left add-manual-theads">Training Title</th>
                                <th className="px-2 text-left add-manual-theads">Type</th>
                                <th className="px-2 text-left add-manual-theads">Venue</th>
                                <th className="px-2 text-left add-manual-theads">Date Planned</th>
                                <th className="px-2 text-center add-manual-theads">Status</th>
                                <th className="px-2 text-center add-manual-theads">Action</th>
                                <th className="px-2 text-center add-manual-theads">View</th>
                                <th className="px-2 text-center add-manual-theads">Edit</th>
                                <th className="pr-2 text-center add-manual-theads">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrainings.map((training, index) => (
                                <tr key={training.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                    <td className="pl-5 pr-2 add-manual-datas">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td className="px-2 add-manual-datas">{training.title}</td>
                                    <td className="px-2 add-manual-datas">{training.type}</td>
                                    <td className="px-2 add-manual-datas">{training.venue}</td>
                                    <td className="px-2 add-manual-datas">{training.datePlanned}</td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <span className={`inline-block rounded-[4px] px-[6px] py-[3px] text-xs ${training.status === 'Completed' ? 'bg-[#36DDAE11] text-[#36DDAE]' : 'bg-[#ddd23611] text-[#ddd236]'
                                            }`}>
                                            {training.status}
                                        </span>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        {training.status === 'Requested' ? (
                                            <button
                                                onClick={() => handleMarkAsCompleted(training.id)}
                                                className=" text-[#1E84AF] text-xs py-1 px-2 rounded  "
                                            >
                                                Mark as Completed
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">No Action Needed</span>
                                        )}
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleQmsViewTraining(training.id)}>
                                            <img
                                                src={viewIcon}
                                                alt="View Icon"
                                                style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(32%) saturate(4%) hue-rotate(53deg) brightness(94%) contrast(86%)' }}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleQmsEditTraining(training.id)}>
                                            <img src={editIcon} alt="Edit Icon" />
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleDeleteTraining(training.id)}>
                                            <img src={deleteIcon} alt="Delete Icon" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTrainings.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">No training records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && trainings.length > 0 && (
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

export default QmsListTraining;