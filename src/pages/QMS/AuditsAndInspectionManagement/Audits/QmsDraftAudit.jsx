import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import view from "../../../../assets/images/Company Documentation/view.svg";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const QmsDraftAudit = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
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

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const companyId = getUserCompanyId();
      const response = await axios.get(`${BASE_URL}/qms/audit-draft/${companyId}/`, {
        params: { is_draft: true }
      });
      setAudits(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching audits:", err);
      setError("Failed to load audits");
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const deleteAudit = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/qms/audit-get/${id}/`);
      fetchAudits(); // Refresh the list
    } catch (err) {
      console.error("Error deleting audit:", err);
      alert("Failed to delete audit");
    }
  };

  const itemsPerPage = 10;
  const totalItems = audits.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Filter items based on search query
  const filteredItems = audits.filter(item =>
    (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.audit_type && item.audit_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleClose = () => {
    navigate('/company/qms/list-audit');
  };

  const handleEditDraftAudit = (id) => {
    navigate(`/company/qms/edit-draft-audit/${id}`);
  };

  const handleViewDraftAudit = (id) => {
    navigate(`/company/qms/view-draft-audit/${id}`);
  };

  if (loading) {
    return <div className="bg-[#1C1C24] text-white p-5 rounded-lg">Loading...</div>;
  }

  if (error) {
    return <div className="bg-[#1C1C24] text-white p-5 rounded-lg">{error}</div>;
  }

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="list-awareness-training-head">Draft Audit</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#1C1C24] text-white px-[10px] h-[42px] rounded-md w-[333px] border border-[#383840] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className='absolute right-[1px] top-[1px] text-white bg-[#24242D] p-[11px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
              <Search size={18} />
            </div>
          </div>

          <button onClick={handleClose} className="bg-[#24242D] p-2 rounded-md">
            <X className="text-white" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead className='bg-[#24242D]'>
            <tr className='h-[48px]'>
              <th className="px-3 text-left list-awareness-training-thead">No</th>
              <th className="px-3 text-left list-awareness-training-thead">Title</th>
              <th className="px-3 text-left list-awareness-training-thead">Audit Type</th>
              <th className="px-3 text-left list-awareness-training-thead">Date Planned</th>
              <th className="px-3 text-left list-awareness-training-thead">Action</th>
              <th className="px-3 text-center list-awareness-training-thead">View</th>
              <th className="px-3 text-center list-awareness-training-thead">Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id} className="border-b border-[#383840] hover:bg-[#131318] cursor-pointer h-[50px]">
                  <td className="px-3 list-awareness-training-datas">{indexOfFirstItem + index + 1}</td>
                  <td className="px-3 list-awareness-training-datas">{item.title || 'N/A'}</td>
                  <td className="px-3 list-awareness-training-datas">{item.audit_type || 'N/A'}</td>
                  <td className="px-3 list-awareness-training-datas">{formatDate(item.proposed_date)}</td>
                  <td className="px-3 list-awareness-training-datas text-left text-[#1E84AF]">
                    <button
                      onClick={() => handleEditDraftAudit(item.id)}
                    >
                      Click to Continue
                    </button>
                  </td>
                  <td className="list-awareness-training-datas text-center ">
                    <div className='flex justify-center items-center h-[50px]'>
                      <button
                        onClick={() => handleViewDraftAudit(item.id)}
                      >
                        <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
                      </button>
                    </div>
                  </td>
                  <td className="list-awareness-training-datas text-center">
                    <div className='flex justify-center items-center h-[50px]'>
                      <button
                        onClick={() => deleteAudit(item.id)}
                      >
                        <img src={deletes} alt="Delete Icon" className='w-[16px] h-[16px]' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">No draft audits found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="flex justify-between items-center mt-3">
          <div className='text-white total-text'>Total: {totalItems}</div>
          <div className="flex items-center gap-5">
            <button
              className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                className={`w-8 h-8 rounded-md ${currentPage === number ? 'pagin-active' : 'pagin-inactive'
                  }`}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            ))}

            <button
              className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QmsDraftAudit;