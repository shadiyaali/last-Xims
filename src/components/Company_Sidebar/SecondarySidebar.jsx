import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./secondarysidebar.css";
import { motion, AnimatePresence } from "framer-motion";

// Import icons
import DashboardIcon from "../../assets/images/Company-Sidebar/icon1.svg";
import DocumentationIcon from "../../assets/images/Company-Sidebar/icon2.svg";
import TrainingIcon from "../../assets/images/Company-Sidebar/icon3.svg";
import ActionsIcon from "../../assets/images/Company-Sidebar/icon4.svg";
import AuditsIcon from "../../assets/images/Company-Sidebar/icon5.svg";
import CustomerIcon from "../../assets/images/Company-Sidebar/icon6.svg";
import SupplierIcon from "../../assets/images/Company-Sidebar/icon7.svg";
import ComplianceIcon from "../../assets/images/Company-Sidebar/icon8.svg";
import RiskIcon from "../../assets/images/Company-Sidebar/icon9.svg";
import EnergyIcon from "../../assets/images/Company-Sidebar/icon10.svg";
import CorrectionIcon from "../../assets/images/Company-Sidebar/icon11.svg";
import ObjectivesIcon from "../../assets/images/Company-Sidebar/icon12.svg";
import UserIcon from "../../assets/images/Company-Sidebar/icon13.svg";
import ReportsIcon from "../../assets/images/Company-Sidebar/icon14.svg";
import NonConformityIcon from "../../assets/images/Company-Sidebar/icon15.svg";
import AnalysisIcon from "../../assets/images/Company-Sidebar/icon16.svg";
import BackupIcon from "../../assets/images/Company-Sidebar/icon17.svg";
import LogoutIcon from "../../assets/images/Company-Sidebar/icon18.svg";

// QMS
import DocumentationSubmenu from "../Company_Sidebar/QMS/Documentation/DocumentationSubmenu";
import UserManagementSubmenu from "./QMS/User Management/UserManagementSubmenu";
import EmployeeTrainingSubmenu from "./QMS/Employee Training/EmployeeTrainingSubmenu";
import ActionsMeetingSubmenu from "./QMS/Actions Meeting Management/ActionsMeetingSubmenu";
import AuditInspectionSubmenu from "./QMS/Audit Inspection Management/AuditInspectionSubmenu";
import CustomerManagementSubmenu from "./QMS/Customer Management/CustomerManagementSubmenu";
import SupplierManagementSubmenu from "./QMS/Supplier Management/SupplierManagementSubmenu";
import ComplianceSubmenu from "./QMS/Compliance/ComplianceSubmenu";
import RiskOpportunitiesSubmenu from "./QMS/Risk and Opportunities/RiskOpportunitiesSubmenu";
import EnergyManagementSubmenu from "./QMS/Energy Management/EnergyManagementSubmenu";
import CorrectionPreventiveSubmenu from "./QMS/Correction Preventive Actions/CorrectionPreventiveSubmenu";
import ObjectiveSubmenu from "./QMS/Objectives and Targets/ObjectiveSubmenu";
import NonconformitySubmenu from "./QMS/Nonconformity Report Managements/NonconformitySubmenu";
import ReportsAnalysisSubmenu from "./QMS/Reports Analysis/ReportsAnalysisSubmenu";

// EMS
import EMSDocumentationSubmenu from "./EMS/Documentation/EMSDocumentationSubmenu";
import EMSEmployeeSubmenu from "./EMS/Employee Training/EMSEmployeeSubmenu";
import EMSActionsMeetingSubmenu from "./EMS/Actions Meeting Management/EMSActionsMeetingSubmenu";
import EMSAuditInspectionSubmenu from "./EMS/Audits Inspection Management/EMSAuditInspectionSubmenu";
import EMSCustomerSubmenu from "./EMS/Customer Management/EMSCustomerSubmenu";
import EMSSupplierSubmenu from "./EMS/Supplier Management/EMSSupplierSubmenu";
import EMSComplianceSubmenu from "./EMS/Compliance/EMSComplianceSubmenu";
import EMSRiskManagementSubmenu from "./EMS/Risk Management/EMSRiskManagementSubmenu";
import EMSEnergyManagementSubmenu from "./EMS/Energy Management/EMSEnergyManagementSubmenu";
import EMSCorrectionSubmenu from "./EMS/Correction Preventive Actions/EMSCorrectionSubmenu";
import EMSObjectivesSubmenu from "./EMS/Objective and Targets/EMSObjectivesSubmenu";
import EMSUserManagementSubmenu from "./EMS/User Management/EMSUserManagementSubmenu";
import EMSNonConformitySubmenu from "./EMS/Non Conformity Report/EMSNonConformitySubmenu";
import EMSReportsAnalysisSubmenu from "./EMS/Reports Analysis/EMSReportsAnalysisSubmenu";

// OHS
import OHSDocumentationSubmenu from "./OHS/Documentation/OHSDocumentationSubmenu";
import OHSEmployeeSubmenu from "./OHS/Employee Training/OHSEmployeeSubmenu";
import OHSActionMeetingSubmenu from "./OHS/Action Meeting Management/OHSActionMeetingSubmenu";
import OHSAuditInpectionSubmenu from "./OHS/Audit Inspection Management/OHSAuditInpectionSubmenu";
import OHSCustomerSubmenu from "./OHS/Customer Management/OHSCustomerSubmenu";
import OHSSupplierSubmenu from "./OHS/Supplier Management/OHSSupplierSubmenu";
import OHSComplianceSubmenu from "./OHS/Compliance/OHSComplianceSubmenu";
import OHSRiskManagementSubmenu from "./OHS/Risk Management/OHSRiskManagementSubmenu";
import OHSEnergySubmenu from "./OHS/Energy Management/OHSEnergySubmenu";
import OHSCorrectionSubmenu from "./OHS/Correction Preventive Actions/OHSCorrectionSubmenu";
import OHSObjectivesSubmenu from "./OHS/Objectives and Targets/OHSObjectivesSubmenu";
import OHSUserSubmenu from "./OHS/User Management/OHSUserSubmenu";
import OHSNonConformitySubmenu from "./OHS/Non Conformity Report/OHSNonConformitySubmenu";
import OHSReportAnalysisSubmenu from "./OHS/Reports Analysis/OHSReportAnalysisSubmenu";

