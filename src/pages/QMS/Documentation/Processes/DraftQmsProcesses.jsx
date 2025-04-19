import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import views from "../../../../assets/images/Company Documentation/view.svg";
import { BASE_URL } from "../../../../Utils/Config";
import axios from "axios";
import DeleteQmsDraftProcessesConfirmModal from "./Modals/DeleteQmsDraftProcessesConfirmModal";
import DeleteQmsDraftProcessesSuccessModal from "./Modals/DeleteQmsDraftProcessesSuccessModal";
import DeleteQmsDraftProcessesErrorModal from "./Modals/DeleteQmsDraftProcessesErrorModal";

const DraftQmsProcesses = ({ userId }) => {
  const [formData, setFormData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const recordsPerPage = 10;

  const [showDeleteProcessesDraftModal, setShowDeleteProcessesDraftModal] =
    useState(false);
  const [processesDraftToDelete, setProcessesDraftToDelete] = useState(null);
  const [
    showDeleteProcessesDraftSuccessModal,
    setShowDeleteProcessesDraftSuccessModal,
  ] = useState(false);
  const [
    showDeleteDraftProcessesErrorModal,
    setShowDeleteDraftProcessesErrorModal,
  ] = useState(false);

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
    const fetchData = async () => {
      try {
        const id = getRelevantUserId();
        const response = await axios.get(
          `${BASE_URL}/qms/process-draft/${id}/`
        );
        const data = response.data;
        if (Array.isArray(data)) {
          setFormData(data);
        } else if (Array.isArray(data?.data)) {
          setFormData(data.data);
        } else {
          setFormData([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch draft processes:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openDeleteModal = (id, name) => {
    setProcessesDraftToDelete({ id, name });
    setShowDeleteProcessesDraftModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteProcessesDraftModal(false);
    setProcessesDraftToDelete(null);
  };


  const handleDelete = async () => {
    if (!processesDraftToDelete) return;

    try {
      // Make API call to delete the draft process
      await axios.delete(
        `${BASE_URL}/qms/processes-get/${processesDraftToDelete.id}/`
      );

      // Update the UI by removing the deleted item
      setFormData((prev) =>
        prev.filter((item) => item.id !== processesDraftToDelete.id)
      );

      // Close the delete modal and show success modal
      closeDeleteModal();
      setShowDeleteProcessesDraftSuccessModal(true);

      // Auto-close success modal after 3 seconds
      setTimeout(() => {
        setShowDeleteProcessesDraftSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting draft process:", error);

      // Close the delete modal and show error modal
      closeDeleteModal();
      setShowDeleteDraftProcessesErrorModal(true);

      // Auto-close error modal after 3 seconds
      setTimeout(() => {
        setShowDeleteDraftProcessesErrorModal(false);
      }, 3000);
    }
  };

  const handleEdit = (id) => {
    navigate(`/company/qms/edit-draft-processes/${id}`);
  };

  const handleView = (id) => {
    navigate(`/company/qms/view-draft-processes/${id}`);
  };

  const handleClose = () => {
    navigate("/company/qms/processes");
  };

  const filteredData = formData.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

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
      return Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );
    }
  };

  const currentRecords = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-[#1C1C24] p-5 rounded-lg text-white">
      <div className="flex justify-between items-center mb-5">
        <h2 className="interested-parties-head">Draft Processes</h2>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="serach-input-manual focus:outline-none bg-transparent"
            />
            <div className="absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center">
              <Search size={18} />
            </div>
          </div>
          <button onClick={handleClose} className="bg-[#24242D] p-2 rounded-md">
            <X className="text-white" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#24242D] text-left">
            <tr className="h-[48px]">
              <th className="px-4 qms-interested-parties-thead text-left">
                No
              </th>
              <th className="px-4 qms-interested-parties-thead text-left">
                Name
              </th>
              <th className="px-4 qms-interested-parties-thead text-left">
                No/Identification
              </th>
              <th className="px-4 qms-interested-parties-thead text-left">
                Type
              </th>
              <th className="px-4 qms-interested-parties-thead text-left">
                Date
              </th>
              <th className="px-4 qms-interested-parties-thead text-left">
                Actions
              </th>
              <th className="px-4 qms-interested-parties-thead text-center">
                View
              </th>
              <th className="px-4 qms-interested-parties-thead text-center">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-[#2D2D35] h-[48px]"
                >
                  <td className="px-4 qms-interested-parties-data">
                    {(currentPage - 1) * recordsPerPage + index + 1}
                  </td>
                  <td className="px-4 qms-interested-parties-data">
                    {item.name}
                  </td>
                  <td className="px-4 qms-interested-parties-data">
                    {item.no || "-"}
                  </td>
                  <td className="px-4 qms-interested-parties-data">
                    {item.type}
                  </td>
                  <td className="px-4 qms-interested-parties-data">
                    {item.created_at?.slice(0, 10)}
                  </td>
                  <td className="px-4 qms-interested-parties-data">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="text-[#1E84AF]"
                    >
                      Click to Continue
                    </button>
                  </td>
                  <td className="text-center">
                    <button onClick={() => handleView(item.id)}>
                      <img src={views} alt="View" className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                  <td className="text-center">
                    <button onClick={() => openDeleteModal(item.id, item.name)}>
                      <img
                        src={deletes}
                        alt="Delete"
                        className="w-4 h-4 mx-auto"
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 not-found">
                  No Draft Processes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="text-white total-text">
          Total: {filteredData.length}
        </div>
        <div className="flex items-center space-x-5">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`cursor-pointer swipe-text ${
              currentPage === 1 ? "opacity-50" : ""
            }`}
          >
            <span>Previous</span>
          </button>
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`${
                currentPage === page ? "pagin-active" : "pagin-inactive"
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="px-1">...</span>
              )}
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
            className={`cursor-pointer swipe-text ${
              currentPage === totalPages || totalPages === 0 ? "opacity-50" : ""
            }`}
          >
            <span>Next</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteQmsDraftProcessesConfirmModal
        showDeleteProcessesDraftModal={showDeleteProcessesDraftModal}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />

      {/* Success Modal */}
      <DeleteQmsDraftProcessesSuccessModal
        showDeleteProcessesDraftSuccessModal={
          showDeleteProcessesDraftSuccessModal
        }
        onClose={() => setShowDeleteProcessesDraftSuccessModal(false)}
      />

      {/* Error Modal */}
      <DeleteQmsDraftProcessesErrorModal
        showDeleteDraftProcessesErrorModal={
            showDeleteDraftProcessesErrorModal
        }
        onClose={() => setShowDeleteDraftProcessesErrorModal(false)}
      />
    </div>
  );
};

export default DraftQmsProcesses;
