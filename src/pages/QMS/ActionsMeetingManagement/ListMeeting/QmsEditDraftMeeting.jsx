import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
 
import CausesModal from '../CausesModal';
import { BASE_URL } from "../../../../Utils/Config";
import axios from 'axios';

const QmsEditDraftMeeting = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [agendaItems, setAgendaItems] = useState([]);
    const [selectedAgendas, setSelectedAgendas] = useState([]);
    const [agendaSearchTerm, setAgendaSearchTerm] = useState('');
    const [filteredAgendaItems, setFilteredAgendaItems] = useState([]);
    const [attendeeSearchTerm, setAttendeeSearchTerm] = useState('');
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        dateConducted: {
            day: '',
            month: '',
            year: ''
        },
        agendas: [],
        meeting_type: 'Normal',
        venue: '',
        startTime: {
            hour: '',
            min: ''
        },
        endTime: {
            hour: '',
            min: ''
        },
        attendees: [],
        called_by: '',
        send_notification: false,
        is_draft: false
    });
    const [loading, setLoading] = useState(true);

    // Filter attendees based on search term
    useEffect(() => {
        if (users.length > 0) {
            const filtered = users.filter(user =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(attendeeSearchTerm.toLowerCase())
            );
            setFilteredAttendees(filtered);
        }
    }, [attendeeSearchTerm, users]);

    // Filter agenda items based on search term
    useEffect(() => {
        if (agendaItems.length > 0) {
            const filtered = agendaItems.filter(agenda =>
                agenda.title.toLowerCase().includes(agendaSearchTerm.toLowerCase())
            );
            setFilteredAgendaItems(filtered);
        }
    }, [agendaSearchTerm, agendaItems]);

    // Fetch meeting data, users, and agenda items
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const companyId = getUserCompanyId();
                
                // Fetch meeting details
                const meetingResponse = await axios.get(`${BASE_URL}/qms/meeting-get/${id}/`);
                const meetingData = meetingResponse.data;
                
                // Extract just the IDs for agendas and attendees
                const agendaIds = meetingData.agenda?.map(item => item.id) || [];
                const attendeeIds = meetingData.attendees?.map(item => item.id) || [];
                
                // Safely parse date and time with null checks
                const dateParts = meetingData.date ? meetingData.date.split('-') : ['', '', ''];
                const startTimeParts = meetingData.start_time ? meetingData.start_time.split(':') : ['', ''];
                const endTimeParts = meetingData.end_time ? meetingData.end_time.split(':') : ['', ''];
                
                // Format data for the form
                setFormData({
                    title: meetingData.title || '',
                    dateConducted: {
                        year: dateParts[0] || '',
                        month: dateParts[1] || '',
                        day: dateParts[2] || ''
                    },
                    agendas: agendaIds,
                    meeting_type: meetingData.meeting_type || 'Normal',
                    venue: meetingData.venue || '',
                    startTime: {
                        hour: startTimeParts[0] || '',
                        min: startTimeParts[1] || ''
                    },
                    endTime: {
                        hour: endTimeParts[0] || '',
                        min: endTimeParts[1] || ''
                    },
                    attendees: attendeeIds,
                    called_by: meetingData.called_by?.id || '',
                    send_notification: meetingData.send_notification || false,
                    is_draft: meetingData.is_draft || false
                });
                
                // Set selected agendas as IDs
                setSelectedAgendas(agendaIds);
                
                // Fetch users and agenda items
                const usersResponse = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);
                const agendasResponse = await axios.get(`${BASE_URL}/qms/agenda/company/${companyId}/`);
                
                setUsers(usersResponse.data);
                setAgendaItems(agendasResponse.data);
                
                setFilteredAttendees(usersResponse.data);
                setFilteredAgendaItems(agendasResponse.data);
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Helper functions for getting user/company IDs
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

    // UI state management
    const [focusedDropdown, setFocusedDropdown] = useState(null);
    
    // Event handlers
    const handleQmsListMeeting = () => {
        navigate('/company/qms/list-meeting');
    };

    const handleAttendeeChange = (userId) => {
        const updatedAttendees = [...formData.attendees];
        const index = updatedAttendees.indexOf(userId);

        if (index > -1) {
            updatedAttendees.splice(index, 1);
        } else {
            updatedAttendees.push(userId);
        }

        setFormData(prev => ({
            ...prev,
            attendees: updatedAttendees
        }));
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddAgenda = (selectedAgendas) => {
        setSelectedAgendas(selectedAgendas);
        setFormData({
            ...formData,
            agendas: selectedAgendas
        });
    };

    const handleAgendaChange = (agendaId) => {
        const updatedSelectedAgendas = [...selectedAgendas];
        const index = updatedSelectedAgendas.indexOf(agendaId);

        if (index > -1) {
            updatedSelectedAgendas.splice(index, 1);
        } else {
            updatedSelectedAgendas.push(agendaId);
        }

        setSelectedAgendas(updatedSelectedAgendas);
        setFormData(prev => ({
            ...prev,
            agendas: updatedSelectedAgendas
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (e.target.type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: e.target.checked
            });
            return;
        }

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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Format the data for API submission
        const formattedData = {
            title: formData.title,
            date: `${formData.dateConducted.year}-${formData.dateConducted.month}-${formData.dateConducted.day}`,
            start_time: `${formData.startTime.hour}:${formData.startTime.min}:00`,
            end_time: `${formData.endTime.hour}:${formData.endTime.min}:00`,
            meeting_type: formData.meeting_type,
            venue: formData.venue,
            attendees: formData.attendees,
            called_by: formData.called_by,
            agenda: formData.agendas,
            send_notification: formData.send_notification,
            is_draft: false,
            company: getUserCompanyId(),
            user: getRelevantUserId()
        };

        // Submit the updated meeting data
        updateMeeting(formattedData);
    };

    
    const updateMeeting = async (data) => {
        try {
            await axios.put(`${BASE_URL}/qms/meeting/${id}/edit/`, data);
            navigate('/company/qms/list-meeting');
        } catch (error) {
            console.error('Error updating meeting:', error);
        }
    };

    const handleCancel = () => {
        navigate('/company/qms/list-meeting');
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

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <p className="text-white">Loading meeting data...</p>
        </div>;
    }

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {/* Modal component */}
            <CausesModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddCause={handleAddAgenda}
                agendaItems={agendaItems}
                selectedAgendas={selectedAgendas}
            />

            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Edit Draft Meeting</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200"
                    onClick={() => handleQmsListMeeting()}
                >
                    List Meeting
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">
                {/* Meeting Title */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Title <span className="text-red-500">*</span>
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

                {/* Date */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date</label>
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
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
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
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "dateConducted.year" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                {/* Meeting Agenda */}
                <div className="flex flex-col gap-3 relative">
                    <div className="flex items-center justify-between">
                        <label className="add-training-label">Meeting Agenda</label>
                    </div>
                    <div className="relative">
                        <div className="flex items-center mb-2 border border-[#383840] rounded-md">
                            <input
                                type="text"
                                placeholder="Search agendas..."
                                value={agendaSearchTerm}
                                onChange={(e) => setAgendaSearchTerm(e.target.value)}
                                className="add-training-inputs !pr-10"
                            />
                            <Search
                                className="absolute right-3"
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>

                    {/* Agenda Checkboxes */}
                    <div className="border border-[#383840] rounded-md p-2 max-h-[130px] overflow-y-auto">
                    {filteredAgendaItems.length > 0 ? (
    filteredAgendaItems.map(agenda => (
        <div key={agenda.id} className="flex items-center py-2 last:border-0">
            <input
                type="checkbox"
                id={`agenda-${agenda.id}`}
                checked={selectedAgendas.includes(agenda.id)}
                onChange={() => handleAgendaChange(agenda.id)}
                className="mr-2 form-checkboxes"
            />
            <label
                htmlFor={`agenda-${agenda.id}`}
                className="text-sm text-[#AAAAAA] cursor-pointer"
            >
                {agenda.title}
            </label>
        </div>
    ))
) : (
    <div className="text-sm text-[#AAAAAA] p-2">No agendas found</div>
)}
                    </div>
                    <button
                        type="button"
                        className='flex justify-start add-training-label !text-[#1E84AF] hover:text-[#29a6db] transition-colors'
                        onClick={handleOpenModal}
                    >
                        View / Add Agenda
                    </button>
                </div>

                {/* Meeting Type */}
                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">Meeting Type <span className="text-red-500">*</span></label>
                    <select
                        name="meeting_type"
                        value={formData.meeting_type}
                        onChange={handleChange}
                        onFocus={() => setFocusedDropdown("meeting_type")}
                        onBlur={() => setFocusedDropdown(null)}
                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        required
                    >
                        <option value="" disabled>Select</option>
                        <option value="Normal">Normal</option>
                        <option value="Specific">Specific</option>
                    </select>
                    <ChevronDown
                        className={`absolute right-3 top-[19%] transform transition-transform duration-300 
                        ${focusedDropdown === "meeting_type" ? "rotate-180" : ""}`}
                        size={20}
                        color="#AAAAAA"
                    />
                </div>

                <div></div>

                {/* Venue */}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                        <label className="add-training-label">
                            Venue
                        </label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className="add-training-inputs"
                        />
                    </div>
                </div>

                {/* Start Time */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Start</label>
                    <div className="grid grid-cols-2 gap-5">
                        {/* Hour */}
                        <div className="relative">
                            <select
                                name="startTime.hour"
                                value={formData.startTime.hour}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("startTime.hour")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Hour</option>
                                {generateOptions(0, 23)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "startTime.hour" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Minute */}
                        <div className="relative">
                            <select
                                name="startTime.min"
                                value={formData.startTime.min}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("startTime.min")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Min</option>
                                {generateOptions(0, 59)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "startTime.min" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                {/* End Time */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">End</label>
                    <div className="grid grid-cols-2 gap-5">
                        {/* Hour */}
                        <div className="relative">
                            <select
                                name="endTime.hour"
                                value={formData.endTime.hour}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("endTime.hour")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Hour</option>
                                {generateOptions(0, 23)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "endTime.hour" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Minute */}
                        <div className="relative">
                            <select
                                name="endTime.min"
                                value={formData.endTime.min}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("endTime.min")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Min</option>
                                {generateOptions(0, 59)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "endTime.min" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                {/* Attendees */}
                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">Attendees</label>
                    <div className="relative">
                        <div className="flex items-center mb-2 border border-[#383840] rounded-md">
                            <input
                                type="text"
                                placeholder="Search attendees..."
                                value={attendeeSearchTerm}
                                onChange={(e) => setAttendeeSearchTerm(e.target.value)}
                                className="add-training-inputs !pr-10"
                            />
                            <Search
                                className="absolute right-3"
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>

                    {/* Attendee Checkboxes */}
                    <div className="border border-[#383840] rounded-md p-2 max-h-[130px] overflow-y-auto">
                    {filteredAttendees.length > 0 ? (
    filteredAttendees.map(user => (
        <div key={user.id} className="flex items-center py-2 last:border-0">
            <input
                type="checkbox"
                id={`attendee-${user.id}`}
                checked={formData.attendees.includes(user.id)}
                onChange={() => handleAttendeeChange(user.id)}
                className="mr-2 form-checkboxes"
            />
            <label
                htmlFor={`attendee-${user.id}`}
                className="text-sm text-[#AAAAAA] cursor-pointer"
            >
                {user.first_name} {user.last_name}
            </label>
        </div>
    ))
) : (
    <div className="text-sm text-[#AAAAAA] p-2">No attendees found</div>
)}
                    </div>
                </div>

                {/* Called By and Send Notification */}
                <div className='flex flex-col gap-5 justify-between'>
                    <div className="flex flex-col gap-3">
                        <label className="add-training-label">Called By</label>
                        <div className="relative">
                            <select
                                name="called_by"
                                value={formData.called_by}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("called_by")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Select</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "called_by" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>

                    <div className="flex items-end justify-end">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="send_notification"
                                className="mr-2 form-checkboxes"
                                checked={formData.send_notification}
                                onChange={handleChange}
                            />
                            <span className="permissions-texts cursor-pointer">
                                Send Notification
                            </span>
                        </label>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="md:col-span-2 flex gap-4 justify-between">
                    <div>
                  
                    </div>
                    <div className='flex gap-5'>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn duration-200"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QmsEditDraftMeeting
