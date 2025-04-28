import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, AlertCircle } from 'lucide-react';
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../../../../Utils/Config";

const QmsListInternalProblems = () => {
    const navigate = useNavigate();
    
    // State management
    const [internalProblems, setInternalProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    // Get user company ID from local storage
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

    // Fetch internal problems
    const fetchInternalProblems = async () => {
        setLoading(true);
        setError(null);
        try {
            const companyId = getUserCompanyId();
            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);
                return;
            }
            
            // Add parameters for filtering and pagination if needed
            const response = await axios.get(
                `${BASE_URL}/qms/internal-problems/company/${companyId}/`,
                {
                    params: {
                        search: searchTerm,
                        page: currentPage,
                        is_draft: false // Exclude drafts from main list
                    }
                }
            );
            
            // Process the response data
            if (response.data.results) {
                // If API returns paginated response
                setInternalProblems(response.data.results);
                setTotalItems(response.data.count);
                console.log("ssssssssss",response.data)
            } else {
                // If API returns simple array
                setInternalProblems(response.data);
                setTotalItems(response.data.length);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching internal problems:', error);
            setError('Failed to load internal problems. Please try again.');
            setLoading(false);
        }
    };

    // Handle search
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    // Debounce search to prevent too many API calls
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInternalProblems();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Initial fetch and page change
    useEffect(() => {
        fetchInternalProblems();
    }, [currentPage]);

    // Navigation handlers
    const handleAddInternalProblems = () => {
        navigate('/company/qms/add-internal-problem');
    };

    const handleDraftProblems = () => {
        navigate('/company/qms/draft-internal-problem');
    };

    const handleViewProblem = (id) => {
        navigate(`/company/qms/view-internal-problem/${id}`);
    };

    const handleEditProblem = (id) => {
        navigate(`/company/qms/edit-internal-problem/${id}`);
    };

    // Delete handlers
    const openDeleteModal = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteProblem = async () => {
        if (!itemToDelete) return;
        
        try {
            await axios.delete(`${BASE_URL}/qms/internal-problems/${itemToDelete}/`);
            setDeleteModalOpen(false);
            setItemToDelete(null);
            fetchInternalProblems(); // Refresh the list
        } catch (error) {
            console.error('Error deleting internal problem:', error);
            setError('Failed to delete internal problem. Please try again.');
        }
    };

    // Pagination
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Component for delete confirmation modal
    const DeleteConfirmationModal = () => {
        if (!deleteModalOpen) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#1C1C24] p-6 rounded-lg max-w-md w-full">
                    <div className="flex items-center mb-4 text-red-500">
                        <AlertCircle className="mr-2" />
                        <h2 className="text-lg font-medium">Confirm Deletion</h2>
                    </div>
                    <p className="mb-6">Are you sure you want to delete this internal problem? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4">
                        <button 
                            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 transition"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
                            onClick={handleDeleteProblem}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {/* Error notification */}
            {error && (
                <div className="bg-red-500 text-white p-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            {/* Delete confirmation modal */}
            <DeleteConfirmationModal />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-manual-head">Internal Problems and Observations</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="serach-input-manual focus:outline-none bg-transparent"
                        />
                        <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                            <Search size={18} />
                        </div>
                    </div>
                    <button
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white !w-[100px]"
                        onClick={handleDraftProblems}
                    >
                        <span>Drafts</span>
                    </button>
                    <button
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleAddInternalProblems}
                    >
                        <span>Add Internal Problem/Observation</span>
                        <img src={plusIcon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                    </button>
                </div>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className='bg-[#24242D]'>
                            <tr className="h-[48px]">
                                <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                                <th className="px-2 text-left add-manual-theads">Description</th>
                                <th className="px-2 text-left add-manual-theads">Cause</th>
                                <th className="px-2 text-left add-manual-theads">Date Problem</th>
                                <th className="px-2 text-left add-manual-theads">CAR</th>
                                <th className="px-2 text-center add-manual-theads">Status</th>
                                <th className="px-2 text-center add-manual-theads">View</th>
                                <th className="px-2 text-center add-manual-theads">Edit</th>
                                <th className="pr-2 text-center add-manual-theads">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {internalProblems.length > 0 ? (
                                internalProblems.map((problem, index) => (
                                    <tr key={problem.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                        <td className="pl-5 pr-2 add-manual-datas">{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                                        <td className="px-2 add-manual-datas">{problem.problem ? problem.problem.substring(0, 30) + (problem.problem.length > 30 ? '...' : '') : 'N/A'}</td>
                                        <td className="px-2 add-manual-datas">{problem.cause.title || 'N/A'}</td>
                                        <td className="px-2 add-manual-datas">{formatDate(problem.date)}</td>
                                        <td className="px-2 add-manual-datas">{problem.car_no?.action_no || 'N/A'}</td>
                                        <td className="px-2 add-manual-datas !text-center">
                                            <span className={`inline-block rounded-[4px] px-[6px] py-[3px] text-xs ${
                                                problem.solve_after_action === 'Yes' ? 'bg-[#36DDAE11] text-[#36DDAE]' : 'bg-[#dd363611] text-[#dd3636]'
                                            }`}>
                                                {problem.solve_after_action === 'Yes' ? 'Solved' : 'Not Solved'}
                                            </span>
                                        </td>
                                        <td className="px-2 add-manual-datas !text-center">
                                            <button onClick={() => handleViewProblem(problem.id)}>
                                                <img src={viewIcon} alt="View Icon" style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(32%) saturate(4%) hue-rotate(53deg) brightness(94%) contrast(86%)' }} />
                                            </button>
                                        </td>
                                        <td className="px-2 add-manual-datas !text-center">
                                            <button onClick={() => handleEditProblem(problem.id)}>
                                                <img src={editIcon} alt="Edit Icon" />
                                            </button>
                                        </td>
                                        <td className="px-2 add-manual-datas !text-center">
                                            <button onClick={() => openDeleteModal(problem.id)}>
                                                <img src={deleteIcon} alt="Delete Icon" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b border-[#383840]">
                                    <td colSpan="9" className="py-4 text-center text-gray-400">
                                        No internal problems found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 0 && (
                <div className="flex justify-between items-center mt-6 text-sm">
                    <div className='text-white total-text'>Total - {totalItems}</div>
                    <div className="flex items-center gap-5">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                        >
                            Previous
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Show at most 5 page numbers centered around the current page
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else {
                                let start = Math.max(1, currentPage - 2);
                                let end = Math.min(totalPages, currentPage + 2);
                                
                                // Adjust start and end if needed
                                if (end - start < 4) {
                                    if (start === 1) {
                                        end = Math.min(5, totalPages);
                                    } else {
                                        start = Math.max(1, end - 4);
                                    }
                                }
                                
                                pageNum = start + i;
                                if (pageNum > end) return null;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => paginate(pageNum)}
                                    className={`${currentPage === pageNum ? 'pagin-active' : 'pagin-inactive'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        }).filter(Boolean)}

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

export default QmsListInternalProblems;