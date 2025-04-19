import React from 'react'
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import procedure from "../../../../assets/images/Company-Sidebar/manual.svg";
import record from "../../../../assets/images/Company-Sidebar/record-format.svg";
import parties from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import process from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import scope from "../../../../assets/images/Company-Sidebar/record-format.svg";
import { useNavigate, useLocation } from "react-router-dom";


const RiskOpportunitiesSubmenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const categories = [
        {
            id: "environmantal-aspect",
            label: "Environmantal Aspect",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/policy",
        },
        {
            id: "environmetal-impact-assesments",
            label: "Environmetal Impact Assesments",
            icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/manual",
        },
        {
            id: "environmental-incidents",
            label: "Environmental Incidents",
            icon: (
                <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/procedure",
        },
        {
            id: "environmental-waste-management",
            label: "Environmental Waste Management",
            icon: (
                <img src={record} alt="Record Format" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/record-format",
        },
        {
            id: "health-and-safety-hazards",
            label: "Health and Safety Hazards",
            icon: (
                <img src={parties} alt="Interested Parties" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/interested-parties",
        },
        {
            id: "health-and-safety-risk-assessments",
            label: "Health and Safety Risk Assessments",
            icon: <img src={process} alt="Processes" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/processes",
        },
        {
            id: "health-and-safety-incidents",
            label: "Health and Safety Incidents",
            icon: (
                <img src={scope} alt="Scope Statements" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/scope-statements",
        },
        {
            id: "process-risks-assessments",
            label: "Process Risks Assessments",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/policy",
        },
        {
            id: "process-opportunities-assessment",
            label: "Process Opportunities Assessment",
            icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
            // path: "/company/qms/manual",
        },
        {
            id: "accident-and-incident-investigations",
            label: "Accident and Incident Investigations",
            icon: (
                <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
            ),
            // path: "/company/qms/procedure",
        },
    ];

    const isActive = (category) => {
        return location.pathname === category.path;
    };

    const handleCategoryClick = (category) => {
        if (props && props.handleItemClick) {
            props.handleItemClick(category.id, category.path, "qmsriskmanagement");
        } else {
            navigate(category.path);
        }
    };


    return (
        <div className="grid grid-cols-3 gap-[10px] bg-[#1C1C24] p-5 w-[555px] absolute top-16 border-t border-r border-b border-[#383840]">
            {categories.map((category) => {
                const active = isActive(category);
                return (
                    <div
                        key={category.id}
                        className="flex flex-col items-center justify-center py-[10px] rounded-md bg-[#85858515] transition-colors duration-200 cursor-pointer h-[100px] gap-[10px] documentation-submenu-cards"
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

export default RiskOpportunitiesSubmenu
