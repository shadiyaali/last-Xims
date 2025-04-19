import React from 'react'
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import procedure from "../../../../assets/images/Company-Sidebar/manual.svg";
import record from "../../../../assets/images/Company-Sidebar/record-format.svg";
import parties from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import process from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import scope from "../../../../assets/images/Company-Sidebar/record-format.svg";
import { useNavigate, useLocation } from "react-router-dom";

const ComplianceSubmenu = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    {
      id: "compliance",
      label: "Compliance",
      icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
      path: "/company/qms/list-compliance",
      relatedPaths: ["/company/qms/add-compliance",
        "/company/qms/edit-compliance",
        "/company/qms/view-compliance",
        "/company/qms/draft-compliance",
        "/company/qms/edit-draft-compliance",
        "/company/qms/view-draft-compliance",
      ]
    },
    {
      id: "legal-other-requirements",
      label: "Legal and Other Requirements",
      icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
      path: "/company/qms/list-legal-requirements",
      relatedPaths: ["/company/qms/add-legal-requirements",
        "/company/qms/edit-legal-requirements",
        "/company/qms/view-legal-requirements",
        "/company/qms/draft-legal-requirements",
        "/company/qms/view-draft-legal-requirements",
        "/company/qms/edit-draft-legal-requirements",
      ]
    },
    {
      id: "evaluation-of-compliance",
      label: "Evaluation of Compliance",
      icon: (
        <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
      ),
      path: "/company/qms/list-evaluation-compliance",
      relatedPaths: ["/company/qms/add-evaluation-compliance",
        "/company/qms/edit-evaluation-compliance",
        "/company/qms/view-evaluation-compliance",
        "/company/qms/draft-evaluation-compliance",
        "/company/qms/edit-draft-evaluation-compliance",
        "/company/qms/view-draft-evaluation-compliance",
      ]
    },
    {
      id: "Management-of-change",
      label: (
        <>
          Management of <br /> Change
        </>
      ),
      icon: (
        <img src={record} alt="Record Format" className="w-[15px] h-[15px]" />
      ),
      path: "/company/qms/list-management-change",
      relatedPaths: ["/company/qms/add-management-change",
        "/company/qms/edit-management-change",
        "/company/qms/view-management-change",
        "/company/qms/draft-management-change",
        "/company/qms/edit-draft-management-change",
        "/company/qms/view-draft-management-change",
      ]
    },
    {
      id: "management-of-change-log",
      label: (
        <>
          Management of <br /> Change Log
        </>
      ),
      icon: (
        <img src={parties} alt="Interested Parties" className="w-[15px] h-[15px]" />
      ),
      // path: "/company/qms/interested-parties",
    },
    {
      id: "risk-management",
      label: "Risk Management",
      icon: <img src={process} alt="Processes" className="w-[15px] h-[15px]" />,
      // path: "/company/qms/processes",
    },
    {
      id: "process-risks-and-assessments",
      label: "Process Risks and Assessments",
      icon: (
        <img src={scope} alt="Scope Statements" className="w-[15px] h-[15px]" />
      ),
      // path: "/company/qms/scope-statements",
    },
    {
      id: "sustainability",
      label: "Sustainability",
      icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
      path: "/company/qms/list-sustainability",
      relatedPaths: ["/company/qms/add-sustainability",
        "/company/qms/edit-sustainability",
        "/company/qms/view-sustainability",
        "/company/qms/draft-sustainability",
        "/company/qms/edit-draft-sustainability",
        "/company/qms/view-draft-sustainability",
      ]
    },
  ];

  const isActive = (category) => {
    const currentPath = location.pathname;
    return currentPath === category.path ||
      (category.relatedPaths &&
        category.relatedPaths.some(path => currentPath.startsWith(path)));
  };

  // Handle clicking on a submenu item
  const handleCategoryClick = (category) => {
    if (props && props.handleItemClick) {
      props.handleItemClick(category.id, category.path, "qmscompliancemanagement");
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

export default ComplianceSubmenu
