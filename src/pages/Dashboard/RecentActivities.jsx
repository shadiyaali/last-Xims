import React, { useState, useEffect } from "react";
import "./recentActivities.css";
import { useTheme } from "../../ThemeContext";
import { BASE_URL } from "../../Utils/Config";
import leftarrow from "../../assets/images/Dashboard/left arrow.svg";
import rightarrow from "../../assets/images/Dashboard/right arrow.svg";
import axios from "axios";

const RecentActivities = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [fifteen, setFifteen] = useState([]);
  const [thirty, setThirty] = useState([]);
  const [sixty, setSixty] = useState([]);
  const [ninety, setNinety] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const tabs = ["In 15 Days", "In 30 Days", "In 60 Days", "In 90 Days"];

  useEffect(() => {
    // Fetch subscribers data
    const fetchData = async () => {
      try {
        const res15 = await axios.get(
          `${BASE_URL}/accounts/subscribers/fifteen/`
        );
        setFifteen(res15.data);
        const res30 = await axios.get(
          `${BASE_URL}/accounts/subscribers/thirty/`
        );
        setThirty(res30.data);
        const res60 = await axios.get(
          `${BASE_URL}/accounts/subscribers/sixty/`
        );
        setSixty(res60.data);
        const res90 = await axios.get(
          `${BASE_URL}/accounts/subscribers/ninety/`
        );
        setNinety(res90.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Function to get the current tab's data
  const getActiveData = () => {
    switch (activeTab) {
      case 0:
        return fifteen;
      case 1:
        return thirty;
      case 2:
        return sixty;
      case 3:
        return ninety;
      default:
        return [];
    }
  };

  // Pagination logic
  const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages(getActiveData())) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    const data = getActiveData();
    const total = totalPages(data);
    return (
      <div className="flex justify-end items-center px-5 paginationmob !mb-0">
        {/* <p className="pagination">
          Showing{" "}
          <span className="paginationno">
            {itemsPerPage * (currentPage - 1) + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
          </span>{" "}
          entries
        </p> */}
        <div className="flex pageswipe">
  {/* Left Arrow Button */}
  <button
    onClick={() => handlePageChange(currentPage - 1)}
    disabled={currentPage === 1}
    className={`px-0 py-2 ${
      currentPage === 1
        ? "cursor-not-allowed arrownotactive"
        : "font-extrabold arrowactive"
    }`}
  >
    <img
      src={rightarrow}
      alt="Left Arrow"
      className={`w-3 h-3 rotate-180 ${
        currentPage === 1 ? "arrownotactive" : "arrowactive"
      }`}
    />
  </button>

  {/* Page Number Buttons */}
  {Array.from({ length: total }).map((_, i) => (
    <button
      key={i}
      onClick={() => handlePageChange(i + 1)}
      className={`px-1 py-2 ${
        currentPage === i + 1
          ? "pagenoactive"
          : "pagenonotactive"
      }`}
    >
      {i + 1}
    </button>
  ))}

  {/* Right Arrow Button */}
  <button
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === total}
    className={`px-0 py-2 ${
      currentPage === total
        ? "arrownotactive cursor-not-allowed font-extrabold"
        : "arrowactive font-extrabold rounded-lg"
    }`}
  >
    <img
      src={rightarrow}
      alt="Right Arrow"
      className={`w-3 h-3 ${
        currentPage === total ? "arrownotactive" : "arrowactive"
      }`}
    />
  </button>
</div>

      </div>
    );
  };

  const renderData = (data) => {
    return data
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((item, index) => (
        <div key={index} className="rounded-lg mx-5 activitytabs">
          <table className="w-full">
            <thead>
              <tr className="recentactivityheadclass">
                <th className="text-left recentactivitythead px-2">No</th>
                <th className="text-left recentactivitythead px-2">
                  Company Name
                </th>
                <th className="text-right recentactivitythead px-2">
                  Expiry Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="recentactivitydataclass">
                <td className="idtext px-2">
                  {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(2, '0')}
                </td>
                <td className="cmytext px-2 w-[55%]">{item.company_name}</td>
                <td className="cmytext text-right px-2">
                  {new Date(item.expiry_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ));
  };

  return (
    <div
      className={`border rounded-lg recent-activities ${
        theme === "dark" ? "dark" : "light"
      }`}
    >
      <h2 className="recenthead">Subscription Expiring</h2>
      <div>
        <div className="flex md:space-x-4 justify-between expirydaystabs ">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`expirydaystab ${
                index === activeTab
                  ? "expirydatesactive duration-200"
                  : "expirydatesInactive"
              }`}
              onClick={() => {
                setActiveTab(index);
                setCurrentPage(1); // Reset page to 1 when changing tabs
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div>
            {renderData(fifteen)}
            {renderPagination()}
          </div>
        )}
        {activeTab === 1 && (
          <div>
            {renderData(thirty)}
            {renderPagination()}
          </div>
        )}
        {activeTab === 2 && (
          <div>
            {renderData(sixty)}
            {renderPagination()}
          </div>
        )}
        {activeTab === 3 && (
          <div>
            {renderData(ninety)}
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
