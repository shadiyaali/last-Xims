import React, { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import { BASE_URL } from "../../../../Utils/Config";
import axios from 'axios';

const ViewMinutesModal = ({
    isVisible,
    selectedMeeting,
    onClose,
    isExiting,
    isAnimating
}) => {
    const [meetingData, setMeetingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeetingData = async () => {
            if (!selectedMeeting) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${BASE_URL}/qms/meeting-get/${selectedMeeting.id}/`);
                setMeetingData(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching meeting data:', error);
                setError("Failed to load meeting information");
                setIsLoading(false);
            }
        };

        if (selectedMeeting) {
            fetchMeetingData();
        }
    }, [selectedMeeting]);

    if (!isVisible) return null;

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Format time for display
    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        return timeString;
    };

    // Handle file viewing
    const handleViewFile = (fileUrl) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="bg-[#1C1C24] rounded-lg shadow-xl relative w-[1014px] p-6">
                    <div className="flex justify-center items-center h-40">
                        <p className="text-white">Loading meeting information...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Use either the fetched data or the selectedMeeting prop
    const displayData = meetingData || selectedMeeting || {};

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className={`absolute inset-0 bg-black transition-opacity ${isExiting ? 'bg-opacity-0' : 'bg-opacity-50'}`}
                onClick={onClose}
            ></div>
            <div className={`bg-[#1C1C24] rounded-lg shadow-xl relative w-[1014px] p-6 transform transition-all duration-300 ease-in-out ${isAnimating ? 'modal-enter' : ''} ${isExiting ? 'modal-exit' : ''}`}>
                <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                    <h2 className="view-employee-head">Meeting Minutes Information</h2>
                    <button
                        onClick={onClose}
                        className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
                    >
                        <X className="text-white" />
                    </button>
                </div>
                <div className="py-5 relative">
                    {/* Vertical divider line */}
                    <div className="hidden md:block absolute top-[20px] bottom-[20px] left-1/2 border-l border-[#383840]"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Date
                            </label>
                            <div className="view-employee-data">{formatDate(displayData.date)}</div>
                        </div>

                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Meeting Type
                            </label>
                            <div className="view-employee-data">{displayData.meeting_type || "N/A"}</div>
                        </div>

                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Venue
                            </label>
                            <div className="view-employee-data">{displayData.venue || "N/A"}</div>
                        </div>
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Start
                            </label>
                            <div className="view-employee-data">{formatTime(displayData.start_time)}</div>
                        </div>
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                End
                            </label>
                            <div className="view-employee-data">{formatTime(displayData.end_time)}</div>
                        </div>
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Minutes
                            </label>
                            <div className="view-employee-data">{displayData.minutes || "No minutes available"}</div>
                        </div>
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Minutes Attached
                            </label>
                            {displayData.file ? (
                                <button 
                                    onClick={() => handleViewFile(displayData.file)} 
                                    className="flex items-center gap-2 click-view-file-btn !text-[18px] text-[#1E84AF]"
                                >
                                    Click to view file <Eye size={18} />
                                </button>
                            ) : (
                                <div className="view-employee-data">No file attached</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewMinutesModal;