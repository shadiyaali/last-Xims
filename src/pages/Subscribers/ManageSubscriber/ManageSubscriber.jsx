import React, { useState, useEffect } from "react";
import axios from "axios";
import edit from "../../../assets/images/Subscriber/edit.svg";
import downarrow from "../../../assets/images/Subscriber/downarrow.svg";
import deletes from "../../../assets/images/Subscriber/delete.svg";
import "./managesubscriber.css";
import { useTheme } from "../../../ThemeContext";
import { BASE_URL } from "../../../Utils/Config";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SubscriberDeleteModal from "./SubscriberDeleteModal";
import SubscriberDeleteSuccess from "./SubscriberDeleteSuccess";
import SubscriberDeleteErrorModal from "./SubscriberDeleteErrorModal";
import SubscriberBlockModal from "./SubscriberBlockModal";
import SubscriberBlockSuccessModal from "./SubscriberBlockSuccessModal";
import SubscriberBlockErrorModal from "./SubscriberBlockErrorModal";
import leftarrow from "../../../assets/images/Subscriber/left arrow.svg";
import rightarrow from "../../../assets/images/Subscriber/right arrow.svg";
import csv from "../../../assets/images/Subscriber/csv icon.svg";

const ManageSubscriber = () => {
  const [subscribers, setSubscribers] = useState([]);
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeManageDropdown, setActiveManageDropdown] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const [showExportModal, setShowExportModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedRange, setSelectedRange] = useState("any");
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accounts/subscriptions/`);
      if (response.data && response.data.length > 0) {
        setSubscriptionPlans(response.data);
        setSelectedPlan("All Plans"); // Default to "All Plans"
        console.log("Fetched Subscription Plans:", response.data);
      } else {
        console.log("No subscription plans found.");
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    }
  };
  
  useEffect(() => {
    fetchSubscriptionPlans(); // Call the function to fetch plans
  }, []);



  const handleExportSubmit = async () => {
    try {
      // Validate input
      if (selectedPlan === "") {
        toast.error("Please select a subscription type");
        return;
      }

      // Build payload
      const payload = {};

      // Add date range to the payload only if selectedRange is "date-range"
      if (selectedRange === "date-range") {
        if (!startDate || !endDate) {
          toast.error("Please select both start and end dates.");
          return;
        }

        // Format dates
        const formatDate = (date) => new Date(date).toISOString().split("T")[0];
        payload.start_date = formatDate(startDate);
        payload.end_date = formatDate(endDate);
      }

      console.log("Final Payload:", payload);

      // Fetch subscribers
      const response = await axios.get(`${BASE_URL}/accounts/subscribers/`);
      if (!response.data || response.data.length === 0) {
        toast.error("No data available for export.");
        return;
      }

      // Filter data
      const filteredData = response.data.filter((subscriber) => {
        const expiryDate = new Date(subscriber.expiry_date).setHours(0, 0, 0, 0);
      
        // Ensure date range is applied correctly
        let isDateInRange = true;
        if (selectedRange === "date-range") {
          const fromDate = new Date(payload.start_date).setHours(0, 0, 0, 0);
          const toDate = new Date(payload.end_date).setHours(0, 0, 0, 0);
          console.log("Checking Date Range:", fromDate, expiryDate, toDate);
          isDateInRange = expiryDate >= fromDate && expiryDate <= toDate;
        }
      
        // Check if selectedPlan is "All Plans"
        const isPlanMatching =
          selectedPlan === "All Plans" || subscriber.plan_name === selectedPlan;
      
        return isDateInRange && isPlanMatching;
      });
      

      console.log("Filtered Data:", filteredData);

      if (filteredData.length === 0) {
        toast.error("No subscribers meet the criteria");
        return;
      }

      // Convert to CSV
      const csvHeaders = ["Company Name", "Subscription Plan", "Expiry Date", "Status"];
      const headerMapping = {
        "Company Name": "company_name",
        "Subscription Plan": "plan_name",
        "Expiry Date": "expiry_date",
        "Status": "status"
      };
      
      const csvRows = filteredData.map((subscriber) =>
        csvHeaders
          .map((header) =>
            header === "Expiry Date"
              ? subscriber[headerMapping[header]] // Use mapping to access the data
              : subscriber[headerMapping[header]] || ""
          )
          .join(",")
      );
      
      const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `subscribers_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      

      setShowExportModal(false);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    }
  };

  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const [subscriberToBlock, setSubscriberToBlock] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [actionType, setActionType] = useState(""); // "block" or "activate"
  const [successMessage, setSuccessMessage] = useState("");

  const [showDeleteSubscriberModal, setShowDeleteSubscriberModal] = useState(false);
  const [showDeleteSubscriberSuccesssModal, setShowDeleteSubscriberSuccesssModal] = useState(false);
  const [showDeleteSubscriberErrorModal, setShowDeleteSubscriberErrorModal] = useState(false);
  const [showBlockSubscriberModal, setShowBlockSubscriberModal] = useState(false);
  const [showsubscriberBlockSuccessModal, setShowSubscriberBlockSuccessModal] = useState(false);
  const [showSubscriberBlockErrorModal, setShowSubscriberBlockErrorModal] = useState(false);

  useEffect(() => {
    // Fetch subscribers from the backend API
    axios
      .get(`${BASE_URL}/accounts/subscribers/`)
      .then((response) => {
        const plans = response.data.map((item) => ({
          id: item.plan,
          name: item.plan_name,
        }));
        setSubscriptionPlans(plans); // Set fetched plans to state
        setSubscribers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching subscribers:", error);
      });
  }, []);

  const toggleBlockStatus = (id, status) => {
    setSubscriberToBlock(id);
    setCurrentStatus(status);

    const action = status.toLowerCase() === "active" ? "block" : "active";
    setActionType(action);

    setShowBlockSubscriberModal(true);
  };

  const handleConfirmBlock = () => {
    if (subscriberToBlock) {
      const newAction =
        currentStatus.toLowerCase() === "active" ? "block" : "active";
      axios
        .post(
          `${BASE_URL}/accounts/subscriber/${subscriberToBlock}/change-status/`,
          {
            action: newAction,
          }
        )
        .then(() => {
          console.log("Status updated successfully");

          // Update the subscriber data locally
          setSubscribers((prevSubscribers) =>
            prevSubscribers.map((subscriber) =>
              subscriber.id === subscriberToBlock
                ? {
                    ...subscriber,
                    status: newAction === "block" ? "Blocked" : "Active",
                  }
                : subscriber
            )
          );
          const message =
            newAction === "block"
              ? "Subsciber Blocked Successfully!"
              : "Subscriber Unblocked Successfully!";
          setSuccessMessage(message);
          setShowSubscriberBlockSuccessModal(true);
          setTimeout(() => {
            setShowSubscriberBlockSuccessModal(false);
          }, 3000);
        })
        .catch((error) => {
          setShowSubscriberBlockErrorModal(true);
          setTimeout(() => {
            setShowSubscriberBlockErrorModal(false);
          }, 3000);
          console.error("Error updating status:", error);
        });
    }
    setShowBlockSubscriberModal(false);
  };

  const handleCancelBlock = () => {
    setShowBlockSubscriberModal(false);
  };

  const deleteSubscriber = (id) => {
    setSubscriberToDelete(id);
    setShowDeleteSubscriberModal(true);
  };
  const handleConfirmSubscriberDelete = () => {
    if (subscriberToDelete) {
      axios
        .delete(`${BASE_URL}/accounts/subscribers/${subscriberToDelete}/`)
        .then((response) => {
          setSubscribers((prevSubscribers) =>
            prevSubscribers.filter(
              (subscriber) => subscriber.id !== subscriberToDelete
            )
          );
          setShowDeleteSubscriberSuccesssModal(true);
          setTimeout(() => {
            setShowDeleteSubscriberSuccesssModal(false);
          }, 3000);
        })

        .catch((error) => {
          console.error("error deleting subscriber:", error);
          setShowDeleteSubscriberErrorModal(true);
          setTimeout(() => {
            setShowDeleteSubscriberErrorModal(false);
          }, 3000);
        });
    }
    setShowDeleteSubscriberModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteSubscriberModal(false);
  };
  const totalPages = Math.ceil(subscribers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedSubscribers = subscribers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/change-subscriber/${id}`);
  };

  const toggleManageSubDropdown = (id) => {
    setActiveManageDropdown((prev) => (prev === id ? null : id));
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

  return (
    <>
      <div className={`managesub ${theme === "dark" ? "dark" : "light"}`}>
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex justify-between">
          <h1 className="managesubhead p-5">Manage Subscribers</h1>
          <button
            className="bg-[#677487] rounded duration-200 hover:bg-[#4f5763] text-white topbtn excsv gap-1 m-5"
            onClick={() => setShowExportModal(true)}
          >
            <img src={csv} alt="Export" className="w-5 h-5" />
            Export to CSV
          </button>

          {showExportModal && (
            <div className="export-modal-overlay">
              <div className="export-modal-container">
                <div className="form-group outline-none">
                  <label htmlFor="subscription-plan" className="selectsubhead">
                    Select Subscription Type
                  </label>
                  <select
  id="subscription-plan"
  value={selectedPlan}
  onChange={(e) => {
    const value = e.target.value;
    setSelectedPlan(value);
    console.log("Selected Plan Value: ", value);
  }}
  className="outline-none subscription-plans cursor-pointer"
>
  <option value="" className="plannameoptions" disabled>
    Select Type
  </option>
  <option value="All Plans" className="plannameoptions cursor-pointer">
    All Plans
  </option>
  {[...new Map(subscriptionPlans.map((plan) => [plan.name, plan])).values()]
    .map((uniquePlan) => (
      <option
        key={uniquePlan.name}
        value={uniquePlan.name}
        className="plannameoptions cursor-pointer"
      >
        {uniquePlan.name || "Unknown Plan"}
      </option>
    ))}
</select>

                </div>

                <div className="form-group flex gap-5">
                  <p className="selectsubhead">Expiry Date Range:</p>
                  <div>
                    <label htmlFor="any" className="custom-radios">
                      <input
                        type="radio"
                        id="any"
                        name="range"
                        value="any"
                        checked={selectedRange === "any"}
                        onChange={(e) => {
                          setSelectedRange(e.target.value);
                          setStartDate(""); // Clear dates when "Any" is selected
                          setEndDate("");
                        }}
                      />
                      <span className="radio-boxes"></span>
                      <span className="checklabel">Any</span>
                    </label>
                  </div>
                  <div>
                    <label htmlFor="date-range" className="custom-radios">
                      <input
                        type="radio"
                        id="date-range"
                        name="range"
                        value="date-range"
                        checked={selectedRange === "date-range"}
                        onChange={(e) => setSelectedRange(e.target.value)}
                      />
                      <span className="radio-boxes"></span>
                      <span className="checklabel">Date Range</span>
                    </label>
                  </div>
                </div>

                {selectedRange === "date-range" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="start-date" className="selectsubhead">
                        From Date
                      </label>
                      <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="startdate outline-none cursor-pointer"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="end-date" className="selectsubhead">
                        To Date
                      </label>
                      <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="enddate outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="modal-actions gap-2">
                  <button
                    className="cancelbtns duration-200"
                    onClick={() => setShowExportModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="downloadbtns duration-200"
                    onClick={handleExportSubmit}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <SubscriberDeleteModal
          showDeleteSubscriberModal={showDeleteSubscriberModal}
          onConfirm={handleConfirmSubscriberDelete}
          onCancel={handleCancelDelete}
        />

        <SubscriberDeleteSuccess
          showDeleteSubscriberSuccesssModal={showDeleteSubscriberSuccesssModal}
          onClose={() => setShowDeleteSubscriberSuccesssModal(false)}
        />

        <SubscriberDeleteErrorModal
          showDeleteSubscriberErrorModal={showDeleteSubscriberErrorModal}
          onClose={() => setShowDeleteSubscriberErrorModal(false)}
        />

        <SubscriberBlockModal
          showBlockSubscriberModal={showBlockSubscriberModal}
          actionType={actionType}
          onConfirm={handleConfirmBlock}
          onCancel={handleCancelBlock}
        />

        <SubscriberBlockSuccessModal
          showsubscriberBlockSuccessModal={showsubscriberBlockSuccessModal}
          onClose={() => setShowSubscriberBlockSuccessModal(false)}
          message={successMessage}
        />

        <SubscriberBlockErrorModal
          showSubscriberBlockErrorModal={showSubscriberBlockErrorModal}
          onClose={() => setShowSubscriberBlockErrorModal(false)}
        />

        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead className="managesubscriberthead">
              <tr className="border-t subtheads">
                <th className="subthead slnumbermob">Sl</th>
                <th className="md:p-4 subthead md:w-[35%] text-start managesubcompanynamemob">
                  Company Name
                </th>
                <th className="md:p-4 subthead md:w-[27%] text-start managesubnamemob tabresplan">
                  Subscription Name
                </th>
                <th className="p-4 subthead text-start w-[10%] managesubresponsive tabresdate">
                  Expiry Date
                </th>
                <th className="p-4 subthead managesubresponsive">Edit</th>
                <th className="p-4 subthead managesubresponsive">Suspend</th>
                <th className="p-4 subthead w-14 managesubresponsive">
                  Delete
                </th>
                <div className="managesubscriberdrop m-10"></div>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscribers.map((subscriber, index) => (
                <React.Fragment key={subscriber.id}>
                  <tr
                    key={subscriber.id}
                    className={`text-center subrows cursor-pointer ${
                      activeManageDropdown === subscriber.id ? "no-border" : ""
                    }`}
                  >
                    <td className="p-4 subbody">
                      {(indexOfFirstItem + index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="md:p-4 text-start subbody">
                      {subscriber.company_name}
                    </td>
                    <td className="md:p-4 text-start subbody managesubnamemob subplanmob">
                      {subscriber.plan_name}
                    </td>
                    <td className="p-4 text-start subbody managesubresponsive">
                      {(() => {
                        const date = new Date(subscriber.expiry_date);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        ); // Ensure month is zero-padded
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}
                    </td>

                    <td className="managesubresponsive">
                      <button onClick={() => handleEdit(subscriber.id)}>
                        <img
                          src={edit}
                          alt="Edit"
                          className="managesubactionbtn"
                        />
                      </button>
                    </td>
                    <td className="p-4 managesubresponsive">
                      <div className="flex justify-center items-center w-full">
                        <button
                          className={`items-center rounded-full p-1 toggle ${
                            subscriber.status.toLowerCase() === "blocked"
                              ? " subtoggleblock"
                              : " subtoggleactive"
                          }`}
                          onClick={() =>
                            toggleBlockStatus(subscriber.id, subscriber.status)
                          }
                        >
                          <div
                            className={`rounded-full transform transition-transform bar ${
                              subscriber.status.toLowerCase() === "blocked"
                                ? " translate-x-22"
                                : " translate-x-00"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 managesubresponsive">
                      <button onClick={() => deleteSubscriber(subscriber.id)}>
                        <img
                          src={deletes}
                          alt="Delete"
                          className="managesubactionbtn"
                        />
                      </button>
                    </td>
                    <div
                      className={`mangesubscriptiondropdata ${
                        activeManageDropdown === subscriber.id ? "active" : ""
                      }`}
                      onClick={() => toggleManageSubDropdown(subscriber.id)}
                    >
                      <img
                        src={downarrow}
                        alt=""
                        className={`downarrowmanagesub managesubactionbtn w-[10px] ${
                          activeManageDropdown === subscriber.id
                            ? "rotated"
                            : ""
                        }`}
                        
                      />
                    </div>
                  </tr>
                  <AnimatePresence>
                    {activeManageDropdown === subscriber.id && (
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
                              <h4 className="mobheads">Expiry Date</h4>
                              <p className="mobexpiredate dropsubdata">
                                {(() => {
                                  const date = new Date(subscriber.expiry_date);
                                  const day = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const month = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0"); // Ensure month is zero-padded
                                  const year = date.getFullYear();
                                  return `${day}-${month}-${year}`;
                                })()}
                              </p>
                            </div>
                            <div className="justify-items-center submobresicon darkthememob">
                              <h4 className="mobheads">Edit</h4>
                              <button onClick={() => handleEdit(subscriber.id)}>
                                <img
                                  src={edit}
                                  alt="Edit"
                                  className="editsubmobview dropsubdata managesubactionbtn w-[15px]"
                                />
                              </button>
                            </div>
                            <div>
                              <h4 className="mobheads">Suspend</h4>
                              <div className="flex justify-center items-center w-full dropsubdata">
                                <button
                                  className={`items-center rounded-full p-1 toggle ${
                                    subscriber.status.toLowerCase() ===
                                    "blocked"
                                      ? " subtoggleblock"
                                      : " subtoggleactive"
                                  }`}
                                  onClick={() =>
                                    toggleBlockStatus(
                                      subscriber.id,
                                      subscriber.status
                                    )
                                  }
                                >
                                  <div
                                    className={`rounded-full transform transition-transform bar ${
                                      subscriber.status.toLowerCase() ===
                                      "blocked"
                                        ? " translate-x-22"
                                        : " translate-x-00"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="justify-items-center submobresicon darkthememob">
                              <h4 className="mobheads">Delete</h4>
                              <button
                                onClick={() => deleteSubscriber(subscriber.id)}
                                className="dropsubdata"
                              >
                                <img
                                  src={deletes}
                                  alt="Delete"
                                  className="deletesubmobview managesubactionbtn w-[15px]"
                                />
                              </button>
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
        className={`flex justify-between paginationmob items-center ${
          theme === "dark" ? "dark" : "light"
        }`}
      >
        <p className="pagination">
          Showing{" "}
          <span className="paginationnummanagesub">
            {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, subscribers.length)} of{" "}
            {subscribers.length}{" "}
          </span>{" "}
          entries
        </p>
        <div className="flex pageswipe">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-0 py-2 ${
              currentPage === 1
                ? "cursor-not-allowed  arrowblocked"
                : "arrowactived"
            }`}
          >
            <img
              src={rightarrow}
              alt="Previous"
              className={`w-3 h-3 rotate-180 ${
                currentPage === 1 ? "arrowblocked" : "arrowactived"
              }`}
            />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-1 py-2 ${
                currentPage === i + 1 ? "pagenocom" : "pagenonotcom"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-0 py-2 ${
              currentPage === totalPages
                ? "arrowblocked cursor-not-allowed "
                : "arrowactived"
            }`}
          >
            <img
              src={rightarrow}
              alt="Next"
              className={`w-3 h-3 ${
                currentPage === totalPages ? "arrowblocked" : "arrowactived"
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default ManageSubscriber;
