import React, { useState, useEffect } from "react";
import axios from "axios";
import view from "../../assets/images/Companies/view.svg";
import edit from "../../assets/images/Companies/edit.svg";
import deletes from "../../assets/images/Companies/delete.svg";
import permission from "../../assets/images/Companies/permission.svg";
// import com_logo from "../../assets/images/Companies/image 1.svg";
import searchIcon from "../../assets/images/Companies/search.svg";
import csvicon from "../../assets/images/Companies/csv icon.svg";
import addicon from "../../assets/images/Companies/add.svg";
import arrow from "../../assets/images/Companies/downarrow.svg";
import leftarrow from "../../assets/images/Companies/left arrow.svg";
import rightarrow from "../../assets/images/Companies/right arrow.svg";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import "./companies.css";
import { BASE_URL } from "../../Utils/Config";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../ThemeContext";
import ConfirmationModal from "./ConfirmationModal";
import DeleteSucessModal from "./DeleteSucessModal";
import DeleteErrorModal from "./DeleteErrorModal";
import BlockConfirmModal from "./BlockConfirmModal";
import BlockSuccessModal from "./BlockSuccessModal";
import BlockErrorModal from "./BlockErrorModal";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);

  const [showBlockConfirmModal, setshowBlockConfirmModal] = useState(false);
  const [companyToBlock, setCompanyToBlock] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [actionType, setActionType] = useState(""); // "block" or "activate"
  const [successMessage, setSuccessMessage] = useState("");
  const [showBlockSuccessModal, setShowBlockSuccessModal] = useState(false);
  const [showBlockErrorModal, setShowBlockErrorModal] = useState(false);

  // Fetch companies data from the API when the component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/accounts/companies/`);
        setCompanies(response.data);
        console.log("Companies List", response.data);
      } catch (error) {
        console.error("Error fetching companies data:", error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    // Fetch subscribers from the backend API
    axios
      .get(`${BASE_URL}/accounts/subscribers/`)
      .then((response) => {
        setSubscribers(response.data); // Set the fetched data to the state
        console.log("Subscribers List", response.data);
      })
      .catch((error) => {
        console.error("Error fetching subscribers:", error);
      });
  }, []);

  const filteredCompanies = companies
    .filter((company) => {
      const nameMatch =
        company.company_name &&
        company.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      const adminNameMatch =
        company.company_admin_name &&
        company.company_admin_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const emailMatch =
        company.email_address &&
        company.email_address.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch =
        company.phone_no1 && company.phone_no1.includes(searchQuery);
      return nameMatch || adminNameMatch || emailMatch || phoneMatch;
    })
    .sort((a, b) => b.id - a.id); // Sort in descending order by ID

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddCompany = () => {
    navigate("/admin/addcompany");
  };

  const handleExportToCSV = () => {
    const csvHeaders = ["ID", "Name", "Username", "Email", "Phone", "Status"];
    const csvRows = paginatedCompanies.map((company) => [
      company.id,
      company.company_name,
      company.user_id,
      company.email_address,
      company.phone_no1,
      company.status,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "companies.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleView = (companyId) => {
    navigate(`/admin/viewcompany/${companyId}`);
  };

  const handleEdit = (companyId) => {
    navigate(`/admin/editcompany/${companyId}`);
  };

  const toggleDropdown = (companyId) => {
    setActiveDropdown((prev) => (prev === companyId ? null : companyId));
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const getPlanName = (companyId) => {
    const subscriber = subscribers.find(
      (subscriber) => subscriber.company === companyId
    );
    return subscriber ? subscriber.plan_name : "";
  };
  const getExpiry = (companyId) => {
    const subscriber = subscribers.find(
      (subscriber) => subscriber.company === companyId
    );

    if (!subscriber || !subscriber.expiry_date) return "";

    // Convert the expiry_date to a date object
    const expiryDate = new Date(subscriber.expiry_date);
    const currentDate = new Date();

    // Check if the expiry date has passed
    if (expiryDate < currentDate) {
      return "Expired"; // Return "Expired" if the date has passed
    }

    // Format the expiry date as dd-mm-yyyy
    const formattedDate = `${String(expiryDate.getDate()).padStart(2, "0")}-${String(
      expiryDate.getMonth() + 1
    ).padStart(2, "0")}-${expiryDate.getFullYear()}`;

    return formattedDate;
  };


  const handleDeleteClick = (companyId) => {
    setCompanyToDelete(companyId);
    setShowDeleteModal(true);
  };

  const toggleBlockStatus = (companyId, status) => {
    setCompanyToBlock(companyId);
    setCurrentStatus(status);

    const action = status.toLowerCase() === "active" ? "block" : "active";
    setActionType(action);

    setshowBlockConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (companyToDelete) {
      axios
        .delete(`${BASE_URL}/accounts/company/${companyToDelete}/delete/`)
        .then((response) => {
          setCompanies(
            companies.filter((company) => company.id !== companyToDelete)
          );
          setShowDeleteSuccessModal(true);
          setTimeout(() => {
            setShowDeleteSuccessModal(false);
          }, 3000);
          console.log("Company deleted successfully:", response.data);
        })
        .catch((error) => {
          setShowDeleteErrorModal(true);
          setTimeout(() => {
            setShowDeleteErrorModal(false);
          }, 3000);
          console.error("Error deleting company:", error);
        });
    }
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Update company status using the API
  const handleConfirmBlock = () => {
    if (companyToBlock) {
      const newAction =
        currentStatus.toLowerCase() === "active" ? "block" : "active";

      axios
        .post(`${BASE_URL}/accounts/company/${companyToBlock}/change-status/`, {
          action: newAction,
        })
        .then(() => {
          console.log("Status updated successfully");

          setCompanies((prevCompanies) =>
            prevCompanies.map((company) =>
              company.id === companyToBlock
                ? {
                  ...company,
                  status: newAction === "block" ? "Blocked" : "Active",
                }
                : company
            )
          );
          const message =
            newAction === "block"
              ? "Company Blocked Successfully!"
              : "Company Unblocked Successfully!";
          setSuccessMessage(message);
          setShowBlockSuccessModal(true);
          setTimeout(() => {
            setShowBlockSuccessModal(false);
          }, 3000);
        })
        .catch((error) => {
          console.error("Full error response:", error.response?.data);
          setShowBlockErrorModal(true);
          setTimeout(() => {
            setShowBlockErrorModal(false);
          }, 3000);
        });
    }
    setshowBlockConfirmModal(false);
  };

  const handleCancelBlock = () => {
    setshowBlockConfirmModal(false);
  };

  return (
    <div>
      <div
        className={`border rounded-lg main ${theme === "dark" ? "dark" : "light"
          }`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <h1 className="cmpilisthead">Companies</h1>
        <div className="lg:flex gap-3 p-5 navcomitems">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded focus:outline-none search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <img
              src={searchIcon}
              alt="Search"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 listserachicon"
            />
          </div>
          <div className="topbtns gap-x-3">
            <button
              className="bg-[#677487] rounded duration-200 hover:bg-[#4f5763] text-white topbtn excsv gap-1"
              onClick={handleExportToCSV}
            >
              <img src={csvicon} alt="Export" className="w-5 h-5" />
              Export to CSV
            </button>
            <button
              className="duration-200 rounded hover:bg-[#21ab86] topbtn addcmpny gap-2"
              onClick={handleAddCompany}
            >
              <img src={addicon} alt="Add" className="w-4 h-4" />
              <p className="addnewcmpy">Add New Company</p>
              <p className="addcmpymob">Add Company</p>
            </button>
          </div>
        </div>

        <ConfirmationModal
          showDeleteModal={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
        <DeleteSucessModal
          showDeleteSuccessModal={showDeleteSuccessModal}
          onClose={() => setShowDeleteSuccessModal(false)}
        />
        <DeleteErrorModal
          showDeleteErrorModal={showDeleteErrorModal}
          onClose={() => setShowDeleteErrorModal(false)}
        />
        <BlockConfirmModal
          showBlockConfirmModal={showBlockConfirmModal}
          actionType={actionType}
          onConfirm={handleConfirmBlock}
          onCancel={handleCancelBlock}
        />
        <BlockSuccessModal
          showBlockSuccessModal={showBlockSuccessModal}
          onClose={() => setShowBlockSuccessModal(false)}
          message={successMessage}
        />
        <BlockErrorModal
          showBlockErrorModal={showBlockErrorModal}
          onClose={() => setShowBlockErrorModal(false)}
        />

        <div className="overflow-x-auto w-full">
          <table className="companieslist">
            <thead className="lg:border-t  listheads">
              <tr className="lg:border-b comhead">
                <th className="companiesthead companiestheadsl">Sl</th>
                <th className="text-start companiestheadlogo">Logo</th>
                <th className="text-start companiesthead compnyname">
                  Company Name
                </th>
                <th className="text-start companiesthead comadminname nodisplayhead tabview">
                 Username
                </th>
                <th className="text-start companiesthead compnyemail nodisplayhead ">
                  Email
                </th>
                <th className="text-start companiesthead nodisplayhead tabview">
                  Phone
                </th>
                <th className="text-start companiesthead nodisplayhead tabview">
                  Status
                </th>
                <th className="companiesthead nodisplayhead tabview">View</th>
                <th className="companiesthead nodisplayhead tabview">Edit</th>
                <th className="companiesthead nodisplayhead tabview">Block</th>
                <th className="companiesthead nodisplayhead tabview">Delete</th>
                <th className="companiesthead compnyper nodisplayhead tabview">
                  Permissions
                </th>
                <div className="drophead"></div>
                <div className="dropheadtab"></div>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.map((company, index) => (
                <React.Fragment key={company.id}>
                  <tr
                    key={company.id}
                    className={`cursor-pointer tblrows ${activeDropdown === company.id ? "no-border" : ""
                      }`}
                  >
                    <td className="companiesdatasl">
                      {String(index + 1 + indexOfFirstItem).padStart(2, "0")}
                    </td>
                    <td className="companiestheadlogo">
                      <img
                        src={company.company_logo}
                        alt="Logo"
                        className="w-[70px] rounded mobcomlistviewimg"
                      />
                    </td>
                    <td className="companiesdata companydataname">
                      {company.company_name}
                      <br />
                      {getPlanName(company.id) ? (
                        <div className="flex activeplan md:space-x-1">
                          <div className="activesubplantext">
                            <span className="activesubplantexttext">
                              {getPlanName(company.id)}
                            </span>
                          </div>
                          <div>
                            <span className={`${getExpiry(company.id) === "Expired" ? "expired-text" : "expire-on-text"}`}>
                              {getExpiry(company.id) === "Expired" ? "Expired" : `Expire On: ${getExpiry(company.id)}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="inactivesubtext">
                          <span className="inactivesubtexttext">
                            No Active Subscription Plan
                          </span>
                        </div>
                      )}



                    </td>

                    <td className="companiesdata nodisplaydata cmpyadminnametab">
                      {company.user_id}
                    </td>
                    <td className="companiesdata companyemaildata nodisplaydata ">
                      {company.email_address}
                    </td>
                    <td className="companiesdata nodisplaydata tabview">
                      {company.phone_no1}
                    </td>
                    <td className="companiesdata nodisplaydata tabview">
                      <span
                        className={`p-1 rounded blockk ${company.status.toLowerCase() === "active"
                            ? "companiesactivestate"
                            : "companiesblockstate"
                          }`}
                      >
                        {company.status.charAt(0).toUpperCase() +
                          company.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="companiesdata nodisplaydata tabview">
                      <div className="flex justify-center items-center w-full darkthemebtn">
                        <img
                          src={view}
                          alt="View"
                          className="cursor-pointer "
                          onClick={() => handleView(company.id)}
                        />
                      </div>
                    </td>

                    <td className=" companiesdata nodisplaydata tabview">
                      <div className="flex justify-center items-center w-full darkthemebtn">
                        <img
                          src={edit}
                          alt="Edit"
                          className="cursor-pointer "
                          onClick={() => handleEdit(company.id)}
                        />
                      </div>
                    </td>
                    <td className="companiesdata nodisplaydata tabview">
                      <div className="flex justify-center items-center w-full">
                        <button
                          className={`items-center rounded-full p-1 toggle ${company.status.toLowerCase() === "blocked"
                              ? "toggleblock"
                              : "toggleactive"
                            }`}
                          onClick={() =>
                            toggleBlockStatus(company.id, company.status)
                          }
                        >
                          <div
                            className={`rounded-full transform transition-transform bar ${company.status.toLowerCase() === "blocked"
                                ? "translate-x-2"
                                : "translate-x-0"
                              }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="companiesdata nodisplaydata tabview">
                      <div className="flex justify-center items-center w-full darkthemebtn">
                        <img
                          src={deletes}
                          alt="Delete"
                          className="cursor-pointer "
                          onClick={() => handleDeleteClick(company.id)}
                        />
                      </div>
                    </td>
                    <td className="companiesdata comperdata nodisplaydata tabview">
                      <div className="flex justify-center items-center w-full darkthemebtn">
                        <img src={permission} alt="Permissions" />
                      </div>
                    </td>
                    <div
                      className={`bgarrow ${activeDropdown === company.id ? "active" : ""
                        }`}
                      onClick={() => toggleDropdown(company.id)}
                    >
                      <img
                        src={arrow}
                        alt=""
                        className={`dropdown-img w-[10px] ${activeDropdown === company.id ? "rotated" : ""
                          }`}

                      />
                    </div>

                    <div
                      className={`bgarrowtab ${activeDropdown === company.id ? "active" : ""
                        }`}
                      onClick={() => toggleDropdown(company.id)}
                    >
                      <img
                        src={arrow}
                        alt=""
                        className={`dropdown-imgtab ${activeDropdown === company.id ? "rotated" : ""
                          }`}
                      />
                    </div>
                  </tr>
                  <AnimatePresence>
                    {activeDropdown === company.id && (
                      <motion.tr
                        className="dropdown-row"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={dropdownVariants}
                      >
                        <td colSpan="12" className="dropdownlist">
                          {/* Dropdown content goes here */}
                          <div className="flex justify-between gap-3 ">
                            <div>
                              <h4 className="mobhead">Username</h4>
                              <p className="mobdata mobcmpyadmin">
                                {company.user_id}
                              </p>
                            </div>
                            <div>
                              <h4 className="mobhead">Phone</h4>
                              <p className="mobdata mobcmpyphone">
                                {company.phone_no1}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-end mobhead">Status</h4>
                              <span
                                className={`rounded blockk text-xs blocks ${company.status.toLowerCase() === "active"
                                    ? "mobstatusactive"
                                    : "mobstatusInactive"
                                  }`}
                              >
                                {company.status.charAt(0).toUpperCase() +
                                  company.status.slice(1).toLowerCase()}
                              </span>
                            </div>
                          </div>
                          <div className="mobemaildiv tabview">
                            <h4 className="mobhead">Email</h4>
                            <p className="mobdata">{company.email_address}</p>
                          </div>
                          <div className="flex justify-between mobactions">
                            <div className="mobresactions darkthememob">
                              <h4 className="mobhead">View</h4>
                              <img
                                src={view}
                                alt="View"
                                className="w-[15px] mobicon mobviewicon"
                                onClick={() => handleView(company.id)}
                              />
                            </div>
                            <div className="mobresactions darkthememob">
                              <h4 className="mobhead">Edit</h4>
                              <img
                                src={edit}
                                alt="Edit"
                                className="w-[15px] mobicon cursor-pointer"
                                onClick={() => handleEdit(company.id)}
                              />
                            </div>
                            <div className="mobresactions">
                              <h4 className="mobhead">Block</h4>
                              <button
                                className={`items-center rounded-full p-1 toggle mobicon ${company.status.toLowerCase() === "blocked"
                                    ? "mobtoggleblock"
                                    : "mobtoggleactive"
                                  }`}
                                onClick={() =>
                                  toggleBlockStatus(company.id, company.status)
                                }
                              >
                                <div
                                  className={`bg-white rounded-full transform transition-transform bar ${company.status.toLowerCase() === "blocked"
                                      ? "translate-x-2"
                                      : "translate-x-0"
                                    }`}
                                />
                              </button>
                            </div>
                            <div className="mobresactions darkthememob">
                              <h4 className="mobhead">Delete</h4>
                              <img
                                src={deletes}
                                alt="Delete"
                                className="cursor-pointer mobicon w-[15px]"
                                onClick={() => handleDeleteClick(company.id)} // Show the modal on delete click
                              />
                            </div>
                            <div className="darkthememob mobresactions">
                              <h4 className="mobhead">Permissions</h4>
                              <img
                                src={permission}
                                alt="Permissions"
                                className="mobicon w-[15px] cursor-pointer"
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`flex justify-between items-center mt-1 paginationmob ${theme === "dark" ? "dark" : "light"
          }`}
      >
        <p className="pagination">
          Showing{" "}
          <span className="paginationnorecent">
            {itemsPerPage * (currentPage - 1) + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of{" "}
            {filteredCompanies.length}
          </span>{" "}
          entries
        </p>
        <div className="flex justify-center items-center pageswipe">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-0 py-2 ${currentPage === 1
                ? "cursor-not-allowed  arrowblocked"
                : "arrowactived"
              }`}
          >
            <img
              src={rightarrow}
              alt="Previous"
              className={`w-3 h-3 rotate-180 ${currentPage === 1 ? "arrowblocked" : "arrowactived"
                }`}
            />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-1 py-2 ${currentPage === i + 1 ? "pagenocom" : "pagenonotcom"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-0 py-2 ${currentPage === totalPages
                ? "arrowblocked cursor-not-allowed "
                : "arrowactived"
              }`}
          >
            <img
              src={rightarrow}
              alt="Next"
              className={`w-3 h-3 ${currentPage === totalPages ? "arrowblocked" : "arrowactived"
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Companies;
