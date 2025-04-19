import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./addsubscriber.css";
import dropicon from "../../../assets/images/Subscriber/dropdownicon.svg";
import { useTheme } from "../../../ThemeContext";
import { BASE_URL } from "../../../Utils/Config";
import { useNavigate } from "react-router-dom";
import AddSubscriberSuccessModal from "./AddSubscriberSuccessModal";
import AddSubscriberErrorModal from "./AddSubscriberErrorModal";

const AddSubscriber = () => {
  const [companies, setCompanies] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [showAddSubSuccessModal, setShowAddSubSuccessModal] = useState(false);
  const [showAddSubErrorModal, setShowAddSubErrorModal] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/accounts/companies/`);
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch companies. Please try again.");
      }
    };

    const fetchSubscriptionPlans = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/accounts/subscriptions/`);
        setSubscriptionPlans(response.data);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
        toast.error("Failed to fetch subscription plans. Please try again.");
      }
    };

    fetchCompanies();
    fetchSubscriptionPlans();
  }, []);

  const handleClickOutside = (e) => {
    if (!e.target.closest(".dropdown-container")) {
      setIsCompanyOpen(false);
      setIsPlanOpen(false);
    }
  };

  useEffect(() => {
    // Fetch subscribers from the backend API
    axios
      .get(`${BASE_URL}/accounts/subscribers/`)
      .then((response) => {
        setSubscribers(response.data); // Set the fetched data to the state
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching subscribers:", error);
      });
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !selectedPlan) {
      toast.error("Please select both a company and a subscription plan.");
      return;
    }

    // Retrieve company ID and plan ID based on selected names
    const companyId = companies.find(
      (company) => company.company_name === selectedCompany
    )?.id;
    const planId = subscriptionPlans.find(
      (plan) => plan.subscription_name === selectedPlan
    )?.id;

    if (!companyId || !planId) {
      toast.error("Invalid company or plan selection.");
      return;
    }

    // Prepare the data in the required format
    const data = {
      company: companyId,
      plan: planId,
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/accounts/subscribers/`,
        data
      );
      setShowAddSubSuccessModal(true)
      setTimeout(() => {
        setShowAddSubSuccessModal(false);
        navigate("/admin/manage-subscriber");
      }, 1500);
      setSelectedCompany("");
      setSelectedPlan("");
      setCompanySearch("");
      setPlanSearch("");
      console.log(data);
    } catch (error) {
      console.error("Error adding subscriber:", error);
      setShowAddSubErrorModal(true);
      setTimeout(() => {
        setShowAddSubErrorModal(false);
      }, 3000);
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row w-full rounded-lg addsub ${theme === "dark" ? "dark" : "light"
        }`}
    >
      <Toaster position="top-center" reverseOrder={false} />

      <AddSubscriberSuccessModal
        showAddSubSuccessModal={showAddSubSuccessModal}
        onClose={() => { setShowAddSubSuccessModal(false) }}
      />

      <AddSubscriberErrorModal
        showAddSubErrorModal={showAddSubErrorModal}
        onClose={() => { setShowAddSubErrorModal(false) }}
      />

      <div className="lg:w-1/3 rounded-lg p-5">
        <h2 className="addsubhead">Add Subscribers</h2>
        <form className="mt-5" onSubmit={handleSubmit}>
          <div className="mb-5">
            {/* Company Dropdown */}
            <div className="mb-4">
              <label htmlFor="companyName" className="addsublabel">
                Company Name
              </label>
              <div className="relative dropdown-container">
                <div
                  className={`custom-dropdown ${!selectedCompany ? "placeholder" : ""
                    }`}
                  onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                >
                  <input
                    type="text"
                    className="dropdown-input"
                    placeholder="Select Company Name"
                    value={companySearch || selectedCompany}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    onFocus={() => setIsCompanyOpen(true)}
                  />
                  <img
                    src={dropicon}
                    alt="Dropdown Icon"
                    className={`dropdown-icon ${isCompanyOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>
                {isCompanyOpen && (
                  <ul className="dropdown-list">
                    {companies
                      .filter(
                        (company) =>
                          !subscribers.some(
                            (subscriber) => subscriber.company === company.id
                          ) && // Exclude already subscribed companies
                          company.company_name
                            .toLowerCase()
                            .includes(companySearch.toLowerCase())
                      )
                      .map((company) => (
                        <li
                          key={company.id}
                          onClick={() => {
                            setSelectedCompany(company.company_name);
                            setIsCompanyOpen(false);
                            setCompanySearch("");
                          }}
                        >
                          {company.company_name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>


            {/* Subscription Plan Dropdown */}
            <div>
              <label htmlFor="subscriptionPlan" className="addsublabel">
                Subscription Plan
              </label>
              <div className="relative dropdown-container">
                <div
                  className={`custom-dropdown ${!selectedPlan ? "placeholder" : ""
                    }`}
                  onClick={() => setIsPlanOpen(!isPlanOpen)}
                >
                  <input
                    type="text"
                    className="dropdown-input"
                    placeholder="Select Subscription Plan"
                    value={planSearch || selectedPlan}
                    onChange={(e) => setPlanSearch(e.target.value)}
                    onFocus={() => setIsPlanOpen(true)}
                  />
                  <img
                    src={dropicon}
                    alt="Dropdown Icon"
                    className={`dropdown-icon ${isPlanOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>
                {isPlanOpen && (
                  <ul className="dropdown-list">
                    {subscriptionPlans
                      .filter((plan) =>
                        plan.subscription_name
                          .toLowerCase()
                          .includes(planSearch.toLowerCase())
                      )
                      .map((plan) => (
                        <li
                          key={plan.id}
                          onClick={() => {
                            setSelectedPlan(plan.subscription_name);
                            setIsPlanOpen(false);
                            setPlanSearch("");
                          }}
                        >
                          {plan.subscription_name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg addsubbtn md:duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriber;
