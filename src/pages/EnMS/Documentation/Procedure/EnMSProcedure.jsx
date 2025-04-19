import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import plusicon from "../../../../assets/images/Company Documentation/plus icon.svg";
import views from "../../../../assets/images/Companies/view.svg";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const EnMSProcedure = () => {
  const [procedure, setProcedure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const procedurePerPage = 10;

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

  // Fetch procedures from API
  const fetchProcedure = async () => {
    try {
      setLoading(true);
      const companyId = getUserCompanyId();
      console.log("Fetching Procedures for Company ID:", companyId);
      const response = await axios.get(
        `${BASE_URL}/company/procedure/${companyId}/`
      );
      console.log("API Response:", response.data);

      setProcedure(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching procedures:", err);

      // Check if it's a 404 error (no procedures found)
      if (err.response && err.response.status === 404) {
        // This is expected when no procedures exist
        setProcedure([]);
        setError(null);
      } else {
        // For other errors, set the error state
        setError("Failed to load procedures. Please try again.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedure();
  }, []);

  // Delete Procedures
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this procedure?")) {
      try {
        await axios.delete(`${BASE_URL}/company/procedure/${id}/`);
        alert("Procedure deleted successfully");
        fetchProcedure(); // Refresh the list
      } catch (err) {
        console.error("Error deleting Procedure:", err);
        alert("Failed to delete Procedure");
      }
    }
  };

  const filteredProcedure = procedure.filter(
    (procedures) =>
      (procedures.title?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (procedures.no?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (procedures.approved_by?.first_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (procedures.rivision?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (formatDate(procedures.date)?.replace(/^0+/, "") || "").includes(
        searchQuery.replace(/^0+/, "")
      )
  );

  const totalPages = Math.ceil(filteredProcedure.length / procedurePerPage);
  const paginatedProcedure = filteredProcedure.slice(
    (currentPage - 1) * procedurePerPage,
    currentPage * procedurePerPage
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

  const handleAddProcedure = () => {
    navigate("/company/enms/addprocedure");
  };

  const handleEdit = (id) => {
    navigate(`/company/enms/procedure/${id}`);
  };

  return (
    <div className="bg-[#1C1C24] list-manual-main">
      <div className="flex items-center justify-between px-[14px] pt-[24px]">
        <h1 className="list-manual-head">List Procedures</h1>
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
            onClick={handleAddProcedure}
          >
            <span>Add Procedure</span>
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
            Loading procedures...
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#24242D]">
              <tr className="h-[48px]">
                <th className="px-5 text-left add-manual-theads">No</th>
                <th className="px-5 text-left add-manual-theads">
                  Procedure Title
                </th>
                <th className="px-5 text-left add-manual-theads">
                  Procedure No
                </th>
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
              {paginatedProcedure.length > 0 ? (
                paginatedProcedure.map((procedure, index) => (
                  <tr
                    key={procedure.id}
                    className="border-b border-[#383840] hover:bg-[#1a1a20] cursor-pointer h-[46px]"
                  >
                    <td className="px-[23px] add-manual-datas">
                      {(currentPage - 1) * procedurePerPage + index + 1}
                    </td>
                    <td className="px-5 add-manual-datas">{procedure.title}</td>
                    <td className="px-5 add-manual-datas">{procedure.no}</td>
                    <td className="px-5 add-manual-datas">
                      {procedure.approved_by
                        ? `${procedure.approved_by.first_name} ${procedure.approved_by.last_name}`
                        : "N/A"}
                    </td>
                    <td className="px-5 add-manual-datas">
                      {procedure.rivision || "N/A"}
                    </td>
                    <td className="px-5 add-manual-datas">
                      {formatDate(procedure.date)}
                    </td>
                    <td className="px-4 add-manual-datas text-center">
                      <button onClick={() => handleView(procedure.id)}>
                        <img src={views} alt="Edit" />
                      </button>
                    </td>
                    <td className="px-4 add-manual-datas text-center">
                      <button onClick={() => handleEdit(procedure.id)}>
                        <img
                          src={edits}
                          alt="Edit"
                          className="w-[16px] h-[16px]"
                        />
                      </button>
                    </td>
                    <td className="px-4 add-manual-datas text-center">
                      <button onClick={() => handleDelete(procedure.id)}>
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
                    No Procedures found.
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan="9" className="pt-[15px] border-t border-[#383840]">
                  <div className="flex items-center justify-between">
                    <div className="text-white total-text">
                      Total-{filteredProcedure.length}
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

export default EnMSProcedure;