// EnMS
import EnMSDocumentationSubmenu from "./EnMS/Documentation/EnMSDocumentationSubmenu";
import EnMSEmployeeSubmenu from "./EnMS/Employee Training/EnMSEmployeeSubmenu";
import EnMSActionMeetingSubmenu from "./EnMS/Action Meeting Management/EnMSActionMeetingSubmenu";
import EnMSAuditSubmenu from "./EnMS/Audit Inspection Management/EnMSAuditSubmenu";
import EnMSCustomerSubmenu from "./EnMS/Customer Management/EnMSCustomerSubmenu";
import EnMSSupplierSubmenu from "./EnMS/Supplier Management/EnMSSupplierSubmenu";
import EnMSComplianceSubmenu from "./EnMS/Compliance/EnMSComplianceSubmenu";
import EnMSRiskSubmenu from "./EnMS/Risk Management/EnMSRiskSubmenu";
import EnMSEnergySubmenu from "./EnMS/Energy Management/EnMSEnergySubmenu";
import EnMSCorrectionSubmenu from "./EnMS/Correction Preventive Actions/EnMSCorrectionSubmenu";
import EnMSObjectivesSubmenu from "./EnMS/Objectives and Targets/EnMSObjectivesSubmenu";
import EnMSUserSubmenu from "./EnMS/User Management/EnMSUserSubmenu";
import EnMSNonConformitySubmenu from "./EnMS/Non Conformity Report/EnMSNonConformitySubmenu";
import EnMSReportAnalysisSubmenu from "./EnMS/Report Analysis/EnMSReportAnalysisSubmenu";

// BMS
import BMSDocumentationSubmenu from "./BMS/Documentation/BMSDocumentationSubmenu";
import BMSEmployeeSubmenu from "./BMS/Employee Training/BMSEmployeeSubmenu";
import BMSActionMeetingSubmenu from "./BMS/Action Meeting Management/BMSActionMeetingSubmenu";
import BMSAuditSubmenu from "./BMS/Audit Inspection Management/BMSAuditSubmenu";
import BMSCustomerSubmenu from "./BMS/Customer Management/BMSCustomerSubmenu";
import BMSSupplierSubmenu from "./BMS/Supplier Management/BMSSupplierSubmenu";
import BMSComplianceSubmenu from "./BMS/Compliance/BMSComplianceSubmenu";
import BMSRiskSubmenu from "./BMS/Risk Management/BMSRiskSubmenu";
import BMSBusinessSubmenu from "./BMS/Business Continuity Management/BMSBusinessSubmenu";
import BMSCorrectionSubmenu from "./BMS/Correction Preventive Actions/BMSCorrectionSubmenu";
import BMSObjectivesSubmenu from "./BMS/Objectives and Targets/BMSObjectivesSubmenu";
import BMSUserSubmenu from "./BMS/User Management/BMSUserSubmenu";
import BMSNonConformitySubmenu from "./BMS/Non Conformity Report/BMSNonConformitySubmenu";
import BMSReportSubmenu from "./BMS/Report Analysis/BMSReportSubmenu";
import AMSDocumentationSubmenu from "./AMS/Documentation/AMSDocumentationSubmenu";
import AMSEmployeeSubmenu from "./AMS/Employee Training/AMSEmployeeSubmenu";
import AMSMeetingSubmenu from "./AMS/Meeting Communication Management/AMSMeetingSubmenu";
import AMSAuditSubmenu from "./AMS/Audit Inspection Management/AMSAuditSubmenu";
import AMSCustomerSubmenu from "./AMS/Customer Management/AMSCustomerSubmenu";
import AMSSupplierSubmenu from "./AMS/Supplier Management/AMSSupplierSubmenu";
import AMSComplianceSubmenu from "./AMS/Compliance/AMSComplianceSubmenu";
import AMSRiskSubmenu from "./AMS/Risk Management/AMSRiskSubmenu";
import AMSEnergySubmenu from "./AMS/Energy Management/AMSEnergySubmenu";
import AMSCorrectionSubmenu from "./AMS/Correction Preventive Actions/AMSCorrectionSubmenu";
import AMSObjectivesSubmenu from "./AMS/Objectives and Targets/AMSObjectivesSubmenu";
import AMSUserSubmenu from "./AMS/User Management/AMSUserSubmenu";
import AMSNonConformitySubmenu from "./AMS/Non Conformity Report/AMSNonConformitySubmenu";
import AMSReportSubmenu from "./AMS/Report Analysis/AMSReportSubmenu";




