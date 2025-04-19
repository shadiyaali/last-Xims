import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import deletes from '../../../../assets/images/Company Documentation/delete.svg';
import view from '../../../../assets/images/Company Documentation/view.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import QmsDeleteConfirmLegalModal from "./Modals/QmsDeleteConfirmLegalModal"
import QmsDeleteLegalSuccessModal from './Modals/QmsDeleteLegalSuccessModal';
import QmsDeleteLegalErrorModal from './Modals/QmsDeleteLegalErrorModal';

const QmsDraftLegalRequirements = () => {
    // State for form data management
    const [complianceData, setComplianceData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [itemsPerPage] = useState(10);
    const navigate = useNavigate();

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [requirementsToDelete, setRequirementsToDelete] = useState(null);
    const [showDeleteLegalSuccessModal, setShowDeleteLegalSuccessModal] = useState(false);
    const [showDeleteLegalErrorModal, setShowDeleteLegalErrorModal] = useState(false);

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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const id = getRelevantUserId();
                console.log("Fetching data for ID:", id); // Debug log

                if (!id) {
                    setError("User ID or Company ID not found");
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${BASE_URL}/qms/legal-draft/${id}/`);
                console.log("API Response:", response.data); // Debug log

                const data = response.data;
                if (Array.isArray(data)) {

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
                    setComplianceData(formattedData);
                } else if (data?.data && Array.isArray(data.data)) {
                    // Handle nested data structure
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
                    setComplianceData(formattedData);
                } else {
                    console.error("Unexpected data format:", data);
                    setComplianceData([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch draft compliance:", error);
                setError("Failed to load compliance data. Please try again.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleClose = () => {
        navigate('/company/qms/list-legal-requirements');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleEditDraftLegalRequirements = (id) => {
        navigate(`/company/qms/edit-draft-legal-requirements/${id}`);
    };

    const handleViewDraftLegalRequirements = (id) => {
        navigate(`/company/qms/view-draft-legal-requirements/${id}`);
    };

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
            setComplianceData(complianceData.filter(item => item.id !== requirementsToDelete));
            setShowDeleteModal(false);
            setShowDeleteLegalSuccessModal(true);
            setTimeout(() => {
                setShowDeleteLegalSuccessModal(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to delete item:", error);
            setShowDeleteModal(false);
            
            setShowDeleteLegalErrorModal(true);
        }
    };

    // Filter and pagination
    const filteredData = complianceData.filter(item =>
        (item.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.complianceNo?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.revision?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (loading) return <div className="bg-[#1C1C24] text-white p-5 rounded-lg">Loading...</div>;
    if (error) return <div className="bg-[#1C1C24] text-white p-5 rounded-lg">Error: {error}</div>;

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="list-compliance-head">Draft Legal and Other Requirements</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="serach-input-manual focus:outline-none bg-transparent !w-[361px]"
                            />
                            <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                                <Search size={18} />
                            </div>
                        </div>
                        <button onClick={handleClose} className="bg-[#24242D] p-2 rounded-md">
                            <X className="text-white" />
                        </button>
                    </div>
                </div>

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
                                    <th className="px-4 qms-list-compliance-thead text-left">Action</th>
                                    <th className="px-4 qms-list-compliance-thead text-center">View</th>
                                    <th className="px-4 qms-list-compliance-thead text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((item, index) => (
                                        <tr key={item.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                            <td className="px-4 qms-list-compliance-data">{indexOfFirstItem + index + 1}</td>
                                            <td className="px-4 qms-list-compliance-data">{item.title}</td>
                                            <td className="px-4 qms-list-compliance-data">{item.legalNo}</td>
                                            <td className="px-4 qms-list-compliance-data">{item.documentType}</td>
                                            <td className="px-4 qms-list-compliance-data">
                                                <span className="text-[#1E84AF]">{item.revision}</span>
                                            </td>
                                            <td className="px-4 qms-list-compliance-data">{item.date}</td>
                                            <td className="px-4 qms-list-compliance-data text-left">
                                                <button
                                                    onClick={() => handleEditDraftLegalRequirements(item.id)}
                                                    className='text-[#1E84AF]'
                                                >
                                                    Click to Continue
                                                </button>
                                            </td>
                                            <td className="px-4 qms-list-compliance-data text-center">
                                                <button
                                                    onClick={() => handleViewDraftLegalRequirements(item.id)}
                                                >
                                                    <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
                                                </button>
                                            </td>
                                            <td className="px-4 qms-list-compliance-data text-center">
                                                <button
                                                    onClick={() => openDeleteModal(item.id)}
                                                >
                                                    <img src={deletes} alt="Delete icon" className='w-[16px] h-[16px]' />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="border-b border-[#383840]">
                                        <td colSpan="9" className="px-4 py-3 text-center not-found">No Legal Requirements Found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 pt-3 flex items-center justify-between">
                        <div className="text-white total-text">
                            Total-{filteredData.length}
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

export default QmsDraftLegalRequirements;