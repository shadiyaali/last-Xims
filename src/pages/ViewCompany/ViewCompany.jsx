import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./viewcompany.css";
import { BASE_URL } from "../../Utils/Config";
import { useTheme } from "../../ThemeContext";
import edit from "../../assets/images/ViewCompany/editicon.svg";
import deletes from "../../assets/images/ViewCompany/deleteicon.svg";
import { toast, Toaster } from "react-hot-toast";
import ConfirmationModal from "../Companies/ConfirmationModal";
import DeleteSucessModal from "../Companies/DeleteSucessModal";
import DeleteErrorModal from "../Companies/DeleteErrorModal";

// Utility function to format the date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ViewCompany = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [formDataState, setFormDataState] = useState({
    company_name: "",
    company_admin_name: "",
    user_id: "",
    email_address: "",
    phone_no1: "",
    phone_no2: "",
    permissions: [],
    company_logo: "",
  });
  const [subscriptionData, setSubscriptionData] = useState({
    planName: "N/A",
    expiryDate: "N/A",
  });
  const [permissionList, setPermissionList] = useState([]);
  const { companyId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteErrorModal, setShowDeleteErrorModal] = useState(false);
  const [companies, setCompanies] = useState([]);


  // Fetch existing company data when the component mounts
  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/accounts/companies/${companyId}/`
      );
      const companyData = response.data[0];

      setFormDataState({
        company_name: companyData.company_name || "",
        company_admin_name: companyData.company_admin_name || "",
        user_id: companyData.user_id || "",
        email_address: companyData.email_address || "",
        phone_no1: companyData.phone_no1 || "",
        phone_no2: companyData.phone_no2 || "",
        permissions: companyData.permissions
          ? companyData.permissions.map(String)
          : [],
        company_logo: companyData.company_logo || "",
      });

      console.log("Company Details: ", response.data);
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to fetch company data.");
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  useEffect(() => {
    // Fetch subscribers from the backend API
    const fetchSubscribers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/accounts/subscribers/`);
        const subscribersData = response.data || [];
        setSubscribers(subscribersData);

        // Find subscription data for the current company
        const companySubscription = subscribersData.find(
          (subscriber) => subscriber.company.toString() === companyId
        );

        if (companySubscription) {
          setSubscriptionData({
            planName: companySubscription.plan_name || "N/A",
            expiryDate: formatDate(companySubscription.expiry_date),
          });
        } else {
          setSubscriptionData({
            planName: "N/A",
            expiryDate: "N/A",
          });
        }

        console.log("Subscriber List: ", subscribersData);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      }
    };

    fetchSubscribers();
  }, [companyId]);

  const handleEdit = () => {
    navigate(`/admin/editcompany/${companyId}`);
  };

  // Function to handle deletion
  const handleDelete = async (companyId) => {
    setCompanyToDelete(companyId);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
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

            // Navigate after hiding the modal
            navigate("/admin/companies");
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

  return (
    <>
      <div className={`view-company ${theme === "dark" ? "dark" : "light"}`}>
        <h2 className="headercmpy outsidehead">Company Information</h2>
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
      </div>
      <div
        className={`view-company-container ${theme === "dark" ? "dark" : "light"
          }`}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <h2 className="headercmpy insidehead">Company Information</h2>

        {/* Company Information */}
        <div className="information">
          <div className="md:grid grid-cols-1 md:grid-cols-2 lg:w-[100%] grids">
            <div className="md:border-r leftsection">
              <div className="grid md:grid-cols-3 md:border-b md:mr-[40px] md:h-[200px] lefttopsection">
                <div className="mobcomlogo">
                  <label className="viewcpmylabels">Company Logo</label>
                  {formDataState.company_logo ? (
                    <div>
                      <img
                        src={formDataState.company_logo}
                        alt="Company Logo"
                        className="company-logos"
                      />
                    </div>
                  ) : (
                    <p className="nologo">No logo available</p>
                  )}
                </div>

                <div className="viewcomname desk-com-name">
                  <label className="viewcpmylabels">Company Name</label>
                  <p className="viewdata">{formDataState.company_name}</p>
                </div>

                <div className="viewcomname mob-viewcomname">
                  <div className="viewcomname mob-com-name">
                    <label className="viewcpmylabels">Company Name</label>
                    <p className="viewdata">{formDataState.company_name}</p>
                  </div>

                  <div>
                    <label className="viewcpmylabels">Company Admin Name</label>
                    <p className="viewdata">{formDataState.company_admin_name}</p>
                  </div>

                </div>
              </div>
              <div className="mobsecondrow">
                <div className="phone1">
                  <label className="viewcpmylabels">Phone No 1</label>
                  <p className="viewdata">{formDataState.phone_no1}</p>
                </div>
                <div className="phone2">
                  <label className="viewcpmylabels">Phone No 2</label>
                  <p className="viewdata">{formDataState.phone_no2}</p>
                </div>
              </div>
              <div className="md:grid md:grid-cols-3 md:mr-[40px] md:mt-[50px] mobthirdrow">
                <div className="mobadminname">
                  <label className="viewcpmylabels">Username</label>
                  <p className="viewdata">{formDataState.user_id}</p>
                </div>
                <div className="mobemailaddress">
                  <label className="viewcpmylabels">Email Address</label>
                  <p className="viewdata">{formDataState.email_address}</p>
                </div>
              </div>
              <div className="mobilefourthrow">
                <div>
                  <label className="viewcpmylabels">Subscription Plan</label>
                  <p className="viewdata">{subscriptionData.planName}</p>
                </div>
                <div className="mobexpiryrow">
                  <label className="viewcpmylabels">Expiry Date</label>
                  <p className="viewdata">{subscriptionData.expiryDate}</p>
                </div>
              </div>
              <div className="mobilefifththrow">
                <div className="flex space-x-10">
                  <div className="md:mt-[4px]">
                    <button
                      className="flex flex-col items-center justify-center gap-3"
                      onClick={handleEdit}
                    >
                      <label className="viewcpmylabels">Edit</label>
                      <img
                        src={edit}
                        alt=""
                        className="editicons w-[18px] h-[18px]"
                      />
                    </button>
                  </div>
                  <div className="md:mt-[4px]">
                    <button
                      className="flex flex-col items-center justify-center gap-3"
                      onClick={() => handleDelete(companyId)} // Pass 'companyId' here
                    >
                      <label className="viewcpmylabels">Delete</label>
                      <img
                        src={deletes}
                        alt=""
                        className="deleteicons w-[18px] h-[18px]"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="md:mt-[50px] mobpermissions">
                <h3 className="viewcpmylabels mb-0">Permissions</h3>
                <ul className="viewdata flex gap-5">
                  {formDataState.permissions.length > 0 ? (
                    formDataState.permissions.map((permission, index) => (
                      <li key={index}>{permission}</li>
                    ))
                  ) : (
                    <li>No permissions assigned</li>
                  )}
                </ul>
              </div>

            </div>
            <div>
              <div className="grid md:grid-cols-3 md:justify-between ml-[40px] md:border-b md:h-[200px] rightsection">
                <div>
                  <label className="viewcpmylabels">Phone No 1</label>
                  <p className="viewdata">{formDataState.phone_no1}</p>
                </div>
                <div>
                  <label className="viewcpmylabels">Phone No 2</label>
                  <p className="viewdata">{formDataState.phone_no2}</p>
                </div>
                <div className="">
                  <label className="viewcpmylabels">Subscription Plan</label>
                  <p className="viewdata">{subscriptionData.planName}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 md:ml-[40px] md:justify-between mt-[50px]">
                <div className="desktopexpiryview">
                  <label className="viewcpmylabels">Expiry Date</label>
                  <p className="viewdata">{subscriptionData.expiryDate}</p>
                </div>
                <div className="mt-[4px] mobeditview">
                  <button
                    className="flex flex-col items-center justify-center gap-2"
                    onClick={handleEdit}
                  >
                    <label className="viewcpmylabels">Edit</label>
                    <img
                      src={edit}
                      alt=""
                      className="editicons w-[18px] h-[18px]"
                    />
                  </button>
                </div>
                <div className="mt-[4px] mobdelete">
                  <button
                    className="flex flex-col items-center justify-center gap-2"
                    onClick={() => handleDelete(companyId)} // Pass 'companyId' here
                  >
                    <label className="viewcpmylabels">Delete</label>
                    <img
                      src={deletes}
                      alt=""
                      className="deleteicons w-[18px] h-[18px]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewCompany;
