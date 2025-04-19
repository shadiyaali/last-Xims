import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom";

const CompanyDashboard = () => {


  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const company_id = localStorage.getItem("company_id");
    const user_id = localStorage.getItem("user_id");

    if (!accessToken) {
        navigate("/company-login");
    } else {
        if (role === "company" && company_id) {
            navigate(`/company/dashboard`);
        } else if (role === "user" && user_id) {
          navigate(`/company/dashboard`);
        }  
    }
}, [navigate]);
 

  return (
    <div className='text-white text-center'>
      Dashboard Page
    </div>
  )
}

export default CompanyDashboard
