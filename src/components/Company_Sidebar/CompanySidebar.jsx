import React, { useState, useEffect } from "react";
import "./companysidebar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../Utils/Config";
const CompanySidebar = ({ setSelectedMenuItem }) => {
  const [activeItem, setActiveItem] = useState("QMS");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [companyPermissions, setCompanyPermissions] = useState([]);
  const navigate = useNavigate();
  // Define menu items
  const menuItems = [
    { id: "QMS", label: "Quality Management System", shortLabel: "QMS", borderColor: "#858585", activeColor: "#858585" },
    { id: "EMS", label: "Environmental Management System", shortLabel: "EMS", borderColor: "#38E76C", activeColor: "#38E76C" },
    { id: "OHS", label: "Occupational Health and Safety Management System", shortLabel: "OHS", borderColor: "#F9291F", activeColor: "#F9291F" },
    { id: "EnMS", label: "Energy Management System", shortLabel: "EnMS", borderColor: "#10B8FF", activeColor: "#10B8FF" },
    { id: "BMS", label: "Business Continuity Management System", shortLabel: "BMS", borderColor: "#F310FF", activeColor: "#F310FF" },
    { id: "AMS", label: "Asset Management System", shortLabel: "AMS", borderColor: "#DD6B06", activeColor: "#DD6B06" },
    { id: "IMS", label: "Integrated Management System", shortLabel: "IMS", borderColor: "#CBA301", activeColor: "#CBA301" },
  ];
  const getCurrentUser = () => {
    const role = localStorage.getItem('role');
    try {
      if (role === 'company') {
        // Retrieve company user data
        const companyData = {};
        Object.keys(localStorage)
          .filter(key => key.startsWith('company_'))
          .forEach(key => {
            const cleanKey = key.replace('company_', '');
            try {
              companyData[cleanKey] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
              companyData[cleanKey] = localStorage.getItem(key);
            }
          });
        // Add additional fields from localStorage
        companyData.role = role;
        companyData.company_id = localStorage.getItem('company_id');
        companyData.company_name = localStorage.getItem('company_name');
        companyData.email_address = localStorage.getItem('email_address');
        console.log("Company User Data:", companyData);
        return companyData;
      } else if (role === 'user') {
        // Retrieve regular user data
        const userData = {};
        Object.keys(localStorage)
          .filter(key => key.startsWith('user_'))
          .forEach(key => {
            const cleanKey = key.replace('user_', '');
            try {
              userData[cleanKey] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
              userData[cleanKey] = localStorage.getItem(key);
            }
          });
        // Add additional fields from localStorage
        userData.role = role;
        userData.user_id = localStorage.getItem('user_id');
        console.log("Regular User Data:", userData);
        return userData;
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return null;
    }
  };
  // Fetch permissions from API
  const fetchLatestPermissions = async () => {
    try {
      const userData = getCurrentUser();
      if (!userData) {
        console.error("User data not found");
        return;
      }
      let endpoint;
      let id;
      if (userData.role === 'company') {
        id = userData.company_id;
        endpoint = `${BASE_URL}/accounts/permissions/${id}/`;
      } else if (userData.role === 'user') {
        id = userData.user_id;
       console.log("id",id)
        endpoint = `${BASE_URL}/company/permissions/${id}/`;
      } else {
        console.error("Unknown role:", userData.role);
        return;
      }
      console.log(`Fetching permissions for ${userData.role} with ID: ${id}`);
      const response = await axios.get(endpoint);
      
      console.log("Permissions API Response:", response.data);
  
      if (response.status === 200) {
        console.log("fetchLatestPermissions response:", response.data);
        
        if (response.data && response.data.permissions && Array.isArray(response.data.permissions)) {
          setCompanyPermissions(response.data.permissions);
          console.log("Permissions set:", response.data.permissions);
        } else {
          console.error("Permissions not found or not in expected format");
        }
      }
    } catch (err) {
      console.error("Error fetching latest permissions:", err);
      // Set default permissions or handle error appropriately
      setCompanyPermissions([]); // Set empty array to prevent errors in UI
    }
  };
  
  useEffect(() => {
    fetchLatestPermissions();
  }, []);
  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter((item) => 
    companyPermissions.length === 0 || companyPermissions.includes(item.id)
  );
  const handleItemClick = (item) => {
    if (activeItem !== item.id) {
      localStorage.setItem("activeMainItem", "dashboard");
      localStorage.removeItem("activeSubItem");
      setActiveItem(item.id);
      setSelectedMenuItem({ id: item.id, label: item.label, borderColor: item.borderColor });
      navigate("/company/dashboard");
    } else {
      setActiveItem(item.id);
      setSelectedMenuItem({ id: item.id, label: item.label, borderColor: item.borderColor });
    }
  };
  return (
    <div className='w-[93px] bg-[#13131A] text-white h-screen flex flex-col gap-[2px] relative'>
      {filteredMenuItems.map((item) => {
        const isActive = activeItem === item.id;
        const isHovered = hoveredItem === item.id;
        return (
          <div key={item.id} className="relative"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              className="w-[73px] h-[47px] company-main-menus border-l-2 flex justify-center items-center transition-all duration-300 ease-in-out"
              style={{
                borderColor: item.borderColor,
                backgroundColor: isActive ? item.activeColor : "#1C1C24",
                color: "#FFFFFF",
              }}
              onClick={() => handleItemClick(item)}
            >
              {item.shortLabel}
            </button>
            {isHovered && (
              <div
                className="absolute left-[0px] top-0 h-[47px] py-0 px-4 bg-[#1C1C24] text-white whitespace-nowrap flex items-center shadow-md cursor-pointer full-form z-50"
                style={{
                  minWidth: "150px",
                  textAlign: "center",
                  animation: "expandIn 0.3s ease forwards",
                  borderLeft: `2px solid ${item.borderColor}`,
                  backgroundColor: item.activeColor,
                }}
                onClick={() => handleItemClick(item)}
              >
                {item.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default CompanySidebar;