import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../../Utils/Config";
import axios from 'axios';

const QmsViewDraftMeeting = () => {
    const [meeting, setMeeting] = useState({
        title: "",
        date: "",
        meeting_type: "",
        venue: "",
        start_time: "",
        end_time: "",
        attendees: [],
        called_by: null,
        agenda: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();  

    useEffect(() => {
        const fetchMeetingData = async () => {
            try {
                const companyId = getUserCompanyId();
                if (!companyId) {
                    throw new Error("Company ID not found");
                }
                
                const response = await axios.get(`${BASE_URL}/qms/meeting-get/${id}/`);
                setMeeting(response.data);
                console.log("Meeting data:", response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching meeting data:', error);
                setError("Failed to load meeting information");
                setIsLoading(false);
            }
        };

        fetchMeetingData();
    }, [id]);

    const getUserCompanyId = () => {
     
        const storedCompanyId = localStorage.getItem("company_id");
        if (storedCompanyId) return storedCompanyId;

      
        const userRole = localStorage.getItem("role");
        if (userRole === "user") {
       
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

    const handleClose = () => {
        navigate("/company/qms/draft-meeting");
    };

 
    if (isLoading) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
                <p>Loading meeting information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
                <p>{error}</p>
            </div>
        );
    }

    // Format date if it exists
    const formattedDate = meeting.date ? new Date(meeting.date).toLocaleDateString() : "N/A";
    
    // Format times if they exist
    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        try {
            const [hours, minutes] = timeString.split(':');
            return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeString;
        }
    };

    // Get attendee names
    const attendeeNames = meeting.attendees && meeting.attendees.length > 0 
        ? meeting.attendees.map(a => `${a.first_name} ${a.last_name}`).join(", ") 
        : "None";
    
    // Get called by name
    const calledByName = meeting.called_by 
        ? `${meeting.called_by.first_name} ${meeting.called_by.last_name}` 
        : "N/A";

    return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                <h2 className="view-employee-head">Meeting Information</h2>
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
                            Title
                        </label>
                        <div className="view-employee-data">{meeting.title || "N/A"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Date
                        </label>
                        <div className="view-employee-data">{formattedDate}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Select Cause
                        </label>
                        <div className="view-employee-data">
                            {meeting.agenda && meeting.agenda.length > 0 
                                ? meeting.agenda.map(a => a.title).join(", ") 
                                : "N/A"}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Meeting Type
                        </label>
                        <div className="view-employee-data">{meeting.meeting_type || "N/A"}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Start
                        </label>
                        <div className="view-employee-data">{formatTime(meeting.start_time)}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            End
                        </label>
                        <div className="view-employee-data">{formatTime(meeting.end_time)}</div>
                    </div>
                    
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Attendees
                        </label>
                        <div className="view-employee-data">{attendeeNames}</div>
                    </div>
                    
                    <div className="flex justify-between">
                        <div>
                            <label className="block view-employee-label mb-[6px]">
                                Called By
                            </label>
                            <div className="view-employee-data">{calledByName}</div>
                        </div>
                        <div className="flex space-x-10">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default QmsViewDraftMeeting
