import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../../../../Utils/Config";

// Import assets - adjust these paths as needed
import plusIcon from '../../../../assets/images/Company Documentation/plus icon.svg';
import editIcon from '../../../../assets/images/Company Documentation/edit.svg';
import deleteIcon from '../../../../assets/images/Company Documentation/delete.svg';
import viewIcon from '../../../../assets/images/Company Documentation/view.svg';
import QmsDeleteConfirmLegalModal from './Modals/QmsDeleteConfirmLegalModal';
import QmsDeleteLegalSuccessModal from './Modals/QmsDeleteLegalSuccessModal';
import QmsDeleteLegalErrorModal from './Modals/QmsDeleteLegalErrorModal';

const QmsListLegalRequirements = () => {
    // Initial data state (empty array)
    const initialData = [];

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [requirementsToDelete, setRequirementsToDelete] = useState(null);
    const [showDeleteLegalSuccessModal, setShowDeleteLegalSuccessModal] = useState(false);
    const [showDeleteLegalErrorModal, setShowDeleteLegalErrorModal] = useState(false);

    // State management
    const [legalRequirements, setLegalRequirements] = useState(initialData);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [draftCount, setDraftCount] = useState(0);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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

    // Fetch legal requirements data
    useEffect(() => {
        const fetchLegalData = async () => {
            setIsLoading(true);
            try {
                const companyId = getUserCompanyId();
                if (!companyId) {
                    throw new Error('Company ID not found');
                }

                const response = await axios.get(`${BASE_URL}/qms/legal/${companyId}/`);

                const formattedData = response.data.map(item => ({
                    id: item.id,
                    title: item.legal_name,
                    legalNo: item.legal_no,
                    revision: item.rivision,
                    date: formatDate(item.date),
                    documentType: item.document_type,
                    attachDocument: item.attach_document,
                    relatedRecordFormat: item.related_record_format,
                    sendNotification: item.send_notification,
                    isDraft: item.is_draft
                }));

                setLegalRequirements(formattedData);
                setError(null);
            } catch (err) {
                setError('Failed to load legal requirements data');
                console.error('Error fetching legal requirements data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLegalData();
    }, []);

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

    const fetchDraftCount = async () => {
        try {
            const id = getRelevantUserId();
            const draftResponse = await axios.get(`${BASE_URL}/qms/legal/drafts-count/${id}/`);
            setDraftCount(draftResponse.data.count);
            console.log('Legal Requirements Draft Count:', draftResponse.data.count);

        } catch (err) {
            console.error("Error fetching draft count:", err);
            setDraftCount(0);
        }
    };

    useEffect(() => {
        fetchDraftCount();
    }, []);

    // Open delete confirmation modal
    const openDeleteModal = (id) => {
        setRequirementsToDelete(id);
        setShowDeleteModal(true);
    };

    // Close all modals
    const closeAllModals = () => {
        setShowDeleteModal(false);
        setShowDeleteLegalSuccessModal(false);
        setShowDeleteLegalErrorModal(false);
        setRequirementsToDelete(null);
    };

    // Handle delete confirmation
    const confirmDelete = async () => {
        if (!requirementsToDelete) return;

        try {
            await axios.delete(`${BASE_URL}/qms/legal-get/${requirementsToDelete}/`);
            setLegalRequirements(legalRequirements.filter(item => item.id !== requirementsToDelete));
            setShowDeleteModal(false);
            setShowDeleteLegalSuccessModal(true);
            setTimeout(() => {
                setShowDeleteLegalSuccessModal(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to delete legal requirement:", err);
            setShowDeleteModal(false);
       
            setShowDeleteLegalErrorModal(true);
        }
    };

    const handleAddLegalRequirements = () => {
        navigate('/company/qms/add-legal-requirements');
    };

    const handleDraftLegalRequirements = () => {
        navigate('/company/qms/draft-legal-requirements');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleEditLegalRequirements = (id) => {
        navigate(`/company/qms/edit-legal-requirements/${id}`);
    };

    const handleViewLegalRequirements = (id) => {
        navigate(`/company/qms/view-legal-requirements/${id}`);
    };

    // Filter data based on search query
    const filteredData = legalRequirements.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.legalNo && item.legalNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.revision && item.revision.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.documentType && item.documentType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="list-compliance-head">List Legal and Other Requirements</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="serach-input-manual focus:outline-none bg-transparent !w-[200px]"
                            />
                            <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                                <Search size={18} />
                            </div>
                        </div>
                        <button
                            className="flex items-center justify-center !px-5 add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                            onClick={handleDraftLegalRequirements}
                        >
                            <span>Drafts</span>
                            {draftCount > 0 && (
                                <span className="bg-red-500 text-white rounded-full text-xs flex justify-center items-center w-[20px]  h-[20px] absolute  top-[115px]  right-[315px]">
                                    {draftCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                            onClick={handleAddLegalRequirements}
                        >
                            <span>Add Legal and Other Requirements</span>
                            <img src={plusIcon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <p>Loading data...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-40 text-red-500">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className='bg-[#24242D]'>
                                    <tr className="h-[48px]">
                                        <th className="px-4 qms-list-compliance-thead text-left w-24">No</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Title</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Legal No</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Document Type</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Revision</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Date</th>
                                        <th className="px-4 qms-list-compliance-thead text-center">View</th>
                                        <th className="px-4 qms-list-compliance-thead text-center">Edit</th>
                                        <th className="px-4 qms-list-compliance-thead text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((item, index) => (
                                            <tr key={item.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                                <td className="px-4 qms-list-compliance-data">{indexOfFirstItem + index + 1}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.title || 'N/A'}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.legalNo || 'N/A'}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.documentType || 'N/A'}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.revision || 'N/A'}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.date}</td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button onClick={() => handleViewLegalRequirements(item.id)}>
                                                        <img src={viewIcon} alt="View Icon" className='w-[16px] h-[16px] mt-1' />
                                                    </button>
                                                </td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button onClick={() => handleEditLegalRequirements(item.id)}>
                                                        <img src={editIcon} alt="Edit icon" className='w-[16px] h-[16px]' />
                                                    </button>
                                                </td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button onClick={() => openDeleteModal(item.id)}>
                                                        <img src={deleteIcon} alt="Delete icon" className='w-[16px] h-[16px]' />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-4 py-4 text-center not-found">
                                                No Requirements Available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 pt-3 flex items-center justify-between">
                            <div className="text-white total-text">
                                Total: {filteredData.length}
                            </div>
                            {filteredData.length > 0 && (
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`${currentPage === pageNum ? 'pagin-active' : 'pagin-inactive'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className={`cursor-pointer swipe-text ${currentPage === totalPages || totalPages === 0 ? 'opacity-50' : ''}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <QmsDeleteConfirmLegalModal
                showDeleteModal={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={closeAllModals}
            />

            {/* Delete Success Modal */}
            <QmsDeleteLegalSuccessModal
                showDeleteLegalSuccessModal={showDeleteLegalSuccessModal}
                onClose={() => setShowDeleteLegalSuccessModal(false)}
            />

            {/* Delete Error Modal */}
            <QmsDeleteLegalErrorModal
                showDeleteLegalErrorModal={showDeleteLegalErrorModal}
                onClose={() => setShowDeleteLegalErrorModal(false)}
            />
        </div>
    );
};

export default QmsListLegalRequirements;