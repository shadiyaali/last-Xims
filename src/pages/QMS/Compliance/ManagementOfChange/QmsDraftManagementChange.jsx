import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import view from "../../../../assets/images/Company Documentation/view.svg";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import QmsDeleteConfirmManagementModal from "./Modals/QmsDeleteConfirmManagementModal";
import QmsDeleteManagementSuccessModal from "./Modals/QmsDeleteManagementSuccessModal";
import QmsDeleteManagementErrorModal from "./Modals/QmsDeleteManagementErrorModal";

const QmsDraftManagementChange = () => {
  // State management
  const [complianceData, setComplianceData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [managementToDelete, setManagementToDelete] = useState(null);
  const [showDeleteManagementSuccessModal, setShowDeleteManagementSuccessModal] = useState(false);
  const [showDeleteManagementErrorModal, setShowDeleteManagementErrorModal] = useState(false);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Get user ID or company ID from localStorage
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

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = getRelevantUserId();
        console.log("Fetching data for ID:", id);

        if (!id) {
          setError("User ID or Company ID not found");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${BASE_URL}/qms/changes-draft/${id}/`);
        console.log("API Response:", response.data);

        const data = response.data;
        if (Array.isArray(data)) {
          const formattedData = data.map(item => ({
            id: item.id,
            title: item.moc_title || "",
            mocno: item.moc_no || "",
            revision: item.rivision || "",
            date: formatDate(item.date),
            mocType: item.moc_type,
            attachDocument: item.attach_document,
            purposeOfChange: item.purpose_of_chnage,
            potentialConsequences: item.potential_cosequences,
            mocRemarks: item.moc_remarks,
            relatedRecordFormat: item.related_record_format,
            resourcesRequired: item.resources_required,
            impactOnProcess: item.impact_on_process,
            sendNotification: item.send_notification,
            isDraft: item.is_draft
          }));
          setComplianceData(formattedData);
        } else if (data?.data && Array.isArray(data.data)) {
          // Handle nested data structure
          const formattedData = data.data.map(item => ({
            id: item.id,
            title: item.moc_title || "",
            mocno: item.moc_no || "",
            revision: item.rivision || "",
            date: formatDate(item.date),
            mocType: item.moc_type,
            attachDocument: item.attach_document,
            purposeOfChange: item.purpose_of_chnage,
            potentialConsequences: item.potential_cosequences,
            mocRemarks: item.moc_remarks,
            relatedRecordFormat: item.related_record_format,
            resourcesRequired: item.resources_required,
            impactOnProcess: item.impact_on_process,
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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClose = () => {
    navigate("/company/qms/list-management-change");
  };

  const handleEditManagementChange = (id) => {
    navigate(`/company/qms/edit-draft-management-change/${id}`);
  };

  const handleViewManagementChange = (id) => {
    navigate(`/company/qms/view-draft-management-change/${id}`);
  };

  // Update the handleDelete function to use modals instead of window.confirm
  const handleDelete = (id) => {
    setManagementToDelete(id);
    setShowDeleteModal(true);
  };

  // Add function to confirm deletion
  // Add function to confirm deletion
const confirmDelete = async () => {
  try {
    await axios.delete(`${BASE_URL}/qms/changes-get/${managementToDelete}/`);
    // Update complianceData instead of managementChanges
    setComplianceData(complianceData.filter(item => item.id !== managementToDelete));
    setShowDeleteModal(false);
    setShowDeleteManagementSuccessModal(true);
    // Auto-close success modal after 2 seconds
    setTimeout(() => {
      setShowDeleteManagementSuccessModal(false);
    }, 2000);
  } catch (err) {
    console.error('Error deleting management change:', err);
    setShowDeleteModal(false);
    setShowDeleteManagementErrorModal(true);
    // Auto-close error modal after 3 seconds
    setTimeout(() => {
      setShowDeleteManagementErrorModal(false);
    }, 3000);
  }
};

  // Add function to close modals
  const closeModals = () => {
    setShowDeleteModal(false);
    setShowDeleteManagementSuccessModal(false);
    setShowDeleteManagementErrorModal(false);
  };

  // Filter and pagination
  const filteredData = complianceData.filter(
    (item) =>
      (item.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.mocno?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.revision?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">Error: {error}</div>;
  }

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="list-compliance-head">Draft Management of Change</h1>

          <QmsDeleteConfirmManagementModal
            showDeleteModal={showDeleteModal}
            onConfirm={confirmDelete}
            onCancel={closeModals}
          />

          <QmsDeleteManagementSuccessModal
            showDeleteManagementSuccessModal={showDeleteManagementSuccessModal}
            onClose={() => setShowDeleteManagementSuccessModal(false)}
          />

          <QmsDeleteManagementErrorModal
            showDeleteManagementErrorModal={showDeleteManagementErrorModal}
            onClose={() => setShowDeleteManagementErrorModal(false)}
          />


          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="serach-input-manual focus:outline-none bg-transparent !w-[230px]"
              />
              <div className="absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center">
                <Search size={18} />
              </div>
            </div>

            <button
              onClick={handleClose}
              className="bg-[#24242D] p-2 rounded-md"
            >
              <X className="text-white" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#24242D]">
                <tr className="h-[48px]">
                  <th className="px-4 qms-list-compliance-thead text-left w-24">
                    No
                  </th>
                  <th className="px-4 qms-list-compliance-thead text-left">
                    Title
                  </th>
                  <th className="px-4 qms-list-compliance-thead text-left">
                    MOC No
                  </th>
                  <th className="px-4 qms-list-compliance-thead text-left">
                    Revision
                  </th>
                  <th className="px-4 qms-list-compliance-thead text-left">
                    Date
                  </th>
                  <th className="px-4 qms-list-compliance-thead text-left">
                    Action
                  </th>
                  <th className="px-4 qms-list-compliance-thead text-center">
                    View
                  </th>
                  <th className="px-4 qms-list-compliance-thead text-center">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer"
                    >
                      <td className="px-4 qms-list-compliance-data">{item.id}</td>
                      <td className="px-4 qms-list-compliance-data">
                        {item.title}
                      </td>
                      <td className="px-4 qms-list-compliance-data">
                        {item.mocno}
                      </td>
                      <td className="px-4 qms-list-compliance-data">
                        <span className="text-[#1E84AF]">{item.revision}</span>
                      </td>
                      <td className="px-4 qms-list-compliance-data">
                        {item.date}
                      </td>
                      <td className="px-4 qms-list-compliance-data text-left">
                        <button onClick={() => handleEditManagementChange(item.id)} className="text-[#1E84AF]">
                          Click to Continue
                        </button>
                      </td>
                      <td className="px-4 qms-list-compliance-data text-center">
                        <button onClick={() => handleViewManagementChange(item.id)}>
                          <img
                            src={view}
                            alt="View Icon"
                            className="w-[16px] h-[16px] mt-1"
                          />
                        </button>
                      </td>
                      <td className="px-4 qms-list-compliance-data text-center">
                        <button onClick={() => handleDelete(item.id)}>
                          <img
                            src={deletes}
                            alt="Deletes icon"
                            className="w-[16px] h-[16px]"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-400 not-found">
                      No Draft Management Changes Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredData.length > 0 && (
            <div className="px-4 pt-3 flex items-center justify-between">
              <div className="text-white total-text">
                Total-{filteredData.length}
              </div>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`cursor-pointer swipe-text ${currentPage === 1 ? "opacity-50" : ""
                    }`}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`${currentPage === pageNum
                        ? "pagin-active"
                        : "pagin-inactive"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`cursor-pointer swipe-text ${currentPage === totalPages || totalPages === 0
                    ? "opacity-50"
                    : ""
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QmsDraftManagementChange;