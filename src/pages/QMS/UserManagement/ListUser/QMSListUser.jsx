import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import plusicon from "../../../../assets/images/Company User Management/plus icon.svg";
import views from "../../../../assets/images/Companies/view.svg";
import permissions from "../../../../assets/images/Company User Management/permission.svg";
import edits from "../../../../assets/images/Company User Management/edits.svg";
import deletes from "../../../../assets/images/Company User Management/deletes.svg";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../../Utils/Config";
import toast, { Toaster } from 'react-hot-toast';
import "./listuser.css";
import QmsDeleteUserConfirmModal from '../Modals/QmsDeleteUserConfirmModal';
import QmsDeleteUserSuccessModal from '../Modals/QmsDeleteUserSuccessModal';
import QmsDeleteUserErrorModal from '../Modals/QmsDeleteUserErrorModal';
import QmsBlockUserConfirmModal from '../Modals/QmsBlockUserConfirmModal';
import QmsBlockUserSuccessModal from '../Modals/QmsBlockUserSuccessModal';
import QmsBlockUserErrorModal from '../Modals/QmsBlockUserErrorModal';

const QMSListUser = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteUserSuccessModal, setShowDeleteUserSuccessModal] = useState(false);
  const [showDeleteUserErrorModal, setShowDeleteUserErrorModal] = useState(false);

  // Status loading indicator
  const [statusLoading, setStatusLoading] = useState({});

  // New state variables for blocking/unblocking users
  const [userToBlock, setUserToBlock] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [actionType, setActionType] = useState(""); // "block" or "active"
  const [successMessage, setSuccessMessage] = useState("");
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [showBlockSuccessModal, setShowBlockSuccessModal] = useState(false);
  const [showBlockErrorModal, setShowBlockErrorModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

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

  // Modify the fetchUsers function to sort by latest added first

  const fetchUsers = async () => {
    try {
      const companyId = getUserCompanyId(); // Fetch company ID dynamically

      if (!companyId) return;

      const response = await axios.get(`${BASE_URL}/company/users/${companyId}/`, {
        params: {
          search: searchQuery,
          page: currentPage,
          limit: usersPerPage,
          order_by: "created_at", // Request server-side sorting if API supports it
          order: "desc"           // Sort in descending order (newest first)
        },
      });

      console.log("API Response:", response.data);

      let usersList = [];

      if (Array.isArray(response.data)) {
        usersList = response.data;
        setTotalPages(1);
      } else if (response.data.users) {
        usersList = response.data.users;
        setTotalPages(response.data.total_pages || 1);
      }

      // If server doesn't support sorting, sort locally
      // Sort by created_at or registration_date (adjust field name if different)
      const sortedUsers = usersList.sort((a, b) => {
        const dateA = new Date(a.created_at || a.registration_date || 0);
        const dateB = new Date(b.created_at || b.registration_date || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAddUsers = () => {
    navigate('/company/qms/adduser');
  };

  const handleEditUser = (userId) => {
    console.log("Edit user with ID:", userId);
    navigate(`/company/qms/edituser/${userId}`);
  };

  const handleViewUser = (userId) => {
    navigate(`/company/qms/user-details/${userId}`);
  }

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await axios.delete(`${BASE_URL}/company/users/delete/${userToDelete}/`);
        setUsers(users.filter(user => user.id !== userToDelete));
        setShowDeleteUserSuccessModal(true);
        setTimeout(() => {
          setShowDeleteUserSuccessModal(false);
        }, 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setShowDeleteUserErrorModal(true);
        setTimeout(() => {
          setShowDeleteUserErrorModal(false);
        }, 3000);
      }
    }
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Toggle block status function
  const handleToggleStatus = async (userId, currentStatus) => {
    // Set the user to block/unblock and the current status
    setUserToBlock(userId);
    setCurrentStatus(currentStatus);

    // Set action type based on current status
    const newAction = currentStatus.toLowerCase() === "active" ? "block" : "active";
    setActionType(newAction);

    // Show the confirmation modal
    setShowBlockConfirmModal(true);
  };

  // Function to handle confirm block action
  const handleConfirmBlock = async () => {
    if (userToBlock) {
      setStatusLoading(prev => ({ ...prev, [userToBlock]: true }));

      try {
        const newStatus = currentStatus.toLowerCase() === "active" ? "blocked" : "active";
        const companyId = getUserCompanyId();

        if (!companyId) {
          setShowBlockErrorModal(true);
          setTimeout(() => {
            setShowBlockErrorModal(false);
          }, 3000);
          return;
        }

        // Make an API call to update the user status
        await axios.put(`${BASE_URL}/company/users/update/${userToBlock}/`, {
          status: newStatus,
          company_id: companyId
        });

        // Update local state to reflect the change
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userToBlock
              ? { ...user, status: newStatus }
              : user
          )
        );

        // Set success message based on new status
        const message = newStatus === "blocked"
          ? "User Blocked Successfully!"
          : "User Activated Successfully!";
        setSuccessMessage(message);
        setShowBlockSuccessModal(true);
        setTimeout(() => {
          setShowBlockSuccessModal(false);
        }, 3000);
      } catch (error) {
        console.error("Error updating user status:", error);
        setShowBlockErrorModal(true);
        setTimeout(() => {
          setShowBlockErrorModal(false);
        }, 3000);
      } finally {
        setStatusLoading(prev => ({ ...prev, [userToBlock]: false }));
      }
    }
    setShowBlockConfirmModal(false);
  };

  // Function to handle cancel block action
  const handleCancelBlock = () => {
    setShowBlockConfirmModal(false);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-[#1C1C24] list-users-main">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-between px-[14px] pt-[24px]">
        <h1 className="list-users-head">List Users</h1>

        {/* Delete Modals */}
        <QmsDeleteUserConfirmModal
          showDeleteModal={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        <QmsDeleteUserSuccessModal
          showDeleteUserSuccessModal={showDeleteUserSuccessModal}
          onClose={() => setShowDeleteUserSuccessModal(false)}
        />

        <QmsDeleteUserErrorModal
          showDeleteUserErrorModal={showDeleteUserErrorModal}
          onClose={() => setShowDeleteUserErrorModal(false)}
        />

        {/* Block Modals */}
        <QmsBlockUserConfirmModal
          showBlockConfirmModal={showBlockConfirmModal}
          actionType={actionType}
          onConfirm={handleConfirmBlock}
          onCancel={handleCancelBlock}
        />

        <QmsBlockUserSuccessModal
          showBlockSuccessModal={showBlockSuccessModal}
          onClose={() => setShowBlockSuccessModal(false)}
          message={successMessage}
        />

        <QmsBlockUserErrorModal
          showBlockErrorModal={showBlockErrorModal}
          onClose={() => setShowBlockErrorModal(false)}
        />

        <div className="flex space-x-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="serach-input focus:outline-none bg-transparent"
            />
            <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
              <Search size={18} />
            </div>
          </div>
          <button
            className="flex items-center justify-center add-user-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
            onClick={handleAddUsers}
          >
            <span>Add Users</span>
            <img src={plusicon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
          </button>
        </div>
      </div>

      <div className="p-5 overflow-hidden">
        <table className="w-full">
          <thead className='bg-[#24242D]'>
            <tr className="list-users-tr h-[48px]">
              <th className="px-5 text-left add-user-theads">No</th>
              <th className="px-5 text-left add-user-theads">Username</th>
              <th className="px-5 text-left add-user-theads">Name</th>
              <th className="px-5 text-left add-user-theads">Email</th>
              <th className="px-5 text-left add-user-theads">Status</th>
              <th className="px-5 text-center add-user-theads">Block</th>
              <th className="px-5 text-center add-user-theads">Permissions</th>
              <th className="px-5 text-center add-user-theads">View</th>
              <th className="px-5 text-center add-user-theads">Edit</th>
              <th className="px-5 text-center add-user-theads">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.id} className="border-b border-[#383840] hover:bg-[#1a1a20] cursor-pointer h-[46px]">
                  <td className="px-[23px] add-user-datas">{(currentPage - 1) * usersPerPage + index + 1}</td>
                  <td className="px-5 add-user-datas">{user.username}</td>
                  <td className="px-5 add-user-datas">{user.first_name} {user.last_name}</td>
                  <td className="px-5 add-user-datas">{user.email}</td>
                  <td className="px-5 add-user-datas">
                    <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 add-user-datas text-center">
                    <div className="flex justify-center items-center w-full">
                      <button
                        className={`items-center rounded-full p-1 toggle ${user.status && user.status.toLowerCase() === "blocked" ? "toggleblock" : "toggleactive"}`}
                        onClick={() => handleToggleStatus(user.id, user.status || "Active")}
                        disabled={statusLoading[user.id]}
                      >
                        {statusLoading[user.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <div
                            className={`rounded-full transform transition-transform bar ${user.status.toLowerCase() === "blocked"
                              ? "translate-x-2"
                              : "translate-x-0"
                              }`}
                          />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 add-user-datas text-center flex justify-center items-center h-[46px]">
                    <img src={permissions} alt="Permission" className='w-[16px] h-[16px]' />
                  </td>
                  <td className="px-4 add-user-datas text-center">
                    <button onClick={() => handleViewUser(user.id)}>
                      <img src={views} alt="View" />
                    </button>
                  </td>
                  <td className="px-4 add-user-datas text-center">
                    <button onClick={() => handleEditUser(user.id)}>
                      <img src={edits} alt="Edit" className='w-[16px] h-[16px]' />
                    </button>
                  </td>
                  <td className="px-4 add-user-datas text-center">
                    <button onClick={() => handleDeleteClick(user.id)}>
                      <img src={deletes} alt="Delete" className='w-[16px] h-[16px]' />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 not-found">No users found.</td>
              </tr>
            )}
            <tr>
              <td colSpan="10" className="pt-[15px] border-t border-[#383840]">
                <div className="flex items-center justify-between">
                  <div className="text-white total-text">
                    Total-{users.length}
                  </div>
                  <div className="flex items-center gap-5">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className="cursor-pointer swipe-text"
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
                      disabled={currentPage === totalPages}
                      className="cursor-pointer swipe-text"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QMSListUser;