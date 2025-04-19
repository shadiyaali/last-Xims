import React, { useState, useEffect } from "react";
import { ChevronDown, Eye } from "lucide-react";
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import QmsEditDraftLegalSuccessModal from "./Modals/QmsEditDraftLegalSuccessModal";
import QmsEditDraftLegalErrorModal from "./Modals/QmsEditDraftLegalErrorModal";

const QmsDraftEditLegalRequirements = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        legal_name: "",
        legal_no: "",
        document_type: "",
        day: "",
        month: "",
        year: "",
        attach_document: null,
        related_record_format: "",
        rivision: "",
        send_notification: false
    });

    const [showDraftEditLegalSuccessModal, setShowDraftEditLegalSuccessModal] = useState(false);
    const [showDraftEditLegalErrorModal, setShowDraftEditLegalErrorModal] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);

    const [dropdowns, setDropdowns] = useState({
        document_type: false,
        day: false,
        month: false,
        year: false,
    });

    useEffect(() => {
        const fetchLegalData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/legal-get/${id}/`);
                const data = response.data;

                console.log("API Response:", data); // Debug log

                let day = "", month = "", year = "";
                if (data.date) {
                    const dateObj = new Date(data.date);
                    day = dateObj.getDate().toString();
                    month = (dateObj.getMonth() + 1).toString();
                    year = dateObj.getFullYear().toString();
                }

                setFormData({
                    legal_name: data.legal_name || "",
                    legal_no: data.legal_no || "",
                    document_type: data.document_type || "",
                    day,
                    month,
                    year,
                    related_record_format: data.related_record_format || "",
                    rivision: data.rivision || "",
                    send_notification: data.send_notification || false
                });

                if (data.attach_document) {
                    setSelectedFile(data.attach_document.split('/').pop());
                    setFileUrl(data.attach_document);
                }

                setLoading(false);
            } catch (err) {
                setError("Failed to load legal requirement data");
                setLoading(false);
                console.error("Error fetching legal requirement data:", err);
            }
        };

        if (id) {
            fetchLegalData();
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
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData();

        // Format date
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
            const response = await axios.put(`${BASE_URL}/qms/legal/${id}/edit/`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("Legal requirement updated successfully:", response.data);
            setShowDraftEditLegalSuccessModal(true);
            setTimeout(() => {
                setShowDraftEditLegalSuccessModal(false);
                navigate("/company/qms/draft-legal-requirements");
            }, 1500);

        } catch (err) {
            console.error("Error updating legal requirement:", err);
            setError("Failed to update legal requirement");
            setShowDraftEditLegalErrorModal(true);
            setTimeout(() => {
                setShowDraftEditLegalErrorModal(false);
            }, 3000);
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
            setFileUrl(null); // Clear the existing file URL since we're uploading a new file
        } else {
            setSelectedFile(null);
            setFormData({
                ...formData,
                attach_document: null,
            });
        }
    };

    const handleViewFile = () => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    };

    const handleListLegalRequirements = () => {
        navigate('/company/qms/list-legal-requirements');
    };

    const handleCancel = () => {
        navigate('/company/qms/draft-legal-requirements');
    };

    if (loading) return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">
            Loading legal requirement data...
        </div>
    );

    if (error) return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">
            Error: {error}
        </div>
    );

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center mb-5 px-[122px] pb-5 border-b border-[#383840]">
                <h2 className="add-compliance-head">Edit Draft Legal and Other Requirements</h2>

                <QmsEditDraftLegalSuccessModal
                    showDraftEditLegalSuccessModal={showDraftEditLegalSuccessModal}
                    onClose={() => { setShowDraftEditLegalSuccessModal(false) }}
                />

                <QmsEditDraftLegalErrorModal
                    showDraftEditLegalErrorModal={showDraftEditLegalErrorModal}
                    onClose={() => { setShowDraftEditLegalErrorModal(false) }}
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
                    {/* Name/Title */}
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

                    {/* Number */}
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

                            className="w-full add-compliance-inputs"
                        />
                    </div>

                    {/* Type */}
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
                                    value={formData.day}
                                    onChange={handleInputChange}
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
                                    value={formData.month}
                                    onChange={handleInputChange}
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
                                    value={formData.year}
                                    onChange={handleInputChange}
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

                    {/* Relate Record Format */}
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
                            <div className="flex items-center justify-between">
                                {(selectedFile && fileUrl) && (
                                    <button
                                        type="button"
                                        onClick={handleViewFile}
                                        className="flex items-center gap-2 mt-[10.65px] text-[#1E84AF] click-view-file-text !text-[14px]"
                                    >
                                        Click to view file <Eye size={17} />
                                    </button>
                                )}
                                {!selectedFile && (
                                    <p className="text-right no-file">No file chosen</p>
                                )}
                            </div>
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

                    <div></div>

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

export default QmsDraftEditLegalRequirements;