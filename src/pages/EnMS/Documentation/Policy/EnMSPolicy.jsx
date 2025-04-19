import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import { Search, ChevronUp, X, Download, FileText, Plus } from 'lucide-react';
// import plus from "../../../../assets/images/Company Documentation/plus icon.svg";
import arrow from '../../../../assets/images/Company Documentation/arrow.svg';
import view from "../../../../assets/images/Company Documentation/view.svg";
import edit from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from "react-router-dom";

const EnMSPolicy = () => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [qmsPolicies, setQmsPolicies] = useState([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
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
        const response = await axios.get(`${BASE_URL}/company/policy-enms/${companyId}/`);
        setQmsPolicies(response.data);
        console.log("Policies loaded:", response.data);
      } catch (error) {
        console.error("Error fetching policies:", error);
      }
    };
    const handleAddQMSPolicy = () => {
      navigate('/company/enms/addpolicy');
    };
    const handleViewPolicy = (policy) => {
      setSelectedPolicy(policy);
      setShowViewModal(true);
    };
    const handleCloseModal = () => {
      setShowViewModal(false);
      setSelectedPolicy(null);
    };
    const handleDeletePolicy = async (policyId) => {
      if (window.confirm("Are you sure you want to delete this policy?")) {
        try {
          await axios.delete(`${BASE_URL}/company/policy-enms/${policyId}/delete/`);
          // Refresh the list after deletion
          fetchPolicies();
        } catch (error) {
          console.error("Error deleting policy:", error);
          alert("Failed to delete policy. Please try again.");
        }
      }
    };
    const handleEditPolicy = (policyId) => {
      navigate(`/company/ohs/editpolicy/${policyId}`);
    };
    const downloadFile = (url, filename) => {
      // Create a hidden anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'policy-document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
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
    const getFileIcon = (url) => {
      if (!url) return null;
      const extension = url.split('.').pop().toLowerCase();
  
      switch (extension) {
        case 'pdf':
          return <FileText className="text-red-400 w-5 h-5" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
          return <img src={url} alt="Preview" className="w-10 h-10 object-cover rounded" />;
        default:
          return <FileText className="text-blue-400 w-5 h-5" />;
      }
    };
    // Filter policies based on search term
    const filteredPolicies = qmsPolicies.filter(policy => {
      const policyText = policy.text || '';
      return policyText.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return (
      <div className="bg-[#1C1C24] rounded-lg text-white p-5">
        <h1 className="list-policy-head">List Policy</h1>
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
              className="bg-transparent border border-[#10B8FF] text-[#10B8FF] rounded-[4px] p-[10px] flex items-center justify-center gap-[10px] transition-all duration-200 w-[140px] h-[42px] add-policy-btn hover:bg-[#10B8FF] hover:text-white group"
              onClick={handleAddQMSPolicy}
            >
              <span>Add Policy</span>
              <Plus size={22} className='text-[#10B8FF] group-hover:text-white transition-colors duration-200' />
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
                      <span className="policy-name text-[#10B8FF] truncate">
                        Energy Policy
                      </span>
                      <div className="flex gap-4">
                        <button
                          className='flex justify-center items-center gap-2 hover:text-blue-400 transition-colors'
                          onClick={() => handleViewPolicy(policy)}
                        >
                          <p className='view-policy-btn-text'>View Policy</p>
                          <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
                        </button>
  
                        {/* {policy.energy_policy && (
                          <button 
                            className='flex justify-center items-center gap-2 text-green-400 hover:text-green-300 transition-colors' 
                            onClick={() => downloadFile(policy.energy_policy, getFileNameFromUrl(policy.energy_policy))}
                          >
                            <p>Download File</p>
                            <Download className="w-[16px] h-[16px]" />
                          </button>
                        )} */}
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
                      <button onClick={() => handleDeletePolicy(policy.id)}>
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
        {showViewModal && selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-[#24242D] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto shadow-lg">
              <div className="flex justify-between items-center p-5 border-b border-[#383840]">
                <h2 className="text-xl font-semibold">Policy Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
  
              <div className="p-6">
                <h3 className="text-xl mb-4 text-[#A3A3A3]">Policy Content:</h3>
                <div className="bg-[#1C1C24] p-5 rounded-md">
                  {selectedPolicy.text.startsWith('<') ? (
                    <div className="policy-content" dangerouslySetInnerHTML={createMarkup(selectedPolicy.text)} />
                  ) : (
                    <p>{selectedPolicy.text}</p>
                  )}
                </div>
  
                {selectedPolicy.energy_policy && (
                  <div className="mt-6">
                    <h3 className="text-xl mb-4 text-[#A3A3A3]">Attached Document:</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-[#2C2C36] p-3 rounded">
                        {getFileIcon(selectedPolicy.energy_policy)}
                        <span className="truncate max-w-md">
                          {getFileNameFromUrl(selectedPolicy.energy_policy)}
                        </span>
                      </div>
  
                      <div className="flex gap-2">
                        <a
                          href={selectedPolicy.energy_policy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#2C2C36] hover:bg-[#383844] text-white font-medium py-2 px-4 rounded inline-flex items-center"
                        >
                          <span>View</span>
                        </a>
  
                        <button
                          onClick={() => downloadFile(selectedPolicy.energy_policy, getFileNameFromUrl(selectedPolicy.energy_policy))}
                          className="bg-[#3A3A47] hover:bg-[#4A4A57] text-white font-medium py-2 px-4 rounded inline-flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-8 text-sm text-[#858585]">
                  <p>Created: {new Date(selectedPolicy.created_at).toLocaleString()}</p>
                  {selectedPolicy.user && <p>Created by: User ID: {selectedPolicy.user}</p>}
                </div>
              </div>
  
              <div className="flex justify-end p-5 border-t border-[#383840]">
                <button
                  onClick={handleCloseModal}
                  className="bg-[#1C1C24] hover:bg-[#2C2C36] text-white font-medium py-2 px-6 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default EnMSPolicy
