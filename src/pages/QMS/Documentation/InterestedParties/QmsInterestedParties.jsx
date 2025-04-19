import React, { useState, useEffect } from "react";
import "./qmsinterestedparties.css";
import plusicon from '../../../../assets/images/Company Documentation/plus icon.svg'
import edits from "../../../../assets/images/Company Documentation/edit.svg"
import deletes from '../../../../assets/images/Company Documentation/delete.svg'
import views from "../../../../assets/images/Company Documentation/view.svg"
import { Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import DeleteQmsInterestedConfirmModal from "./Modals/DeleteQmsInterestedConfirmModal";
import DeleteQmsInterestedSuccessModal from "./Modals/DeleteQmsInterestedSuccessModal";
import DeleteQmsInterestedErrorModal from "./Modals/DeleteQmsInterestedErrorModal";

const QmsInterestedParties = () => {
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftCount, setDraftCount] = useState();
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { company_id } = useParams();
  const recordsPerPage = 10;

  const [showDeleteInterestedModal, setShowDeleteInterestedModal] = useState(false);
  const [interestedToDelete, setInterestedToDelete] = useState(null);
  const [showDeleteInterestedSuccessModal, setShowDeleteInterestedSuccessModal] = useState(false);
  const [showDeleteInterestedErrorModal, setShowDeleteInterestedErrorModal] = useState(false);


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

  const fetchInterestedParties = async () => {
    setLoading(true);
    try {
      const companyId = getUserCompanyId();
      const response = await axios.get(`${BASE_URL}/qms/interested-parties/${companyId}/`);
      console.log("Fetched interested parties data:", response.data);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setFormData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching interested parties:", err);
      setError("Failed to load interested parties data");
      setFormData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestedParties();
  }, []);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const filteredData = formData.filter(item =>
    Object.values(item).some(
      value => typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleInterestedPartiesDraft = () => {
    navigate(`/company/qms/draft-interested-parties`);
  }

  const handleAddInterestedParties = () => {
    navigate(`/company/qms/add-interested-parties/`);
  };

  const handleDelete = (id) => {
    setInterestedToDelete(id);
    setShowDeleteInterestedModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/qms/interested-parties-get/${interestedToDelete}/`);
      setFormData(prev => prev.filter(item => item.id !== interestedToDelete));
      setShowDeleteInterestedModal(false);
      setShowDeleteInterestedSuccessModal(true);
      setTimeout(() => {
        setShowDeleteInterestedSuccessModal(false);
        fetchInterestedParties(); // Fixed: was fetchManuals, now correctly calls fetchInterestedParties
      }, 2000);
    } catch (err) {
      console.error("Error deleting interested party:", err);
      setShowDeleteInterestedModal(false);
      setShowDeleteInterestedErrorModal(true);

      // Auto-close error modal after 3 seconds
      setTimeout(() => {
        setShowDeleteInterestedErrorModal(false);
      }, 2000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteInterestedModal(false);
    setInterestedToDelete(null);
  };


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

  useEffect(() => {
    const fetchDraftCount = async () => {
      try {
        const Id = getRelevantUserId();
        const draftResponse = await axios.get(`${BASE_URL}/qms/interst/drafts-count/${Id}/`);
        setDraftCount(draftResponse.data.count);
      } catch (err) {
        console.error("Error fetching draft count:", err);
        setDraftCount(0);
      }
    };

    fetchDraftCount();
  }, []);


  const handleEditInterestedParties = (id) => {
    navigate(`/company/qms/edit-interested-parties/${id}`);
  };

  const handleViewInterestedParties = (id) => {
    navigate(`/company/qms/view-interested-parties/${id}`);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }
  };

  const currentRecords = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      <div className="flex justify-between items-center mb-5">
        <h1 className="interested-parties-head">Interested Parties</h1>

        <DeleteQmsInterestedConfirmModal
          showDeleteInterestedModal={showDeleteInterestedModal}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

        <DeleteQmsInterestedSuccessModal
          showDeleteInterestedSuccessModal={showDeleteInterestedSuccessModal}
          onClose={() => setShowDeleteInterestedSuccessModal(false)}
        />

        <DeleteQmsInterestedErrorModal
          showDeleteInterestedErrorModal={showDeleteInterestedErrorModal}
          onClose={() => setShowDeleteInterestedErrorModal(false)}
        />


        <div className="flex space-x-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="serach-input-manual focus:outline-none bg-transparent"
            />
            <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
              <Search size={18} />
            </div>
          </div>
          <button
            className="flex items-center justify-center add-draft-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
            onClick={handleInterestedPartiesDraft}
          >
            <span>Drafts</span>
            {draftCount > 0 && (
              <span className="bg-red-500 text-white rounded-full text-xs flex justify-center items-center w-[20px] h-[20px] absolute top-[115px] right-60">
                {draftCount}
              </span>
            )}
          </button>
          <button
            onClick={handleAddInterestedParties}
            className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
          >
            <span>Add Interested Parties</span>
            <img src={plusicon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading interested parties data...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredData.length === 0 ? (
        <div>
          <p className="text-center not-found py-5">No interested parties found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#24242D]">
                <tr className="h-[48px]">
                  <th className="px-4 qms-interested-parties-thead text-left">No</th>
                  <th className="px-4 qms-interested-parties-thead text-left">Name</th>
                  <th className="px-4 qms-interested-parties-thead text-left">Category</th>
                  <th className="px-4 qms-interested-parties-thead text-left">Needs</th>
                  <th className="px-4 qms-interested-parties-thead text-left">Expectations</th>
                  <th className="px-4 qms-interested-parties-thead text-left">Date</th>
                  <th className="px-4 qms-interested-parties-thead text-center">View</th>
                  <th className="px-4 qms-interested-parties-thead text-center">Edit</th>
                  <th className="px-4 qms-interested-parties-thead text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((item, index) => (
                  <tr key={item.id} className="border-b border-[#2D2D35] h-[48px]">
                    <td className="px-4 qms-interested-parties-data">{(currentPage - 1) * recordsPerPage + index + 1}</td>
                    <td className="px-4 qms-interested-parties-data">{item.name}</td>
                    <td className="px-4 qms-interested-parties-data">{item.category}</td>
                    <td className="px-4 qms-interested-parties-data">{item.needs}</td>
                    <td className="px-4 qms-interested-parties-data">{item.expectations}</td>
                    <td className="px-4 qms-interested-parties-data">{formatDate(item.created_at)}</td>
                    <td className="px-4 qms-interested-parties-data text-center">
                      <img src={views} alt="View" className="cursor-pointer mx-auto w-[16px] h-[16px]" onClick={() => handleViewInterestedParties(item.id)} />
                    </td>
                    <td className="px-4 qms-interested-parties-data text-center">
                      <img src={edits} alt="Edit" className="cursor-pointer mx-auto w-[16px] h-[16px]" onClick={() => handleEditInterestedParties(item.id)} />
                    </td>
                    <td className="px-4 qms-interested-parties-data text-center">
                      <img src={deletes} alt="Delete" className="cursor-pointer mx-auto w-[16px] h-[16px]" onClick={() => handleDelete(item.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="text-white total-text">Total: {filteredData.length}</div>
            <div className="flex items-center space-x-5">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
              >
                <span>Previous</span>
              </button>

              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`${currentPage === page ? 'pagin-active' : 'pagin-inactive'}`}
                >
                  {page}
                </button>
              ))}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-1">...</span>}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-1 rounded pagin-inactive"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`cursor-pointer swipe-text ${currentPage === totalPages || totalPages === 0 ? 'opacity-50' : ''}`}
              >
                <span>Next</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default QmsInterestedParties;