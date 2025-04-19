import React, { useState, useEffect } from 'react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./qmsaddtraining.css";
import { BASE_URL } from "../../../../Utils/Config";

const QmsAddTraining = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddTrainingSuccessModal, setShowAddTrainingSuccessModal] = useState(false);
  const [showAddTrainingErrorModal, setShowAddTrainingErrorModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [draftLoading, setDraftLoading] = useState(false);

  const [formData, setFormData] = useState({
    trainingTitle: '',
    typeOfTraining: 'Internal',
    expectedResults: '',
    actualResults: '',
    status: 'Requested',
    requestedBy: '',
    datePlanned: {
      day: '',
      month: '',
      year: ''
    },
    dateConducted: {
      day: '',
      month: '',
      year: ''
    },
    startTime: {
      hour: '',
      min: ''
    },
    endTime: {
      hour: '',
      min: ''
    },
    venue: '',
    attachment: null,
    trainingEvaluation: '',
    evaluationDate: {
      day: '',
      month: '',
      year: ''
    },
    evaluationBy: '',
    send_notification: false,
    is_draft: false
  });

  useEffect(() => {
    // Fetch users for dropdown selections
    const fetchUsers = async () => {
      try {
        const companyId = getUserCompanyId();
        const response = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

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

  const [focusedDropdown, setFocusedDropdown] = useState(null);

  const handleQmsListTraining = () => {
    navigate('/company/qms/list-training');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
      return;
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

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      attachment: e.target.files[0]
    });
  };

  const handleAttendeesChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }

    setSelectedAttendees(selectedValues);
  };



  const handleSubmit = async (e, isDraft = false) => {
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

      // Format dates and times for submission
      const datePlanned = `${formData.datePlanned.year}-${formData.datePlanned.month}-${formData.datePlanned.day}`;
      const dateConducted = `${formData.dateConducted.year}-${formData.dateConducted.month}-${formData.dateConducted.day}`;
      const startTime = `${formData.startTime.hour}:${formData.startTime.min}:00`;
      const endTime = `${formData.endTime.hour}:${formData.endTime.min}:00`;
      const evaluationDate = `${formData.evaluationDate.year}-${formData.evaluationDate.month}-${formData.evaluationDate.day}`;

      const submissionData = new FormData();
      submissionData.append('company', companyId);
      submissionData.append('user', userId);
      submissionData.append('training_title', formData.trainingTitle);
      submissionData.append('expected_results', formData.expectedResults);
      submissionData.append('actual_results', formData.actualResults);
      submissionData.append('type_of_training', formData.typeOfTraining);
      submissionData.append('status', formData.status);
      submissionData.append('requested_by', formData.requestedBy);
      submissionData.append('date_planned', datePlanned);
      submissionData.append('date_conducted', dateConducted);
      submissionData.append('start_time', startTime);
      submissionData.append('end_time', endTime);
      submissionData.append('venue', formData.venue);
      submissionData.append('training_evaluation', formData.trainingEvaluation);
      submissionData.append('evaluation_date', evaluationDate);
      submissionData.append('evaluation_by', formData.evaluationBy);
      submissionData.append('send_notification', formData.send_notification);
      submissionData.append('is_draft', isDraft || formData.is_draft);

      // Append selected attendees
      selectedAttendees.forEach(attendeeId => {
        submissionData.append('training_attendees', attendeeId);
      });

      if (formData.attachment) {
        submissionData.append('attachment', formData.attachment);
      }

      const response = await axios.post(`${BASE_URL}/qms/training/create/`, submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowAddTrainingSuccessModal(true);
      setTimeout(() => {
        setShowAddTrainingSuccessModal(false);
        navigate('/company/qms/list-training');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowAddTrainingErrorModal(true);
      setTimeout(() => {
        setShowAddTrainingErrorModal(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/company/qms/list-training');
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
  const handleSaveAsDraft = async () => {
    try {
      setDraftLoading(true);

      const companyId = getUserCompanyId();
      const userId = getRelevantUserId();

      if (!companyId || !userId) {
        setError('Company ID or User ID not found. Please log in again.');
        setDraftLoading(false);
        return;
      }

      // Format dates and times properly
      const datePlanned = formData.datePlanned.year && formData.datePlanned.month && formData.datePlanned.day ?
        `${formData.datePlanned.year}-${formData.datePlanned.month}-${formData.datePlanned.day}` : '';

      const dateConducted = formData.dateConducted.year && formData.dateConducted.month && formData.dateConducted.day ?
        `${formData.dateConducted.year}-${formData.dateConducted.month}-${formData.dateConducted.day}` : '';

      const startTime = formData.startTime.hour && formData.startTime.min ?
        `${formData.startTime.hour}:${formData.startTime.min}:00` : '';

      const endTime = formData.endTime.hour && formData.endTime.min ?
        `${formData.endTime.hour}:${formData.endTime.min}:00` : '';

      const evaluationDate = formData.evaluationDate.year && formData.evaluationDate.month && formData.evaluationDate.day ?
        `${formData.evaluationDate.year}-${formData.evaluationDate.month}-${formData.evaluationDate.day}` : '';

      const submitData = new FormData();

      submitData.append('company', companyId);
      submitData.append('user', userId);
      submitData.append('is_draft', true);

      // Add basic fields
      if (formData.trainingTitle) submitData.append('training_title', formData.trainingTitle);
      if (formData.typeOfTraining) submitData.append('type_of_training', formData.typeOfTraining);
      if (formData.expectedResults) submitData.append('expected_results', formData.expectedResults);
      if (formData.actualResults) submitData.append('actual_results', formData.actualResults);
      if (formData.status) submitData.append('status', formData.status);
      if (formData.requestedBy) submitData.append('requested_by', formData.requestedBy);
      if (formData.venue) submitData.append('venue', formData.venue);
      if (formData.trainingEvaluation) submitData.append('training_evaluation', formData.trainingEvaluation);
      if (formData.evaluationBy) submitData.append('evaluation_by', formData.evaluationBy);
      submitData.append('send_notification', formData.send_notification);

      if (datePlanned) submitData.append('date_planned', datePlanned);
      if (dateConducted) submitData.append('date_conducted', dateConducted);
      if (startTime) submitData.append('start_time', startTime);
      if (endTime) submitData.append('end_time', endTime);
      if (evaluationDate) submitData.append('evaluation_date', evaluationDate);

      selectedAttendees.forEach(attendeeId => {
        submitData.append('training_attendees', attendeeId);
      });

      // Add attachment if any
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      console.log('Sending draft data:', Object.fromEntries(submitData.entries()));

      const response = await axios.post(
        `${BASE_URL}/qms/training/draft-create/`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setDraftLoading(false);

      setTimeout(() => {
        navigate('/company/qms/draft-training');
      }, 1500);

    } catch (err) {
      setDraftLoading(false);
      const errorMessage = err.response?.data?.detail || 'Failed to save Draft';
      setError(errorMessage);
      console.error('Error saving Draft:', err.response?.data || err);
    }
  };
  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
        <h1 className="add-training-head">Add Training</h1>
        <button
          className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200"
          onClick={() => handleQmsListTraining()}
        >
          List Training
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">
        {/* Training Title */}
        <div className="flex flex-col gap-3">
          <label className="add-training-label">
            Training Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="trainingTitle"
            value={formData.trainingTitle}
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
              name="typeOfTraining"
              value={formData.typeOfTraining}
              onChange={handleChange}
              onFocus={() => setFocusedDropdown("typeOfTraining")}
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
      ${focusedDropdown === "typeOfTraining" ? "rotate-180" : ""}`}
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
            name="expectedResults"
            value={formData.expectedResults}
            onChange={handleChange}
            className="add-training-inputs !h-[109px]"
            required
          />
        </div>

        {/* Actual Results */}
        <div className="flex flex-col gap-3">
          <label className="add-training-label">Actual Results</label>
          <textarea
            name="actualResults"
            value={formData.actualResults}
            onChange={handleChange}
            className="add-training-inputs !h-[109px]"
          />
        </div>

        {/* Training Attendees */}
        <div className="flex flex-col gap-3">
          <label className="add-training-label">Training Attendees</label>
          <select
            multiple
            value={selectedAttendees}
            onChange={handleAttendeesChange}
            className="add-training-inputs !h-[151px] overflow-y-auto"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#AAAAAA]">Hold Ctrl/Cmd to select multiple attendees</p>
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
              className="add-training-inputs appearance-none pr-10 cursor-pointer"
              required
            >
              <option value="Requested">Requested</option>
              <option value="Completed">Completed</option>
            </select>
            
          </div> */}

          <div className="flex flex-col gap-3 relative">
            <label className="add-training-label">Requested By</label>
            <select
              name="requestedBy"
              value={formData.requestedBy}
              onChange={handleChange}
              onFocus={() => setFocusedDropdown("requestedBy")}
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
      ${focusedDropdown === "requestedBy" ? "rotate-180" : ""}`}
              size={20}
              color="#AAAAAA"
            />
          </div>
        </div>

        {/* Date Planned */}
        <div className="flex flex-col gap-3">
          <label className="add-training-label">
            Date Planned <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-5">
            {/* Day */}
            <div className="relative">
              <select
                name="datePlanned.day"
                value={formData.datePlanned.day}
                onChange={handleChange}
                onFocus={() => setFocusedDropdown("datePlanned.day")}
                onBlur={() => setFocusedDropdown(null)}
                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                required
              >
                <option value="" disabled>dd</option>
                {generateOptions(1, 31)}
              </select>
              <ChevronDown
                className={`absolute right-3 top-1/3 transform transition-transform duration-300
          ${focusedDropdown === "datePlanned.day" ? "rotate-180" : ""}`}
                size={20}
                color="#AAAAAA"
              />
            </div>

            {/* Month */}
            <div className="relative">
              <select
                name="datePlanned.month"
                value={formData.datePlanned.month}
                onChange={handleChange}
                onFocus={() => setFocusedDropdown("datePlanned.month")}
                onBlur={() => setFocusedDropdown(null)}
                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                required
              >
                <option value="" disabled>mm</option>
                {generateOptions(1, 12)}
              </select>
              <ChevronDown
                className={`absolute right-3 top-1/3 transform transition-transform duration-300
          ${focusedDropdown === "datePlanned.month" ? "rotate-180" : ""}`}
                size={20}
                color="#AAAAAA"
              />
            </div>

            {/* Year */}
            <div className="relative">
              <select
                name="datePlanned.year"
                value={formData.datePlanned.year}
                onChange={handleChange}
                onFocus={() => setFocusedDropdown("datePlanned.year")}
                onBlur={() => setFocusedDropdown(null)}
                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                required
              >
                <option value="" disabled>yyyy</option>
                {generateOptions(2023, 2030)}
              </select>
              <ChevronDown
                className={`absolute right-3 top-1/3 transform transition-transform duration-300
          ${focusedDropdown === "datePlanned.year" ? "rotate-180" : ""}`}
                size={20}
                color="#AAAAAA"
              />
            </div>
          </div>
        </div>

        {/* Date Conducted */}
        <div className="flex flex-col gap-3">
          <label className="add-training-label">
            Date Conducted <span className="text-red-500">*</span>
          </label>
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
                required
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
                required
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
                required
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

        {/* Start Time */}
        <div className="flex flex-col gap-3 w-[65.5%]">
          <label className="add-training-label">
            Start <span className="text-red-500">*</span>
          </label>
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
                required
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
                required
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
        <div className="flex flex-col gap-3 w-[65.5%]">
          <label className="add-training-label">
            End <span className="text-red-500">*</span>
          </label>
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
                required
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
                required
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
              <img src={file} alt="" />
            </label>
          </div>
          {formData.attachment && (
            <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">{formData.attachment.name}</p>
          )}
          {!formData.attachment && (
            <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">No file chosen</p>
          )}
        </div>

        {/* Training Evaluation */}
        <div className="flex flex-col gap-3">
          <label className="add-training-label">Training Evaluation</label>
          <textarea
            name="trainingEvaluation"
            value={formData.trainingEvaluation}
            onChange={handleChange}
            className="add-training-inputs !h-[151px]"
          />
        </div>

        {/* Evaluation Date */}
        <div className='flex flex-col gap-5'>
          <div className="flex flex-col gap-3">
            <label className="add-training-label">
              Evaluation Date <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-5">
              {/* Day */}
              <div className="relative">
                <select
                  name="evaluationDate.day"
                  value={formData.evaluationDate.day}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("evaluationDate.day")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="" disabled>dd</option>
                  {generateOptions(1, 31)}
                </select>
                <ChevronDown
                  className={`absolute right-3 top-1/3 transform transition-transform duration-300
          ${focusedDropdown === "evaluationDate.day" ? "rotate-180" : ""}`}
                  size={20}
                  color="#AAAAAA"
                />
              </div>

              {/* Month */}
              <div className="relative">
                <select
                  name="evaluationDate.month"
                  value={formData.evaluationDate.month}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("evaluationDate.month")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="" disabled>mm</option>
                  {generateOptions(1, 12)}
                </select>
                <ChevronDown
                  className={`absolute right-3 top-1/3 transform transition-transform duration-300
          ${focusedDropdown === "evaluationDate.month" ? "rotate-180" : ""}`}
                  size={20}
                  color="#AAAAAA"
                />
              </div>

              {/* Year */}
              <div className="relative">
                <select
                  name="evaluationDate.year"
                  value={formData.evaluationDate.year}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("evaluationDate.year")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  required
                >
                  <option value="" disabled>yyyy</option>
                  {generateOptions(2023, 2030)}
                </select>
                <ChevronDown
                  className={`absolute right-3 top-1/3 transform transition-transform duration-300
          ${focusedDropdown === "evaluationDate.year" ? "rotate-180" : ""}`}
                  size={20}
                  color="#AAAAAA"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="add-training-label">Evaluation By</label>
            <div className="relative">
              <select
                name="evaluationBy"
                value={formData.evaluationBy}
                onChange={handleChange}
                onFocus={() => setFocusedDropdown("evaluationBy")}
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
        ${focusedDropdown === "evaluationBy" ? "rotate-180" : ""}`}
                size={20}
                color="#AAAAAA"
              />
            </div>
          </div>
        </div>

        <div></div>
        <div className="flex items-end justify-end mt-3">
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
        <div className="md:col-span-2 flex gap-4 justify-between">
          <div>
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={draftLoading}
              className="request-correction-btn duration-200"
            >
              {draftLoading ? 'Saving...' : 'Save as Draft'}
            </button>
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
              disabled={loading}
              className="save-btn duration-200 !w-full"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QmsAddTraining
