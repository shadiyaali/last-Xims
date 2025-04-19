import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import plusicon from "../../../../assets/images/Company Documentation/plus icon.svg";
import views from "../../../../assets/images/Companies/view.svg";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import publish from "../../../../assets/images/Modal/publish.svg"
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import DeleteQmsManualConfirmModal from './Modals/DeleteQmsManualConfirmModal';
import DeleteQmsManualsuccessModal from './Modals/DeleteQmsManualsuccessModal';
import DeleteQmsManualErrorModal from './Modals/DeleteQmsManualErrorModal';
import PublishSuccessModal from './Modals/PublishSuccessModal';
import PublishErrorModal from './Modals/PublishErrorModal';

const QmsListSustainability = () => {
    const [manuals, setManuals] = useState([]);
    const [draftCount, setDraftCount] = useState(0);
    const [corrections, setCorrections] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const manualPerPage = 10;

    const [showPublishModal, setShowPublishModal] = useState(false);
    const [selectedManualId, setSelectedManualId] = useState(null);
    const [sendNotification, setSendNotification] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [manualToDelete, setManualToDelete] = useState(null);
    const [showDeleteManualSuccessModal, setShowDeleteManualSuccessModal] = useState(false);
    const [showDeleteManualErrorModal, setShowDeleteManualErrorModal] = useState(false);

    const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
    const [showPublishErrorModal, setShowPublishErrorModal] = useState(false);


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    const getCurrentUser = () => {
        const role = localStorage.getItem('role');
        console.log("Current role from localStorage:", role);

        try {
            if (role === 'company') {
                // Retrieve company user data
                const companyData = {};
                Object.keys(localStorage)
                    .filter(key => key.startsWith('company_'))
                    .forEach(key => {
                        const cleanKey = key.replace('company_', '');
                        try {
                            companyData[cleanKey] = JSON.parse(localStorage.getItem(key));
                        } catch (e) {
                            companyData[cleanKey] = localStorage.getItem(key);
                        }
                    });

                // Add additional fields from localStorage
                companyData.role = role;
                companyData.company_id = localStorage.getItem('company_id');
                companyData.company_name = localStorage.getItem('company_name');
                companyData.email_address = localStorage.getItem('email_address');

                console.log("Company User Data:", companyData);
                return companyData;
            } else if (role === 'user') {
                // Retrieve regular user data
                const userData = {};
                Object.keys(localStorage)
                    .filter(key => key.startsWith('user_'))
                    .forEach(key => {
                        const cleanKey = key.replace('user_', '');
                        try {
                            userData[cleanKey] = JSON.parse(localStorage.getItem(key));
                        } catch (e) {
                            userData[cleanKey] = localStorage.getItem(key);
                        }
                    });

                // Add additional fields from localStorage
                userData.role = role;
                userData.user_id = localStorage.getItem('user_id');
                
                // DEBUG: Log all localStorage items to see what's available
                console.log("All localStorage items:");
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    console.log(`${key}: ${localStorage.getItem(key)}`);
                }

                console.log("Regular User Data:", userData);
                return userData;
            }
        } catch (error) {
            console.error("Error retrieving user data:", error);
            return null;
        }
    };

    const getUserCompanyId = () => {
        const role = localStorage.getItem("role");
        console.log("Getting company ID for role:", role);

        if (role === "company") {
            const companyId = localStorage.getItem("company_id");
            console.log("Company ID from localStorage:", companyId);
            return companyId;
        } else if (role === "user") {
            try {
                const userCompanyId = localStorage.getItem("user_company_id");
                const parsedId = userCompanyId ? JSON.parse(userCompanyId) : null;
                console.log("User company ID from localStorage:", userCompanyId);
                console.log("Parsed user company ID:", parsedId);
                return parsedId;
            } catch (e) {
                console.error("Error parsing user company ID:", e);
                return null;
            }
        }

        return null;
    };

    // Centralized function to check if current user is involved with a manual
    const isUserInvolvedWithManual = (manual) => {
        const currentUserId = Number(localStorage.getItem('user_id'));
        
        console.log("Checking involvement for manual:", manual.id);
        console.log("Current user ID:", currentUserId);
        console.log("Written by:", manual.written_by?.id);
        console.log("Checked by:", manual.checked_by?.id);
        console.log("Approved by:", manual.approved_by?.id);

        // Check if user is the writer, checker, or approver of the manual
        const isInvolved = (
            (manual.written_by && manual.written_by.id === currentUserId) ||
            (manual.checked_by && manual.checked_by.id === currentUserId) ||
            (manual.approved_by && manual.approved_by.id === currentUserId)
        );
        
        console.log("Is user involved:", isInvolved);
        return isInvolved;
    };

    // Centralized function to filter manuals based on visibility rules
    const filterManualsByVisibility = (manualsData) => {
        const role = localStorage.getItem('role');
        console.log("Filtering manuals by visibility for role:", role);
        console.log("Total manuals before filtering:", manualsData.length);

        const filteredManuals = manualsData.filter(manual => {
            console.log("Evaluating manual:", manual);
            console.log("Manual status:", manual.status);
            
            // If manual is published, show to everyone
            if (manual.status === 'Publish') {
                console.log("Manual is published, showing to everyone");
                return true;
            }

            // If user is a company admin, show all
            if (role === 'company') {
                console.log("User is company admin, showing all manuals");
                return true;
            }

            // For other statuses, only show if user is involved with the manual
            const involved = isUserInvolvedWithManual(manual);
            console.log("Manual visibility decision for regular user:", involved);
            return involved;
        });

        console.log("Manuals after filtering:", filteredManuals.length);
        return filteredManuals;
    };

    // Fetch manuals using the centralized filter function
    const fetchManuals = async () => {
        try {
            setLoading(true);
            const companyId = getUserCompanyId();
            console.log("Fetching manuals for company ID:", companyId);
            
            const response = await axios.get(`${BASE_URL}/qms/sustainability/${companyId}/`);
            console.log("Raw API response:", response.data);

            // Apply visibility filtering
            const filteredManuals = filterManualsByVisibility(response.data);

            // Sort manuals by creation date (newest first)
            const sortedManuals = filteredManuals.sort((a, b) => {
                // Use created_at if available, otherwise fall back to date field
                const dateA = new Date(a.created_at || a.date || 0);
                const dateB = new Date(b.created_at || b.date || 0);
                return dateB - dateA; // Descending order (newest first)
            });

            setManuals(sortedManuals);
            console.log("Filtered and Sorted Manuals Data:", sortedManuals);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching manuals:", err);
            setError("Failed to load record format. Please try again.");
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch all required data in a single useEffect
        const fetchAllData = async () => {
            try {
                // First, fetch manuals
                const companyId = getUserCompanyId();
                console.log("Fetching manuals for company ID:", companyId);
                
                const manualsResponse = await axios.get(`${BASE_URL}/qms/sustainability/${companyId}/`);
                console.log("Raw manuals data from API:", manualsResponse.data);

                // Apply visibility filtering using the centralized function
                const filteredManuals = filterManualsByVisibility(manualsResponse.data);
                console.log("Filtered manuals:", filteredManuals);

                // Set filtered manuals
                setManuals(filteredManuals);

                // Then fetch corrections for visible manuals
                const correctionsPromises = filteredManuals.map(async (manual) => {
                    try {
                        console.log(`Fetching corrections for manual ID ${manual.id}`);
                        const correctionResponse = await axios.get(`${BASE_URL}/qms/sustainability/${manual.id}/corrections/`);
                        console.log(`Corrections for manual ${manual.id}:`, correctionResponse.data);
                        return { manualId: manual.id, corrections: correctionResponse.data };
                    } catch (correctionError) {
                        console.error(`Error fetching corrections for manual ${manual.id}:`, correctionError);
                        return { manualId: manual.id, corrections: [] };
                    }
                });

                // Process all corrections
                const correctionResults = await Promise.all(correctionsPromises);

                // Transform corrections into the dictionary format
                const correctionsByManual = correctionResults.reduce((acc, result) => {
                    acc[result.manualId] = result.corrections;
                    return acc;
                }, {});

                setCorrections(correctionsByManual);
                console.log("Corrections by manual:", correctionsByManual);

                // Fetch draft count
                const id = getRelevantUserId();
                console.log("Getting draft count for user ID:", id);
                const draftResponse = await axios.get(`${BASE_URL}/qms/sustainability/drafts-count/${id}/`);
                console.log("Draft count response:", draftResponse.data);
                setDraftCount(draftResponse.data.count);

                // Set current user and clear loading state
                const currentUserData = getCurrentUser();
                setCurrentUser(currentUserData);
                console.log("Set current user to:", currentUserData);
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data. Please try again.");
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const getRelevantUserId = () => {
        const userRole = localStorage.getItem("role");
        console.log("Getting relevant user ID for role:", userRole);

        if (userRole === "user") {
            const userId = localStorage.getItem("user_id");
            console.log("User ID from localStorage:", userId);
            if (userId) return userId;
        }

        const companyId = localStorage.getItem("company_id");
        console.log("Company ID from localStorage:", companyId);
        if (companyId) return companyId;

        console.log("No relevant user ID found");
        return null;
    };

    const handleClickApprove = (id) => {
        navigate(`/company/qms/view-sustainability/${id}`);
    };

    // Delete manual
    const handleDelete = (id) => {
        setManualToDelete(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (manualToDelete) {
            try {
                await axios.delete(`${BASE_URL}/qms/sustainability-detail/${manualToDelete}/`);
                setShowDeleteModal(false);
                setShowDeleteManualSuccessModal(true);
                setTimeout(() => {
                    setShowDeleteManualSuccessModal(false);
                    fetchManuals(); // Refresh the list after deletion
                }, 2000);
            } catch (err) {
                console.error("Error deleting record format:", err);
                setShowDeleteModal(false);
                setShowDeleteManualErrorModal(true);
                setTimeout(() => {
                    setShowDeleteManualErrorModal(false);
                }, 2000);
            }
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

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

    const handleQMSAddEvaluationCompliance = () => {
        navigate('/company/qms/add-sustainability');
    };

    const handleEdit = (id) => {
        navigate(`/company/qms/edit-sustainability/${id}`);
    };

    const handleView = (id) => {
        navigate(`/company/qms/view-sustainability/${id}`);
    };

    const handleManualDraft = () => {
        navigate('/company/qms/draft-sustainability')
    }

    const handlePublish = (manual) => {
        setSelectedManualId(manual.id);
        setShowPublishModal(true);
        setSendNotification(false);
    };

    const closePublishModal = () => {
        fetchManuals();
        setShowPublishModal(false);
        setIsPublishing(false); // Reset loading state when modal is closed
    };

    // Modify the handlePublishSave function to update the manual's status
    const handlePublishSave = async () => {
        try {
            if (!selectedManualId) {
                alert("No record format selected for publishing");
                return;
            }

            // Set publishing loading state to true when starting
            setIsPublishing(true);

            const userId = localStorage.getItem('user_id');
            console.log("Publishing manual with user ID:", userId);
            
            if (!userId) {
                alert("User information not found. Please log in again.");
                setIsPublishing(false); // Reset loading state on error
                return;
            }

            const companyId = getUserCompanyId();
            console.log("Publishing for company ID:", companyId);
            
            console.log("Publishing manual with ID:", selectedManualId);
            console.log("Send notification:", sendNotification);
            
            await axios.post(`${BASE_URL}/qms/sustainability/${selectedManualId}/publish-notification/`, {
                company_id: companyId,
                published_by: userId,
                send_notification: sendNotification
            });

            setShowPublishSuccessModal(true);
            setTimeout(() => {
                setShowPublishSuccessModal(false);
                closePublishModal();
                fetchManuals(); // Refresh the list
                navigate("/company/qms/list-sustainability");
                setIsPublishing(false); // Reset loading state after completion
            }, 1500);
        } catch (error) {
            console.error("Error publishing record format:", error);
            setShowPublishErrorModal(true);
            setIsPublishing(false); // Reset loading state on error
            setTimeout(() => {
                setShowPublishErrorModal(false);
            }, 3000);
        }
    };

    const canReview = (manual) => {
        const currentUserId = Number(localStorage.getItem('user_id'));
        const manualCorrections = corrections[manual.id] || [];

        console.log('Reviewing Conditions Debug:', {
            currentUserId,
            manualId: manual.id,
            checkedById: manual.checked_by?.id,
            approvedById: manual.approved_by?.id,
            status: manual.status,
            corrections: manualCorrections,
            toUserValues: manualCorrections.map(correction => correction.to_user)
        });

        if (manual.status === "Pending for Review/Checking") {
            const canCheck = currentUserId === manual.checked_by?.id;
            console.log("Can check this manual:", canCheck);
            return canCheck;
        }

        if (manual.status === "Correction Requested") {
            // Check if any correction is directed to the current user
            const canCorrect = manualCorrections.some(correction => 
                correction.to_user && correction.to_user.id === currentUserId
            );
            console.log("Can correct this manual:", canCorrect);
            return canCorrect;
        }

        if (manual.status === "Reviewed,Pending for Approval") {
            const canApprove = currentUserId === manual.approved_by?.id;
            console.log("Can approve this manual:", canApprove);
            return canApprove;
        }

        console.log("User cannot review this manual");
        return false;
    };

    return (
        <div className="bg-[#1C1C24] list-manual-main">
            <div className="flex items-center justify-between px-[14px] pt-[24px]">
                <h1 className="list-manual-head">List Sustainability</h1>

                <DeleteQmsManualConfirmModal
                    showDeleteModal={showDeleteModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
                <DeleteQmsManualsuccessModal
                    showDeleteManualSuccessModal={showDeleteManualSuccessModal}
                    onClose={() => setShowDeleteManualSuccessModal(false)}
                />
                <DeleteQmsManualErrorModal
                    showDeleteManualErrorModal={showDeleteManualErrorModal}
                    onClose={() => setShowDeleteManualErrorModal(false)}
                />
                <PublishSuccessModal
                    showPublishSuccessModal={showPublishSuccessModal}
                    onClose={() => { setShowPublishSuccessModal(false) }}
                />
                <PublishErrorModal
                    showPublishErrorModal={showPublishErrorModal}
                    onClose={() => { setShowPublishErrorModal(false) }}
                />


                <div className="flex space-x-5">
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
                        className="flex items-center justify-center add-draft-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleManualDraft}
                    >
                        <span>Drafts</span>
                        {draftCount > 0 && (
                            <span className="bg-red-500 text-white rounded-full text-xs flex justify-center items-center w-[20px] h-[20px] absolute top-[120px] right-[207px]">
                                {draftCount}
                            </span>
                        )}
                    </button>
                    <button
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleQMSAddEvaluationCompliance}
                    >
                        <span>Add Sustainability</span>
                        <img src={plusicon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                    </button>
                </div>
            </div>

            <div className="p-5 overflow-hidden">
                {loading ? (
                    <div className="text-center py-4 not-found">Loading Sustainability...</div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500">{error}</div>
                ) : (
                    <table className="w-full">
                        <thead className='bg-[#24242D]'>
                            <tr className="h-[48px]">
                                <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                                <th className="px-2 text-left add-manual-theads">Title</th>
                                <th className="px-2 text-left add-manual-theads">Compliance No</th>
                                <th className="px-2 text-left add-manual-theads">Approved by</th>
                                <th className="px-2 text-left add-manual-theads">Revision</th>
                                <th className="px-2 text-left add-manual-theads">Date</th>
                                <th className="px-2 text-left add-manual-theads">Status</th>
                                <th className="px-2 text-left add-manual-theads">Action</th>
                                <th className="px-2 text-center add-manual-theads">View</th>
                                <th className="px-2 text-center add-manual-theads">Edit</th>
                                <th className="pl-2 pr-4 text-center add-manual-theads">Delete</th>
                            </tr>
                        </thead>
                        <tbody key={currentPage}>
                            {paginatedManual.length > 0 ? (
                                paginatedManual.map((manual, index) => {
                                    const canApprove = canReview(manual);
                                    console.log(`Manual ${index} (${manual.id}): can review = ${canApprove}`);

                                    return (
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
                                            <td className="px-2 add-manual-datas">
                                                {manual.status}
                                            </td>
                                            <td className='px-2 add-manual-datas'>
                                                {manual.status === 'Pending for Publish' ? (
                                                    <button className="text-[#36DDAE]" onClick={() => handlePublish(manual)}>Click to Publish</button>
                                                ) : canApprove ? (
                                                    <button
                                                        onClick={() => handleClickApprove(manual.id)}
                                                        className="text-[#1E84AF]"
                                                    >
                                                        {manual.status === 'Pending for Review/Checking'
                                                            ? 'Review'
                                                            : (manual.status === 'Correction Requested'
                                                                ? 'Click to Approve'
                                                                : 'Click to Approve')}
                                                    </button>
                                                ) : (
                                                    <span className="text-[#858585]">Not Action Required</span>
                                                )}
                                            </td>
                                            <td className="px-2 add-manual-datas text-center">
                                                <button
                                                    onClick={() => handleView(manual.id)}
                                                    title="View"
                                                >
                                                    <img src={views} alt="" />
                                                </button>
                                            </td>
                                            <td className="px-2 add-manual-datas text-center">
                                                <button
                                                    onClick={() => handleEdit(manual.id)}
                                                    title="Edit"
                                                >
                                                    <img src={edits} alt="" />
                                                </button>
                                            </td>

                                            <td className="pl-2 pr-4 add-manual-datas text-center">
                                                <button
                                                    onClick={() => handleDelete(manual.id)}
                                                    title="Delete"
                                                >
                                                    <img src={deletes} alt="" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="11" className="text-center py-4 not-found">No Record Formats found.</td></tr>
                            )}
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
            <AnimatePresence>
                {showPublishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Overlay with animation */}
                        <motion.div
                            className="absolute inset-0 bg-black bg-opacity-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Modal with animation */}
                        <motion.div
                            className="bg-[#1C1C24] rounded-md shadow-xl w-auto h-auto relative"
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{
                                duration: 0.3,
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                        >
                            <div className="p-6">
                                <div className='flex flex-col justify-center items-center space-y-7'>
                                    <img src={publish} alt="Publish Icon" className='mt-3' />
                                    <div className='flex gap-[113px] mb-5'>
                                        <div className="flex items-center">
                                            <span className="mr-3 add-qms-manual-label">Send Notification?</span>
                                            <input
                                                type="checkbox"
                                                className="qms-manual-form-checkbox"
                                                checked={sendNotification}
                                                onChange={() => setSendNotification(!sendNotification)}
                                            />
                                        </div>
                                    </div>
                                    {/* {publishSuccess && (
                      <div className="text-green-500 mb-3">Manual published successfully!</div>
                    )} */}
                                    <div className='flex gap-5'>
                                        <button onClick={closePublishModal} className='cancel-btn duration-200 text-white'>Cancel</button>
                                        <button
                                            onClick={handlePublishSave}
                                            className='save-btn duration-200 text-white'
                                            disabled={isPublishing}
                                        >
                                            {isPublishing ? 'Publishing...' : 'Publish'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default QmsListSustainability