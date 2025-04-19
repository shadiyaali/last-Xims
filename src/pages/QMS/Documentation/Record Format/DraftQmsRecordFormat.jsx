import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import views from "../../../../assets/images/Companies/view.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import DeleteQmsManualDraftConfirmModal from './Modals/DeleteQmsManualDraftConfirmModal';
import DeleteQmsManualDraftSucessModal from './Modals/DeleteQmsManualDraftSucessModal';
import DeleteQmsManualDraftErrorModal from './Modals/DeleteQmsManualDraftErrorModal';

const DraftQmsRecordFormat = () => {
    const [manuals, setManuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const manualPerPage = 10;

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [manualToDelete, setManualToDelete] = useState(null);
    const [showDeleteDraftManualSuccessModal, setShowDeleteDraftManualSuccessModal] = useState(false);
    const [showDeleteDraftManualErrorModal, setShowDeleteDraftManualErrorModal] = useState(false);

    const handleDeleteClick = (id) => {
        setManualToDelete(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (manualToDelete) {
            axios
                .delete(`${BASE_URL}/qms/record-detail/${manualToDelete}/`)
                .then((response) => {
                    // Remove the deleted manual from state
                    setManuals(manuals.filter((manual) => manual.id !== manualToDelete));
                    setShowDeleteDraftManualSuccessModal(true);
                    setTimeout(() => {
                        setShowDeleteDraftManualSuccessModal(false);
                    }, 3000);
                    console.log("Manual deleted successfully:", response.data);
                })
                .catch((error) => {
                    setShowDeleteDraftManualErrorModal(true);
                    setTimeout(() => {
                        setShowDeleteDraftManualErrorModal(false);
                    }, 3000);
                    console.error("Error deleting manual:", error);
                });
        }
        setShowDeleteModal(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };
    const handleEditDraft = (id) => {

        navigate(`/company/qms/editrecordformat/${id}`);
    }
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
    const companyId = getUserCompanyId();
    console.log("Stored Company ID:", companyId);

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

    const fetchManuals = async () => {
        try {
            setLoading(true);
            const id = getRelevantUserId();
            const response = await axios.get(`${BASE_URL}/qms/record-draft/${id}/`);
            setManuals(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching procedures:", err);
            setError("Failed to load record format. Please try again.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManuals();
    }, []);

    const filteredManual = manuals.filter(manual =>
        (manual.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (manual.no?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (manual.approved_by?.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (manual.rivision?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (formatDate(manual.date)?.replace(/^0+/, '') || '').includes(searchQuery.replace(/^0+/, ''))
    );
    const totalPages = Math.ceil(filteredManual.length / manualPerPage);
    const paginatedManual = filteredManual.slice((currentPage - 1) * manualPerPage, currentPage * manualPerPage);
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };
    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };
    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };
    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };
    const handleCloseManualDraft = () => {
        navigate('/company/qms/record-format');
    };
    const handleView = (id) => {
        navigate(`/company/qms/viewrecordformat/${id}`);
    };
    return (
        <div className="bg-[#1C1C24] list-manual-main">
            {/* Header section - kept the same */}
            <div className="flex items-center justify-between px-[14px] pt-[24px]">
                <h1 className="list-manual-head">Draft Record Formats</h1>

                <DeleteQmsManualDraftConfirmModal
                    showDeleteModal={showDeleteModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
                <DeleteQmsManualDraftSucessModal
                    showDeleteDraftManualSuccessModal={showDeleteDraftManualSuccessModal}
                    onClose={() => setShowDeleteDraftManualSuccessModal(false)}
                />
                <DeleteQmsManualDraftErrorModal
                    showDeleteDraftManualErrorModal={showDeleteDraftManualErrorModal}
                    onClose={() => setShowDeleteDraftManualErrorModal(false)}
                />


                <div className="flex space-x-5 items-center">
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
                        className="text-white bg-[#24242D] p-1 rounded-md"
                        onClick={handleCloseManualDraft}
                    >
                        <X className='text-white' />
                    </button>
                </div>
            </div>
            {/* Table section with updated columns */}
            <div className="p-5 overflow-hidden">
                {loading ? (
                    <div className="text-center py-4 text-white">Loading manuals...</div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500">{error}</div>
                ) : (
                    <table className="w-full">
                        <thead className='bg-[#24242D]'>
                            <tr className="h-[48px]">
                                <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                                <th className="px-2 text-left add-manual-theads">Record Title</th>
                                <th className="px-2 text-left add-manual-theads">Record No</th>
                                <th className="px-2 text-left add-manual-theads">Approved by</th>
                                <th className="px-2 text-left add-manual-theads">Revision</th>
                                <th className="px-2 text-left add-manual-theads">Date</th>
                                <th className="px-2 text-left add-manual-theads">Action</th>
                                <th className="px-2 text-center add-manual-theads">View</th>
                                <th className="pl-2 pr-4 text-center add-manual-theads">Delete</th>
                            </tr>
                        </thead>
                        <tbody key={currentPage}>
                            {paginatedManual.length > 0 ? (
                                paginatedManual.map((manual, index) => (
                                    <tr key={manual.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[46px]">
                                        <td className="pl-5 pr-2 add-manual-datas">{(currentPage - 1) * manualPerPage + index + 1}</td>
                                        <td className="px-2 add-manual-datas">{manual.title || 'N/A'}</td>
                                        <td className="px-2 add-manual-datas">{manual.no || 'N/A'}</td>
                                        <td className="px-2 add-manual-datas">
                                            {manual.approved_by ?
                                                `${manual.approved_by.first_name} ${manual.approved_by.last_name}` :
                                                'N/A'}
                                        </td>
                                        <td className="px-2 add-manual-datas">{manual.rivision || 'N/A'}</td>
                                        <td className="px-2 add-manual-datas">{formatDate(manual.date)}</td>
                                        <td className='px-2 add-manual-datas'>
                                            <button className='text-[#1E84AF]'

                                                onClick={() => handleEditDraft(manual.id)}
                                            >
                                                Click to Continue
                                            </button>
                                        </td>
                                        <td className="px-2 add-manual-datas text-center">
                                            <button
                                                onClick={() => handleView(manual.id)}
                                                title="View"
                                            >
                                                <img src={views} alt="" />
                                            </button>
                                        </td>
                                        <td className="pl-2 pr-4 add-manual-datas text-center">
                                            <button
                                                onClick={() => handleDeleteClick(manual.id)}
                                                title="Delete"
                                            >
                                                <img src={deletes} alt="" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="11" className="text-center py-4 not-found">No Manuals found.</td></tr>
                            )}
                            {/* Pagination row - kept the same */}
                            <tr>
                                <td colSpan="11" className="pt-[15px] border-t border-[#383840]">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="text-white total-text">Total-{filteredManual.length}</div>
                                        <div className="flex items-center gap-5">
                                            <button
                                                onClick={handlePrevious}
                                                disabled={currentPage === 1}
                                                className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                                            >
                                                Previous
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageClick(page)}
                                                    className={`${currentPage === page ? 'pagin-active' : 'pagin-inactive'}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={handleNext}
                                                disabled={currentPage === totalPages || totalPages === 0}
                                                className={`cursor-pointer swipe-text ${currentPage === totalPages || totalPages === 0 ? 'opacity-50' : ''}`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    );
};
export default DraftQmsRecordFormat
