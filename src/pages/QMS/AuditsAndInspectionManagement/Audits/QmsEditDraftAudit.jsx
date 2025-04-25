import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const QmsEditDraftAudit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);

    const [procedureOptions, setProcedureOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);

    // Search states
    const [procedureSearchTerm, setProcedureSearchTerm] = useState("");
    const [userSearchTerm, setUserSearchTerm] = useState("");

    // Custom field states
    const [showCustomProcedureField, setShowCustomProcedureField] = useState(false);
    const [showCustomUserField, setShowCustomUserField] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        certification_body: '',
        audit_from: '',
        check_auditor: false,
        audit_type: '',
        area: '',
        procedures: [],
        audit_from_internal: [],
        notes: '',
        upload_audit_report: null,
        upload_non_coformities_report: null,
        proposedDate: {
            day: '',
            month: '',
            year: ''
        },
        dateConducted: {
            day: '',
            month: '',
            year: ''
        },
        custom_procedures: '',
        custom_internal_auditors: ''
    });

    const [focusedDropdown, setFocusedDropdown] = useState(null);

    const handleListDraftAudit = () => {
        navigate('/company/qms/draft-audit');
    };

    useEffect(() => {
        // Fetch audit data, procedures, and users on component mount
        fetchAuditData();
        fetchProcedures();
        fetchUsers();
    }, [id]);

    const fetchAuditData = async () => {
        try {
            setFetchLoading(true);
            const response = await axios.get(`${BASE_URL}/qms/audit-get/${id}/`);
            const auditData = response.data;

            // Format dates for form data
            const proposedDate = auditData.proposed_date ? new Date(auditData.proposed_date) : null;
            const dateConducted = auditData.date_conducted ? new Date(auditData.date_conducted) : null;

            // Check if this is an internal or external audit
            const hasInternalAuditors = auditData.audit_from_internal && auditData.audit_from_internal.length > 0;

            setFormData({
                title: auditData.title || '',
                certification_body: auditData.certification_body || '',
                audit_from: auditData.audit_from || '',
                check_auditor: hasInternalAuditors,
                audit_type: auditData.audit_type || '',
                area: auditData.area || '',
                procedures: auditData.procedures?.map(proc => proc.id) || [],
                audit_from_internal: auditData.audit_from_internal?.map(user => user.id) || [],
                notes: auditData.notes || '',
                proposedDate: {
                    day: proposedDate ? String(proposedDate.getDate()).padStart(2, '0') : '',
                    month: proposedDate ? String(proposedDate.getMonth() + 1).padStart(2, '0') : '',
                    year: proposedDate ? String(proposedDate.getFullYear()) : ''
                },
                dateConducted: {
                    day: dateConducted ? String(dateConducted.getDate()).padStart(2, '0') : '',
                    month: dateConducted ? String(dateConducted.getMonth() + 1).padStart(2, '0') : '',
                    year: dateConducted ? String(dateConducted.getFullYear()) : ''
                },
                custom_procedures: auditData.custom_procedures || '',
                custom_internal_auditors: auditData.custom_internal_auditors || ''
            });

            // Set custom field flags if they exist
            setShowCustomProcedureField(!!auditData.custom_procedures);
            setShowCustomUserField(!!auditData.custom_internal_auditors);

            setError(null);
        } catch (error) {
            console.error("Failed to fetch audit data", error);
            setError("Failed to load audit data");
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchProcedures = async () => {
        try {
            const companyId = getUserCompanyId();
            if (!companyId) {
                console.error("Company ID not found");
                return;
            }
            const response = await axios.get(`${BASE_URL}/qms/procedure-publish/${companyId}/`);
            setProcedureOptions(response.data);
        } catch (err) {
            console.error("Error fetching procedures:", err);
            // Fallback procedure options
            setProcedureOptions([
                { id: 1, title: "Null" },
            ]);
        }
    };

    const fetchUsers = async () => {
        try {
            const companyId = getUserCompanyId();
            if (!companyId) {
                console.error("Company ID not found");
                return;
            }
            const response = await axios.get(`${BASE_URL}/company/users/${companyId}/`);
            setUserOptions(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
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

    const handleProcedureCheckboxChange = (procedureId) => {
        setFormData(prevData => {
            const updatedProcedures = [...prevData.procedures];

            // If already selected, remove it
            if (updatedProcedures.includes(procedureId)) {
                return {
                    ...prevData,
                    procedures: updatedProcedures.filter(id => id !== procedureId)
                };
            }
            // Otherwise add it
            else {
                return {
                    ...prevData,
                    procedures: [...updatedProcedures, procedureId]
                };
            }
        });
    };

    const handleUserCheckboxChange = (userId) => {
        setFormData(prevData => {
            const updatedUsers = [...prevData.audit_from_internal];

            // If already selected, remove it
            if (updatedUsers.includes(userId)) {
                return {
                    ...prevData,
                    audit_from_internal: updatedUsers.filter(id => id !== userId)
                };
            }
            // Otherwise add it
            else {
                return {
                    ...prevData,
                    audit_from_internal: [...updatedUsers, userId]
                };
            }
        });
    };

    // Handle procedure N/A option
    const handleProcedureNAChange = (e) => {
        const checked = e.target.checked;
        setShowCustomProcedureField(checked);

        if (checked) {
            // Clear selected procedures if N/A is checked
            setFormData(prev => ({
                ...prev,
                procedures: []
            }));
        } else {
            // Clear custom field if N/A is unchecked
            setFormData(prev => ({
                ...prev,
                custom_procedures: ""
            }));
        }
    };

    // Handle user N/A option
    const handleUserNAChange = (e) => {
        const checked = e.target.checked;
        setShowCustomUserField(checked);

        if (checked) {
            // Clear selected users if N/A is checked
            setFormData(prev => ({
                ...prev,
                audit_from_internal: []
            }));
        } else {
            // Clear custom field if N/A is unchecked
            setFormData(prev => ({
                ...prev,
                custom_internal_auditors: ""
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        // Handle file uploads
        if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0] // Get the first file
            });
            return;
        }

        // Handle checkbox specifically - especially for the auditor toggle
        if (type === 'checkbox') {
            if (name === 'check_auditor') {
                // If changing to internal auditor, clear the external audit_from field
                // If changing to external auditor, clear the internal auditor selections
                setFormData(prev => ({
                    ...prev,
                    [name]: checked,
                    ...(checked ? { audit_from: '' } : { audit_from_internal: [], custom_internal_auditors: '' })
                }));

                // Also reset the custom field display when switching
                if (!checked) {
                    setShowCustomUserField(false);
                }

                return;
            } else {
                setFormData({
                    ...formData,
                    [name]: checked
                });
                return;
            }
        }

        // Handle nested objects
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

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

            // Format dates properly
            const proposedDate = formData.proposedDate.year && formData.proposedDate.month && formData.proposedDate.day
                ? `${formData.proposedDate.year}-${formData.proposedDate.month}-${formData.proposedDate.day}`
                : null;

            const dateConducted = formData.dateConducted.year && formData.dateConducted.month && formData.dateConducted.day
                ? `${formData.dateConducted.year}-${formData.dateConducted.month}-${formData.dateConducted.day}`
                : null;

            const submissionData = new FormData();
            submissionData.append('company', companyId);
            submissionData.append('user', userId);
            submissionData.append('title', formData.title);
            submissionData.append('certification_body', formData.certification_body);
            submissionData.append('audit_type', formData.audit_type);
            submissionData.append('area', formData.area);
            submissionData.append('notes', formData.notes);
            submissionData.append('is_draft', 'false'); // Adding the draft flag

            // Exclusive handling of audit_from vs audit_from_internal
            if (formData.check_auditor) {
                // Using internal auditors
                submissionData.append('audit_from', ''); // Clear external auditor

                // Handle internal auditors
                if (showCustomUserField && formData.custom_internal_auditors) {
                    submissionData.append('custom_internal_auditors', formData.custom_internal_auditors);
                } else if (formData.audit_from_internal && formData.audit_from_internal.length > 0) {
                    formData.audit_from_internal.forEach(userId => {
                        submissionData.append('audit_from_internal', userId);
                    });
                }
            } else {
                // Using external auditor
                submissionData.append('audit_from', formData.audit_from);
                // Don't include audit_from_internal at all to ensure it's cleared
            }

            if (proposedDate) {
                submissionData.append('proposed_date', proposedDate);
            }

            if (dateConducted) {
                submissionData.append('date_conducted', dateConducted);
            }

            // Handle multi-select procedures
            if (showCustomProcedureField && formData.custom_procedures) {
                submissionData.append('custom_procedures', formData.custom_procedures);
            } else if (formData.procedures && formData.procedures.length > 0) {
                formData.procedures.forEach(procedureId => {
                    submissionData.append('procedures', procedureId);
                });
            }

            // If there are files, add them to the form data
            if (formData.upload_audit_report instanceof File) {
                submissionData.append('upload_audit_report', formData.upload_audit_report);
            }

            if (formData.upload_non_coformities_report instanceof File) {
                submissionData.append('upload_non_coformities_report', formData.upload_non_coformities_report);
            }

            const response = await axios.put(`${BASE_URL}/qms/audit-get/${id}/`, submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Draft audit updated successfully:', response.data);
            setTimeout(() => {
                navigate('/company/qms/draft-audit');
            }, 1500);
        } catch (error) {
            console.error('Error updating draft audit:', error);
            setError('Failed to update draft audit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/company/qms/draft-audit');
    };

    // Generate options for dropdowns
    const generateOptions = (start, end, prefix = '') => {
        const options = [];
        for (let i = start; i <= end; i++) {
            const value = i < 10 ? `0${i}` : `${i}`;
            options.push(
                <option key={i} value={value}>
                    {prefix}{value}
                </option>
            );
        }
        return options;
    };

    // Filter procedures based on search term
    const filteredProcedures = procedureOptions.filter(procedure =>
        procedure.title.toLowerCase().includes(procedureSearchTerm.toLowerCase())
    );

    // Filter users based on search term
    const filteredUsers = userOptions.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    // Show loading while fetching data
    if (fetchLoading) {
        return (
            <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center items-center h-64">
                <p>Loading draft audit data...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Edit Draft Audit</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200"
                    onClick={handleListDraftAudit}
                >
                    List Draft Audit
                </button>
            </div>

            {error && (
                <div className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-md mx-[104px] my-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Audit Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Certification Body
                    </label>
                    <input
                        type="text"
                        name="certification_body"
                        value={formData.certification_body}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    {!formData.check_auditor && (
                        <>
                            <label className="add-training-label">
                                Audit From
                            </label>
                            <input
                                type="text"
                                name="audit_from"
                                value={formData.audit_from}
                                onChange={handleChange}
                                className="add-training-inputs focus:outline-none"
                            />
                        </>
                    )}
                    <div className="flex items-end justify-start">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="check_auditor"
                                className="mr-2 form-checkboxes"
                                checked={formData.check_auditor}
                                onChange={handleChange}
                            />
                            <span className="permissions-texts cursor-pointer pr-3">
                                If not external auditor
                            </span>
                        </label>
                    </div>

                    {/* Conditionally render user selection when check_auditor is true */}
                    {formData.check_auditor && (
                        <div className="flex flex-col mt-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="add-training-label">Internal Auditors</h3>
                                 
                            </div>

                            <div className="relative mb-2">
                                {!showCustomUserField && (
                                    <div className="relative mb-2">
                                        <input
                                            type="text"
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                            placeholder="Search auditors..."
                                            className="w-full add-training-inputs pl-8 focus:outline-none"
                                        />
                                        
                                    </div>
                                )}
                            </div>

                            {showCustomUserField ? (
                                <input
                                    type="text"
                                    name="custom_internal_auditors"
                                    value={formData.custom_internal_auditors}
                                    onChange={handleChange}
                                    placeholder="Enter custom auditor names"
                                    className="add-training-inputs focus:outline-none mb-2"
                                />
                            ) : (
                                <div className="border border-[#383840] rounded-md p-2 max-h-[130px] overflow-y-auto">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => (
                                            <div key={user.id} className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    id={`user-${user.id}`}
                                                    className="mr-2 form-checkboxes"
                                                    checked={formData.audit_from_internal.includes(user.id)}
                                                    onChange={() => handleUserCheckboxChange(user.id)}
                                                />
                                                <label
                                                    htmlFor={`user-${user.id}`}
                                                    className="permissions-texts cursor-pointer"
                                                >
                                                    {user.first_name} {user.last_name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 mt-2">No auditors found</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">Audit Type <span className="text-red-500">*</span></label>
                    <select
                        name="audit_type"
                        value={formData.audit_type}
                        onChange={handleChange}
                        onFocus={() => setFocusedDropdown("audit_type")}
                        onBlur={() => setFocusedDropdown(null)}
                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        required
                    >
                        <option value="" disabled>Select</option>
                        <option value="Internal">Internal</option>
                        <option value="External">External</option>
                    </select>
                    <ChevronDown
                        className={`absolute right-3 top-[45%] transform transition-transform duration-300 
                        ${focusedDropdown === "audit_type" ? "rotate-180" : ""}`}
                        size={20}
                        color="#AAAAAA"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Area / Function:
                    </label>
                    <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="add-training-label">
                            Procedures
                        </label>
                        
                    </div>

                    {showCustomProcedureField ? (
                        <input
                            type="text"
                            name="custom_procedures"
                            value={formData.custom_procedures}
                            onChange={handleChange}
                            placeholder="Enter custom procedure names"
                            className="add-training-inputs focus:outline-none mb-2"
                        />
                    ) : (
                        <>
                            <div className="relative mb-2">
                                <input
                                    type="text"
                                    value={procedureSearchTerm}
                                    onChange={(e) => setProcedureSearchTerm(e.target.value)}
                                    placeholder="Search procedures..."
                                    className="w-full add-training-inputs pl-8 focus:outline-none"
                                />
                               
                            </div>

                            <div className="border border-[#383840] rounded-md p-2 max-h-[130px] overflow-y-auto">
                                {filteredProcedures.length > 0 ? (
                                    filteredProcedures.map((option) => (
                                        <div key={option.id} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                id={`procedure-${option.id}`}
                                                className="mr-2 form-checkboxes"
                                                checked={formData.procedures.includes(option.id)}
                                                onChange={() => handleProcedureCheckboxChange(option.id)}
                                            />
                                            <label
                                                htmlFor={`procedure-${option.id}`}
                                                className="permissions-texts cursor-pointer"
                                            >
                                                {option.title}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 mt-2">No procedures found</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Proposed Date for Audit</label>
                    <div className="grid grid-cols-3 gap-5">
                        {/* Day */}
                        <div className="relative">
                            <select
                                name="proposedDate.day"
                                value={formData.proposedDate.day}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("proposedDate.day")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>dd</option>
                                {generateOptions(1, 31)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "proposedDate.day" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Month */}
                        <div className="relative">
                            <select
                                name="proposedDate.month"
                                value={formData.proposedDate.month}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("proposedDate.month")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>mm</option>
                                {generateOptions(1, 12)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "proposedDate.month" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Year */}
                        <div className="relative">
                            <select
                                name="proposedDate.year"
                                value={formData.proposedDate.year}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("proposedDate.year")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>yyyy</option>
                                {generateOptions(2023, 2030)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "proposedDate.year" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date Conducted</label>
                    <div className="grid grid-cols-3 gap-5">
                        {/* Day */}
                        <div className="relative">
                            <select
                                name="dateConducted.day"
                                value={formData.dateConducted.day}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("dateConducted.day")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>dd</option>
                                {generateOptions(1, 31)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "dateConducted.day" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Month */}
                        <div className="relative">
                            <select
                                name="dateConducted.month"
                                value={formData.dateConducted.month}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("dateConducted.month")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>mm</option>
                                {generateOptions(1, 12)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform   transition-transform duration-300
               ${focusedDropdown === "dateConducted.month" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Year */}
                        <div className="relative">
                            <select
                                name="dateConducted.year"
                                value={formData.dateConducted.year}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("dateConducted.year")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>yyyy</option>
                                {generateOptions(2023, 2030)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform   transition-transform duration-300
               ${focusedDropdown === "dateConducted.year" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                    </div>
                </div>


                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                        <label className="add-training-label">
                            Notes
                        </label>
                        <input
                            type="text"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="add-training-inputs"
                            required
                        />
                    </div>
                </div>


                <div className='flex items-end gap-5 w-full'>
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
            </form>
        </div>
    );
};
export default QmsEditDraftAudit