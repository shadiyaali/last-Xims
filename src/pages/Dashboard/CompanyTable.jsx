import React, { useEffect, useState } from "react";
import axios from "axios";
import "./companytable.css";
import { useTheme } from "../../ThemeContext";
import { BASE_URL } from "../../Utils/Config";

const CompanyTable = () => {
  const [companies, setCompanies] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    // Fetch company data from the backend API
    axios
      .get(`${BASE_URL}/accounts/companies/`)
      .then((response) => {
        const sortedCompanies = response.data.sort((a, b) => {
          // Sort by date_joined in descending order (most recent first)
          return new Date(b.date_joined) - new Date(a.date_joined);
        });
        setCompanies(sortedCompanies); // Set the sorted data to state
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }); // Returns the date in 'Dec 19, 2013' format
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase(); // Returns time in '07:40 am' format
  };

  return (
    <div
      className={`border rounded-lg companytable lg:w-[100%] ${
        theme === "dark" ? "dark" : "light"
      }`}
    >
      <h4 className="regcompany">Recent Registered Companies</h4>
      <div className="table-container">
        <table className="min-w-full text-left dashtable">
          <thead className="theads">
            <tr>
              <th className="tableheading tableheadingsl rightborder">No</th>
              <th className="tableheading headingname">Company Name</th>
              <th className="tableheading headingdate rightborder">
                Company Name & Date
              </th>
              <th className="tableheading headdate">Date</th>
              <th className="tableheading rightborder">Phone</th>
              <th className="tableheading">Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.length > 0 ? (
              companies.map((company, index) => (
                <tr key={index} className="cursor-pointer cmytble">
                  <td className="index data">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </td>
                  <td className="w-1/3 data">
                    {company.company_name}
                    <div className="tabledateres">
                      {formatDate(company.date_joined)}
                      <div className="borderright" />
                      <span className="tabledatespan">
                        {formatTime(company.date_joined)}
                      </span>
                    </div>
                  </td>
                  <td className="data tabledate">
                    {formatDate(company.date_joined)} <br />
                    <span className="text-sm text-[#898989] time">
                      {formatTime(company.date_joined)}
                    </span>
                  </td>
                  <td className="data">{company.phone_no1}</td>
                  <td className="data">
                    <span
                      className={`status capitalize ${
                        company.status === "active"
                          ? "activestates"
                          : "blockedstates"
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center nocmy">
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyTable;
