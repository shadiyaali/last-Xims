import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const QmsViewInspection = () => {
    const [formData, setFormData] = useState({
        title: "",
        certification_body: "",
        inspector_from: "",
        inspection_type: "",
        area: "",
        procedures: [],
        proposed_date: "",
        date_conducted: "",
        notes: "",
        upload_inspection_report: null,
        upload_non_coformities_report: null,
        inspector_from_internal: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/inspection-get/${id}/`);
                setFormData({
                    ...response.data,
                    procedures: response.data.procedures || [],
                    inspector_from_internal: response.data.inspector_from_internal || []
                });
                setError(null);
            } catch (error) {
                console.error("Failed to fetch inspection data", error);
                setError("Failed to load inspection data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleClose = () => {
        navigate("/company/qms/list-inspection");
    };

    const handleEdit = () => {
        navigate(`/company/qms/edit-inspection/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this inspection?")) {
            try {
                await axios.delete(`${BASE_URL}/qms/inspection-get/${id}/`);
                navigate("/company/qms/list-inspection");
            } catch (error) {
                console.error("Failed to delete inspection", error);
                alert("Failed to delete inspection");
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5">
                Loading inspection data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                <h2 className="view-employee-head">Inspection Information</h2>
                <button
                    onClick={handleClose}
                    className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
                >
                    <X className="text-white" />
                </button>
            </div>

            <div className="p-5 relative">
                <div className="hidden md:block absolute top-[20px] bottom-[20px] left-1/2 border-l border-[#383840]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Inspection Title
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
                            Inspector From
                        </label>
                        <div className="view-employee-data">
                            {formData.inspector_from
                                ? formData.inspector_from
                                : (formData.inspector_from_internal && formData.inspector_from_internal.length > 0
                                    ? formData.inspector_from_internal.map(user => `${user.first_name} ${user.last_name}`).join(", ")
                                    : "Not specified")}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Inspection Type
                        </label>
                        <div className="view-employee-data">{formData.inspection_type || "Not specified"}</div>
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
                        <div className="view-employee-data">
                            {formData.procedures && formData.procedures.length > 0 ? (
                                <ul className="list-disc pl-5">
                                    {formData.procedures.map(procedure => (
                                        <li key={procedure.id}>
                                            {procedure.title}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                "None"
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Proposed Date for Inspection
                        </label>
                        <div className="view-employee-data">{formatDate(formData.proposed_date)}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Date Conducted
                        </label>
                        <div className="view-employee-data">{formatDate(formData.date_conducted)}</div>
                    </div>

                    {formData.upload_inspection_report && (
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Inspection Report
                            </label>
                            <div className="view-employee-data">
                                <a
                                    href={formData.upload_inspection_report}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#1E84AF] hover:underline"
                                >
                                    View Report
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
                                    className="text-[#1E84AF] hover:underline"
                                >
                                    View Report
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="">
                        <label className="block view-employee-label mb-[6px]">
                            Notes
                        </label>
                        <div className="view-employee-data ">
                            {formData.notes || "No notes provided"}
                        </div>
                    </div>

                    <div className="flex space-x-10 justify-end">
                        <div className="flex flex-col justify-center items-center gap-[8px] view-employee-label">
                            Edit
                            <button onClick={handleEdit}>
                                <img
                                    src={edits}
                                    alt="Edit Icon"
                                    className="w-[18px] h-[18px]"
                                />
                            </button>
                        </div>

                        <div className="flex flex-col justify-center items-center gap-[8px] view-employee-label">
                            Delete
                            <button onClick={handleDelete}>
                                <img
                                    src={deletes}
                                    alt="Delete Icon"
                                    className="w-[18px] h-[18px]"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QmsViewInspection;