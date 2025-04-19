import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import deletes from '../../../../assets/images/Company Documentation/delete.svg';
import view from '../../../../assets/images/Company Documentation/view.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import QmsDeleteComplinaceConfirmModal from './Modals/QmsDeleteComplinaceConfirmModal';
import QmsDeleteComplianceSuccessModal from './Modals/QmsDeleteComplianceSuccessModal';
import QmsDeleteComplianceErrorModal from './Modals/QmsDeleteComplianceErrorModal';


const QmsDraftCompliance = ({ userId }) => {
    // State for data management
    const [complianceData, setComplianceData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [complianceToDelete, setComplianceToDelete] = useState(null);
    const [showDeleteComplianceSuccessModal, setShowDeleteComplianceSuccessModal] = useState(false);
    const [showDeleteComplianceErrorModal, setShowDeleteComplianceErrorModal] = useState(false);



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
    // Check the API response structure in your browser's dev tools
    useEffect(() => {
        const fetchData = async () => {
            try {
                const id = getRelevantUserId();
                console.log("Fetching data for ID:", id); // Debug log
                const response = await axios.get(`${BASE_URL}/qms/compliance-draft/${id}/`);
                console.log("API Response:", response.data); // Debug log

                const data = response.data;
                if (Array.isArray(data)) {
                    // Transform the data to match your frontend's expected structure
                    const formattedData = data.map(item => ({
                        id: item.id,
                        title: item.compliance_name || "Untitled",
                        complianceNo: item.compliance_no || "N/A",
                        complianceType: item.compliance_type || "N/A",
                        revision: item.rivision || "N/A",
                        date: item.date ? formatDate(item.date) : "N/A"
                    }));
                    setComplianceData(formattedData);
                } else if (data?.data && Array.isArray(data.data)) {
                    // Handle nested data structure
                    const formattedData = data.data.map(item => ({
                        id: item.id,
                        title: item.compliance_name || "Untitled",
                        complianceNo: item.compliance_no || "N/A",
                        complianceType: item.compliance_type || "N/A",
                        revision: item.rivision || "N/A",
                        date: item.date ? formatDate(item.date) : "N/A"
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
    }, [userId]);

    // Format date from YYYY-MM-DD to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
        } catch (error) {
            return dateString;
        }
    };

    const handleClose = () => {
        navigate('/company/qms/list-compliance');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleEditCompliance = (id) => {
        navigate(`/company/qms/edit-draft-compliance/${id}`);
    };

    const handleViewCompliance = (id) => {
        navigate(`/company/qms/view-draft-compliance/${id}`);
    };

    // Updated to use modals
    const initiateDelete = (id) => {
        setComplianceToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${BASE_URL}/qms/compliances-get/${complianceToDelete}/`);
            setShowDeleteModal(false);
            setShowDeleteComplianceSuccessModal(true);
            setTimeout(() => {
                setShowDeleteComplianceSuccessModal(false);
            }, 2000);
            setComplianceData(complianceData.filter(item => item.id !== complianceToDelete));
        } catch (err) {
            console.error("Error deleting compliance:", err);
            setShowDeleteModal(false);
            setShowDeleteComplianceErrorModal(true);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setComplianceToDelete(null);
    };

    // Filter and pagination
    const filteredData = complianceData.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.complianceNo && item.complianceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.revision && item.revision.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.complianceType && item.complianceType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="list-compliance-head">Draft Compliance</h1>
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

                {loading ? (
                    <div className="text-center py-8">Loading compliance data...</div>
                ) : error ? (
                    <div className="text-center text-red-400 py-8">{error}</div>
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
                                        <th className="px-4 qms-list-compliance-thead text-left">Action</th>
                                        <th className="px-4 qms-list-compliance-thead text-center">View</th>
                                        <th className="px-4 qms-list-compliance-thead text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length === 0 ? (
                                        <tr className="border-b border-[#383840]">
                                            <td colSpan="9" className="px-4 py-4 text-center not-found">
                                                No draft compliances found
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((item, index) => (
                                            <tr key={item.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px]">
                                                <td className="px-4 qms-list-compliance-data">{indexOfFirstItem + index + 1}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.title}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.complianceNo}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.complianceType}</td>
                                                <td className="px-4 qms-list-compliance-data">{item.revision}
                                                </td>
                                                <td className="px-4 qms-list-compliance-data">{item.date}</td>
                                                <td className="px-4 qms-list-compliance-data text-left">
                                                    <button
                                                        onClick={() => handleEditCompliance(item.id)}
                                                        className='text-[#1E84AF] cursor-pointer'
                                                    >
                                                        Click to Continue
                                                    </button>
                                                </td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button
                                                        onClick={() => handleViewCompliance(item.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
                                                    </button>
                                                </td>
                                                <td className="px-4 qms-list-compliance-data text-center">
                                                    <button
                                                        onClick={() => initiateDelete(item.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <img src={deletes} alt="Delete icon" className='w-[16px] h-[16px]' />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
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

export default QmsDraftCompliance;