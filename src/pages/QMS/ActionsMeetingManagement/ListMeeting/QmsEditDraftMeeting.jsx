import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QmsEditDraftMeeting = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        dateConducted: {
            day: '',
            month: '',
            year: ''
        },
        cause: '',
        meetingType: '',
        venue: '',
        startTime: {
            hour: '',
            min: ''
        },
        endTime: {
            hour: '',
            min: ''
        },
        attendee: '',
        calledBy: '',
    });

    const [focusedDropdown, setFocusedDropdown] = useState(null);

    const handleQmsListDraftMeeting = () => {
        navigate('/company/qms/draft-meeting')
    }


    const handleChange = (e) => {
        const { name, value } = e.target;

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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form data submitted:', formData);
        // Here you would typically send the data to your backend
    };

    const handleCancel = () => {
        navigate('/company/qms/draft-meeting')
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

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Edit Draft Meeting</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200"
                    onClick={() => handleQmsListDraftMeeting()}
                >
                    List Draft Meeting
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5  ">
                {/* Training Title */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Title <span className="text-red-500">*</span>
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
                                className={`absolute right-3 top-1/3 transform   transition-transform duration-300
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


                <div className="flex flex-col gap-3 relative">
                    <div className="flex items-center justify-between">
                        <label className="add-training-label">Select Cause :</label>
                        <button className='add-training-label !text-[12px] !text-[#1E84AF]'>Reload Agenda List</button>
                    </div>
                    <select
                        name="cause"
                        value={formData.cause}
                        onChange={handleChange}
                        onFocus={() => setFocusedDropdown("cause")}
                        onBlur={() => setFocusedDropdown(null)}
                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                    >
                        <option value="" disabled>Select</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                        <option value="HR">HR</option>
                    </select>
                    <ChevronDown
                        className={`absolute right-3 top-[45%] transform   transition-transform duration-300 
        ${focusedDropdown === "cause" ? "rotate-180" : ""}`}
                        size={20}
                        color="#AAAAAA"
                    />
                    <button className='flex justify-start add-training-label !text-[#1E84AF]'>View / Add Causes </button>
                </div>

                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">Meeting Type  <span className="text-red-500">*</span></label>
                    <select
                        name="meetingType"
                        value={formData.meetingType}
                        onChange={handleChange}
                        onFocus={() => setFocusedDropdown("meetingType")}
                        onBlur={() => setFocusedDropdown(null)}
                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                    >
                        <option value="" disabled>Select</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                        <option value="HR">HR</option>
                    </select>
                    <ChevronDown
                        className={`absolute right-3 top-[45%] transform   transition-transform duration-300 
        ${focusedDropdown === "meetingType" ? "rotate-180" : ""}`}
                        size={20}
                        color="#AAAAAA"
                    />
                </div>
                <div >
                </div>

                {/* Status */}
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
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-[65.5%]">
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
                                className={`absolute right-3 top-1/3 transform  transition-transform duration-300
            ${focusedDropdown === "startTime.min" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                    </div>
                </div>


                <div className="flex flex-col gap-3 w-[65.5%]">
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
                                className={`absolute right-3 top-1/3 transform  transition-transform duration-300
            ${focusedDropdown === "endTime.min" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                    </div>
                </div>


                {/* Training Evaluation */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Attendee</label>
                    <textarea
                        name="attendee"
                        value={formData.attendee}
                        onChange={handleChange}
                        className="add-training-inputs !h-[151px]"
                    />
                </div>

                {/* Evaluation Date */}
                <div className='flex flex-col gap-5 justify-between'>
                    <div className="flex flex-col gap-3">
                        <label className="add-training-label">Called By</label>
                        <div className="relative">
                            <select
                                name="calledBy"
                                value={formData.calledBy}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("calledBy")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Select</option>
                                <option value="Manager">Manager</option>
                                <option value="Trainer">Trainer</option>
                                <option value="HR">HR</option>
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
          ${focusedDropdown === "calledBy" ? "rotate-180" : ""}`}
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
