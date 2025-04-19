import React, { useState, useEffect } from "react";
import axios from "axios";
import edit from "../../../assets/images/Subscription/edit.svg";
import deleted from "../../../assets/images/Subscription/delete.svg";
import downarrow from "../../../assets/images/Subscription/downarrow.svg";
import { BASE_URL } from "../../../Utils/Config";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import "./managesubscription.css";
import { useTheme } from "../../../ThemeContext";
import { useNavigate } from "react-router-dom";
import SubscriptionDeleteModal from "./SubscriptionDeleteModal";
import SubscriptionDeleteSuccess from "./SubscriptionDeleteSuccess";
import SubscriptionDeleteErrorModal from "./SubscriptionDeleteErrorModal";
import leftarrow from "../../../assets/images/Subscription/left arrow.svg";
import rightarrow from "../../../assets/images/Subscription/right arrow.svg";

const ManageSubscription = () => {
  const [subscriptions, setSubscriptions] = useState([]); // Subscription details
  const [subscriberCounts, setSubscriberCounts] = useState([]); // Active/expired counts
  const [activeManageSubscriptionDropdown, setActiveManageSubscriptionDropdown] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items per page
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

  const [showDeleteSubscriptionModal, setShowDeleteSubscriptionModal] = useState(false);
  const [showDeleteSubscriptionSuccesssModal,setShowDeleteSubscriptionSuccesssModal,] = useState(false);
  const [showDeleteSubscriptionErrorModal, setShowDeleteSubscriptionErrorModal] = useState(false);

  // Fetch both subscription and subscriber counts together
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subscriptionsRes, subscriberCountsRes] = await Promise.all([
          axios.get(`${BASE_URL}/accounts/subscriptions/`),
          axios.get(`${BASE_URL}/accounts/subscriptions/status/`),
        ]);

        setSubscriptions(subscriptionsRes.data);
        setSubscriberCounts(subscriberCountsRes.data.subscriptions);
        console.log(subscriptionsRes.data);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle Edit Action
  const handleEdit = (id) => {
    navigate(`/admin/edit-subscription/${id}`);
  };

  // Handle Delete Action
  const handleDelete = async (id) => {
    setSubscriptionToDelete(id);
    setShowDeleteSubscriptionModal(true);
  };

  const handleConfirmSubscriptionDelete = async () => {
    if (subscriptionToDelete) {
      try {
        const response = await axios.delete(
          `${BASE_URL}/accounts/subscriptions/${subscriptionToDelete}/`
        );
        if (response.status === 200 || response.status === 204) {
          // Correctly filter out the deleted subscription by ID
          setSubscriptions((prev) => prev.filter((sub) => sub.id !== subscriptionToDelete));
          setShowDeleteSubscriptionSuccesssModal(true);
          setTimeout(() => {
            setShowDeleteSubscriptionSuccesssModal(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error deleting subscription:", error);
        setShowDeleteSubscriptionErrorModal(true);
        setTimeout(() => {
        setShowDeleteSubscriptionErrorModal(false);
        }, 3000);
      } 
        setShowDeleteSubscriptionModal(false); 
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteSubscriptionModal(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedSubscriptions = subscriptions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleManageSubcriptionDropdown = (id) => {
    setActiveManageSubscriptionDropdown((prev) => (prev === id ? null : id));
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
      <div
        className={`managesubscription ${theme === "dark" ? "dark" : "light"}`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <div>
          <h1 className="managesubscriptionhead">Manage Subscription</h1>
          <SubscriptionDeleteModal
          showDeleteSubscriptionModal={showDeleteSubscriptionModal}
          onConfirm={handleConfirmSubscriptionDelete}
          onCancel={handleCancelDelete}
          />

          <SubscriptionDeleteSuccess
          showDeleteSubscriptionSuccesssModal={showDeleteSubscriptionSuccesssModal}
          onClose={() => setShowDeleteSubscriptionSuccesssModal(false)}
          />

          <SubscriptionDeleteErrorModal
          showDeleteSubscriptionErrorModal={showDeleteSubscriptionErrorModal}
          onClose={() => setShowDeleteSubscriptionErrorModal(false)}
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="managesubscriptiontblhead">
                  <th className="px-3 managesubscriptionheads text-center w-12 managesubscriptionsl">
                    Sl
                  </th>
                  <th className="px-3 managesubscriptionheads text-left managesubscriptionname">
                    Subscription Name
                  </th>
                  <th className="px-6 managesubscriptionheads text-left  managesubscriptionvalidity">
                    Validity
                  </th>
                  <th className="px-6 managesubscriptionheads text-left managesubscriptionmob activecounts">
                    Active Subscribers
                  </th>
                  <th className="px-6 managesubscriptionheads text-left managesubscriptionmob">
                    Expired Subscribers
                  </th>
                  <th className="px-6 managesubscriptionheads text-center w-14 managesubscriptionmob">
                    Edit
                  </th>
                  <th className="px-6 managesubscriptionheads text-center w-14 managesubscriptionmob">
                    Delete
                  </th>
                  <div className="managesubscriptiondrop"></div>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscriptions.length > 0 ? (
                  paginatedSubscriptions.map((subscription, id) => {
                    const subscriberData = subscriberCounts.find(
                      (count) =>
                        count.subscription_name.trim().toLowerCase() ===
                        subscription.subscription_name.trim().toLowerCase()
                    );

                    const activeCount = subscriberData
                      ? subscriberData.active_subscribers_count
                      : 0;
                    const expiredCount = subscriberData
                      ? subscriberData.expired_subscribers_count
                      : 0;

                    return (
                      <>
                        <tr
                          key={subscription.id}
                          className={`managesubscriptiondatarow subrows ${
                            activeManageSubscriptionDropdown === subscription.id
                              ? "no-border"
                              : ""
                          }`}
                        >
                          <td className="md:px-3 md:py-4   text-gray-700 text-center managesubscriptiondata">
                            {(indexOfFirstItem + id + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="md:px-3 md:py-4 text-gray-700 text-left managesubscriptiondata managesubscriptionnamedata">
                            {subscription.subscription_name || "N/A"}
                          </td>
                          <td className="md:px-6 md:py-4 text-gray-700 text-left managesubscriptiondata managesubscriptionvaliditydata">
                            {subscription.validity || "N/A"} Days
                          </td>
                          <td className="md:px-6 md:py-4 text-left managesubscriptiondataactive managesubscriptionmob">
                            <div className="managesubactivestate">
                              {activeCount}
                            </div>
                          </td>
                          <td className="md:px-6 md:py-4 text-left managesubscriptiondataexpire managesubscriptionmob">
                            <div className="managesubexpirestate">
                              {expiredCount}
                            </div>
                          </td>
                          <td className="md:px-6 md:py-4 text-center button-cell managesubscriptionmob">
                            <button
                              onClick={() => handleEdit(subscription.id)}
                              aria-label="Edit Subscription"
                            >
                              <img
                                src={edit}
                                alt=""
                                className="editsubscription"
                              />
                            </button>
                          </td>
                          <td className="md:px-6 md:py-4 text-center button-cell managesubscriptionmob">
                            <button
                              onClick={() => handleDelete(subscription.id)}
                              aria-label="Delete Subscription"
                            >
                              <img
                                src={deleted}
                                alt=""
                                className="deletesubscription"
                              />
                            </button>
                          </td>
                          <div
                            className={`managesubscriptiondowndrop ${
                              activeManageSubscriptionDropdown ===
                              subscription.id
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              toggleManageSubcriptionDropdown(subscription.id)
                            }
                          >
                            <img
                              src={downarrow}
                              alt=""
                              className={`managesubscriptiondowndropimg w-[10px] ${
                                activeManageSubscriptionDropdown ===
                                subscription.id
                                  ? "rotated"
                                  : ""
                              }`}
                              
                            />
                          </div>
                        </tr>
                        <AnimatePresence>
                          {activeManageSubscriptionDropdown ===
                            subscription.id && (
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
                                  <div className="subscriptionmobresviewcount">
                                    <h4 className="mobheads">
                                      Active Subscribers
                                    </h4>
                                    <td className="text-left managesubscriptiondataactive">
                                      <div className="managesubactivestate">
                                        {activeCount}
                                      </div>
                                    </td>
                                  </div>
                                  <div className="subscriptionmobresviewcount">
                                    <h4 className="mobheads">
                                      Expired Subscribers
                                    </h4>
                                    <td className="text-left managesubscriptiondataexpire ">
                            <div className="managesubexpirestate">
                              {expiredCount}
                            </div>
                          </td>
                                  </div>
                                  <div className="subscriptionmobresview">
                                    <h4 className="mobheads">Edit</h4>
                                    <button
                              onClick={() => handleEdit(subscription.id)}
                              aria-label="Edit Subscription"
                            >
                              <div className="h-[22px]">
                              <img
                                src={edit}
                                alt=""
                                className="editsubscription w-[15px] mt-[3px]"
                              />
                              </div>
                            </button>
                                  </div>
                                  <div className="subscriptionmobresview">
                                    <h4 className="mobheads">Delete</h4>
                                    <button
                              onClick={() => handleDelete(subscription.id, id)}
                              aria-label="Delete Subscription"
                            >
                               <div className="h-[22px]">
                              <img
                                src={deleted}
                                alt=""
                                className="deletesubscription w-[15px] mt-[3px]"
                              />
                              </div>
                            </button>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No subscriptions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div
        className={`flex justify-between items-center mt-1 paginationmob ${
          theme === "dark" ? "dark" : "light"
        }`}
      >
          <p className="pagination">
            Showing{" "}
            <span className="paginationnorecent">
              {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, subscriptions.length)} of{" "}
              {subscriptions.length}
            </span>{" "}
            entries
          </p>
        
          <div className="flex justify-center items-center pageswipe">
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
              className={`px-1 ${
                currentPage === i + 1
                  ? "pagenocom"
                  : "pagenonotcom"
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

export default ManageSubscription;
