import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const ViewInspectionReportModal = ({
    isVisible,
    onClose,
    selectedInspection,
    isExiting,
    isAnimating
}) => {
    const [reportData, setReportData] = useState({
        inspection_report: null,
        non_conformities_report: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isVisible && selectedInspection && selectedInspection.id) {
            fetchInspectionReports();
        }
    }, [isVisible, selectedInspection]);

    const fetchInspectionReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/qms/inspection/${selectedInspection.id}/report/`);
            setReportData({
                inspection_report: response.data.data.upload_inspection_report,
                non_conformities_report: response.data.data.upload_non_coformities_report
            });
            setError(null);
        } catch (err) {
            console.error("Error fetching inspection reports:", err);
            setError("Failed to load inspection reports");
        } finally {
            setLoading(false);
        }
    };

    const handleViewFile = (fileUrl) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className={`absolute inset-0 bg-black transition-opacity ${isExiting ? 'bg-opacity-0' : 'bg-opacity-50'}`}
                onClick={onClose}
            ></div>
            <div className={`bg-[#1C1C24] rounded-lg shadow-xl relative w-[1014px] p-6 transform transition-all duration-300 ease-in-out ${isAnimating ? 'modal-enter' : ''} ${isExiting ? 'modal-exit' : ''}`}>
                <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                    <h2 className="view-employee-head">Inspection Report Information</h2>
                    <button
                        onClick={onClose}
                        className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
                    >
                        <X className="text-white" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <p className="text-white">Loading inspection reports...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-12">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-2">
                            <div className='border-r border-[#383840] mt-5'>
                                <label className="block view-employee-label mb-[6px]">
                                    Inspection Report
                                </label>
                                {reportData.inspection_report ? (
                                    <button 
                                        className="flex items-center gap-2 !text-[18px] text-[#1E84AF] click-view-file-btn"
                                        onClick={() => handleViewFile(reportData.inspection_report)}
                                    >
                                        Click to view file <Eye size={18} />
                                    </button>
                                ) : (
                                    <p className="text-gray-400">No inspection report available</p>
                                )}
                            </div>

                            <div className='mt-5 ml-5'>
                                <label className="block view-employee-label mb-[6px]">
                                    Non Conformities Report
                                </label>
                                {reportData.non_conformities_report ? (
                                    <button 
                                        className="flex items-center gap-2 !text-[18px] text-[#1E84AF] click-view-file-btn"
                                        onClick={() => handleViewFile(reportData.non_conformities_report)}
                                    >
                                        Click to view file <Eye size={18} />
                                    </button>
                                ) : (
                                    <p className="text-gray-400">No non-conformities report available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewInspectionReportModal;