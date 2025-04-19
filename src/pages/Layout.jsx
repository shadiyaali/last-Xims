import React from "react";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./layout.css";
import { useTheme } from "../ThemeContext";

const Layout = () => {
  const { theme } = useTheme();
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
    
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto p-5 outlets ${theme === "dark" ? "dark" : "light"}`}>
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default Layout;
