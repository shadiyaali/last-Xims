import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CompanySidebar from '../components/Company_Sidebar/CompanySidebar';
import CompanyNavbar from '../components/Company_Navbar/CompanyNavbar';
import SecondarySidebar from '../components/Company_Sidebar/SecondarySidebar';

const CompanyLayout = () => {
    const [selectedMenuItem, setSelectedMenuItem] = useState({
        id: "QMS",
        label: "Quality Management System",
        borderColor: "#858585",
    });

    const [secondarySidebarCollapsed, setSecondarySidebarCollapsed] = useState(false);

    const toggleSecondarySidebar = () => {
        setSecondarySidebarCollapsed(!secondarySidebarCollapsed);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Pass the toggle function and collapsed state to Navbar */}
            <CompanyNavbar 
                selectedMenuItem={selectedMenuItem} 
                toggleSidebar={toggleSecondarySidebar} 
                collapsed={secondarySidebarCollapsed}
                setCollapsed={setSecondarySidebarCollapsed}
            />

            <div className="flex flex-1 overflow-hidden">
                <CompanySidebar setSelectedMenuItem={setSelectedMenuItem} />

                {/* Pass collapsed state to SecondarySidebar */}
                <SecondarySidebar 
                    selectedMenuItem={selectedMenuItem}
                    collapsed={secondarySidebarCollapsed}
                    setCollapsed={setSecondarySidebarCollapsed}
                />

                <div className="flex-1 overflow-y-auto p-4 bg-[#13131A]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default CompanyLayout;
