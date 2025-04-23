import React, { useState, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../../Utils/Config";
import axios from "axios";
import AddQmsProcessesSuccessModal from "./Modals/AddQmsProcessesSuccessModal";
import AddQmsProcessesErrorModal from "./Modals/AddQmsProcessesErrorModal";
import AddQmsProcessesDraftSucessesModal from "./Modals/AddQmsProcessesDraftSucessesModal";
import AddQmsProcessesDraftErrorModal from "./Modals/AddQmsProcessesDraftErrorModal";

const AddQmsProcesses = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [showAddProcessesSuccessModal, setShowAddProcessesSuccessModal] = useState(false);
  const [showAddQmsProcessesErrorModal, setShowAddQmsProcessesErrorModal] = useState(false);
  const [showDraftProcessesSuccessModal, setShowDraftProcessesSuccessModal] = useState(false);
  const [showDraftProcessesErrorModal, setShowDraftProcessesErrorModal] = useState(false);

  // Add state for compliance options
  const [legalRequirementOptions, setLegalRequirementOptions] = useState([]);
  // Add search state
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    type: "Stratgic",
    no: "",
    legal_requirements: [],
    custom_legal_requirements: "",
    file: null,
    company: null,
    send_notification: false,
  });
  
  const [dropdownRotation, setDropdownRotation] = useState({
    type: false,
    legal_requirements: false,
  });
  
  const [showCustomField, setShowCustomField] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  
  const getUserCompanyId = () => {
    const storedCompanyId = localStorage.getItem("company_id");
    if (storedCompanyId) return storedCompanyId;
    const userRole = localStorage.getItem("role");
    if (userRole === "user") {
      const userData = localStorage.getItem("user_company_id");
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (e) {
          console.error("Error parsing user company ID:", e);
          return null;
        }
      }
    }
    return null;
  };

  const companyId = getUserCompanyId();
  
  useEffect(() => {
    if (companyId) {
      setFormData((prev) => ({
        ...prev,
        company: companyId,
      }));
      fetchComplianceData();
    }
  }, [companyId]);
  
  const getRelevantUserId = () => {
    const userRole = localStorage.getItem("role");
    if (userRole === "user") {
      const userId = localStorage.getItem("user_id");
      if (userId) return userId;
    }
    const companyId = localStorage.getItem("company_id");
    if (companyId) return companyId;
    return null;
  };
  
  const fetchComplianceData = async () => {
    try {
      if (!companyId) {
        console.error("Company ID not found");
        return;
      }
      const response = await axios.get(
        `${BASE_URL}/qms/procedure-publish/${companyId}/`
      );
      setLegalRequirementOptions(response.data);
      console.log("Fetched compliance data:", response.data);
    } catch (err) {
      console.error("Error fetching compliance data:", err);
      setLegalRequirementOptions([
        { compliance_name: "GDPR", title: "GDPR Compliance" },
        { compliance_name: "HIPAA", title: "HIPAA Compliance" },
        { compliance_name: "CCPA", title: "CCPA Compliance" },
        { compliance_name: "SOX", title: "SOX Compliance" },
      ]);
    }
  };
  
  const toggleDropdown = (field) => {
    setDropdownRotation((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle checkbox change for procedures
  const handleProcedureCheckboxChange = (procedureTitle) => {
    setFormData(prevData => {
      const updatedProcedures = [...prevData.legal_requirements];

      // If already selected, remove it
      if (updatedProcedures.includes(procedureTitle)) {
        return {
          ...prevData,
          legal_requirements: updatedProcedures.filter(item => item !== procedureTitle)
        };
      }
      // Otherwise add it
      else {
        return {
          ...prevData,
          legal_requirements: [...updatedProcedures, procedureTitle]
        };
      }
    });
  };

  // Toggle N/A option for custom field
  const handleNAChange = (e) => {
    const checked = e.target.checked;
    setShowCustomField(checked);

    if (checked) {
      // If N/A is checked, clear all procedure selections
      setFormData(prev => ({
        ...prev,
        legal_requirements: []
      }));
    } else {
      // If N/A is unchecked, clear the custom field
      setFormData(prev => ({
        ...prev,
        custom_legal_requirements: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file: file,
      });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const userId = getRelevantUserId();
    const submitData = new FormData();
    
    // Add basic fields
    submitData.append("name", formData.name);
    submitData.append("type", formData.type);
    submitData.append("no", formData.no);
    submitData.append('user', userId);
  
    // Handle legal requirements based on N/A selection
    if (showCustomField) {
      // If N/A is selected, don't append any legal requirements
      // But include the custom text
      if (formData.custom_legal_requirements) {
        submitData.append(
          "custom_legal_requirements",
          formData.custom_legal_requirements
        );
      }
    } else {
      // For many-to-many relationships, we need to send an array of IDs
      // Since we're using a FormData object, we need to append each ID separately
      formData.legal_requirements.forEach((procedureTitle, index) => {
        // Find the procedure ID that matches this title
        const procedure = legalRequirementOptions.find(p => p.title === procedureTitle);
        if (procedure && procedure.id) {
          submitData.append(`legal_requirements[${index}]`, procedure.id);
        }
      });
    }
  
    // Add file if it exists
    if (formData.file instanceof File) {
      submitData.append("file", formData.file);
    }
    
    // Add company ID
    if (formData.company) {
      submitData.append("company", formData.company);
    }
  
    submitData.append("send_notification", formData.send_notification);
    
    try {
      const response = await axios.post(
        `${BASE_URL}/qms/processes/`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response from server:", response.data);
      setShowAddProcessesSuccessModal(true);
      setTimeout(() => {
        setShowAddProcessesSuccessModal(false);
        navigate("/company/qms/processes");
      }, 1500);
    } catch (err) {
      setError("Failed to save. Please check your inputs and try again.");
      setShowAddQmsProcessesErrorModal(true);
      setTimeout(() => {
        setShowAddQmsProcessesErrorModal(false);
      }, 3000);
      console.error("Error submitting form:", err);
      console.error("Error details:", err.response?.data);
      setSubmitting(false);
    }
  };
  const handleCancel = () => {
    navigate("/company/qms/processes");
  };

  if (loading) {
    return (
      <div className="bg-[#1C1C24] p-5 rounded-lg text-white flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }
  
  const handleSaveAsDraft = async () => {
    try {
      const companyId = getUserCompanyId();
      const userId = getRelevantUserId();
  
      if (!companyId || !userId) {
        setError("Company ID or User ID not found. Please log in again.");
        setLoading(false);
        return;
      }
  
      const submitData = new FormData();
  
      submitData.append("company", companyId);
      submitData.append("user", userId);
      submitData.append("is_draft", true);
  
      // Add basic fields
      submitData.append("name", formData.name);
      submitData.append("type", formData.type);
      submitData.append("no", formData.no);
  
      // Handle legal requirements based on N/A selection
      if (showCustomField) {
        if (formData.custom_legal_requirements) {
          submitData.append(
            "custom_legal_requirements",
            formData.custom_legal_requirements
          );
        }
      } else {
        // For many-to-many relationships in draft
        formData.legal_requirements.forEach((procedureTitle, index) => {
          const procedure = legalRequirementOptions.find(p => p.title === procedureTitle);
          if (procedure && procedure.id) {
            submitData.append(`legal_requirements[${index}]`, procedure.id);
          }
        });
      }
  
      // Add file if it exists
      if (formData.file) {
        submitData.append("file", formData.file);
      }
  
      submitData.append("send_notification", formData.send_notification);
  
      const response = await axios.post(
        `${BASE_URL}/qms/processes/draft-create/`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setLoading(false);
      setShowDraftProcessesSuccessModal(true);
      setTimeout(() => {
        setShowDraftProcessesSuccessModal(false);
        navigate("/company/qms/draft-processes");
      }, 1500);
    } catch (err) {
      setLoading(false);
      setShowDraftProcessesErrorModal(true);
      setTimeout(() => {
        setShowDraftProcessesErrorModal(false);
      }, 3000);
      const errorMessage = err.response?.data?.detail || "Failed to save Draft";
      setError(errorMessage);
      console.error("Error saving Draft:", err.response?.data || err);
    }
  };
  // Filter procedures based on search term
  const filteredProcedures = legalRequirementOptions
    .filter(option => 
      !["GDPR", "HIPAA", "CCPA", "SOX"].includes(option.compliance_name) &&
      option.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
  return (
    <div className="bg-[#1C1C24] p-5 rounded-lg text-white">
      <h1 className="add-interested-parties-head px-[122px] border-b border-[#383840] pb-5">
        Add Processes
      </h1>

      <AddQmsProcessesSuccessModal
        showAddProcessesSuccessModal={showAddProcessesSuccessModal}
        onClose={() => {
          setShowAddProcessesSuccessModal(false);
        }}
      />

      <AddQmsProcessesErrorModal
        showAddQmsProcessesErrorModal={showAddQmsProcessesErrorModal}
        onClose={() => {
          setShowAddQmsProcessesErrorModal(false);
        }}
      />

      <AddQmsProcessesDraftSucessesModal
        showDraftProcessesSuccessModal={showDraftProcessesSuccessModal}
        onClose={() => {
          setShowDraftProcessesSuccessModal(false);
        }}
      />

      <AddQmsProcessesDraftErrorModal
        showDraftProcessesErrorModal={showDraftProcessesErrorModal}
        onClose={() => {
          setShowDraftProcessesErrorModal(false);
        }}
      />

      {error && (
        <div className="px-[122px] mt-4 text-red-500 bg-red-100 bg-opacity-10 p-3 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="px-[122px]">
        <div className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block mb-3 add-qms-manual-label">
                Name/Title
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full add-qms-intertested-inputs"
                required
              />
            </div>

            <div>
              <label className="block mb-3 add-qms-manual-label">
                Process No/Identification
              </label>
              <input
                type="text"
                name="no"
                placeholder="Enter Process Number"
                value={formData.no}
                onChange={handleInputChange}
                className="w-full add-qms-intertested-inputs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-3 add-qms-manual-label">
                Process Type
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  onFocus={() => toggleDropdown("type")}
                  onBlur={() => toggleDropdown("type")}
                  className="w-full add-qms-intertested-inputs appearance-none cursor-pointer"
                  required
                >
                  <option value="Stratgic">Strategic</option>
                  <option value="Core">Core</option>
                  <option value="Support">Support</option>
                  <option value="Monitoring/Measurment">
                    Monitoring/Measurment
                  </option>
                  <option value="Outsource">Outsource</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none transition-transform duration-300">
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transform transition-transform duration-300 ${dropdownRotation.type ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-3 add-qms-manual-label">
                Related Procedure
              </label>

              {/* Search box for procedures */}
              <div className="relative mb-2 ">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search procedures..."
                  className="w-full add-qms-intertested-inputs pl-8 "
                />
              
              </div>

          
              <div className="border border-[#383840] rounded-md p-2 max-h-[130px] overflow-y-auto">
        
             
                {showCustomField ? (
                  
                  <div className="mt-2">
                    <textarea
                      name="custom_legal_requirements"
                      placeholder="Please specify"
                      value={formData.custom_legal_requirements}
                      onChange={handleInputChange}
                      className="w-full add-qms-intertested-inputs !h-20"
                    />
                  </div>
                ) : (
               
                  <>
                    {filteredProcedures.length > 0 ? (
                      filteredProcedures.map((option, index) => (
                        <div key={index} className="flex items-center mb-2 ">
                          <input
                            type="checkbox"
                            id={`procedure-${index}`}
                            className="mr-2 form-checkboxes"
                            checked={formData.legal_requirements.includes(option.title)}
                            onChange={() => handleProcedureCheckboxChange(option.title)}
                          />
                          <label
                            htmlFor={`procedure-${index}`}
                            className="permissions-texts cursor-pointer"
                          >
                            {option.title}
                          </label>
                          
                        </div>
                        
                      ))
                    ) : (
                      <p className="text-gray-400 mt-2">No procedures found</p>
                    )}
                  </>
                )}
                    <div className="flex items-center mb-4 pb-2  ">
                  <input
                    type="checkbox"
                    id="procedure-na"
                    className="mr-2 form-checkboxes"
                    checked={showCustomField}
                    onChange={handleNAChange}
                  />
                  <label
                    htmlFor="procedure-na"
                    className="permissions-texts cursor-pointer font-medium"
                  >
                    N/A
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-3 add-qms-manual-label">
                Browse / Upload File
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="w-full add-qmsmanual-attach"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <span className="file-input">
                    {fileName !== "No file chosen" ? fileName : "Choose File"}
                  </span>
                  <img src={file} alt="File Icon" />
                </button>
                {fileName === "No file chosen" && (
                  <p className="text-right no-file">No file chosen</p>
                )}
              </div>
            </div>
            <div className="flex items-end justify-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="send_notification"
                  className="mr-2 form-checkboxes"
                  checked={formData.send_notification}
                  onChange={handleInputChange}
                />
                <span className="permissions-texts cursor-pointer">
                  Send Notification
                </span>
              </label>
            </div>
            <div>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="request-correction-btn duration-200"
              >
                Save as Draft
              </button>
            </div>
            <div className="flex justify-end space-x-5">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn duration-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn duration-200"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save & Publish"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
export default AddQmsProcesses;