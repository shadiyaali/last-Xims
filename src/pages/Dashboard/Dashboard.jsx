import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Importing motion from framer-motion
import "./dashboard.css";
import companies from "../../assets/images/Dashboard/companies.svg";
import users from "../../assets/images/Dashboard/users.svg";
import { BASE_URL } from "../../Utils/Config";
// import axios from "axios";
import files from "../../assets/images/Dashboard/files.svg";
import service from "../../assets/images/Dashboard/service.svg";
import ac_company from "../../assets/images/Dashboard/ac-company.svg";
import activityIcon from "../../assets/images/Dashboard/activities.svg";

// Import the CompanyTable component
import CompanyTable from "./CompanyTable";
import RecentActivities from "./RecentActivities";
import { useTheme } from "../../ThemeContext";

const Dashboard = () => {
  const { theme } = useTheme();

  // State to hold the dynamic values for the dashboard
  const [values, setValues] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    companyFiles: 0,
    customerServices: 0,
    activeCompanies: 0, // Added activeCompanies state
  });

  // Target values that will be fetched from the backend
  const [targetValues, setTargetValues] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    companyFiles: 0,
    customerServices: 0,
    activeCompanies: 0, // Added activeCompanies target value
  });

  // Fetch values of company count and active companies count
  useEffect(() => {
    const fetchValues = async () => {
      try {
        // Fetch total companies count
        const totalCompaniesResponse = await fetch(`${BASE_URL}/accounts/companies/count/`);
        const totalCompaniesData = await totalCompaniesResponse.json();
        if (totalCompaniesData && totalCompaniesData.count) {
          setTargetValues((prevValues) => ({
            ...prevValues,
            totalCompanies: totalCompaniesData.count,
          }));
          console.log('Total Companies', totalCompaniesData.count);
        } else {
          console.error("Invalid data format or missing count for totalCompanies");
        }
  
        // Fetch total users count
        const totalUsersResponse = await fetch(`${BASE_URL}/accounts/users/count/`);
        const totalUsersData = await totalUsersResponse.json();
        if (totalUsersData && typeof totalUsersData.active_user_count === "number") {
          setTargetValues((prevValues) => ({
            ...prevValues,
            totalUsers: totalUsersData.active_user_count,
          }));
          console.log('Total Users', totalUsersData.active_user_count);
        } else {
          console.error("Invalid data format or missing active_user_count for totalUsers", totalUsersData);
        }
        
  
        // Fetch active companies count
        const activeCompaniesResponse = await fetch(`${BASE_URL}/accounts/active-company-count/`);
        const activeCompaniesData = await activeCompaniesResponse.json();
        console.log("Active Companies Data:", activeCompaniesData);
  
        if (activeCompaniesData && typeof activeCompaniesData.active_company_count === "number") {
          setTargetValues((prevValues) => ({
            ...prevValues,
            activeCompanies: activeCompaniesData.active_company_count,
          }));
          console.log('Active Companies', activeCompaniesData.active_company_count);
        } else {
          console.error("Invalid data format or missing active_company_count for activeCompanies", activeCompaniesData);
        }
  
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchValues();
  }, []);
  

  // Animation function to count from 0 to the target value
  useEffect(() => {
    const countUp = (key, targetValue) => {
      let currentValue = 0;
      const interval = setInterval(() => {
        if (currentValue < targetValue) {
          currentValue += 1; // Increment by 1
          setValues((prevValues) => ({
            ...prevValues,
            [key]: currentValue,
          }));
        } else {
          clearInterval(interval); // Stop the interval when the target is reached
        }
      }, 30); // Update interval (10ms)
    };

    // Start counting for each stat when target values change
    Object.keys(targetValues).forEach((key) => {
      if (targetValues[key] > 0) {
        countUp(key, targetValues[key]); // Start the animation if target value is > 0
      }
    });
  }, [targetValues]); // Re-run the animation when targetValues change

  // Stats data for display
  const stats = [
    {
      id: 1,
      title: "Total Companies",
      key: "totalCompanies",
      bgColor: "bg-[#3575FF1A]",
      icon: <img src={companies} alt="" className="dashicons totalcompaniesdark" />,
    },
    {
      id: 2,
      title: "Total Users",
      key: "totalUsers",
      bgColor: "bg-[#F366431A]",
      icon: <img src={users} alt="" className="dashicons totalusersdark" />,
    },
    {
      id: 3,
      title: "Company Files",
      key: "companyFiles",
      bgColor: "bg-[#4524F81A]",
      icon: <img src={files} alt="" className="dashicons companyfilesdark" />,
    },
    {
      id: 4,
      title: "Customer Services",
      key: "customerServices",
      bgColor: "bg-[#24D6A51A]",
      icon: <img src={service} alt="" className="dashicons companyservicesdark" />,
    },
    {
      id: 5,
      title: "Active Companies",
      key: "activeCompanies", // Key for active companies
      bgColor: "bg-[#FFBF351A]",
      icon: <img src={ac_company} alt="" className="dashicons activecompaniesdark" />,
    },
  ];

  // State to hold the recent companies for the table
  const [recentCompanies, setRecentCompanies] = useState([
    // Company data here
  ]);

  // Recent activities data
  const activities = [
    // Activities data here
  ];

  return (
    <>
      <div className={`dashboarddark ${theme === "dark" ? "dark" : "light"}`}>
        <div className="dashtoptext">
          <p className="toptext">Welcome Back, <br /><span className="toptextspan">Logged in as Super Admin</span></p>
        </div>
        <div className="p-5 border rounded-lg cards">
          <h1 className="mb-2 p-0 pb-3 mainheadss">Overall</h1>
          <div className="cardslay">
            {stats.map((stat) => (
              <div key={stat.id} className="card lg:space-y-7">
                <div className={`${stat.bgColor} flex items-center justify-center rounded-xl singlecard`}>
                  {stat.icon}
                </div>
                <div>
                  <h3 className="subheads">{stat.title}</h3>
                  <motion.p
                    className="ptexts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {values[stat.key]} {/* Display the animated value */}
                  </motion.p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Display company table and recent activities */}
      <div className="twotables flex flex-wrap pb-4 mt-5">
        <div className="flex dashcmpytable">
          <CompanyTable companies={recentCompanies} />
        </div>
        <div className="flex-1 dashrecenttable">
          <RecentActivities activities={activities} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
