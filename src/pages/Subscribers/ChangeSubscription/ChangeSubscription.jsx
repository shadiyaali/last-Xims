import React, { useState, useEffect } from "react";
import dropicon from "../../../assets/images/Subscriber/dropdownicon.svg";
import "./changesubscriptionplan.css";
import { useTheme } from "../../../ThemeContext";
import { BASE_URL } from "../../../Utils/Config";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import ChangeSubscriptionSuccessModal from "./ChangeSubscriptionSuccessModal";
import ChangeSubscriptionErrorModal from "./ChangeSubscriptionErrorModal";

const ChangeSubscription = () => {
  const [companyName, setCompanyName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(""); // Track selected plan
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const { id } = useParams();
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const navigate = useNavigate();

  const [showChangeSubscriptionSuccessModal, setShowChangeSubscriptionSuccessModal] = useState(false);
  const [showChangeSubscriptionErrorModal, setShowChangeSubscriptionErrorModal] = useState(false);

  const handleClickOutside = (e) => {
    if (!e.target.closest(".dropdown-container")) {
      setIsPlanOpen(false);
    }
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // setLoading(true);
        setError(null);

        const response = await axios.get(
          `${BASE_URL}/accounts/subscribers/${id}/`
        );
        const subscriberData = response.data;

        // Set the fetched company name and plan name
        setCompanyName(subscriberData.company_name);
        setSelectedPlan(subscriberData.plan_name); // Set selected plan from fetched data

        console.log("Fetched subscriber data:", subscriberData);
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        setError(
          err.response?.data?.message ||
          "An error occurred while fetching the subscription."
        );
      }
    };
    fetchSubscription();
  }, [id]);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/accounts/subscriptions/`);
        setSubscriptionPlans(response.data);
        console.log("Fetched subscription plans:", response.data);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission triggered", e);

    if (!selectedPlan) {
      alert("Please select a subscription plan.");
      return;
    }

    // Find the plan ID corresponding to the selected plan name
    const selectedPlanData = subscriptionPlans.find(
      (plan) => plan.subscription_name === selectedPlan
    );

    if (!selectedPlanData) {
      alert("Invalid plan selected.");
      return;
    }

    const planId = selectedPlanData.id; // Use the plan ID for the request

    console.log("Request Body Sent to API:", { plan: planId });

    try {
      // setLoading(true);

      // Send the plan ID instead of the plan name
      const response = await axios.put(
        `${BASE_URL}/accounts/subscribers/${id}/`,
        {
          plan: planId, // Send plan ID instead of plan name
        }
      );

      // Check if the response was successful
      if (response.status === 200) {
        setShowChangeSubscriptionSuccessModal(true);
        console.log("Updated subscription response:", response.data);
        setTimeout(() => {
          setShowChangeSubscriptionSuccessModal(false);
          navigate("/admin/manage-subscriber");
        }, 1500);
      } else {
        toast.error("There was an issue updating the subscription.");
      }
    } catch (err) {
      setShowChangeSubscriptionErrorModal(true);
      setTimeout(() => {
        setShowChangeSubscriptionErrorModal(false);
      }, 3000);
      console.error("Error updating subscription plan:", err);
    }
  };

  return (
    <div className={`changesubplan p-5 ${theme === "dark" ? "dark" : "light"}`}>
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="changesubplanhead">Change Subscription</h2>

      <ChangeSubscriptionSuccessModal
        showChangeSubscriptionSuccessModal={showChangeSubscriptionSuccessModal}
        onClose={() => { setShowChangeSubscriptionSuccessModal(false) }}
      />

      <ChangeSubscriptionErrorModal
        showChangeSubscriptionErrorModal={showChangeSubscriptionErrorModal}
        onClose={() => { setShowChangeSubscriptionErrorModal(false) }}
      />

      <div className="flex gap-14">
        <div className="w-full lg:w-1/3">
          <form onSubmit={handleSubmit} className="mt-5">
            {/* Company Name (Read-Only) */}
            <div className="mb-5">
              <div className="mb-4">
                <label className="changesubplanlabel">Company Name</label>
                <div className="relative dropdown-container">
                  <div className="custom-dropdowns placeholder">
                    <input
                      type="text"
                      className="dropdown-inputs cursor-not-allowed"
                      value={companyName} // Display fetched company name
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Dropdown */}
            <div className="mb-5">
              <label className="changesubplanlabel">Change to</label>
              <div className="relative dropdown-container">
                <div
                  className={`custom-dropdowns ${!selectedPlan ? "placeholder" : ""
                    }`}
                >
                  <input
                    type="text"
                    className="dropdown-inputs"
                    placeholder="Select Plan"
                    value={selectedPlan} // Bind value to selectedPlan
                    readOnly
                  />
                  <img
                    src={dropicon}
                    alt="Dropdown Icon"
                    className={`dropdown-icon ${isPlanOpen ? "rotate-180" : ""
                      }`}
                    onClick={() => setIsPlanOpen(!isPlanOpen)}
                  />
                </div>
                {isPlanOpen && (
                  <ul className="dropdown-list">
                    {subscriptionPlans.map((plan, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setSelectedPlan(plan.subscription_name); // Update selectedPlan state
                          setIsPlanOpen(false); // Close dropdown
                          console.log("Selected Plan:", plan.subscription_name); // Log selected plan
                        }}
                      >
                        {plan.subscription_name}{" "}
                        {/* Display the subscription name */}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg changesubplanbtn md:duration-200"
            >
              Change
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeSubscription;
