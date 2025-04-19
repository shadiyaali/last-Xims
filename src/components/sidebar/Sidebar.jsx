import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import dashboard from "../../assets/images/Sidebar/dashboard.svg";
import company from "../../assets/images/Sidebar/company.svg";
import subscribersIcon from "../../assets/images/Sidebar/subscribers.svg";
import subscription from "../../assets/images/Sidebar/subscription.svg";
import addsub from "../../assets/images/Sidebar/addsub.svg";
import managesub from "../../assets/images/Sidebar/managesub.svg";
import "./sidebar.css";
import { useTheme } from "../../ThemeContext";
import { motion, AnimatePresence  } from "framer-motion";

const Sidebar = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const [activeItem, setActiveItem] = useState(() => {
    return localStorage.getItem("activeItem") || "dashboard";
  });

  const [isSubscribersDropdownOpen, setIsSubscribersDropdownOpen] =
    useState(false);
  const [isSubscriptionDropdownOpen, setIsSubscriptionDropdownOpen] =
    useState(false);

  const [activeSubscribersMenu, setActiveSubscribersMenu] = useState(null);
  const [activeSubscriptionsMenu, setActiveSubscriptionsMenu] = useState(null);

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes("dashboard")) {
      setActiveItem("dashboard");
    } else if (currentPath.includes("companies")) {
      setActiveItem("companies");
    } else if (currentPath.includes("subscribers")) {
      setActiveItem("subscribers");
    } else if (currentPath.includes("subscription")) {
      setActiveItem("subscription");
    }
  }, [location]);

  const handleItemClick = (item, path) => {
    setActiveItem(item);
    localStorage.setItem("activeItem", item);
    navigate(path);
    setIsSubscribersDropdownOpen(false);
    setIsSubscriptionDropdownOpen(false);
    setActiveSubscribersMenu(null); // Reset submenu active state
    setActiveSubscriptionsMenu(null);
  };

  const toggleSubscribersDropdown = () => {
    setIsSubscribersDropdownOpen((prev) => {
      if (prev) {
        setActiveSubscribersMenu(null); // Reset active state when closing
      }

      return !prev;
    });
    setIsSubscriptionDropdownOpen(false); // Close the subscriptions dropdown
    setActiveSubscriptionsMenu(null);
    setActiveItem("subscribers");
    localStorage.setItem("activeItem", "subscribers");
  };

  const toggleSubscriptionDropdown = () => {
    setIsSubscriptionDropdownOpen((prev) => {
      if (prev) {
        setActiveSubscriptionsMenu(null); // Reset active state when closing
      }

      return !prev;
    });
    setIsSubscribersDropdownOpen(false); // Close the subscribers dropdown
    setActiveSubscribersMenu(null); // Reset submenu active state
    setActiveItem("subscription");
    localStorage.setItem("activeItem", "subscription");
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSubscribersDropdownOpen(false);
      setIsSubscriptionDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`h-screen border-r flex flex-col items-center mainsidebar ${
        theme === "dark" ? "dark" : "light"
      }`}
    >
      <img
        src={logo}
        alt="XIMSpro Logo"
        className="logo mb-8 cursor-pointer"
        onClick={() => handleItemClick("dashboard", "/admin/dashboard")}
      />

      <nav className="lg:flex lg:flex-col items-center lg:space-y-3 relative lg:top-16 sidebartab">
        <div
          onClick={() => handleItemClick("dashboard", "/admin/dashboard")}
          className={`flex flex-col items-center cursor-pointer item mainitems tabressideitems ${
            activeItem === "dashboard" ? "active" : ""
          }`}
        >
          <img
            src={dashboard}
            alt="Dashboard icon"
            className="w-5 h-5 sideicon"
          />
          <span className="mt-1 spans">Dashboard</span>
        </div>

        <div
          onClick={() => handleItemClick("companies", "/admin/companies")}
          className={`flex flex-col items-center cursor-pointer item mainitems tabressideitems ${
            activeItem === "companies" ? "active" : ""
          }`}
        >
          <img src={company} alt="Company icon" className="w-5 h-5 sideicon" />
          <span className="mt-1 spans">Companies</span>
        </div>

        {/* Subscribers menu */}
        <div
          className={`flex flex-col items-center pt-2 cursor-pointer subscribersdiv tabressideitems ${
            activeItem === "subscribers" ? "active" : ""
          }`}
          onClick={toggleSubscribersDropdown}
        >
          <img
            src={subscribersIcon}
            alt="Subscribers icon"
            className={`w-5 h-5 sideicon subscribersIcon ${
              activeItem === "subscribers" ? "active" : ""
            }`}
          />
          <span
            className={`spans mt-1 subscribersdivtext ${
              activeItem === "subscribers" ? "active" : ""
            }`}
          >
            Subscribers
          </span>
        </div>
        
        <AnimatePresence>
      {isSubscribersDropdownOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="subscriberdropdownmenus"
        >
          <h3 className="subhead">Subscribers</h3>
          <div className="flex gap-3">
            {/* Add Subscriber */}
            <Link
              to="/admin/add-subscriber"
              onClick={() => {
                setIsSubscribersDropdownOpen(false);
                setActiveSubscribersMenu("add-subscriber");
              }}
            >
              <div
                className={`addsubbox cursor-pointer ${
                  activeSubscribersMenu === "add-subscriber" ? "active" : ""
                }`}
              >
                <div className="addsubcontent">
                  <img src={addsub} alt="" className="addsubimg " />
                </div>
                <p className="addsubtext duration-200">
                  Add
                  <br />
                  Subscribers
                </p>
              </div>
            </Link>

            {/* Manage Subscriber */}
            <Link
              to="/admin/manage-subscriber"
              onClick={() => {
                setIsSubscribersDropdownOpen(false);
                setActiveSubscribersMenu("manage-subscriber");
              }}
            >
              <div
                className={`managesubbox cursor-pointer ${
                  activeSubscribersMenu === "manage-subscriber" ? "active" : ""
                }`}
              >
                <div className="managesubcontent">
                  <img src={managesub} alt="" className="managesubimg " />
                </div>
                <p className="managesubtext duration-200">
                  Manage
                  <br /> Subscribers
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

        {/* Subscription menu */}
        <div
          className={`flex flex-col items-center pt-2 cursor-pointer subscriptiondiv tabressideitems ${
            activeItem === "subscription" ? "active" : ""
          }`}
          onClick={toggleSubscriptionDropdown}
        >
          <img
            src={subscription}
            alt="Subscription icon"
            className={`w-5 h-5 sideicon subscriptionIcon ${
              activeItem === "subscription" ? "active" : ""
            }`}
          />
          <span
            className={`spans mt-1 subscriptionsdivtext ${
              activeItem === "subscription" ? "active" : ""
            }`}
          >
            Subscriptions
          </span>
        </div>

        <AnimatePresence>
        {isSubscriptionDropdownOpen && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="subscriptiondropdownmenus">
            <h3 className="subheadss">Subscriptions</h3>
            <div className="flex gap-3">
              {/* Add Subscription */}
              <Link
                to="/admin/add-subscription-plan"
                onClick={() => {
                  setIsSubscriptionDropdownOpen(false);
                  setActiveSubscriptionsMenu("add-subscription-plan");
                }}
              >
                <div className={`addsubsciptionbox cursor-pointer ${
                    activeSubscriptionsMenu === "add-subscription-plan" ? "active" : ""
                  }`}>
                  <div className="addsubscriptioncontent">
                    <img src={addsub} alt="" className="addsubscriptionimg" />
                  </div>
                  <p className="addsubscriptiontext duration-200">
                    Add
                    <br />
                    Subscription Plan
                  </p>
                </div>
              </Link>

              {/* Manage Subscription */}
              <Link to="/admin/manage-subscription" onClick={() => {
                setIsSubscriptionDropdownOpen(false);
                setActiveSubscriptionsMenu("manage-subscription");
              }}>
                <div
                  className={`managesubscriptionbox cursor-pointer ${
                    activeSubscriptionsMenu === "manage-subscription" ? "active" : ""
                  }`} >
                  <div className="managesubscriptioncontent">
                    <img
                      src={managesub}
                      alt=""
                      className="managesubscriptionimg"
                    />
                  </div>
                  <p className="managesubscriptiontext duration-200">
                    Manage
                    <br />
                    Subscription
                  </p>
                </div>
              </Link>
            </div>
            </motion.div>
        )}
        </AnimatePresence> 
      </nav>
    </div>
  );
};

export default Sidebar;
