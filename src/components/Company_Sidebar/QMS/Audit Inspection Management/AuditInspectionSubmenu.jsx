import React from 'react'
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import procedure from "../../../../assets/images/Company-Sidebar/manual.svg";
import { useNavigate, useLocation } from "react-router-dom";

const AuditInspectionSubmenu = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const categories = [
        {
            id: "audit-and-inspection-management",
            label: "Audit and Inspection Management",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            path: "/company/qms/list-audit",
            relatedPaths: [
              "/company/qms/edit-audit",
              "/company/qms/view-audit",
              "/company/qms/draft-audit",
              "/company/qms/edit-draft-audit",
              "/company/qms/view-draft-audit",
            ]
        },
        {
            id: "add-audit",
            label: "Add Audit",
            icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
            path: "/company/qms/add-audit",
        },
        {
            id: "add-inspection",
            label: "Add Inspection",
            icon: (
                <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
            ),
            path: "/company/qms/add-inspection",
            relatedPaths: [
              "/company/qms/list-inspection",
              "/company/qms/edit-inspection",
              "/company/qms/view-inspection",
              "/company/qms/draft-inspection",
              "/company/qms/edit-draft-inspection",
              "/company/qms/view-draft-inspection",
            ]
        },
    ]

    const isActive = (category) => {
      const currentPath = location.pathname;
      return currentPath === category.path ||
          (category.relatedPaths &&
              category.relatedPaths.some(path => currentPath.startsWith(path)));
  };


    const handleCategoryClick = (category) => {
        if (props && props.handleItemClick) {
            props.handleItemClick(category.id, category.path, "qmsauditinspection");
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
              className={`text-center ${
                active ? "text-white" : "text-[#5B5B5B]"
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

export default AuditInspectionSubmenu