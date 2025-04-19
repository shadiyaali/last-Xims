import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import QmsAddLegalSuccessModal from "./Modals/QmsAddLegalSuccessModal";
import QmsAddLegalErrorModal from "./Modals/QmsAddLegalErrorModal";
import QmsSaveDraftLegalSuccessModal from "./Modals/QmsSaveDraftLegalSuccessModal";
import QmsSaveDraftLegalErrorModal from "./Modals/QmsSaveDraftLegalErrorModal";

const QmsAddLegalRequirements = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        legal_name: "",
        legal_no: "",
        document_type: "",
        date: "",
        attach_document: null,
        related_record_format: "",
        rivision: "",
        send_notification: false,
        is_draft: false
    });

    const [showAddLegalSuccessModal, setShowAddLegalSuccessModal] = useState(false);
    const [showAddLegalErrorModal, setShowAddLegalErrorModal] = useState(false);

    const [showDraftLegalSuccessModal, setShowDraftLegalSuccessModal] = useState(false);
    const [showDraftLegalErrorModal, setShowDraftLegalErrorModal] = useState(false);

    // State to handle file selection UI
    const [selectedFile, setSelectedFile] = useState(null);

    // Get user info from localStorage
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
    // State for dropdown UI controls
    const [dropdowns, setDropdowns] = useState({
        document_type: false,
        day: false,
        month: false,
        year: false,
    });

    // Date handling
    const [dateComponents, setDateComponents] = useState({
        day: "",
        month: "",
        year: ""
    });

    const handleDropdownFocus = (key) => {
        setDropdowns((prev) => ({ ...prev, [key]: true }));
    };

    const handleDropdownBlur = (key) => {
        setDropdowns((prev) => ({ ...prev, [key]: false }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle checkbox inputs differently
        const inputValue = type === 'checkbox' ? checked : value;

        setFormData({
            ...formData,
            [name]: inputValue,
        });
    };

    // Update date when day, month, or year changes
    const handleDateChange = (e) => {
        const { name, value } = e.target;

        const updatedDateComponents = {
            ...dateComponents,
            [name]: value
        };

        setDateComponents(updatedDateComponents);

        // Only set the date if all components are selected
        if (updatedDateComponents.day && updatedDateComponents.month && updatedDateComponents.year) {
            // Format date as YYYY-MM-DD for backend
            const formattedDate = `${updatedDateComponents.year}-${String(updatedDateComponents.month).padStart(2, '0')}-${String(updatedDateComponents.day).padStart(2, '0')}`;

            setFormData({
                ...formData,
                date: formattedDate
            });
        }
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

        try {
            const userId = getRelevantUserId();
            const companyId = getUserCompanyId();
            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);
                return;
            }
            const formDataToSend = new FormData();
            formDataToSend.append('company', companyId);
            formDataToSend.append('user', userId);

            // Add all form fields to FormData
            Object.keys(formData).forEach(key => {
                if (key === 'attach_document' && formData[key]) {
                    formDataToSend.append(key, formData[key]);
                } else if (key !== 'attach_document' && formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Send the request
            const response = await axios.post(
                `${BASE_URL}/qms/legal/create/`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log("Legal requirement added successfully:", response.data);
            setShowAddLegalSuccessModal(true);
            setTimeout(() => {
                setShowAddLegalSuccessModal(false);
                navigate('/company/qms/list-legal-requirements');
            }, 1500);

        } catch (error) {
            console.error("Error adding legal requirement:", error);
            setShowAddLegalErrorModal(true);
            setTimeout(() => {
                setShowAddLegalErrorModal(false);
            }, 3000);
        }
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
    const handleSaveAsDraft = async () => {
        try {
            setLoading(true);

            const companyId = getUserCompanyId();
            const userId = getRelevantUserId();

            if (!companyId || !userId) {
                setError('Company ID or User ID not found. Please log in again.');
                setLoading(false);
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
                `${BASE_URL}/qms/legal/draft-create/`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',

                    },
                }
            );

            setLoading(false);
            setShowDraftLegalSuccessModal(true);
            setTimeout(() => {
                setShowDraftLegalSuccessModal(false);
                navigate('/company/qms/draft-legal-requirements');
            }, 1500);


        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.detail || 'Failed to save Draft';
            setError(errorMessage);
            setShowDraftLegalErrorModal(true);
            setTimeout(() => {
                setShowDraftLegalErrorModal(false);
            }, 3000);
            console.error('Error saving Draft:', err.response?.data || err);
        }
    };

    const handleListLegalRequirements = () => {
        navigate('/company/qms/list-legal-requirements');
    };

    const handleCancel = () => {
        navigate('/company/qms/list-legal-requirements');
    };

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center mb-5 px-[122px] pb-5 border-b border-[#383840]">
                <h2 className="add-compliance-head">Add Legal and Other Requirements</h2>

                <QmsAddLegalSuccessModal
                    showAddLegalSuccessModal={showAddLegalSuccessModal}
                    onClose={() => { setShowAddLegalSuccessModal(false) }}
                />

                <QmsAddLegalErrorModal
                    showAddLegalErrorModal={showAddLegalErrorModal}
                    onClose={() => { setShowAddLegalErrorModal(false) }}
                />

                <QmsSaveDraftLegalSuccessModal
                    showDraftLegalSuccessModal={showDraftLegalSuccessModal}
                    onClose={() => { setShowDraftLegalSuccessModal(false) }}
                />

                <QmsSaveDraftLegalErrorModal
                    showDraftLegalErrorModal={showDraftLegalErrorModal}
                    onClose={() => { setShowDraftLegalErrorModal(false) }}
                />


                <button
                    className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                    onClick={handleListLegalRequirements}
                >
                    <span>List Legal and Other Requirements</span>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="px-[122px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Legal Name / Title */}
                    <div>
                        <label className="add-compliance-label">
                            Legal / Law Name / Title
                        </label>
                        <input
                            type="text"
                            name="legal_name"
                            value={formData.legal_name}
                            onChange={handleInputChange}
                            className="w-full add-compliance-inputs"
                        />
                    </div>

                    {/* Legal Number */}
                    <div>
                        <label className="add-compliance-label">
                            Legal / Law Number{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="legal_no"
                            value={formData.legal_no}
                            onChange={handleInputChange}
                            required
                            className="w-full add-compliance-inputs"
                        />
                    </div>

                    {/* Document Type */}
                    <div>
                        <label className="add-compliance-label">
                            Document Type
                        </label>
                        <div className="relative">
                            <select
                                name="document_type"
                                value={formData.document_type}
                                onChange={handleInputChange}
                                onFocus={() => handleDropdownFocus("document_type")}
                                onBlur={() => handleDropdownBlur("document_type")}
                                className="appearance-none w-full add-compliance-inputs cursor-pointer"
                            >
                                <option value="">Select Document Type</option>
                                <option value="System">System</option>
                                <option value="Paper">Paper</option>
                                <option value="External">External</option>
                                <option value="Work Instruction">Work Instruction</option>
                            </select>
                            <div
                                className={`pointer-events-none absolute inset-y-0 right-0 top-[12px] flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${dropdowns.document_type ? "rotate-180" : ""
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
                                    value={dateComponents.day}
                                    onChange={handleDateChange}
                                    onFocus={() => handleDropdownFocus("day")}
                                    onBlur={() => handleDropdownBlur("day")}
                                    className="appearance-none w-full add-compliance-inputs cursor-pointer"
                                >
                                    <option value="">dd</option>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
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
                                    value={dateComponents.month}
                                    onChange={handleDateChange}
                                    onFocus={() => handleDropdownFocus("month")}
                                    onBlur={() => handleDropdownBlur("month")}
                                    className="appearance-none w-full add-compliance-inputs cursor-pointer"
                                >
                                    <option value="">mm</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
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
                                    value={dateComponents.year}
                                    onChange={handleDateChange}
                                    onFocus={() => handleDropdownFocus("year")}
                                    onBlur={() => handleDropdownBlur("year")}
                                    className="appearance-none w-full add-compliance-inputs cursor-pointer"
                                >
                                    <option value="">yyyy</option>
                                    {[...Array(10)].map((_, i) => (
                                        <option key={2020 + i} value={2020 + i}>
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
                                id="document"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                className="w-full add-qmsmanual-attach"
                                onClick={() => document.getElementById("document").click()}
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

                    {/* Related Record Format */}
                    <div>
                        <label className="add-compliance-label">
                            Related Record Format
                        </label>
                        <input
                            type="text"
                            name="related_record_format"
                            value={formData.related_record_format}
                            onChange={handleInputChange}
                            className="w-full add-compliance-inputs"
                        />
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

                    {/* Send Notification */}
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

                    {/* Save as Draft */}
                    <div>
                        <button
                            type="button"
                            onClick={handleSaveAsDraft}
                            className="request-correction-btn duration-200"
                        >
                            Save as Draft
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-end gap-5">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn duration-200 !w-full"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn duration-200 !w-full"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QmsAddLegalRequirements;