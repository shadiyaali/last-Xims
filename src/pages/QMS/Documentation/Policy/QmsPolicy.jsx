import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, X, FileText, Plus, Eye } from 'lucide-react';
// import plus from "../../../../assets/images/Company Documentation/plus icon.svg";
import arrow from '../../../../assets/images/Company Documentation/arrow.svg';
import view from "../../../../assets/images/Company Documentation/view.svg";
import edit from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import downloads from "../../../../assets/images/Company Documentation/download.svg"
import { useNavigate } from "react-router-dom";
import './qmspolicy.css';
import DeleteQmsPolicyConfirmModal from './Modals/DeleteQmsPolicyConfirmModal';
import DeleteQmsPolicySuccessModal from './Modals/DeleteQmsPolicySuccessModal';
import DeleteQmsPolicyErrorModal from './Modals/DeleteQmsPolicyErrorModal';

const QmsPolicy = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [qmsPolicies, setQmsPolicies] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);

  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);


  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchPolicies();
  }, []);
  const getUserCompanyId = () => {
    // First check if company_id is stored directly
    const storedCompanyId = localStorage.getItem("company_id");
    if (storedCompanyId) return storedCompanyId;

    // If user data exists with company_id
    const userRole = localStorage.getItem("role");
    if (userRole === "user") {
      // Try to get company_id from user data that was stored during login
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

  const fetchPolicies = async () => {
    try {
      const companyId = getUserCompanyId();
      console.log("Fetching manuals for Company ID:", companyId);
      const response = await axios.get(`${BASE_URL}/qms/policy/${companyId}/`);
      setQmsPolicies(response.data);
      console.log("Policies loaded:", response.data);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };
  const handleAddQMSPolicy = () => {
    navigate('/company/qms/addpolicy');
  };
  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setShowViewModal(true);
  };
  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedPolicy(null);
  };

  const handleDeleteClick = (policyId) => {
    setPolicyToDelete(policyId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (policyToDelete) {
      try {
        await axios.delete(`${BASE_URL}/qms/policy/${policyToDelete}/update/`);
        // Refresh the list after deletion
        fetchPolicies();
        setShowDeleteSuccessModal(true);
        setTimeout(() => {
          setShowDeleteSuccessModal(false);
        }, 3000);
      } catch (error) {
        console.error("Error deleting policy:", error);
        setShowDeleteErrorModal(true);
        setTimeout(() => {
          setShowDeleteErrorModal(false);
        }, 3000);
      }
    }
    setShowDeleteModal(false);
    setPolicyToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPolicyToDelete(null);
  };


  const handleEditPolicy = (policyId) => {
    navigate(`/company/qms/editpolicy/${policyId}`);
  };

  const handleDownload = async (policyId, filename) => {
    try {
      setIsLoading(true);
      console.log("Downloading policy file:", policyId);
      const response = await axios.get(`${BASE_URL}/qms/policy-download/${policyId}/`);
      console.log("Download response:", response.data);
      if (response.data.download_url) {
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.target = '_blank';
        link.download = filename || 'policy_document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("No download URL received");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      const errorMessage = error.response?.data?.error || "Failed to download file. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // const downloadFile = (url, filename) => {
  //   // Create a hidden anchor element
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = filename || 'policy-document';
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  // };
  // Function to extract file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return 'document';
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  };
  // Function to render HTML content safely
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };
  // Function to render file type icon based on file extension
  // const getFileIcon = (url) => {
  //   if (!url) return null;
  //   const extension = url.split('.').pop().toLowerCase();

  //   switch (extension) {
  //     case 'pdf':
  //       return <FileText className="text-red-400 w-5 h-5" />;
  //     case 'png':
  //     case 'jpg':
  //     case 'jpeg':
  //     case 'gif':
  //       return <img src={url} alt="Preview" className="w-10 h-10 object-cover rounded" />;
  //     default:
  //       return <FileText className="text-blue-400 w-5 h-5" />;
  //   }
  // };
  // Filter policies based on search term
  const filteredPolicies = qmsPolicies.filter(policy => {
    const policyText = policy.text || '';
    return policyText.toLowerCase().includes(searchTerm.toLowerCase());
  });
  return (
    <div className="bg-[#1C1C24] rounded-lg text-white p-5">
      <h1 className="list-policy-head">List Policy</h1>

      <DeleteQmsPolicyConfirmModal
        showDeleteModal={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <DeleteQmsPolicySuccessModal
        showDeleteSuccessModal={showDeleteSuccessModal}
        onClose={() => setShowDeleteSuccessModal(false)}
      />

      <DeleteQmsPolicyErrorModal
        showDeleteErrorModal={showDeleteErrorModal}
        onClose={() => setShowDeleteErrorModal(false)}
      />


      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#383840]">
        <span className="doc-path-text">Documentation</span>
        <span className="text-gray-400"><img src={arrow} alt="Arrow" /></span>
        <span className='policy-path-text'>Policy</span>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border border-[#383840] rounded-md outline-none p-0 pl-[10px] h-[42px] w-[417px] policy-search duration-200 focus:border-[#43434d]"
          />
          <div className='absolute right-[1px] top-[1px] h-[40px] w-[55px] bg-[#24242D] flex justify-center items-center rounded-tr-md rounded-br-md'>
            <Search className="text-white w-[18px]" />
          </div>
        </div>
        {qmsPolicies.length === 0 && (
          <button
            className="bg-transparent border border-[#858585] text-[#858585] rounded-[4px] p-[10px] flex items-center justify-center gap-[10px] transition-all duration-200 w-[140px] h-[42px] add-policy-btn hover:bg-[#858585] hover:text-white group"
            onClick={handleAddQMSPolicy}
          >
            <span>Add Policy</span>
            <Plus size={22} className='text-[#858585] group-hover:text-white transition-colors duration-200' />
          </button>
        )}

      </div>
      <div className="bg-[#24242D] rounded-md overflow-hidden">
        <div
          className={`flex justify-between items-center px-5 pt-5 pb-6 border-b border-[#383840] 
    ${qmsPolicies.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => {
            if (qmsPolicies.length > 0) {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <h2 className="policy-list-head">Policy</h2>
          <ChevronUp
            className={`h-5 w-5 transition-transform duration-300 ease-in-out text-[#AAAAAA] 
    ${isExpanded ? '' : 'rotate-180'}`}
          />
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <div key={policy.id} className="px-5 pt-6 pb-5 border-b border-gray-700 flex justify-start space-x-[50px] items-center last:border-b-0">
                <div className="flex items-center gap-[50px]">
                  <div className='gap-[15px] flex flex-col max-w-xl'>
                    <span className="policy-name text-[#858585] truncate">
                      Quality Policy
                    </span>
                    <div className="flex gap-4">
                      <button
                        className='flex justify-center items-center gap-2 hover:text-blue-400 transition-colors'
                        onClick={() => handleViewPolicy(policy)}
                      >
                        <p className='view-policy-btn-text'>View Policy</p>
                        <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-[60px]">
                  <div className="flex flex-col items-center gap-[15px]">
                    <span className="actions-text">Edit</span>
                    <button onClick={() => handleEditPolicy(policy.id)}>
                      <img src={edit} alt="Edit Icon" className='w-[16px] h-[16px]' />
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-[15px]">
                    <span className="actions-text">Delete</span>
                    <button onClick={() => handleDeleteClick(policy.id)}>
                      <img src={deleteIcon} alt="Delete Icon" className='w-[16px] h-[16px]' />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-5">No policies found.</p>
          )}
        </div>
      </div>
      {/* View Policy Modal */}
      <AnimatePresence>
        {showViewModal && selectedPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="bg-[#1C1C24] rounded-lg w-full max-w-[700px] max-h-auto overflow-auto shadow-lg"
            >
              {/* Modal content remains the same as in the previous version */}
              <div className="flex justify-between items-center mx-5 mt-5 mb-[27px] border-b border-[#383840] pb-[21px]">
                <h2 className="qms-policy-modal-head">QMS Policy</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white bg-[#24242D] w-[36px] h-[36px] flex justify-center items-center rounded-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-5 pb-5">
                <h2 className="policy-content-head mb-3">Policy Content</h2>
                <div className="bg-[#24242D] p-5 rounded-md">
                  {selectedPolicy.text.startsWith('<') ? (
                    <div className="policy-content" dangerouslySetInnerHTML={createMarkup(selectedPolicy.text)} />
                  ) : (
                    <p>{selectedPolicy.text}</p>
                  )}
                </div>

                {selectedPolicy.energy_policy && (
                  <div className="mt-5">
                    <h2 className="attached-document-head pb-3">Attached Document</h2>
                    <div className="flex justify-between items-center gap-5">

                      <div className="flex">
                        <a
                          href={selectedPolicy.energy_policy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#24242D] hover:bg-[#17171d] text-white px-4 rounded-md inline-flex items-center w-[187px] h-[59px] duration-200"
                        >
                          <span className='flex gap-[6px] items-center view-attachment-text'><Eye /> View Attachment</span>
                        </a>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDownload(selectedPolicy.id, getFileNameFromUrl(selectedPolicy.energy_policy))}
                          className="bg-[#24242D] hover:bg-[#17171d] text-white px-4 rounded-md inline-flex items-center gap-[6px] h-[59px] duration-200"
                          disabled={isLoading}
                        >
                          <img src={downloads} alt="Download" className='w-[24px] h-[24px]' />
                          <span className='download-btn'>{isLoading ? "Downloading..." : "Download"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QmsPolicy;
