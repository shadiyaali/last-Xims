import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const QmsDraftViewLegalRequirements = () => {
    const [legalRequirement, setLegalRequirement] = useState({
        legal_name: '',
        legal_no: '',
        document_type: '',
        date: '',
        attach_document: '',
        related_record_format: '',
        rivision: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams(); // Get legal requirement ID from URL

    // Format date from API (YYYY-MM-DD) to display format (DD-MM-YYYY)
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-');
        } catch (error) {
            console.error("Date formatting error:", error);
            return dateString;
        }
    };

    useEffect(() => {
        // Fetch legal requirement data when component mounts
        const fetchLegalRequirementData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/legal-get/${id}/`);
                
                console.log("API Response:", response.data); // Debug log
                
                // Map API response to component state
                const data = response.data;
                setLegalRequirement({
                    legal_name: data.legal_name || 'N/A',
                    legal_no: data.legal_no || 'N/A',
                    document_type: data.document_type || 'N/A',
                    date: data.date ? formatDate(data.date) : 'N/A',
                    attach_document: data.attach_document || '',
                    related_record_format: data.related_record_format || 'N/A',
                    rivision: data.rivision || 'N/A'
                });
                setLoading(false);
            } catch (err) {
                setError("Failed to load legal requirement data");
                setLoading(false);
                console.error("Error fetching legal requirement data:", err);
            }
        };

        if (id) {
            fetchLegalRequirementData();
        }
    }, [id]);

    const handleClose = () => {
        navigate('/company/qms/draft-legal-requirements');
    };

    const handleViewDocument = () => {
        if (legalRequirement.attach_document) {
            window.open(legalRequirement.attach_document, '_blank');
        }
    };

    if (loading) return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
            Loading legal requirement data...
        </div>
    );

    if (error) return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
            Error: {error}
        </div>
    );

    return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                <h2 className="view-employee-head">Legal and Other Requirements Information</h2>
                <button onClick={handleClose} className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md">
                    <X className='text-white' />
                </button>
            </div>

            <div className="p-5 relative">
                {/* Vertical divider line */}
                <div className="hidden md:block absolute top-[20px] bottom-[20px] left-1/2 border-l border-[#383840]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                    <div>
                        <label className="block view-employee-label mb-[6px]">Legal / Law Name / Title</label>
                        <div className="view-employee-data">{legalRequirement.legal_name}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">Legal / Law Number</label>
                        <div className="view-employee-data">{legalRequirement.legal_no}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">Document Type</label>
                        <div className="view-employee-data">{legalRequirement.document_type}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">Date</label>
                        <div className="view-employee-data">{legalRequirement.date}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">Attach Document</label>
                        {legalRequirement.attach_document ? (
                            <button 
                                onClick={handleViewDocument} 
                                className="flex items-center gap-2 view-employee-data !text-[#1E84AF]"
                            >
                                Click to view file
                                <Eye size={17} />
                            </button>
                        ) : (
                            <div className="view-employee-data">No document attached</div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">Related Record Format</label>
                        <div className="view-employee-data">{legalRequirement.related_record_format}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">Revision</label>
                        <div className="view-employee-data">{legalRequirement.rivision}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QmsDraftViewLegalRequirements;