import React from 'react'
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import procedure from "../../../../assets/images/Company-Sidebar/manual.svg";
import record from "../../../../assets/images/Company-Sidebar/record-format.svg";
import parties from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import process from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import scope from "../../../../assets/images/Company-Sidebar/record-format.svg";
import { useNavigate, useLocation } from "react-router-dom";

const EmployeeTrainingSubmenu = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const categories = [
        {
            id: "add-training",
            label: "Add Training",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            path: "/company/qms/add-training",
        },
        {
            id: "list-training",
            label: "List Training",
            icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
            path: "/company/qms/list-training",
            relatedPaths: [
                "/company/qms/edit-training",
                "/company/qms/view-training",
                "/company/qms/draft-training",
                "/company/qms/edit-draft-training",
                "/company/qms/view-draft-training",
            ]
        },
        {
            id: "list-user-training",
            label: "List User Training",
            icon: (
                <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
            ),
            path: "/company/qms/listuser-training",
        },
        {
            id: "training-evaluation",
            label: "Training Evaluation",
            icon: (
                <img src={record} alt="Record Format" className="w-[15px] h-[15px]" />
            ),
            path: "/company/qms/training-evaluation",
        },
        {
            id: "employee-performance-evaluation",
            label: "Employee Performance Evaluation",
            icon: (
                <img
                    src={parties}
                    alt="Interested Parties"
                    className="w-[15px] h-[15px]"
                />
            ),
            path: "/company/qms/employee-performance",
            relatedPaths: [
                "/company/qms/add-employee-performance",
                "/company/qms/edit-employee-performance",
                "/company/qms/view-employee-performance",
                "/company/qms/draft-employee-performance",
                "/company/qms/edit-draft-employee-performance",
                "/company/qms/view-draft-employee-performance",
                

            ]
        },
        {
            id: "employee-satisfaction-survey",
            label: "Employee Satisfaction Survey",
            icon: <img src={process} alt="Processes" className="w-[15px] h-[15px]" />,
            path: "/company/qms/list-satisfaction-survey",
            relatedPaths: [
                "/company/qms/add-satisfaction-survey",
                "/company/qms/edit-satisfaction-survey",
                "/company/qms/view-satisfaction-survey",
                "/company/qms/draft-satisfaction-survey",
                "/company/qms/edit-draft-satisfaction-survey",
                "/company/qms/view-draft-satisfaction-survey",
            ]
        },
        {
            id: "awareness-training",
            label: "Awareness Training",
            icon: (
                <img src={scope} alt="Scope Statements" className="w-[15px] h-[15px]" />
            ),
            path: "/company/qms/list-awareness-training",
            relatedPaths: [
                "/company/qms/add-awareness-training",
                "/company/qms/edit-awareness-training",
                "/company/qms/view-awareness-training",
                "/company/qms/draft-awareness-training",
                "/company/qms/edit-draft-awareness-training",
                "/company/qms/view-draft-awareness-training",
            ]
        },
    ];

    const isActive = (category) => {
        const currentPath = location.pathname;
        return currentPath === category.path ||
            (category.relatedPaths &&
                category.relatedPaths.some(path => currentPath.startsWith(path)));
    };


    const handleCategoryClick = (category) => {
        if (props && props.handleItemClick) {
            props.handleItemClick(category.id, category.path, "qmsemployeetraining");
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

export default EmployeeTrainingSubmenu