const SecondarySidebar = ({ selectedMenuItem, collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMainItem, setActiveMainItem] = useState("dashboard");
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [currentSubmenu, setCurrentSubmenu] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState(0);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
  const [manuallyActivated, setManuallyActivated] = useState(false);
  const [activeSubmenuParent, setActiveSubmenuParent] = useState(null); // Track the parent of active submenu

  const timeoutRef = useRef(null);
  const submenuRef = useRef(null);
  const menuItemRefs = useRef({});
  const sidebarRef = useRef(null);

  const systemMenus = {
    QMS: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/company/dashboard",
        hasSubMenu: false,
      },
      {
        id: "qmsdocumentation",
        label: "Documentation",
        icon: DocumentationIcon,
        hasSubMenu: true,
        submenuType: "qmsdocumentation",
        pathPrefix: "/company/qmsdocumentation",
      },
      {
        id: "qmsemployeetraining",
        label: "Employee Training & Performance",
        icon: TrainingIcon,
        hasSubMenu: true,
        submenuType: "qmsemployeetraining",
        pathPrefix: "/company/qmsemployeetraining",
      },
      {
        id: "qmsactions",
        label: "Actions, Meeting and Communication Management",
        icon: ActionsIcon,
        hasSubMenu: true,
        submenuType: "qmsactions",
        pathPrefix: "/company/qmsactions",
      },
      {
        id: "qmsauditinspection",
        label: "Audits & Inspections Management",
        icon: AuditsIcon,
        hasSubMenu: true,
        submenuType: "qmsauditinspection",
        pathPrefix: "/company/qmsauditinspection",
      },
      {
        id: "qmscustomermanagement",
        label: "Customer Management",
        icon: CustomerIcon,
        hasSubMenu: true,
        submenuType: "qmscustomermanagement",
        pathPrefix: "/company/qmscustomermanagement",
      },
      {
        id: "qmssuppliermanagement",
        label: "Supplier Management",
        icon: SupplierIcon,
        hasSubMenu: true,
        submenuType: "qmssuppliermanagement",
        pathPrefix: "/company/qmssuppliermanagement",
      },
      {
        id: "qmscompliancemanagement",
        label: "Compliance, Sustainability & Management of Change",
        icon: ComplianceIcon,
        hasSubMenu: true,
        submenuType: "qmscompliancemanagement",
        pathPrefix: "/company/qmscompliancemanagement",
      },
      {
        id: "qmsriskmanagement",
        label: "Risk & Opportunities Management",
        icon: RiskIcon,
        hasSubMenu: true,
        submenuType: "qmsriskmanagement",
        pathPrefix: "/company/qmsriskmanagement",
      },
      {
        id: "qmsenergymanagement",
        label: "Energy Management",
        icon: EnergyIcon,
        hasSubMenu: true,
        submenuType: "qmsenergymanagement",
        pathPrefix: "/company/qmsenergymanagement",
      },
      {
        id: "qmscorrectionmanagement",
        label: "Correction Corrective Actions & Preventive Actions",
        icon: CorrectionIcon,
        hasSubMenu: true,
        submenuType: "qmscorrectionmanagement",
        pathPrefix: "/company/qmscorrectionmanagement",
      },
      {
        id: "qmsobjectives",
        label: "Objectives & Targets",
        icon: ObjectivesIcon,
        hasSubMenu: true,
        submenuType: "qmsobjectives",
        pathPrefix: "/company/qmsobjectives",
      },
      {
        id: "qmsuser",
        label: "User Management",
        icon: UserIcon,
        hasSubMenu: true,
        submenuType: "qmsuser",
        pathPrefix: "/company/qmsuser",
      },
      {
        id: "qmsnonconformity",
        label: "Non Conformity Report Management",
        icon: NonConformityIcon,
        hasSubMenu: true,
        submenuType: "qmsnonconformity",
        pathPrefix: "/company/qmsnonconformity",
      },
      {
        id: "qmsreportsanalysis",
        label: "Reports & Analysis",
        icon: ReportsIcon,
        hasSubMenu: true,
        submenuType: "qmsreportsanalysis",
        pathPrefix: "/company/qmsreportsanalysis",
      },
      {
        id: "backup",
        label: "Backup",
        icon: BackupIcon,
        path: "/company/backup",
        hasSubMenu: false,
      },
      {
        id: "logout",
        label: "Log Out",
        icon: LogoutIcon,
        hasSubMenu: false,
      },
    ],

    EMS: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/company/dashboard",
        hasSubMenu: false,
      },
      {
        id: "emsdocumentation",
        label: "Documentation",
        icon: DocumentationIcon,
        hasSubMenu: true,
        submenuType: "emsdocumentation",
        pathPrefix: "/company/emsdocumentation",
      },
      {
        id: "emsemployeetraining",
        label: "Employee Training & Performance",
        icon: TrainingIcon,
        hasSubMenu: true,
        submenuType: "emsemployeetraining",
        pathPrefix: "/company/emsemployeetraining",
      },
      {
        id: "emsactions",
        label: "Actions, Meeting and Communication Management",
        icon: ActionsIcon,
        hasSubMenu: true,
        submenuType: "emsactions",
        pathPrefix: "/company/emsactions",
      },
      {
        id: "emsauditinspection",
        label: "Audits & Inspections Management",
        icon: AuditsIcon,
        hasSubMenu: true,
        submenuType: "emsauditinspection",
        pathPrefix: "/company/emsauditinspection",
      },
      {
        id: "emscustomermanagement",
        label: "Customer Management",
        icon: CustomerIcon,
        hasSubMenu: true,
        submenuType: "emscustomermanagement",
        pathPrefix: "/company/emscustomermanagement",
      },
      {
        id: "emssuppliermanagement",
        label: "Supplier Management",
        icon: SupplierIcon,
        hasSubMenu: true,
        submenuType: "emssuppliermanagement",
        pathPrefix: "/company/emssuppliermanagement",
      },
      {
        id: "emscompliance",
        label: "Compliance, Sustainability & Management of Change",
        icon: ComplianceIcon,
        hasSubMenu: true,
        submenuType: "emscompliance",
        pathPrefix: "/company/emscompliance",
      },
      {
        id: "emsriskmanagement",
        label: "Risk, Opportunities & Incident Management",
        icon: RiskIcon,
        hasSubMenu: true,
        submenuType: "emsriskmanagement",
        pathPrefix: "/company/emsriskmanagement",
      },
      {
        id: "emsenergymanagement",
        label: "Energy Management",
        icon: EnergyIcon,
        hasSubMenu: true,
        submenuType: "emsenergymanagement",
        pathPrefix: "/company/emsenergymanagement",
      },
      {
        id: "emscorrectionmanagement",
        label: "Correction Corrective Actions & Preventive Actions",
        icon: CorrectionIcon,
        hasSubMenu: true,
        submenuType: "emscorrectionmanagement",
        pathPrefix: "/company/emscorrectionmanagement",
      },
      {
        id: "emsobjectives",
        label: "Objectives & Targets",
        icon: ObjectivesIcon,
        hasSubMenu: true,
        submenuType: "emsobjectives",
        pathPrefix: "/company/emsobjectives",
      },
      {
        id: "emsuser",
        label: "User Management",
        icon: UserIcon,
        hasSubMenu: true,
        submenuType: "emsuser",
        pathPrefix: "/company/emsuser",
      },
      {
        id: "emsnonconformity",
        label: "Non Conformity Report Management",
        icon: NonConformityIcon,
        hasSubMenu: true,
        submenuType: "emsnonconformity",
        pathPrefix: "/company/emsnonconformity",
      },
      {
        id: "emsreportsanalysis",
        label: "Reports & Analysis",
        icon: ReportsIcon,
        hasSubMenu: true,
        submenuType: "emsreportsanalysis",
        pathPrefix: "/company/emsreportsanalysis",
      },
      {
        id: "backup",
        label: "Backup",
        icon: BackupIcon,
        path: "/company/backup",
        hasSubMenu: false,
      },
      {
        id: "logout",
        label: "Log Out",
        icon: LogoutIcon,
        hasSubMenu: false,
      },
    ],

    OHS: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/company/dashboard",
        hasSubMenu: false,
      },
      {
        id: "ohsdocumentation",
        label: "Documentation",
        icon: DocumentationIcon,
        hasSubMenu: true,
        submenuType: "ohsdocumentation",
        pathPrefix: "/company/ohsdocumentation",
      },
      {
        id: "ohsemployeetraining",
        label: "Employee Training & Performance",
        icon: TrainingIcon,
        hasSubMenu: true,
        submenuType: "ohsemployeetraining",
        pathPrefix: "/company/ohsemployeetraining",
      },
      {
        id: "ohsactions",
        label: "Actions, Meeting and Communication Management",
        icon: ActionsIcon,
        hasSubMenu: true,
        submenuType: "ohsactions",
        pathPrefix: "/company/ohsactions",
      },
      {
        id: "ohsauditinspection",
        label: "Audits & Inspections Management",
        icon: AuditsIcon,
        hasSubMenu: true,
        submenuType: "ohsauditinspection",
        pathPrefix: "/company/ohsauditinspection",
      },
      {
        id: "ohscustomermanagement",
        label: "Customer Management",
        icon: CustomerIcon,
        hasSubMenu: true,
        submenuType: "ohscustomermanagement",
        pathPrefix: "/company/ohscustomermanagement",
      },
      {
        id: "ohssuppliermanagement",
        label: "Supplier Management",
        icon: SupplierIcon,
        hasSubMenu: true,
        submenuType: "ohssuppliermanagement",
        pathPrefix: "/company/ohssuppliermanagement",
      },
      {
        id: "ohscompliance",
        label: "Compliance, Sustainability & Management of Change",
        icon: ComplianceIcon,
        hasSubMenu: true,
        submenuType: "ohscompliance",
        pathPrefix: "/company/ohscompliance",
      },
      {
        id: "ohsriskmanagement",
        label: "Risk, Opportunities & Incident Management",
        icon: RiskIcon,
        hasSubMenu: true,
        submenuType: "ohsriskmanagement",
        pathPrefix: "/company/ohsriskmanagement",
      },
      {
        id: "ohsenergymanagement",
        label: "Energy Management",
        icon: EnergyIcon,
        hasSubMenu: true,
        submenuType: "ohsenergymanagement",
        pathPrefix: "/company/ohsenergymanagement",
      },
      {
        id: "ohscorrectionmanagement",
        label: "Correction Corrective Actions & Preventive Actions",
        icon: CorrectionIcon,
        hasSubMenu: true,
        submenuType: "ohscorrectionmanagement",
        pathPrefix: "/company/ohscorrectionmanagement",
      },
      {
        id: "ohsobjectives",
        label: "Objectives & Targets",
        icon: ObjectivesIcon,
        hasSubMenu: true,
        submenuType: "ohsobjectives",
        pathPrefix: "/company/ohsobjectives",
      },
      {
        id: "ohsuser",
        label: "User Management",
        icon: UserIcon,
        hasSubMenu: true,
        submenuType: "ohsuser",
        pathPrefix: "/company/ohsuser",
      },
      {
        id: "ohsnonconformity",
        label: "Non Conformity Report Management",
        icon: NonConformityIcon,
        hasSubMenu: true,
        submenuType: "ohsnonconformity",
        pathPrefix: "/company/ohsnonconformity",
      },
      {
        id: "ohsreportsanalysis",
        label: "Reports & Analysis",
        icon: ReportsIcon,
        hasSubMenu: true,
        submenuType: "ohsreportsanalysis",
        pathPrefix: "/company/ohsreportsanalysis",
      },
      {
        id: "backup",
        label: "Backup",
        icon: BackupIcon,
        path: "/company/backup",
        hasSubMenu: false,
      },
      {
        id: "logout",
        label: "Log Out",
        icon: LogoutIcon,
        hasSubMenu: false,
      },
    ],

    EnMS: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/company/dashboard",
        hasSubMenu: false,
      },
      {
        id: "enmsdocumentation",
        label: "Documentation",
        icon: DocumentationIcon,
        hasSubMenu: true,
        submenuType: "enmsdocumentation",
        pathPrefix: "/company/enmsdocumentation",
      },
      {
        id: "enmsemployeetraining",
        label: "Employee Training & Performance",
        icon: TrainingIcon,
        hasSubMenu: true,
        submenuType: "enmsemployeetraining",
        pathPrefix: "/company/enmsemployeetraining",
      },
      {
        id: "enmsactions",
        label: "Actions, Meeting and Communication Management",
        icon: ActionsIcon,
        hasSubMenu: true,
        submenuType: "enmsactions",
        pathPrefix: "/company/enmsactions",
      },
      {
        id: "enmsauditinspection",
        label: "Audits & Inspections Management",
        icon: AuditsIcon,
        hasSubMenu: true,
        submenuType: "enmsauditinspection",
        pathPrefix: "/company/enmsauditinspection",
      },
      {
        id: "enmscustomermanagement",
        label: "Customer Management",
        icon: CustomerIcon,
        hasSubMenu: true,
        submenuType: "enmscustomermanagement",
        pathPrefix: "/company/enmscustomermanagement",
      },
      {
        id: "enmssuppliermanagement",
        label: "Supplier Management",
        icon: SupplierIcon,
        hasSubMenu: true,
        submenuType: "enmssuppliermanagement",
        pathPrefix: "/company/enmssuppliermanagement",
      },
      {
        id: "enmscompliance",
        label: "Compliance, Sustainability & Management of Change",
        icon: ComplianceIcon,
        hasSubMenu: true,
        submenuType: "enmscompliance",
        pathPrefix: "/company/enmscompliance",
      },
      {
        id: "enmsriskmanagement",
        label: "Risk, Opportunities & Incident Management",
        icon: RiskIcon,
        hasSubMenu: true,
        submenuType: "enmsriskmanagement",
        pathPrefix: "/company/enmsriskmanagement",
      },
      {
        id: "enmsenergymanagement",
        label: "Energy Management",
        icon: EnergyIcon,
        hasSubMenu: true,
        submenuType: "enmsenergymanagement",
        pathPrefix: "/company/enmsenergymanagement",
      },
      {
        id: "enmscorrectionmanagement",
        label: "Correction Corrective Actions & Preventive Actions",
        icon: CorrectionIcon,
        hasSubMenu: true,
        submenuType: "enmscorrectionmanagement",
        pathPrefix: "/company/enmscorrectionmanagement",
      },
      {
        id: "enmsobjectives",
        label: "Objectives & Targets",
        icon: ObjectivesIcon,
        hasSubMenu: true,
        submenuType: "enmsobjectives",
        pathPrefix: "/company/enmsobjectives",
      },
      {
        id: "enmsuser",
        label: "User Management",
        icon: UserIcon,
        hasSubMenu: true,
        submenuType: "enmsuser",
        pathPrefix: "/company/enmsuser",
      },
      {
        id: "enmsnonconformity",
        label: "Non Conformity Report Management",
        icon: NonConformityIcon,
        hasSubMenu: true,
        submenuType: "enmsnonconformity",
        pathPrefix: "/company/enmsnonconformity",
      },
      {
        id: "enmsreportsanalysis",
        label: "Reports & Analysis",
        icon: ReportsIcon,
        hasSubMenu: true,
        submenuType: "enmsreportsanalysis",
        pathPrefix: "/company/enmsreportsanalysis",
      },
      {
        id: "backup",
        label: "Backup",
        icon: BackupIcon,
        path: "/company/backup",
        hasSubMenu: false,
      },
      {
        id: "logout",
        label: "Log Out",
        icon: LogoutIcon,
        hasSubMenu: false,
      },
    ],

    BMS: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/company/dashboard",
        hasSubMenu: false,
      },
      {
        id: "bmsdocumentation",
        label: "Documentation",
        icon: DocumentationIcon,
        hasSubMenu: true,
        submenuType: "bmsdocumentation",
        pathPrefix: "/company/bmsdocumentation",
      },
      {
        id: "bmsemployeetraining",
        label: "Employee Training & Performance",
        icon: TrainingIcon,
        hasSubMenu: true,
        submenuType: "bmsemployeetraining",
        pathPrefix: "/company/bmsemployeetraining",
      },
      {
        id: "bmsactions",
        label: "Actions, Meeting and Communication Management",
        icon: ActionsIcon,
        hasSubMenu: true,
        submenuType: "bmsactions",
        pathPrefix: "/company/bmsactions",
      },
      {
        id: "bmsauditinspection",
        label: "Audits & Inspections Management",
        icon: AuditsIcon,
        hasSubMenu: true,
        submenuType: "bmsauditinspection",
        pathPrefix: "/company/bmsauditinspection",
      },
      {
        id: "bmscustomermanagement",
        label: "Customer Management",
        icon: CustomerIcon,
        hasSubMenu: true,
        submenuType: "bmscustomermanagement",
        pathPrefix: "/company/bmscustomermanagement",
      },
      {
        id: "bmssuppliermanagement",
        label: "Supplier Management",
        icon: SupplierIcon,
        hasSubMenu: true,
        submenuType: "bmssuppliermanagement",
        pathPrefix: "/company/bmssuppliermanagement",
      },
      {
        id: "bmscompliance",
        label: "Compliance, Sustainability & Management of Change",
        icon: ComplianceIcon,
        hasSubMenu: true,
        submenuType: "bmscompliance",
        pathPrefix: "/company/bmscompliance",
      },
      {
        id: "bmsriskmanagement",
        label: "Risk, Opportunities & Incident Management",
        icon: RiskIcon,
        hasSubMenu: true,
        submenuType: "bmsriskmanagement",
        pathPrefix: "/company/bmsriskmanagement",
      },
      {
        id: "bmsbusinessmanagement",
        label: "Business Continuity Management",
        icon: AnalysisIcon,
        hasSubMenu: true,
        submenuType: "bmsbusinessmanagement",
        pathPrefix: "/company/bmsbusinessmanagement",
      },
      {
        id: "bmscorrectionmanagement",
        label: "Correction Corrective Actions & Preventive Actions",
        icon: CorrectionIcon,
        hasSubMenu: true,
        submenuType: "bmscorrectionmanagement",
        pathPrefix: "/company/bmscorrectionmanagement",
      },
      {
        id: "bmsobjectives",
        label: "Objectives & Targets",
        icon: ObjectivesIcon,
        hasSubMenu: true,
        submenuType: "bmsobjectives",
        pathPrefix: "/company/bmsobjectives",
      },
      {
        id: "bmsuser",
        label: "User Management",
        icon: UserIcon,
        hasSubMenu: true,
        submenuType: "bmsuser",
        pathPrefix: "/company/bmsuser",
      },
      {
        id: "bmsnonconformity",
        label: "Non Conformity Report Management",
        icon: NonConformityIcon,
        hasSubMenu: true,
        submenuType: "bmsnonconformity",
        pathPrefix: "/company/bmsnonconformity",
      },
      {
        id: "bmsreportsanalysis",
        label: "Reports & Analysis",
        icon: ReportsIcon,
        hasSubMenu: true,
        submenuType: "bmsreportsanalysis",
        pathPrefix: "/company/bmsreportsanalysis",
      },
      {
        id: "backup",
        label: "Backup",
        icon: BackupIcon,
        path: "/company/backup",
        hasSubMenu: false,
      },
      { 
        id: "logout", 
        label: "Log Out", 
        icon: LogoutIcon, 
        hasSubMenu: false, 
      },
    ],

    AMS: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/company/dashboard",
        hasSubMenu: false,
      },
      {
        id: "amsdocumentation",
        label: "Documentation",
        icon: DocumentationIcon,
        hasSubMenu: true,
        submenuType: "amsdocumentation",
        pathPrefix: "/company/amsdocumentation",
      },
      {
        id: "amsemployeetraining",
        label: "Employee Training & Performance",
        icon: TrainingIcon,
        hasSubMenu: true,
        submenuType: "amsemployeetraining",
        pathPrefix: "/company/amsemployeetraining",
      },
      {
        id: "amsmeeting",
        label: "Meeting and Communication Management",
        icon: ActionsIcon,
        hasSubMenu: true,
        submenuType: "amsmeeting",
        pathPrefix: "/company/amsmeeting",
      },
      {
        id: "amsauditinspection",
        label: "Audits & Inspections Management",
        icon: AuditsIcon,
        hasSubMenu: true,
        submenuType: "amsauditinspection",
        pathPrefix: "/company/amsauditinspection",
      },
      {
        id: "amscustomermanagement",
        label: "Customer Management",
        icon: CustomerIcon,
        hasSubMenu: true,
        submenuType: "amscustomermanagement",
        pathPrefix: "/company/amscustomermanagement",
      },
      {
        id: "amssuppliermanagement",
        label: "Supplier Management",
        icon: SupplierIcon,
        hasSubMenu: true,
        submenuType: "amssuppliermanagement",
        pathPrefix: "/company/amssuppliermanagement",
      },
      {
        id: "amscompliance",
        label: "Compliance, Sustainability & Management of Change",
        icon: ComplianceIcon,
        hasSubMenu: true,
        submenuType: "amscompliance",
        pathPrefix: "/company/amscompliance",
      },
      {
        id: "amsriskmanagement",
        label: "Risk & Incident Management",
        icon: RiskIcon,
        hasSubMenu: true,
        submenuType: "amsriskmanagement",
        pathPrefix: "/company/amsriskmanagement",
      },
      {
        id: "amsenergymanagement",
        label: "Energy Management",
        icon: EnergyIcon,
        hasSubMenu: true,
        submenuType: "amsenergymanagement",
        pathPrefix: "/company/amsenergymanagement",
      },
      {
        id: "amscorrectionmanagement",
        label: "Correction Corrective Actions & Preventive Actions",
        icon: CorrectionIcon,
        hasSubMenu: true,
        submenuType: "amscorrectionmanagement",
        pathPrefix: "/company/amscorrectionmanagement",
      },
      {
        id: "amsobjectives",
        label: "Objectives & Targets",
        icon: ObjectivesIcon,
        hasSubMenu: true,
        submenuType: "amsobjectives",
        pathPrefix: "/company/amsobjectives",
      },
      {
        id: "amsuser",
        label: "User Management",
        icon: UserIcon,
        hasSubMenu: true,
        submenuType: "amsuser",
        pathPrefix: "/company/amsuser",
      },
      {
        id: "amsnonconformity",
        label: "Non Conformity Report Management",
        icon: NonConformityIcon,
        hasSubMenu: true,
        submenuType: "amsnonconformity",
        pathPrefix: "/company/amsnonconformity",
      },
      {
        id: "amsreportsanalysis",
        label: "Reports & Analysis",
        icon: ReportsIcon,
        hasSubMenu: true,
        submenuType: "amsreportsanalysis",
        pathPrefix: "/company/amsreportsanalysis",
      },
      {
        id: "backup",
        label: "Backup",
        icon: BackupIcon,
        path: "/company/backup",
        hasSubMenu: false,
      },
      { 
        id: "logout", 
        label: "Log Out", 
        icon: LogoutIcon, 
        hasSubMenu: false,
      },
    ],

    IMS: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: DashboardIcon,
        path: "/company/dashboard",
      },
    ],
  };

  const currentMenuItems = systemMenus[selectedMenuItem?.id] || systemMenus.QMS;

  // Improved function to find parent menu item based on path
  const findParentMenuItem = (path) => {
    // First check for exact path matches
    const exactMatch = currentMenuItems.find(
      (item) => item.path && path === item.path
    );
    if (exactMatch) return exactMatch.id;

    // Then check for path prefixes
    for (const item of currentMenuItems) {
      if (item.pathPrefix && path.startsWith(item.pathPrefix)) {
        return item.id;
      }
    }

    // QMS 
    // if (path.includes("/company/qmsdocumentation")) {
    //   return "qmsdocumentation";
    // }

    // if (path.includes("/company/qmsemployeetraining")) {
    //   return "qmsemployeetraining";
    // }

    // if (path.includes("/company/qmsactions")) {
    //   return "qmsactions";
    // }

    // if (path.includes("/company/qmsauditinspection")) {
    //   return "qmsauditinspection";
    // }

    // if (path.includes("/company/qmscustomermanagement")) {
    //   return "qmscustomermanagement";
    // }

    // if (path.includes("/company/qmssuppliermanagement")) {
    //   return "qmssuppliermanagement";
    // }

    // if (path.includes("/company/qmscompliancemanagement")) {
    //   return "qmscompliancemanagement";
    // }

    // if (path.includes("/company/qmsriskmanagement")) {
    //   return "qmsriskmanagement";
    // }

    // if (path.includes("/company/qmsenergymanagement")) {
    //   return "qmsenergymanagement";
    // }

    // if (path.includes("/company/qmscorrectionmanagement")) {
    //   return "qmscorrectionmanagement";
    // }

    // if (path.includes("/company/qmsobjectives")) {
    //   return "qmsobjectives";
    // }

    // // if (path.includes("/company/qmsuser")) {
    // //   return "qmsuser";
    // // }

    // if (path.includes("/company/qmsnonconformity")) {
    //   return "qmsnonconformity";
    // }

    // if (path.includes("/company/qmsreportsanalysis")) {
    //   return "qmsreportsanalysis";
    // }


    // // EMS
    // if (path.includes("/company/emsdocumentation")) {
    //   return "emsdocumentation";
    // }

    // if (path.includes("/company/emsemployeetraining")) {
    //   return "emsemployeetraining";
    // }

    // if (path.includes("/company/emsactions")) {
    //   return "emsactions";
    // }

    // if (path.includes("/company/emsauditinspection")) {
    //   return "emsauditinspection";
    // }


    return null;
  };

  useEffect(() => {
    // Retrieve stored active state from localStorage on mount
    const storedMainItem =
      localStorage.getItem("activeMainItem") || "dashboard";
    const storedSubItem = localStorage.getItem("activeSubItem") || null;

    if (storedMainItem) {
      setActiveMainItem(storedMainItem);
    }

    if (storedSubItem) {
      setActiveSubItem(storedSubItem);
    }
  }, []);

  // Update active states based on current URL path
  useEffect(() => {
    if (manuallyActivated) {
      // Prevent resetting active state when manually changed
      setManuallyActivated(false);
      return;
    }

    const currentPath = location.pathname;
    const parentMenuItem = findParentMenuItem(currentPath);

    if (parentMenuItem) {
      setActiveMainItem(parentMenuItem);
      localStorage.setItem("activeMainItem", parentMenuItem); // Save to localStorage

      const pathSegments = currentPath.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];

      // Only set active sub-item if it's not the same as parent menu
      const newSubItem = lastSegment !== parentMenuItem ? lastSegment : null;
      setActiveSubItem(newSubItem);
      localStorage.setItem("activeSubItem", newSubItem); // Save to localStorage
    } else {
      setActiveSubItem(null);
      localStorage.removeItem("activeSubItem"); // Clear if no submenu
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    updateSubmenuPosition();

    const sidebarElement = sidebarRef.current;
    if (sidebarElement) {
      sidebarElement.addEventListener("scroll", updateSubmenuPosition);

      return () => {
        sidebarElement.removeEventListener("scroll", updateSubmenuPosition);
      };
    }
  }, [hoveredMenuItem]);

  const updateSubmenuPosition = () => {
    if (
      hoveredMenuItem &&
      menuItemRefs.current[hoveredMenuItem] &&
      sidebarRef.current
    ) {
      const menuItemElement = menuItemRefs.current[hoveredMenuItem];
      const sidebarElement = sidebarRef.current;

      const menuItemRect = menuItemElement.getBoundingClientRect();
      const sidebarRect = sidebarElement.getBoundingClientRect();

      let topPosition = menuItemRect.top - sidebarRect.top - 65;

      setSubmenuPosition(topPosition);
    }
  };

  const handleMenuItemMouseEnter = (item) => {
    if (collapsed) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setHoveredMenuItem(item.id);

    // If the new item doesn't have a submenu, close the existing submenu immediately
    if (!item.hasSubMenu) {
      setShowSubmenu(false);
      setCurrentSubmenu(null);
      setActiveSubmenuParent(null);
      return;
    }

    // Open submenu if the item has one
    setCurrentSubmenu(item.submenuType);
    setActiveSubmenuParent(item.id); // Set the active submenu parent
    setShowSubmenu(true);
    updateSubmenuPosition();
  };

  const handleMenuAreaMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHoveredMenuItem(null);
      setShowSubmenu(false);
      setActiveSubmenuParent(null); // Clear active submenu parent
    }, 300);
  };

  const handleSubmenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Keep the submenu and parent menu highlighted
    // No need to change hoveredMenuItem as we're using activeSubmenuParent now
  };

  const handleSubmenuMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setHoveredMenuItem(null);
      setShowSubmenu(false);
      setActiveSubmenuParent(null); // Clear active submenu parent
    }, 300);
  };

  // Handle click on a main menu item
  const handleMenuItemClick = (item) => {
    // If the item has a submenu, toggle it
    if (item.hasSubMenu) {
      setManuallyActivated(true);
      const isTogglingCurrent = currentSubmenu === item.submenuType;

      setShowSubmenu((prev) => (isTogglingCurrent ? !prev : true));
      setCurrentSubmenu(
        isTogglingCurrent && !showSubmenu ? null : item.submenuType
      );
      setActiveSubmenuParent(
        isTogglingCurrent && !showSubmenu ? null : item.id
      );
      return;
    }

    // For items without submenu, update state and navigate
    setActiveMainItem(item.id);
    setActiveSubItem(null);
    setCurrentSubmenu(null);
    setShowSubmenu(false);
    setActiveSubmenuParent(null);
    setManuallyActivated(true);

    // Save active state to localStorage
    localStorage.setItem("activeMainItem", item.id);
    localStorage.removeItem("activeSubItem");

    // Navigate to the item's path
    if (item.path) {
      navigate(item.path);
    }

    // Remove this line to prevent auto-collapse
    // if (setCollapsed && typeof setCollapsed === "function") {
    //   setCollapsed(true);
    // }
  };

  // Handle click on a submenu item
  const handleSubMenuItemClick = (subItemId, path, parentMenuId) => {
    // Set the correct parent menu as active
    setActiveMainItem(parentMenuId);
    setActiveSubItem(subItemId);
    setManuallyActivated(true);
    setActiveSubmenuParent(null);
    setShowSubmenu(false);

    // Save active submenu state to localStorage
    localStorage.setItem("activeMainItem", parentMenuId);
    localStorage.setItem("activeSubItem", subItemId);

    // Navigate to the selected path
    if (path) {
      navigate(path);
    }

    // Remove this line to prevent auto-collapse
    // if (setCollapsed && typeof setCollapsed === "function") {
    //   setCollapsed(true);
    // }
  };

  const isMenuItemActive = (item) => {
    if (item.hasSubMenu && item.id === activeMainItem) {
      return true; // Keep parent menu active when a submenu is active
    }

    return !item.hasSubMenu && activeMainItem === item.id;
  };

  // New function to determine hover state including when submenu is active
  const isMenuItemHovered = (item) => {
    return hoveredMenuItem === item.id || activeSubmenuParent === item.id;
  };

  const renderSubmenu = () => {
    if (!showSubmenu || collapsed) return null;

    const submenuVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    };

    let submenuContent = null;

    switch (currentSubmenu) {
      case "qmsdocumentation":
        submenuContent = (
          <DocumentationSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsemployeetraining":
        submenuContent = (
          <EmployeeTrainingSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsactions":
        submenuContent = (
          <ActionsMeetingSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsauditinspection":
        submenuContent = (
          <AuditInspectionSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmscustomermanagement":
        submenuContent = (
          <CustomerManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmssuppliermanagement":
        submenuContent = (
          <SupplierManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmscompliancemanagement":
        submenuContent = (
          <ComplianceSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsriskmanagement":
        submenuContent = (
          <RiskOpportunitiesSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsenergymanagement":
        submenuContent = (
          <EnergyManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmscorrectionmanagement":
        submenuContent = (
          <CorrectionPreventiveSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsobjectives":
        submenuContent = (
          <ObjectiveSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsuser":
        submenuContent = (
          <UserManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsnonconformity":
        submenuContent = (
          <NonconformitySubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "qmsreportsanalysis":
        submenuContent = (
          <ReportsAnalysisSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;

      case "emsdocumentation":
        submenuContent = (
          <EMSDocumentationSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsemployeetraining":
        submenuContent = (
          <EMSEmployeeSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsactions":
        submenuContent = (
          <EMSActionsMeetingSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsauditinspection":
        submenuContent = (
          <EMSAuditInspectionSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emscustomermanagement":
        submenuContent = (
          <EMSCustomerSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emssuppliermanagement":
        submenuContent = (
          <EMSSupplierSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emscompliance":
        submenuContent = (
          <EMSComplianceSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsriskmanagement":
        submenuContent = (
          <EMSRiskManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsenergymanagement":
        submenuContent = (
          <EMSEnergyManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emscorrectionmanagement":
        submenuContent = (
          <EMSCorrectionSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsobjectives":
        submenuContent = (
          <EMSObjectivesSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsuser":
        submenuContent = (
          <EMSUserManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsnonconformity":
        submenuContent = (
          <EMSNonConformitySubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "emsreportsanalysis":
        submenuContent = (
          <EMSReportsAnalysisSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;

      case "ohsdocumentation":
        submenuContent = (
          <OHSDocumentationSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsemployeetraining":
        submenuContent = (
          <OHSEmployeeSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsactions":
        submenuContent = (
          <OHSActionMeetingSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsauditinspection":
        submenuContent = (
          <OHSAuditInpectionSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohscustomermanagement":
        submenuContent = (
          <OHSCustomerSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohssuppliermanagement":
        submenuContent = (
          <OHSSupplierSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohscompliance":
        submenuContent = (
          <OHSComplianceSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsriskmanagement":
        submenuContent = (
          <OHSRiskManagementSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsenergymanagement":
        submenuContent = (
          <OHSEnergySubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohscorrectionmanagement":
        submenuContent = (
          <OHSCorrectionSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsobjectives":
        submenuContent = (
          <OHSObjectivesSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsuser":
        submenuContent = (
          <OHSUserSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsnonconformity":
        submenuContent = (
          <OHSNonConformitySubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "ohsreportsanalysis":
        submenuContent = (
          <OHSReportAnalysisSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;

      case "enmsdocumentation":
        submenuContent = (
          <EnMSDocumentationSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsemployeetraining":
        submenuContent = (
          <EnMSEmployeeSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsactions":
        submenuContent = (
          <EnMSActionMeetingSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsauditinspection":
        submenuContent = (
          <EnMSAuditSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmscustomermanagement":
        submenuContent = (
          <EnMSCustomerSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmssuppliermanagement":
        submenuContent = (
          <EnMSSupplierSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmscompliance":
        submenuContent = (
          <EnMSComplianceSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsriskmanagement":
        submenuContent = (
          <EnMSRiskSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsenergymanagement":
        submenuContent = (
          <EnMSEnergySubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmscorrectionmanagement":
        submenuContent = (
          <EnMSCorrectionSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsobjectives":
        submenuContent = (
          <EnMSObjectivesSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsuser":
        submenuContent = (
          <EnMSUserSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsnonconformity":
        submenuContent = (
          <EnMSNonConformitySubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "enmsreportsanalysis":
        submenuContent = (
          <EnMSReportAnalysisSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;

      case "bmsdocumentation":
        submenuContent = (
          <BMSDocumentationSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsemployeetraining":
        submenuContent = (
          <BMSEmployeeSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsactions":
        submenuContent = (
          <BMSActionMeetingSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsauditinspection":
        submenuContent = (
          <BMSAuditSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmscustomermanagement":
        submenuContent = (
          <BMSCustomerSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmssuppliermanagement":
        submenuContent = (
          <BMSSupplierSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmscompliance":
        submenuContent = (
          <BMSComplianceSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsriskmanagement":
        submenuContent = (
          <BMSRiskSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsbusinessmanagement":
        submenuContent = (
          <BMSBusinessSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmscorrectionmanagement":
        submenuContent = (
          <BMSCorrectionSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsobjectives":
        submenuContent = (
          <BMSObjectivesSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsuser":
        submenuContent = (
          <BMSUserSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsnonconformity":
        submenuContent = (
          <BMSNonConformitySubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;
      case "bmsreportsanalysis":
        submenuContent = (
          <BMSReportSubmenu
            activeSubItem={activeSubItem}
            handleItemClick={handleSubMenuItemClick}
          />
        );
        break;

        case "amsdocumentation":
          submenuContent = (
            <AMSDocumentationSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsemployeetraining":
          submenuContent = (
            <AMSEmployeeSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsmeeting":
          submenuContent = (
            <AMSMeetingSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsauditinspection":
          submenuContent = (
            <AMSAuditSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amscustomermanagement":
          submenuContent = (
            <AMSCustomerSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amssuppliermanagement":
          submenuContent = (
            <AMSSupplierSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amscompliance":
          submenuContent = (
            <AMSComplianceSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsriskmanagement":
          submenuContent = (
            <AMSRiskSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsenergymanagement":
          submenuContent = (
            <AMSEnergySubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amscorrectionmanagement":
          submenuContent = (
            <AMSCorrectionSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsobjectives":
          submenuContent = (
            <AMSObjectivesSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsuser":
          submenuContent = (
            <AMSUserSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsnonconformity":
          submenuContent = (
            <AMSNonConformitySubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        case "amsreportsanalysis":
          submenuContent = (
            <AMSReportSubmenu
              activeSubItem={activeSubItem}
              handleItemClick={handleSubMenuItemClick}
            />
          );
          break;
        default:
        submenuContent = null;
    }

    if (!submenuContent) return null;

    return (
      <motion.div
        ref={submenuRef}
        className="absolute left-full bg-[#2A2A36] border border-[#383840] rounded-r-md shadow-lg -z-10"
        style={{ top: `${submenuPosition}px` }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        variants={submenuVariants}
        onMouseEnter={handleSubmenuMouseEnter}
        onMouseLeave={handleSubmenuMouseLeave}
      >
        {submenuContent}
      </motion.div>
    );
  };



  const handleLogout = () => {
    // Remove authentication tokens
    localStorage.removeItem("companyAccessToken");
    localStorage.removeItem('logoutTime');
    navigate("/company-login");

  };

  return (
    <div className="relative z-10" onMouseLeave={handleMenuAreaMouseLeave}>
      <div
        ref={sidebarRef}
        className="secondary-sidebar bg-[#1C1C24] text-[#5B5B5B] h-full overflow-y-auto transition-all border-l border-r border-[#383840] "
        style={{ width: collapsed ? "73px" : "292px" }}
      >
        <div className="py-5">
          {currentMenuItems.map((item) => (
            <div
              key={item.id}
              ref={(el) => (menuItemRefs.current[item.id] = el)}
              onClick={() =>
                item.id === "logout" ? handleLogout() : handleMenuItemClick(item)
              }
              onMouseEnter={() => handleMenuItemMouseEnter(item)}
            >
              <div
                className="flex items-center justify-between pl-[25px] pr-2 py-3 cursor-pointer second-sidebar"
                style={{
                  borderLeft: isMenuItemActive(item)
                    ? `2px solid ${selectedMenuItem?.borderColor || "#30AD71"}`
                    : "none",
                  backgroundColor: isMenuItemActive(item)
                    ? `${selectedMenuItem?.borderColor || "#30AD71"}15`
                    : "transparent", // Removed the hover background
                  color:
                    isMenuItemActive(item) || isMenuItemHovered(item)
                      ? "#FFFFFF"
                      : "#5B5B5B",
                }}
              >
                <div className="flex items-center">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`w-5 h-5 second-sidebar-icons ${isMenuItemActive(item) || isMenuItemHovered(item)
                      ? "filter brightness-0 invert"
                      : ""
                      }`}
                  />
                  {!collapsed && (
                    <span className="ml-3 second-sidebar-spans">
                      {item.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>{renderSubmenu()}</AnimatePresence>
    </div>
  );
};

export default SecondarySidebar;
