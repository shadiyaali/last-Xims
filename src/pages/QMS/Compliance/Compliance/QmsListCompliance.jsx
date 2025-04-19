import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import plusIcon from '../../../../assets/images/Company Documentation/plus icon.svg';
import editIcon from '../../../../assets/images/Company Documentation/edit.svg';
import deleteIcon from '../../../../assets/images/Company Documentation/delete.svg';
import viewIcon from '../../../../assets/images/Company Documentation/view.svg';
import axios from 'axios';
import "./qmslistcompliance.css";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../../../../Utils/Config";
import QmsDeleteComplinaceConfirmModal from './Modals/QmsDeleteComplinaceConfirmModal';
import QmsDeleteComplianceSuccessModal from './Modals/QmsDeleteComplianceSuccessModal';
import QmsDeleteComplianceErrorModal from './Modals/QmsDeleteComplianceErrorModal';

const QmsListCompliance = () => {

    const [complianceData, setComplianceData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [draftCount, setDraftCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [complianceToDelete, setComplianceToDelete] = useState(null);
    const [showDeleteComplianceSuccessModal, setShowDeleteComplianceSuccessModal] = useState(false);
    const [showDeleteComplianceErrorModal, setShowDeleteComplianceErrorModal] = useState(false);

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
        const fetchComplianceData = async () => {
            setIsLoading(true);
            try {
                const companyId = getUserCompanyId();
                const response = await axios.get(`${BASE_URL}/qms/compliance/${companyId}/`);
                const formattedData = response.data.map(item => ({
                    id: item.id,
                    title: item.compliance_name,
                    complianceNo: item.compliance_no,
                    revision: item.rivision,
                    date: formatDate(item.date),
                    complianceType: item.compliance_type,
                    isDraft: item.is_draft
                }));
                setComplianceData(formattedData);
                setError(null);
            } catch (err) {
                setError('Failed to load compliance data');
                console.error('Error fetching compliance data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplianceData();
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
            const draftResponse = await axios.get(`${BASE_URL}/qms/compliance/drafts-count/${id}/`);
            setDraftCount(draftResponse.data.count);
            console.log('Compliance Draft Count:', draftResponse.data.count);

        } catch (err) {
            console.error("Error fetching draft count:", err);
            setDraftCount(0);
        }
    };

    useEffect(() => {
        fetchDraftCount();
    }, []);

    // Format date from YYYY-MM-DD to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDraftCompliance = () => {
        navigate('/company/qms/draft-compliance');
    };

    const handleAddCompliance = () => {
        navigate('/company/qms/add-compliance');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleEditCompliance = (id) => {
        navigate(`/company/qms/edit-compliance/${id}`);
    };

    const handleViewCompliance = (id) => {
        navigate(`/company/qms/view-compliance/${id}`);
    };

    // Updated to use modals
    const initiateDelete = (id) => {
        setComplianceToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${BASE_URL}/qms/compliances-get/${complianceToDelete}/`);
            setComplianceData(complianceData.filter(item => item.id !== complianceToDelete));
            setShowDeleteModal(false);
            setShowDeleteComplianceSuccessModal(true);
            setTimeout(() => {
                setShowDeleteComplianceSuccessModal(false);
            }, 2000);
            fetchDraftCount();
        } catch (err) {
            console.error('Error deleting compliance:', err);
            setShowDeleteModal(false);
            setShowDeleteComplianceErrorModal(true);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setComplianceToDelete(null);
    };

    // Filter by search query
    const filteredData = complianceData.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complianceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.revision?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complianceType?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter published compliances (non-drafts)
    const publishedCompliances = filteredData.filter(item => !item.isDraft);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = publishedCompliances.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(publishedCompliances.length / itemsPerPage);

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="list-compliance-head">List Compliance</h1>
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
                        <button
                            className="flex items-center justify-center !px-5 add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                            onClick={handleDraftCompliance}
                        >
                            <span>Drafts</span>
                            {draftCount > 0 && (
                                <span className="bg-red-500 text-white rounded-full text-xs flex justify-center items-center w-[20px] h-[20px] absolute top-[115px] right-[200px]">
                                    {draftCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                            onClick={handleAddCompliance}
                        >
                            <span>Add Compliance</span>
                            <img src={plusIcon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">Loading compliance data...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                    <div className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className='bg-[#24242D]'>
                                    <tr className="h-[48px]">
                                        <th className="px-4 qms-list-compliance-thead text-left w-24">No</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Title</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Compliance No</th>
                                        <th className="px-4 qms-list-compliance-thead text-left">Type</th>
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
                                                <td className="px-4 qms-list-compliance-data">{item.complianceNo || 'N/A'}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.complianceType || 'N/A'}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.revision || 'N/A'}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.date}</td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button onClick={() => handleViewCompliance(item.id)}>
                                                        <img src={viewIcon} alt="View Icon" className='w-[16px] h-[16px]' />
                                                    </button>
                                                </td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button onClick={() => handleEditCompliance(item.id)}>
                                                        <img src={editIcon} alt="Edit icon" className='w-[16px] h-[16px]' />
                                                    </button>
                                                </td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button onClick={() => initiateDelete(item.id)}>
                                                        <img src={deleteIcon} alt="Delete icon" className='w-[16px] h-[16px]' />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-4 py-8 text-center not-found">No compliance data found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 pt-3 flex items-center justify-between">
                            <div className="text-white total-text">
                                Total-{publishedCompliances.length}
                            </div>
                            {totalPages > 0 && (
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
                                        disabled={currentPage === totalPages}
                                        className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
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
            <QmsDeleteComplinaceConfirmModal
                showDeleteModal={showDeleteModal}
                onConfirm={handleDelete}
                onCancel={handleCancelDelete}
            />

            {/* Success Modal */}
            <QmsDeleteComplianceSuccessModal
                showDeleteComplianceSuccessModal={showDeleteComplianceSuccessModal}
                onClose={() => setShowDeleteComplianceSuccessModal(false)}
            />

            {/* Error Modal */}
            <QmsDeleteComplianceErrorModal
                showDeleteComplianceErrorModal={showDeleteComplianceErrorModal}
                onClose={() => setShowDeleteComplianceErrorModal(false)}
            />
        </div>
    );
};

export default QmsListCompliance;