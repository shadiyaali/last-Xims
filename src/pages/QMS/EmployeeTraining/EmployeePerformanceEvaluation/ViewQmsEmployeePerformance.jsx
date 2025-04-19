import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from '../../../../assets/images/Company Documentation/delete.svg';
import "./viewqmsemployeeperformance.css";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const ViewQmsEmployeePerformance = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/performance-get/${id}/`);
                setPerformanceData(response.data);
                setError(null);
            } catch (err) {
                setError("Failed to load employee performance data");
                console.error("Error fetching employee performance data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPerformanceData();
        }
    }, [id]);

    const handleClose = () => {
        navigate('/company/qms/employee-performance');
    };

    const handleEdit = () => {
        navigate(`/company/qms/edit-employee-performance/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this performance evaluation?")) {
            try {
                await axios.delete(`${BASE_URL}/qms/performance/${id}/update/`);
                alert("Performance evaluation deleted successfully");
                navigate('/company/qms/employee-performance');
            } catch (err) {
                console.error("Error deleting performance evaluation:", err);
                alert("Failed to delete performance evaluation");
            }
        }
    };

    // Format date from YYYY-MM-DD to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    if (loading) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    if (!performanceData) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
                <p className="text-xl">No data found</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                <h2 className="view-employee-head">Employee Performance Evaluation Information</h2>
                <button onClick={handleClose} className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md">
                    <X className='text-white' />
                </button>
            </div>

            <div className="p-5 relative">
                {/* Vertical divider line */}
                <div className="hidden md:block absolute top-[20px] bottom-[20px] left-1/2 border-l border-[#383840]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                    <div>
                        <label className="block view-employee-label mb-[6px]">Evaluation Title</label>
                        <div className="view-employee-data">
                            {performanceData.evaluation_title || 'Anonymous'}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">Evaluation Description</label>
                        <div className="view-employee-data">
                            {performanceData.description || 'No description provided'}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">Valid Till</label>
                        <div className="view-employee-data">
                            {formatDate(performanceData.valid_till)}
                        </div>
                    </div>

                    {performanceData.is_draft && (
                        <div>
                            <label className="block view-employee-label mb-[6px]">Status</label>
                            <div className="view-employee-data bg-yellow-800 inline-block px-2 py-1 rounded">
                                Draft
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end items-end space-x-10 md:col-start-2">
                        <div className='flex flex-col justify-center items-center gap-[8px] view-employee-label'>
                            Edit
                            <button onClick={handleEdit}>
                                <img src={edits} alt="Edit Icon" className='w-[18px] h-[18px]' />
                            </button>
                        </div>

                        <div className='flex flex-col justify-center items-center gap-[8px] view-employee-label'>
                            Delete
                            <button onClick={handleDelete}>
                                <img src={deletes} alt="Delete Icon" className='w-[18px] h-[18px]' />
                            </button>
                        </div>
                    </div>
                </div>
            </div>       
        </div>
    );
};

export default ViewQmsEmployeePerformance;