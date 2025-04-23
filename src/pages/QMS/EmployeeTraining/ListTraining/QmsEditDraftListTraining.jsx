import React, { useState, useEffect } from 'react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import { ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";


const QmsEditDraftListTraining = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showUpdatedSuccessModal, setShowUpdatedSuccessModal] = useState(false);
    const [showUpdateErrorModal, setShowUpdateErrorModal] = useState(false);
    const [users, setUsers] = useState([]);
    
    // Initial form state structure
    const [formData, setFormData] = useState({
        training_title: '',
        type_of_training: 'Internal',
        expected_results: '',
        actual_results: '',
        training_attendees: [],
        status: '',
        requested_by: '',
        date_planned: '',
        date_conducted: '',
        start_time: {
            hour: '',
            min: ''
        },
        end_time: {
            hour: '',
            min: ''
        },
        venue: '',
        attachment: null,
        training_evaluation: '',
        evaluation_date: '',
        evaluation_by: '',
        send_notification: false,
        is_draft: false
    });
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
      
    // Get all users for dropdown selections
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const companyId = getUserCompanyId();
                const response = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);
                setUsers(response.data);
                console.log("Users fetched successfully:", response.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        fetchUsers();
    }, []);

    // Fetch training data
    useEffect(() => {
        const fetchTrainingData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/training-get/${id}/`);
                const data = response.data;
                
                // Format dates
                const datePlanned = data.date_planned ? new Date(data.date_planned) : null;
                const dateConducted = data.date_conducted ? new Date(data.date_conducted) : null;
                const evaluationDate = data.evaluation_date ? new Date(data.evaluation_date) : null;
                
                // Format times
                const startTime = data.start_time ? data.start_time.split(':') : ['', ''];
                const endTime = data.end_time ? data.end_time.split(':') : ['', ''];
                
                setFormData({
                    ...data,
                    requested_by: data.requested_by ? data.requested_by.id : '',
                    evaluation_by: data.evaluation_by ? data.evaluation_by.id : '',
                    training_attendees: data.training_attendees ? data.training_attendees.map(attendee => attendee.id) : [],
                    start_time: {
                        hour: startTime[0],
                        min: startTime[1]
                    },
                    end_time: {
                        hour: endTime[0],
                        min: endTime[1]
                    }
                });
                
                if (data.attachment) {
                    setSelectedFile(data.attachment.split('/').pop());
                }
                
                setLoading(false);
                console.log("Training data fetched successfully:", response.data);
            } catch (err) {
                setError("Failed to load training data");
                setLoading(false);
                console.error("Error fetching training data:", err);
            }
        };
        
        if (id) {
            fetchTrainingData();
        }
    }, [id]);
    
    const [focusedDropdown, setFocusedDropdown] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === "training_attendees") {
            // Handle multi-select for attendees
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({
                ...formData,
                training_attendees: selectedOptions
            });
        } else if (name.includes('.')) {
            // Handle nested objects like start_time.hour
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else if (type === "checkbox") {
            // Handle checkboxes
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            // Handle regular inputs
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({
                ...formData,
                attachment: e.target.files[0]
            });
            setSelectedFile(e.target.files[0].name);
        }
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData object for file upload
    const submitData = new FormData();
    
    // Format time fields - only if hour and minute are both provided
    const formattedStartTime = formData.start_time.hour && formData.start_time.min 
        ? `${formData.start_time.hour}:${formData.start_time.min}:00` 
        : '';
        
    const formattedEndTime = formData.end_time.hour && formData.end_time.min 
        ? `${formData.end_time.hour}:${formData.end_time.min}:00` 
        : '';
    
    // Add regular fields
    submitData.append('training_title', formData.training_title);
    submitData.append('type_of_training', formData.type_of_training);
    submitData.append('expected_results', formData.expected_results);
    submitData.append('actual_results', formData.actual_results || '');
    submitData.append('status', formData.status || 'Requested'); // Provide a default value
    
    // Only append fields if they have valid values
    if (formData.requested_by) submitData.append('requested_by', formData.requested_by);
    
    // Handle date fields - convert null/undefined to empty string
    submitData.append('date_planned', formData.date_planned || '');
    submitData.append('date_conducted', formData.date_conducted || '');
    
    // Only append time fields if they have valid values
    if (formattedStartTime) submitData.append('start_time', formattedStartTime);
    if (formattedEndTime) submitData.append('end_time', formattedEndTime);
    
    submitData.append('venue', formData.venue);
    submitData.append('training_evaluation', formData.training_evaluation || '');
    submitData.append('evaluation_date', formData.evaluation_date || '');
    
    if (formData.evaluation_by) submitData.append('evaluation_by', formData.evaluation_by);
    
    // Convert boolean to string values for backend
    submitData.append('send_notification', formData.send_notification ? 'true' : 'false');
    submitData.append('is_draft', formData.is_draft ? 'true' : 'false');
    
    // Handle attendees (many-to-many field)
    if (formData.training_attendees && formData.training_attendees.length > 0) {
        formData.training_attendees.forEach(attendee => {
            submitData.append('training_attendees', attendee);
        });
    }
    
    // Handle file attachment
    if (formData.attachment && typeof formData.attachment === 'object') {
        submitData.append('attachment', formData.attachment);
    }
    
    try {
        // Debug what's being sent
        console.log("Submitting data:", Object.fromEntries(submitData.entries()));
        
        const response = await axios.put(`${BASE_URL}/qms/training/${id}/edit/`, submitData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log("Training updated successfully:", response.data);
        setShowUpdatedSuccessModal(true);
        setTimeout(() => {
            setShowUpdatedSuccessModal(false);
            navigate("/company/qms/list-training");
        }, 1500);
    } catch (err) {
        console.error("Error updating training:", err);
        if (err.response && err.response.data) {
            // Display specific validation errors
            console.error("Validation errors:", err.response.data);
            setError(`Failed to update training: ${JSON.stringify(err.response.data)}`);
        } else {
            setError("Failed to update training");
        }
        setShowUpdateErrorModal(true);
        setTimeout(() => {
            setShowUpdateErrorModal(false);
        }, 3000);
    }
};
    const handleListTraining = () => {
        navigate('/company/qms/list-training');
    };

    const handleCancel = () => {
        navigate('/company/qms/list-training');
    };

    // Format date from ISO string to YYYY-MM-DD for input fields
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.substring(0, 10); // Get YYYY-MM-DD part
    };

    if (loading) return <div className="text-white text-center py-10">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Edit Training</h1>
                <button
                    onClick={handleListTraining}
                    className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200"
                >
                    List Training
                </button>
            </div>

            {showUpdatedSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1C1C24] p-6 rounded-lg shadow-lg">
                        <p className="text-green-500 text-center">Training updated successfully!</p>
                    </div>
                </div>
            )}

            {showUpdateErrorModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1C1C24] p-6 rounded-lg shadow-lg">
                        <p className="text-red-500 text-center">Failed to update training.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">
                {/* Training Title */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Training Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="training_title"
                        value={formData.training_title}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                        required
                    />
                </div>

                {/* Type of Training */}
                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">Type of Training</label>
                    <div className="relative">
                        <select
                            name="type_of_training"
                            value={formData.type_of_training}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("type_of_training")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        >
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                            <option value="Client/Legal">Client/Legal</option>
                            <option value="Online">Online</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform transition-transform duration-300 
                            ${focusedDropdown === "type_of_training" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>

                {/* Expected Results */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Expected Results <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="expected_results"
                        value={formData.expected_results}
                        onChange={handleChange}
                        className="add-training-inputs !h-[109px]"
                        required
                    />
                </div>

                {/* Actual Results */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Actual Results</label>
                    <textarea
                        name="actual_results"
                        value={formData.actual_results}
                        onChange={handleChange}
                        className="add-training-inputs !h-[109px]"
                    />
                </div>

                {/* Training Attendees - Multiple Select */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Training Attendees</label>
                    <select
                        name="training_attendees"
                        value={formData.training_attendees}
                        onChange={handleChange}
                        className="add-training-inputs !h-[151px]"
                        multiple
                    >
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>
                  
                </div>

                {/* Status */}
                <div className="flex flex-col gap-5">
                    {/* <div className='flex flex-col gap-3 relative'>
                        <label className="add-training-label">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("status")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="read-only add-training-inputs appearance-none pr-10 cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select</option>
                            <option value="Requested">Requested</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-[60%] transform transition-transform duration-300 
                            ${focusedDropdown === "status" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div> */}

                    <div className="flex flex-col gap-3 relative">
                        <label className="add-training-label">Requested By</label>
                        <select
                            name="requested_by"
                            value={formData.requested_by}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("requested_by")}
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
                            className={`absolute right-3 top-[60%] transform transition-transform duration-300 
                            ${focusedDropdown === "requested_by" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>

                {/* Date Planned */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date Planned</label>
                    <input
                        type="date"
                        name="date_planned"
                        value={formatDateForInput(formData.date_planned)}
                        onChange={handleChange}
                        className="add-training-inputs"
                    />
                </div>

                {/* Date Conducted */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date Conducted</label>
                    <input
                        type="date"
                        name="date_conducted"
                        value={formatDateForInput(formData.date_conducted)}
                        onChange={handleChange}
                        className="add-training-inputs"
                    />
                </div>

                {/* Start Time */}
                <div className="flex flex-col gap-3 w-[65.5%]">
                    <label className="add-training-label">Start</label>
                    <div className="grid grid-cols-2 gap-5">
                        {/* Hour */}
                        <div className="relative">
                            <select
                                name="start_time.hour"
                                value={formData.start_time.hour}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("start_time.hour")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Hour</option>
                                {Array.from({ length: 24 }, (_, i) => {
                                    const val = i < 10 ? `0${i}` : `${i}`;
                                    return <option key={i} value={val}>{val}</option>;
                                })}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "start_time.hour" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Minute */}
                        <div className="relative">
                            <select
                                name="start_time.min"
                                value={formData.start_time.min}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("start_time.min")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Min</option>
                                {Array.from({ length: 60 }, (_, i) => {
                                    const val = i < 10 ? `0${i}` : `${i}`;
                                    return <option key={i} value={val}>{val}</option>;
                                })}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "start_time.min" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                {/* End Time */}
                <div className="flex flex-col gap-3 w-[65.5%]">
                    <label className="add-training-label">End</label>
                    <div className="grid grid-cols-2 gap-5">
                        {/* Hour */}
                        <div className="relative">
                            <select
                                name="end_time.hour"
                                value={formData.end_time.hour}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("end_time.hour")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Hour</option>
                                {Array.from({ length: 24 }, (_, i) => {
                                    const val = i < 10 ? `0${i}` : `${i}`;
                                    return <option key={i} value={val}>{val}</option>;
                                })}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "end_time.hour" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Minute */}
                        <div className="relative">
                            <select
                                name="end_time.min"
                                value={formData.end_time.min}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("end_time.min")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Min</option>
                                {Array.from({ length: 60 }, (_, i) => {
                                    const val = i < 10 ? `0${i}` : `${i}`;
                                    return <option key={i} value={val}>{val}</option>;
                                })}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "end_time.min" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                {/* Venue */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        className="add-training-inputs"
                        required
                    />
                </div>

                {/* Upload Attachments */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Upload Attachments</label>
                    <div className="flex">
                        <input
                            type="file"
                            id="file-upload"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="file-upload"
                            className="add-training-inputs w-full flex justify-between items-center cursor-pointer !bg-[#1C1C24] border !border-[#383840]"
                        >
                            <span className="text-[#AAAAAA] choose-file">Choose File</span>
                            <img src={file} alt="File icon" />
                        </label>
                    </div>
                    {selectedFile && (
                        <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">{selectedFile}</p>
                    )}
                    {!selectedFile && (
                        <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">No file chosen</p>
                    )}
                </div>

                {/* Training Evaluation */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Training Evaluation</label>
                    <textarea
                        name="training_evaluation"
                        value={formData.training_evaluation}
                        onChange={handleChange}
                        className="add-training-inputs !h-[151px]"
                    />
                </div>

                {/* Evaluation Date */}
                <div className='flex flex-col gap-5'>
                    <div className="flex flex-col gap-3">
                        <label className="add-training-label">Evaluation Date</label>
                        <input
                            type="date"
                            name="evaluation_date"
                            value={formatDateForInput(formData.evaluation_date)}
                            onChange={handleChange}
                            className="add-training-inputs"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="add-training-label">Evaluation By</label>
                        <div className="relative">
                            <select
                                name="evaluation_by"
                                value={formData.evaluation_by}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("evaluation_by")}
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
                                ${focusedDropdown === "evaluation_by" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                <div></div>
                <div className="flex items-end justify-end mt-5">
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

                {/* Form Actions */}
                <div className="md:col-span-2 flex gap-4 justify-end">
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
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
};



export default QmsEditDraftListTraining
