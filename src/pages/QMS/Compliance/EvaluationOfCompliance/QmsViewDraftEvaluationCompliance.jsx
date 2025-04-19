import React, { useState, useEffect } from 'react';
import edits from "../../../../assets/images/Company Documentation/edit.svg"
import deletes from "../../../../assets/images/Company Documentation/delete.svg"
import historys from '../../../../assets/images/Company Documentation/history.svg'
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import ManualCorrectionSuccessModal from './Modals/ManualCorrectionSuccessModal';
import ManualCorrectionErrorModal from './Modals/ManualCorrectionErrorModal';
import ReviewSubmitSuccessModal from './Modals/ReviewSubmitSuccessModal';
import ReviewSubmitErrorModal from './Modals/ReviewSubmitErrorModal';

const QmsViewDraftEvaluationCompliance = () => {
const navigate = useNavigate();
    const { id } = useParams();
    const [manualDetails, setManualDetails] = useState('aa');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [corrections, setCorrections] = useState([]);
    const [highlightedCorrection, setHighlightedCorrection] = useState(null);
    const [historyCorrections, setHistoryCorrections] = useState([]);
    const [usersData, setUsersData] = useState({});

    const [showSentCorrectionSuccessModal, setShowSentCorrectionSuccessModal] = useState(false);
    const [showSentCorrectionErrorModal, setShowSentCorrectionErrorModal] = useState(false);
    const [showSubmitManualSuccessModal, setShowSubmitManualSuccessModal] = useState(false);
    const [showSubmitManualErrorModal, setShowSubmitManualErrorModal] = useState(false);

    const [correctionRequest, setCorrectionRequest] = useState({
        isOpen: false,
        text: ''
    });

    const getCurrentUser = () => {
        const role = localStorage.getItem('role');

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

        if (role === "company") {
            return localStorage.getItem("company_id");
        } else if (role === "user") {
            // Try to get company ID for user
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

    // // Fetch manual details
    const fetchManualDetails = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/qms/evaluation-detail/${id}/`);
            setManualDetails(response.data);
            console.log("Manual Detailsssssssssssss:", response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching manual details:", err);
            setError("Failed to load record format details");
            setLoading(false);
        }
    };

 

    const getViewedCorrections = () => {
        const storageKey = `viewed_corrections_${id}_${localStorage.getItem('user_id')}`;
        const viewedCorrections = localStorage.getItem(storageKey);
        return viewedCorrections ? JSON.parse(viewedCorrections) : [];
    };

    const saveViewedCorrection = (correctionId) => {
        const storageKey = `viewed_corrections_${id}_${localStorage.getItem('user_id')}`;
        const viewedCorrections = getViewedCorrections();
        if (!viewedCorrections.includes(correctionId)) {
            viewedCorrections.push(correctionId);
            localStorage.setItem(storageKey, JSON.stringify(viewedCorrections));
        }
    };

    const fetchManualCorrections = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/qms/evaluation/${id}/corrections/`);
            const allCorrections = response.data;
            console.log("Fetched Record Formats Corrections:", allCorrections);

            // Get viewed corrections for the current user
            const viewedCorrections = getViewedCorrections();

            // Store all corrections
            setCorrections(allCorrections);

            // Extract all user IDs from corrections to fetch their details
            const userIds = new Set();
            allCorrections.forEach(correction => {
                if (correction.from_user && typeof correction.from_user === 'number') 
                    userIds.add(correction.from_user);
                if (correction.to_user && typeof correction.to_user === 'number') 
                    userIds.add(correction.to_user);
            });
            
            // Fetch details for all users
           
            // Sort all corrections by created_at date (newest first)
            const sortedCorrections = [...allCorrections].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );

            // Always highlight the most recent correction regardless of who it's for
            if (sortedCorrections.length > 0) {
                const mostRecent = sortedCorrections[0];

                // Check if the current user has already viewed this correction
                if (!viewedCorrections.includes(mostRecent.id)) {
                    // Set the most recent as highlighted
                    setHighlightedCorrection(mostRecent);

                    // Display all other corrections in the history
                    setHistoryCorrections(sortedCorrections.slice(1));
                } else {
                    // If the user has already viewed the latest correction
                    // then just show all corrections in history
                    setHighlightedCorrection(null);
                    setHistoryCorrections(sortedCorrections);
                }
            } else {
                // No corrections available
                setHighlightedCorrection(null);
                setHistoryCorrections([]);
            }
        } catch (error) {
            console.error("Error fetching record format corrections:", error);
        }
    };

    useEffect(() => {
        fetchManualDetails();
        fetchManualCorrections();
    }, [id]);

    // // Get user name from ID or object
    const getUserName = (user) => {
        if (!user) return "N/A";
        
        // If user is an object with first_name and last_name
        if (typeof user === 'object' && user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        
        // If user is an ID and we have fetched data for it
        if (typeof user === 'number' && usersData[user]) {
            return `${usersData[user].first_name} ${usersData[user].last_name}`;
        }
        
        // If user is just an email string
        if (typeof user === 'string' && user.includes('@')) {
            return user;
        }
        
        // Fallback - use email if available in the correction
        if (user === highlightedCorrection?.to_user && highlightedCorrection?.to_user_email) {
            return highlightedCorrection.to_user_email;
        }
        
        // Ultimate fallback
        return `User ${user}`;
    };

 
    const handleCorrectionRequest = () => {
        setCorrectionRequest(prev => ({
            ...prev,
            isOpen: true
        }));
    };

    const handleCloseCorrectionRequest = () => {
        setCorrectionRequest({
            isOpen: false,
            text: ''
        });
    };

    const handleCloseViewPage = () => {
        navigate('/company/qms/list-evaluation-compliance')
    }

    const handleCorrectionSubmit = async () => {
        try {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                alert('User not authenticated');
                return;
            }

            const requestData = {
                manual_id: id,
                correction: correctionRequest.text,
                from_user: currentUser.user_id
            };

            console.log('Submitting correction request:', requestData);

            const response = await axios.post(`${BASE_URL}/qms/record/submit-correction/`, requestData);

            console.log('Correction response:', response.data);

            handleCloseCorrectionRequest();
            setShowSentCorrectionSuccessModal(true);

            // Clear any previously viewed corrections from localStorage to ensure
            // the new correction appears highlighted for the current user
            const storageKey = `viewed_corrections_${id}_${localStorage.getItem('user_id')}`;
            localStorage.removeItem(storageKey);

            // Refresh data immediately to get the new correction
            await fetchManualDetails();
            await fetchManualCorrections();

            setTimeout(() => {
                setShowSentCorrectionSuccessModal(false);
                // Don't navigate away - we want to show the highlighted correction
            }, 1500);

        } catch (error) {
            console.error('Error submitting correction:', error);
            setShowSentCorrectionErrorModal(true);
            setTimeout(() => {
                setShowSentCorrectionErrorModal(false);
            }, 3000);
        }
    };

    const handleMoveToHistory = () => {
        if (highlightedCorrection) {
            // Save this correction as viewed in localStorage
            saveViewedCorrection(highlightedCorrection.id);

            // Update state
            setHistoryCorrections(prev => [highlightedCorrection, ...prev]);
            setHighlightedCorrection(null);
        }
    };

    // // Format date from ISO to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    // // Format date to display how long ago the correction was made
    const formatCorrectionDate = (dateString) => {
        const date = new Date(dateString);

        // Format date as DD-MM-YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        // Format time as HH:MM am/pm
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';

        // Convert hours to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        const formattedHours = String(hours).padStart(2, '0');

        return `${day}-${month}-${year}, ${formattedHours}:${minutes} ${ampm}`;
    };
    
    const handleDeleteProcedure = (recordId) => {
        // Implement your delete functionality here
        console.log("Delete record with ID:", recordId);
        // You can add confirmation dialog and actual deletion logic
    };

    // Render loading or error states
    if (loading) return <div className="text-white">Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!manualDetails) return <div className="text-white">No manual details found</div>;

    // Check if current user can review
    const currentUserId = Number(localStorage.getItem('user_id'));
    const isCurrentUserWrittenBy = currentUserId === manualDetails.written_by?.id;

    const canReview = (() => {
        // Exclude the written_by user from requesting corrections
        if (isCurrentUserWrittenBy) {
            return false;
        }
    
        if (manualDetails.status === "Pending for Review/Checking") {
            return currentUserId === manualDetails.checked_by?.id;
        }
        
        if (manualDetails.status === "Correction Requested") {
            // Check if there are any pending corrections sent BY the current user
            const hasSentCorrections = corrections.some(correction => 
                correction.from_user?.id === currentUserId && 
                !correction.is_addressed
            );
            
            // If current user has sent corrections that aren't addressed yet,
            // they shouldn't be able to review/submit
            if (hasSentCorrections) {
                return false;
            }
            
            // Otherwise check if they are allowed to review based on the manual's current state
            return corrections.some(correction => correction.to_user?.id === currentUserId);
        }
    
        if (manualDetails.status === "Reviewed,Pending for Approval") {
            return currentUserId === manualDetails.approved_by?.id;
        }
    
        return false;
    })();
  
    const handleReviewAndSubmit = async () => {
        try {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                alert('User not authenticated');
                return;
            }

            const requestData = {
                record_id: id,
                current_user_id: currentUser.user_id
            };

            const response = await axios.post(
                `${BASE_URL}/qms/record-review/`,
                requestData
            );

            setShowSubmitManualSuccessModal(true);
            setTimeout(() => {
                setShowSubmitManualSuccessModal(false);
                navigate("/company/qms/record-format");
            }, 1500);
            fetchManualDetails();
            fetchManualCorrections();
        } catch (error) {
            console.error('Error submitting review:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to submit review';
            setShowSubmitManualErrorModal(true);
            setTimeout(() => {
                setShowSubmitManualErrorModal(false);
            }, 3000);
        }
    };

    const correctionVariants = {
        hidden: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.3
            }
        },
        visible: {
            opacity: 1,
            height: 'auto',
            transition: {
                duration: 0.3
            }
        }
    };

    // Render highlighted correction
    const renderHighlightedCorrection = () => {
        if (!highlightedCorrection) return null;
    
        return (
            <div className="mt-5 bg-[#1F2937] p-4 rounded-md border-l-4 border-[#3B82F6]">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-[#3B82F6]" />
                        <h2 className="text-white font-medium">Latest Correction Request</h2>
                    </div>
                    
                </div>
                <div className="bg-[#24242D] p-5 rounded-md mt-3">
                    <div className="flex justify-between items-center mb-2">
                        <div className="from-to-time text-[#AAAAAA]">
                            From: {getUserName(highlightedCorrection.from_user)}
                        </div>
                        <div className="from-to-time text-[#AAAAAA]">
                            {formatCorrectionDate(highlightedCorrection.created_at)}
                        </div>
                    </div>
                    <p className="text-white history-content">{highlightedCorrection.correction}</p>
                </div>
            </div>
        );
    };

    // Render correction history
    const renderCorrectionHistory = () => {
        if (historyCorrections.length === 0) return null;
    
        return (
            <div className="mt-5 bg-[#1C1C24] p-4 pt-0 rounded-md max-h-[356px] overflow-auto custom-scrollbar">
                <div className="sticky -top-0 bg-[#1C1C24] flex items-center text-white mb-5 gap-[6px] pb-2">
                    <h2 className="history-head">Correction History</h2>
                    <img src={historys} alt="History" />
                </div>
                {historyCorrections.map((correction, index) => (
                    <div
                        key={correction.id}
                        className={`bg-[#24242D] p-5 rounded-md mb-5 ${index < historyCorrections.length - 1 ? 'mb-5' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="from-to-time text-[#AAAAAA]">
                            From: {getUserName(correction.from_user)}
                            </div>
                            <div className="from-to-time text-[#AAAAAA]">
                                {formatCorrectionDate(correction.created_at)}
                            </div>
                        </div>
                        <p className="text-white history-content">{correction.correction}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-[#1C1C24] p-5 rounded-lg">
            <div className='flex justify-between items-center border-b border-[#383840] pb-[26px]'>
                <h1 className='viewmanualhead'> Draft Evaluation of Compliance/Obligation Information</h1>

                <ManualCorrectionSuccessModal
                    showSentCorrectionSuccessModal={showSentCorrectionSuccessModal}
                    onClose={() => { setShowSentCorrectionSuccessModal(false) }}
                />

                <ManualCorrectionErrorModal
                    showSentCorrectionErrorModal={showSentCorrectionErrorModal}
                    onClose={() => { setShowSentCorrectionErrorModal(false) }}
                />

                <ReviewSubmitSuccessModal
                    showSubmitManualSuccessModal={showSubmitManualSuccessModal}
                    onClose={() => { setShowSubmitManualSuccessModal(false) }}
                />

                <ReviewSubmitErrorModal
                    showSubmitManualErrorModal={showSubmitManualErrorModal}
                    onClose={() => { setShowSubmitManualErrorModal(false) }}
                />

                <button
                    className="text-white bg-[#24242D] p-1 rounded-md"
                    onClick={handleCloseViewPage}
                >
                    <X size={22} />
                </button>
            </div>
            <div className="mt-5">
                <div className="grid grid-cols-2 divide-x divide-[#383840] pb-5">
                    <div className="grid grid-cols-1 gap-[40px]">
                        <div>
                            <label className="viewmanuallabels">Compliance/Obligation Name/Title</label>
                            <div className="flex justify-between items-center">
                                <p className="viewmanuasdata">{manualDetails.title || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Compliance/Obligation Number</label>
                            <p className="viewmanuasdata">{manualDetails.no || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Revision</label>
                            <p className="viewmanuasdata">{manualDetails.rivision || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Compliance/Obligation Type</label>
                            <p className="viewmanuasdata">{manualDetails.document_type || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Attach Document</label>
                            <div
                                className='flex items-center cursor-pointer gap-[8px]'
                                onClick={() => {
                                    if (manualDetails.upload_attachment) {
                                        window.open(manualDetails.upload_attachment, '_blank');
                                    }
                                }}
                            >
                                <p className="click-view-file-text">
                                    {manualDetails.upload_attachment ? 'Click to view file' : 'No file attached'}
                                </p>
                                {manualDetails.upload_attachment && (
                                    <Eye size={20} className='text-[#1E84AF]' />
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Relate Document / Guideline</label>
                            <p className="viewmanuasdata">{manualDetails.retention_period || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-[40px] pl-5">
                        <div>
                            <label className="viewmanuallabels">Written/Prepare By</label>
                            <p className="viewmanuasdata">
                                {manualDetails.written_by
                                    ? `${manualDetails.written_by.first_name} ${manualDetails.written_by.last_name}`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Checked/Reviewed By</label>
                            <p className="viewmanuasdata">
                                {manualDetails.checked_by
                                    ? `${manualDetails.checked_by.first_name} ${manualDetails.checked_by.last_name}`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Approved By</label>
                            <p className="viewmanuasdata">
                                {manualDetails.approved_by
                                    ? `${manualDetails.approved_by.first_name} ${manualDetails.
                                        approved_by.last_name}`
                                    : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="viewmanuallabels">Date</label>
                            {/* <p className="viewmanuasdata">{formatDate(manualDetails.date)}</p> */}
                        </div>
                        <div>
                                <label className="viewmanuallabels">Review Frequency</label>
                                <p className="viewmanuasdata">
                                    {manualDetails.review_frequency_year
                                        ? `${manualDetails.review_frequency_year} years, ${manualDetails.review_frequency_month || 0} months`
                                        : 'N/A'}
                                </p>
                            </div>
                        <div className='flex justify-between items-center'>
                        <div>
                            <label className="viewmanuallabels">Evaluation Remarks</label>
                            <p className="viewmanuasdata">{manualDetails.retention_period || 'N/A'}</p>
                        </div>
                             {isCurrentUserWrittenBy && ( 
                             <div className='flex gap-10'>
                                    <div className='flex flex-col justify-  center items-center'>
                                        <label className="viewmanuallabels">Edit</label>
                                        <button
                                            // onClick={() => {
                                            //     handleMoveToHistory();
                                            //     navigate(`/company/qms/editrecordformat/${id}`);
                                            // }}
                                        >
                                            <img src={edits} alt="Edit Icon" />
                                        </button>
                                    </div>
                                    <div className='flex flex-col justify-center items-center'>
                                        <label className="viewmanuallabels">Delete</label>
                                        <button
                                            // onClick={() => {
                                            //     handleDeleteProcedure(id);
                                            // }}
                                        >
                                            <img src={deletes} alt="Delete Icon" />
                                        </button>
                                    </div>
                                </div>
                             )} 
                        </div>

                        
                    </div>
                </div>

              
                {renderHighlightedCorrection()}

                 
                {renderCorrectionHistory()}

               {canReview && (
                    <div className="flex flex-wrap justify-between mt-5">
                        {!correctionRequest.isOpen && (
                            <>
                                <button
                                    // onClick={() => {
                                    //     handleMoveToHistory();
                                    //     handleCorrectionRequest();        
                                    // }}
                                    className="request-correction-btn duration-200"
                                >
                                    Request For Correction
                                </button>
                                <button
                                    // onClick={() => {
                                    //     handleReviewAndSubmit();
                                    //     handleMoveToHistory();
                                    // }}
                                    className="review-submit-btn bg-[#1E84AF] p-5 rounded-md duration-200"
                                    disabled={!canReview}
                                >
                                    Review and Submit
                                </button>
                            </>
                        )}

                        <AnimatePresence>
                            {correctionRequest.isOpen && (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={correctionVariants}
                                    className="mt-4 overflow-hidden w-full"
                                >
                                    <div className='flex justify-end mb-5'>
                                        <button
                                            onClick={handleCloseCorrectionRequest}
                                            className="text-white bg-[#24242D] p-1 rounded-md"
                                        >
                                            <X size={22} />
                                        </button>
                                    </div>

                                    <textarea
                                        value={correctionRequest.text}
                                        onChange={(e) => setCorrectionRequest(prev => ({
                                            ...prev,
                                            text: e.target.value
                                        }))}
                                        placeholder="Enter Correction"
                                        className="w-full h-32 bg-[#24242D] text-white px-5 py-[14px] rounded-md resize-none focus:outline-none correction-inputs"
                                    />
                                    <div className="mt-5 flex justify-end">
                                        <button
                                            onClick={handleCorrectionSubmit}
                                            className="save-btn duration-200 text-white"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QmsViewDraftEvaluationCompliance
