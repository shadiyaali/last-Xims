import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";

const QmsViewInternalProblems = () => {
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

   
    useEffect(() => {
        const fetchProblemData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/qms/internal-problems/${id}/`);
                setProblem(response.data);
                setLoading(false);
                console.log("sssssssss",response.data)
            } catch (err) {
                console.error("Error fetching internal problem:", err);
                setError("Failed to load internal problem data. Please try again.");
                setLoading(false);
            }
        };

        if (id) {
            fetchProblemData();
        }
    }, [id]);

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleClose = () => {
        navigate("/company/qms/list-internal-problem");
    };

    const handleEdit = () => {
        navigate(`/company/qms/edit-internal-problem/${id}`);
    };

    const openDeleteModal = () => {
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${BASE_URL}/qms/internal-problems/${id}/`);
            navigate("/company/qms/list-internal-problem");
        } catch (err) {
            console.error("Error deleting internal problem:", err);
            setError("Failed to delete internal problem. Please try again.");
        } finally {
            setDeleteModalOpen(false);
        }
    };

    // Delete confirmation modal component
    const DeleteConfirmationModal = () => {
        if (!deleteModalOpen) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#1C1C24] p-6 rounded-lg max-w-md w-full">
                    <div className="flex items-center mb-4 text-red-500">
                        <AlertCircle className="mr-2" />
                        <h2 className="text-lg font-medium">Confirm Deletion</h2>
                    </div>
                    <p className="mb-6">Are you sure you want to delete this internal problem? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4">
                        <button 
                            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 transition"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5 min-h-[300px] flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

 

    

    return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5">
            {/* Delete confirmation modal */}
            <DeleteConfirmationModal />

            <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                <h2 className="view-employee-head">Internal Problems and Observations Information</h2>
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
                            Select Causes / Root Cause
                        </label>
                        <div className="view-employee-data">
                            {problem.cause ? problem.cause.title : 'N/A'}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Problem/ Observation Description
                        </label>
                        <div className="view-employee-data">
                            {problem.problem || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Immediate Action Taken
                        </label>
                        <div className="view-employee-data">
                            {problem.immediate_action || 'N/A'}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Executor
                        </label>
                        <div className="view-employee-data">
                            {problem.executor ? `${problem.executor.first_name} ${problem.executor.last_name}` : 'N/A'}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Solved After Action?
                        </label>
                        <div className="view-employee-data">
                            {problem.solve_after_action || 'N/A'}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Date Problem
                        </label>
                        <div className="view-employee-data">
                            {formatDate(problem.date)}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Corrective Action Needed?
                        </label>
                        <div className="view-employee-data">
                            {problem.corrective_action || 'N/A'}
                        </div>
                    </div>

                    {problem.car_no && (
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                CAR Number
                            </label>
                            <div className="view-employee-data">
                                {problem.car_no.action_no || 'N/A'}
                            </div>
                        </div>
                    )}

                    {problem.correction && (
                        <div className="md:col-span-2">
                            <label className="block view-employee-label mb-[6px]">
                                Correction
                            </label>
                            <div className="view-employee-data">
                                {problem.correction}
                            </div>
                        </div>
                    )}
                    
                    <div className="md:col-span-2 flex justify-end">
                        <div className="flex space-x-10">
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
                                <button onClick={openDeleteModal}>
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
        </div>
    );
};

export default QmsViewInternalProblems;