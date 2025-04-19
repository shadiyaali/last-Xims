import React, { useState, useEffect } from "react";
import { ChevronDown, Eye } from "lucide-react";
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import QmsEditDraftComplianceSuccessModal from "./Modals/QmsEditDraftComplianceSuccessModal";
import QmsEditDraftComplianceErrorModal from "./Modals/QmsEditDraftComplianceErrorModal";

const QmsEditDraftCompliance = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the compliance ID from URL params

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

  const [showDraftEditComplianceSuccessModal, setShowDraftEditComplianceSuccessModal] = useState(false);
  const [showDraftEditComplianceErrorModal, setShowDraftEditComplianceErrorModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dropdowns, setDropdowns] = useState({
    compliance_type: false,
    day: false,
    month: false,
    year: false,
  });


  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/qms/compliances-get/${id}/`);
        const data = response.data;


        let day = "", month = "", year = "";
        if (data.date) {
          const dateObj = new Date(data.date);
          day = dateObj.getDate().toString();
          month = (dateObj.getMonth() + 1).toString();
          year = dateObj.getFullYear().toString();
        }

        setFormData({
          ...data,
          day,
          month,
          year,
        });

        if (data.attach_document) {
          setSelectedFile(data.attach_document.split('/').pop());
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load compliance data");
        setLoading(false);
        console.error("Error fetching compliance data:", err);
      }
    };

    if (id) {
      fetchComplianceData();
    }
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();


    const submitData = new FormData();


    if (formData.day && formData.month && formData.year) {
      const formattedDate = `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;
      submitData.append('date', formattedDate);
    }


    Object.keys(formData).forEach(key => {

      if (!['day', 'month', 'year'].includes(key) && formData[key] !== null) {
        if (key === 'attach_document' && typeof formData[key] === 'object') {
          submitData.append(key, formData[key]);
        } else if (typeof formData[key] !== 'object') {
          submitData.append(key, formData[key]);
        }
      }
    });

    try {
      const response = await axios.put(`${BASE_URL}/qms/compliances/${id}/edit/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Compliance updated successfully:", response.data);
      setShowDraftEditComplianceSuccessModal(true);
      setTimeout(() => {
        setShowDraftEditComplianceSuccessModal(false);
        navigate("/company/qms/list-compliance");
      }, 1500);

    } catch (err) {
      console.error("Error updating compliance:", err);
      setError("Failed to update compliance");
      setShowDraftEditComplianceErrorModal(true);
      setTimeout(() => {
        setShowDraftEditComplianceErrorModal(false);
      }, 3000);
    }
  };

  const handleListCompliance = () => {
    navigate("/company/qms/list-compliance");
  };

  const handleCancel = () => {
    navigate("/company/qms/list-compliance");
  };

  const handleViewFile = () => {
    // Only attempt to view if there's a file to view
    if (formData.attach_document && typeof formData.attach_document === 'string') {
      window.open(formData.attach_document, '_blank');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-5">{error}</div>;
  }

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      <div className="flex justify-between items-center mb-5 px-[122px] pb-5 border-b border-[#383840]">
        <h2 className="add-compliance-head">Edit Compliance / Obligation</h2>

        <QmsEditDraftComplianceSuccessModal
          showDraftEditComplianceSuccessModal={showDraftEditComplianceSuccessModal}
          onClose={() => { setShowDraftEditComplianceSuccessModal(false) }}
        />

        <QmsEditDraftComplianceErrorModal
          showDraftEditComplianceErrorModal={showDraftEditComplianceErrorModal}
          onClose={() => { setShowDraftEditComplianceErrorModal(false) }}
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
              value={formData.compliance_name || ""}
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
              value={formData.compliance_no || ""}
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
                value={formData.compliance_type || ""}
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
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  name="day"
                  value={formData.day || ""}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("day")}
                  onBlur={() => handleDropdownBlur("day")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">dd</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={(i + 1).toString()}>
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
                  value={formData.month || ""}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("month")}
                  onBlur={() => handleDropdownBlur("month")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">mm</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={(i + 1).toString()}>
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
                  value={formData.year || ""}
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
              <div className="flex items-center justify-between">
                {(typeof formData.attach_document === 'string' || selectedFile) && (
                  <div
                    onClick={handleViewFile}
                    className="flex items-center gap-[8px] text-[#1E84AF] mt-[10.65px] click-view-file-text !text-[14px] cursor-pointer"
                  >
                    Click to view file
                    <Eye size={17} />
                  </div>
                )}
                {!selectedFile && (
                  <p className="text-right no-file">No file chosen</p>
                )}
              </div>
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
              value={formData.relate_business_process || ""}
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
              value={formData.compliance_remarks || ""}
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
              value={formData.relate_document || ""}
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
              value={formData.rivision || ""}
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
                checked={formData.send_notification || false}
                onChange={handleInputChange}
              />
              <span className="permissions-texts cursor-pointer">
                Send Notification
              </span>
            </label>
          </div>
          <div></div>
          <div className="flex items-end gap-5">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn duration-200 !w-full"
            >
              Cancel
            </button>
            <button type="submit" className="save-btn duration-200 !w-full">
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QmsEditDraftCompliance