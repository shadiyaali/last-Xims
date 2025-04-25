import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const QmsViewDraftAudit = () => {
    const [formData, setFormData] = useState({
        title: "",
        certification_body: "",
        audit_from: "",
        audit_from_internal: [],
        audit_type: "",
        area: "",
        procedures: [],
        proposed_date: "",
        date_conducted: "",
        notes: "",
        custom_procedures: "",
        custom_internal_auditors: "",
        upload_audit_report: null,
        upload_non_coformities_report: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/audit-get/${id}/`);
                setFormData({
                    title: response.data.title || "",
                    certification_body: response.data.certification_body || "",
                    audit_from: response.data.audit_from || "",
                    audit_from_internal: response.data.audit_from_internal || [],
                    audit_type: response.data.audit_type || "",
                    area: response.data.area || "",
                    procedures: response.data.procedures || [],
                    proposed_date: response.data.proposed_date || "",
                    date_conducted: response.data.date_conducted || "",
                    notes: response.data.notes || "",
                    custom_procedures: response.data.custom_procedures || "",
                    custom_internal_auditors: response.data.custom_internal_auditors || "",
                    upload_audit_report: response.data.upload_audit_report || null,
                    upload_non_coformities_report: response.data.upload_non_coformities_report || null
                });
                setError(null);
            } catch (error) {
                console.error("Failed to fetch audit data", error);
                setError("Failed to load audit data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleClose = () => {
        navigate("/company/qms/draft-audit");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Format procedures list for display
    const formatProcedures = () => {
        if (formData.custom_procedures) {
            return formData.custom_procedures;
        }
        
        if (formData.procedures && formData.procedures.length > 0) {
            return formData.procedures.map(proc => proc.title).join(", ");
        }
        
        return "None specified";
    };

    // Format auditors for display
    const formatAuditors = () => {
        // If using internal auditors
        if (formData.audit_from_internal && formData.audit_from_internal.length > 0) {
            return formData.audit_from_internal.map(user => 
                `${user.first_name} ${user.last_name}`
            ).join(", ");
        } 
        
        // If custom internal auditors are specified
        if (formData.custom_internal_auditors) {
            return formData.custom_internal_auditors;
        }
        
        // Otherwise show external auditor
        return formData.audit_from || "None specified";
    };

    if (loading) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
                <p>Loading audit data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5">
                <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                    <h2 className="view-employee-head">Error</h2>
                    <button
                        onClick={handleClose}
                        className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
                    >
                        <X className="text-white" />
                    </button>
                </div>
                <div className="p-5">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                <h2 className="view-employee-head">Audit Information</h2>
                <button
                    onClick={handleClose}
                    className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
                >
                    <X className="text-white" />
                </button>
            </div>

            <div className="p-5 relative">
                {/* Vertical divider line */}
                <div className="hidden md:block absolute top-[20px] bottom-[20px] left-1/2 border-l border-[#383840]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Audit Title
                        </label>
                        <div className="view-employee-data">{formData.title || "Not specified"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Certification Body
                        </label>
                        <div className="view-employee-data">{formData.certification_body || "Not specified"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Auditor(s)
                        </label>
                        <div className="view-employee-data">{formatAuditors()}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Audit Type
                        </label>
                        <div className="view-employee-data">{formData.audit_type || "Not specified"}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Area / Function
                        </label>
                        <div className="view-employee-data">{formData.area || "Not specified"}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Procedures
                        </label>
                        <div className="view-employee-data">{formatProcedures()}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Proposed Date for Audit
                        </label>
                        <div className="view-employee-data">{formatDate(formData.proposed_date)}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Date Conducted
                        </label>
                        <div className="view-employee-data">{formatDate(formData.date_conducted)}</div>
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block view-employee-label mb-[6px]">
                            Notes
                        </label>
                        <div className="view-employee-data">{formData.notes || "No notes provided"}</div>
                    </div>

                    {/* Display file links if they exist */}
                    {formData.upload_audit_report && (
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Audit Report
                            </label>
                            <div className="view-employee-data">
                                <a 
                                    href={formData.upload_audit_report} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    View Audit Report
                                </a>
                            </div>
                        </div>
                    )}

                    {formData.upload_non_coformities_report && (
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Non-Conformities Report
                            </label>
                            <div className="view-employee-data">
                                <a 
                                    href={formData.upload_non_coformities_report} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    View Non-Conformities Report
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QmsViewDraftAudit;