import React from 'react'
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import procedure from "../../../../assets/images/Company-Sidebar/manual.svg";
import record from "../../../../assets/images/Company-Sidebar/record-format.svg";
import parties from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import { useNavigate, useLocation } from "react-router-dom";

const EnMSEnergySubmenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const categories = [
        {
            id: "energy-review",
            label: "Energy Review",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/policy",
        },
        {
            id: "energy-baselines",
            label: "Energy Baselines",
            icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/manual",
        },
        {
            id: "energy-management-performance-score",
            label: "Energy Management Performance Score",
            icon: (
                <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/procedure",
        },
        {
            id: "structural-management-score",
            label: "Structural Management Score",
            icon: (
                <img src={record} alt="Record Format" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/record-format",
        },
        {
            id: "operation-management-score",
            label: "Operation Management Score",
            icon: (
                <img src={parties} alt="Interested Parties" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/interested-parties",
        },
        {
            id: "target-achievement-score",
            label: "Target Achievement Score",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/policy",
        },
        {
            id: "energy-performance-improvement-actions",
            label: "Energy Performance Improvement Actions",
            icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/manual",
        },
        {
            id: "energy-performance-indicator",
            label: "Energy Performance Indicator",
            icon: (
                <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/procedure",
        },
        {
            id: "significant-energy-use-consumptions",
            label: "Significant Energy Use & Consumptions",
            icon: (
                <img src={record} alt="Record Format" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/record-format",
        },
        {
            id: "energy-involvement-opportunities",
            label: "Energy Involvement Opportunities",
            icon: (
                <img src={parties} alt="Interested Parties" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/interested-parties",
        },
        {
            id: "energy-action-plans",
            label: "Energy Action Plans",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/policy",
        },
    ]

    const isActive = (category) => {
        return location.pathname === category.path;
    };

    const handleCategoryClick = (category) => {
        if (props && props.handleItemClick) {
            props.handleItemClick(category.id, category.path, "enmsenergymanagement");
        } else {
            navigate(category.path);
        }
    };

    return (
        <div className="grid grid-cols-4 gap-[10px] bg-[#1C1C24] p-5 w-[730px] absolute top-16 border-t border-r border-b border-[#383840]">
            {categories.map((category) => {
                const active = isActive(category);
                return (
                    <div
                        key={category.id}
                        className="flex flex-col items-center justify-center py-[10px] rounded-md bg-[#10B8FF10] transition-colors duration-200 cursor-pointer h-[100px] gap-[10px] documentation-submenu-cards"
                        onClick={() => handleCategoryClick(category)}
                    >
                        <div className="bg-[#5B5B5B] rounded-full p-[5px] w-[26px] h-[26px] flex justify-center items-center">
                            {category.icon}
                        </div>
                        <span
                            className={`text-center ${active ? "text-white" : "text-[#5B5B5B]"
                                } documentation-submenu-label duration-200`}
                        >
                            {category.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};


export default EnMSEnergySubmenu
