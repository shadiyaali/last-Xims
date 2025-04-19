import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import "./qmsaddcompliance.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import QmsAddComplianceSuccessModal from "./Modals/QmsAddComplianceSuccessModal";
import QmsAddComplianceErrorModal from "./Modals/QmsAddComplianceErrorModal";
import QmsSaveDraftComplianceSuccessModal from "./Modals/QmsSaveDraftComplianceSuccessModal";
import QmsSaveDraftComplianceErrorModal from "./Modals/QmsSaveDraftComplianceErrorModal";


const QmsAddCompliance = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    compliance_name: "",
    compliance_no: "",
    compliance_type: "",
    date: null,
    day: "",
    month: "",
    year: "",
    attach_document: null,
    relate_business_process: "",
    compliance_remarks: "",
    relate_document: "",
    rivision: "",
    send_notification: false,
  });

  const [showAddComplianceSuccessModal, setShowAddComplianceSuccessModal] = useState(false);
  const [showAddComplianceErrorModal, setShowAddComplianceErrorModal] = useState(false);

  const [showDraftComplianceSuccessModal, setShowDraftComplianceSuccessModal] = useState(false);
  const [showDraftComplianceErrorModal, setShowDraftComplianceErrorModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [dropdowns, setDropdowns] = useState({
    compliance_type: false,
    day: false,
    month: false,
    year: false,
  });

  const handleDropdownFocus = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: true }));
  };

  const handleDropdownBlur = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: false }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      setFormData({
        ...formData,
        attach_document: file,
      });
    } else {
      setSelectedFile(null);
      setFormData({
        ...formData,
        attach_document: null,
      });
    }
  };
  const getUserCompanyId = () => {
    // First check if company_id is stored directly
    const storedCompanyId = localStorage.getItem("company_id");
    if (storedCompanyId) return storedCompanyId;

    // If user data exists with company_id
    const userRole = localStorage.getItem("role");
    if (userRole === "user") {
      // Try to get company_id from user data that was stored during login
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
  useEffect(() => {
    const { day, month, year } = formData;
    if (day && month && year) {
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  }, [formData.day, formData.month, formData.year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = getRelevantUserId();
      const companyId = getUserCompanyId();
      if (!companyId) {
        setError('Company ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      const submissionData = new FormData();
      submissionData.append('company', companyId);
      submissionData.append('user', userId);
      console.log("fdsgfsdgfsdgf", formData);

      for (const key in formData) {
        if (key !== 'day' && key !== 'month' && key !== 'year' && formData[key] !== null) {
          submissionData.append(key, formData[key]);
        }
      }

      const response = await axios.post(`${BASE_URL}/qms/compliances/create/`, submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowAddComplianceSuccessModal(true);
      setTimeout(() => {
        setShowAddComplianceSuccessModal(false);
        navigate('/company/qms/list-compliance');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowAddComplianceErrorModal(true);
      setTimeout(() => {
        setShowAddComplianceErrorModal(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setDraftLoading(true);

      const companyId = getUserCompanyId();
      const userId = getRelevantUserId();

      if (!companyId || !userId) {
        setError('Company ID or User ID not found. Please log in again.');
        setDraftLoading(false);
        return;
      }

      const submitData = new FormData();

      submitData.append('company', companyId);
      submitData.append('user', userId);
      submitData.append('is_draft', true);

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });


      if (formData.file) {
        submitData.append('upload_attachment', formData.file);
      }

      console.log('Sending draft data:', Object.fromEntries(submitData.entries()));

      const response = await axios.post(
        `${BASE_URL}/qms/compliance/draft-create/`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',

          },
        }
      );

      setDraftLoading(false);
      setShowDraftComplianceSuccessModal(true);
      setTimeout(() => {
        setShowDraftComplianceSuccessModal(false);
        navigate('/company/qms/draft-compliance');
      }, 1500);


    } catch (err) {
      setDraftLoading(false);
      setShowDraftComplianceErrorModal(true);
      setTimeout(() => {
        setShowDraftComplianceErrorModal(false);
      }, 3000);
      const errorMessage = err.response?.data?.detail || 'Failed to save Draft';
      setError(errorMessage);
      console.error('Error saving Draft:', err.response?.data || err);
    }
  };


  const handleListCompliance = () => {
    navigate('/company/qms/list-compliance');
  };

  const handleCancel = () => {
    navigate('/company/qms/list-compliance');
  };

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      <div className="flex justify-between items-center mb-5 px-[122px] pb-5 border-b border-[#383840]">
        <h2 className="add-compliance-head">Add Compliance / Obligation</h2>

        <QmsAddComplianceSuccessModal
          showAddComplianceSuccessModal={showAddComplianceSuccessModal}
          onClose={() => { setShowAddComplianceSuccessModal(false) }}
        />

        <QmsAddComplianceErrorModal
          showAddComplianceErrorModal={showAddComplianceErrorModal}
          onClose={() => { setShowAddComplianceErrorModal(false) }}
        />

        <QmsSaveDraftComplianceSuccessModal
          showDraftComplianceSuccessModal={showDraftComplianceSuccessModal}
          onClose={() => { setShowDraftComplianceSuccessModal(false) }}
        />

        <QmsSaveDraftComplianceErrorModal
          showDraftComplianceErrorModal={showDraftComplianceErrorModal}
          onClose={() => { setShowDraftComplianceErrorModal(false) }}
        />

        <button
          className="flex items-center justify-center add-manual-btn gap-[10px] !w-[238px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
          onClick={handleListCompliance}
        >
          <span>List Compliance / Obligation</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="px-[122px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name/Title */}
          <div>
            <label className="add-compliance-label">
              Compliance/Obligation Name/Title
            </label>
            <input
              type="text"
              name="compliance_name"
              value={formData.compliance_name}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
          </div>

          {/* Number */}
          <div>
            <label className="add-compliance-label">
              Compliance/Obligation Number{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="compliance_no"
              value={formData.compliance_no}
              onChange={handleInputChange}
              required
              className="w-full add-compliance-inputs"
            />
          </div>

          {/* Type */}
          <div>
            <label className="add-compliance-label">
              Compliance/Obligation Type
            </label>
            <div className="relative">
              <select
                name="compliance_type"
                value={formData.compliance_type}
                onChange={handleInputChange}
                onFocus={() => handleDropdownFocus("compliance_type")}
                onBlur={() => handleDropdownBlur("compliance_type")}
                className="appearance-none w-full add-compliance-inputs cursor-pointer"
              >
                <option value="">Select Compliance/Obligation Type</option>
                <option value="Legal">Legal</option>
                <option value="Business">Business</option>
                <option value="Client">Client</option>
                <option value="Process/Specification">Process/Specification</option>
              </select>
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 top-[12px] flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${dropdowns.compliance_type ? "rotate-180" : ""
                  }`}
              >
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="add-compliance-label">Date</label>
            <div className="grid grid-cols-3 gap-5">
              <div className="relative">
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("day")}
                  onBlur={() => handleDropdownBlur("day")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">dd</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 top-[12px] right-0 flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${dropdowns.day ? "rotate-180" : ""
                    }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>

              <div className="relative">
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("month")}
                  onBlur={() => handleDropdownBlur("month")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">mm</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 top-[12px] flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${dropdowns.month ? "rotate-180" : ""
                    }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>

              <div className="relative">
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("year")}
                  onBlur={() => handleDropdownBlur("year")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">yyyy</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={2020 + i} value={(2020 + i).toString()}>
                      {2020 + i}
                    </option>
                  ))}
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 top-[12px] flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${dropdowns.year ? "rotate-180" : ""
                    }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Attach Document */}
          <div>
            <label className="add-compliance-label">Attach Document</label>
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
                  {selectedFile ? selectedFile : "Choose File"}
                </span>
                <img src={file} alt="File Icon" />
              </button>
              {!selectedFile && (
                <p className="text-right no-file">No file chosen</p>
              )}
            </div>
          </div>

          {/* Relate Business Process */}
          <div>
            <label className="add-compliance-label">
              Relate Business Process
            </label>
            <input
              type="text"
              name="relate_business_process"
              value={formData.relate_business_process}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="add-compliance-label">
              Compliance/Obligation Remarks
            </label>
            <textarea
              name="compliance_remarks"
              value={formData.compliance_remarks}
              onChange={handleInputChange}
              rows="4"
              className="w-full add-compliance-inputs !py-3 !h-[98px]"
            ></textarea>
          </div>

          {/* Related Document */}
          <div>
            <label className="add-compliance-label">
              Relate Document/ Process
            </label>
            <textarea
              name="relate_document"
              value={formData.relate_document}
              onChange={handleInputChange}
              rows="4"
              className="w-full add-compliance-inputs !py-3 !h-[98px]"
            ></textarea>
          </div>

          {/* Revision */}
          <div>
            <label className="add-compliance-label">Revision</label>
            <input
              type="text"
              name="rivision"
              value={formData.rivision}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
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
              disabled={draftLoading}
              className="request-correction-btn duration-200"
            >
              {draftLoading ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
          <div className="flex items-end gap-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="cancel-btn duration-200 !w-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="save-btn duration-200 !w-full"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QmsAddCompliance;