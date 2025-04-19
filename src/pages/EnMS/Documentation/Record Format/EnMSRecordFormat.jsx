import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import plusicon from "../../../../assets/images/Company Documentation/plus icon.svg";
import views from "../../../../assets/images/Companies/view.svg";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const EnMSRecordFormat = () => {
  const [recordFormat, setRecordFormat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordFormatPerPage = 10;

  // Format date from ISO to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

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

  // Fetch Record Format from API
  const fetchRecordFormat = async () => {
    try {
      setLoading(true);
      const companyId = getUserCompanyId();
      console.log("Fetching Record Format for Company ID:", companyId);
      const response = await axios.get(
        `${BASE_URL}/company/records/${companyId}/`
      );
      console.log("API Response:", response.data);

      setRecordFormat(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Record Formats:", err);

      // Check if it's a 404 error (no record formats found)
      if (err.response && err.response.status === 404) {
        // This is expected when no record formats exist
        setRecordFormat([]);
        setError(null);
      } else {
        // For other errors, set the error state
        setError("Failed to load Record Formats. Please try again.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordFormat();
  }, []);

  // Delete Record Format
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record format?")) {
      try {
        await axios.delete(`${BASE_URL}/company/records/${id}/`);
        alert("Record Format deleted successfully");
        fetchRecordFormat(); // Refresh the list
      } catch (err) {
        console.error("Error deleting Record Format:", err);
        alert("Failed to delete Record Format");
      }
    }
  };

  const filteredrecordFormat = recordFormat.filter(
    (recordFormats) =>
      (recordFormats.title?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (recordFormats.no?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (recordFormats.approved_by?.first_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (recordFormats.rivision?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (formatDate(recordFormats.date)?.replace(/^0+/, "") || "").includes(
        searchQuery.replace(/^0+/, "")
      )
  );

  const totalPages = Math.ceil(
    filteredrecordFormat.length / recordFormatPerPage
  );
  const paginatedRecordFormat = filteredrecordFormat.slice(
    (currentPage - 1) * recordFormatPerPage,
    currentPage * recordFormatPerPage
  );

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
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleAddRecordFormat = () => {
    navigate("/company/enms/addrecordformat");
  };

  const handleEdit = (id) => {
    navigate(`/company/enms/addrecordformat/${id}`);
  };

  return (
    <div className="bg-[#1C1C24] list-manual-main">
      <div className="flex items-center justify-between px-[14px] pt-[24px]">
        <h1 className="list-manual-head">List Record Formats</h1>
        <div className="flex space-x-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="serach-input-manual focus:outline-none bg-transparent"
            />
            <div className="absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center">
              <Search size={18} />
            </div>
          </div>
          <button
            className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#10B8FF] text-[#10B8FF] hover:bg-[#10B8FF] hover:text-white"
            onClick={handleAddRecordFormat}
          >
            <span> Add Record Format</span>
            <img
              src={plusicon}
              alt="Add Icon"
              className="w-[18px] h-[18px] enms-add-plus"
            />
          </button>
        </div>
      </div>

      <div className="p-5 overflow-hidden">
        {loading ? (
          <div className="text-center py-4 text-white">
            Loading Record Formats...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#24242D]">
              <tr className="h-[48px]">
                <th className="px-5 text-left add-manual-theads">No</th>
                <th className="px-5 text-left add-manual-theads">
                  Record Title
                </th>
                <th className="px-5 text-left add-manual-theads">Record No</th>
                <th className="px-5 text-left add-manual-theads">
                  Approved by
                </th>
                <th className="px-5 text-left add-manual-theads">Revision</th>
                <th className="px-5 text-left add-manual-theads">Date</th>
                <th className="px-5 text-center add-manual-theads">View</th>
                <th className="px-5 text-center add-manual-theads">Edit</th>
                <th className="px-5 text-center add-manual-theads">Delete</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecordFormat.length > 0 ? (
                paginatedRecordFormat.map((recordFormats, index) => (
                  <tr
                    key={recordFormats.id}
                    className="border-b border-[#383840] hover:bg-[#1a1a20] cursor-pointer h-[46px]"
                  >
                    <td className="px-[23px] add-manual-datas">
                      {(currentPage - 1) * recordFormatPerPage + index + 1}
                    </td>
                    <td className="px-5 add-manual-datas">
                      {recordFormats.title}
                    </td>
                    <td className="px-5 add-manual-datas">
                      {recordFormats.no}
                    </td>
                    <td className="px-5 add-manual-datas">
                      {recordFormats.approved_by
                        ? `${recordFormats.approved_by.first_name} ${recordFormats.approved_by.last_name}`
                        : "N/A"}
                    </td>
                    <td className="px-5 add-manual-datas">
                      {recordFormats.rivision || "N/A"}
                    </td>
                    <td className="px-5 add-manual-datas">
                      {formatDate(recordFormats.date)}
                    </td>
                    <td className="px-4 add-manual-datas text-center">
                      <button onClick={() => handleView(recordFormats.id)}>
                        <img src={views} alt="Edit" />
                      </button>
                    </td>
                    <td className="px-4 add-manual-datas text-center">
                      <button onClick={() => handleEdit(recordFormats.id)}>
                        <img
                          src={edits}
                          alt="Edit"
                          className="w-[16px] h-[16px]"
                        />
                      </button>
                    </td>
                    <td className="px-4 add-manual-datas text-center">
                      <button onClick={() => handleDelete(recordFormats.id)}>
                        <img
                          src={deletes}
                          alt="Delete"
                          className="w-[16px] h-[16px]"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4 not-found">
                    No Record Formats found.
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan="9" className="pt-[15px] border-t border-[#383840]">
                  <div className="flex items-center justify-between">
                    <div className="text-white total-text">
                      Total-{filteredrecordFormat.length}
                    </div>
                    <div className="flex items-center gap-5">
                      <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className={`cursor-pointer swipe-text ${
                          currentPage === 1 ? "opacity-50" : ""
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            className={`${
                              currentPage === page
                                ? "pagin-active"
                                : "pagin-inactive"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={handleNext}
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className={`cursor-pointer swipe-text ${
                          currentPage === totalPages || totalPages === 0
                            ? "opacity-50"
                            : ""
                        }`}
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
    </div>
  );
};

export default EnMSRecordFormat;
