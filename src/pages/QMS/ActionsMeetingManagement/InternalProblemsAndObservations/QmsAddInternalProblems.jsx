import React, { useState } from 'react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg"
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QmsAddInternalProblems = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        typeOfTraining: 'Internal',
        trainingTitle: '',
        expectedResults: '',
        actualResults: '',
        trainingAttendee: 'Internal',
        status: '',
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
        evaluationBy: ''
    });

    const [focusedDropdown, setFocusedDropdown] = useState(null);

    const handleQmsListTraining = () => {
        navigate('/company/qms/list-training')
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
        navigate('/company/qms/list-training')
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
                <h1 className="add-training-head">Add Internal Problems and Observations</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded px-3 h-[42px] list-training-btn duration-200"
                    onClick={() => handleQmsListTraining()}
                >
                    Internal Problems and Observations
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5  ">
                {/* Training Title */}
                <div className="flex flex-col gap-3 relative">
                    <div className='flex justify-between'>
                        <label className="add-training-label">Select Causes / Root Cause</label>
                        <button className='add-training-label !text-[12px] !text-[#1E84AF]'>Reload Cause List</button>
                    </div>
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
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform   transition-transform duration-300 
       ${focusedDropdown === "typeOfTraining" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                    <button className='flex justify-start add-training-label !text-[#1E84AF]'>Add Causes / Root Causes</button>
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
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform   transition-transform duration-300 
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

                {/* Training Attendee */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Training Attendees</label>
                    <textarea
                        name="trainingAttendee"
                        value={formData.trainingAttendee}
                        onChange={handleChange}
                        className="add-training-inputs !h-[151px]"
                    >
                    </textarea>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-5">
                    <div className='flex flex-col gap-3 relative'>
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
                            <option value="" disabled>Select</option>
                            <option value="Planned">Planned</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-[60%] transform   transition-transform duration-300 
       ${focusedDropdown === "status" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>

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
                            <option value="Manager">Manager</option>
                            <option value="Employee">Employee</option>
                            <option value="HR">HR</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-[60%] transform   transition-transform duration-300 
       ${focusedDropdown === "requestedBy" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>



                {/* Date Planned */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date Planned</label>
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
                            >
                                <option value="" disabled>dd</option>
                                {generateOptions(1, 31)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform   transition-transform duration-300
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
                            >
                                <option value="" disabled>mm</option>
                                {generateOptions(1, 12)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform   transition-transform duration-300
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
                            >
                                <option value="" disabled>yyyy</option>
                                {generateOptions(2023, 2030)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform   transition-transform duration-300
           ${focusedDropdown === "datePlanned.year" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                    </div>
                </div>


                {/* Date Conducted */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date Conducted</label>
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


                {/* Start Time */}
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


                {/* End Time */}
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
                        <label className="add-training-label">Evaluation Date</label>
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
                                >
                                    <option value="" disabled>mm</option>
                                    {generateOptions(1, 12)}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-1/3 transform  transition-transform duration-300
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
                                >
                                    <option value="" disabled>yyyy</option>
                                    {generateOptions(2023, 2030)}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-1/3 transform  transition-transform duration-300
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
                                <option value="Manager">Manager</option>
                                <option value="Trainer">Trainer</option>
                                <option value="HR">HR</option>
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
                        <button className='request-correction-btn duration-200'>
                            Save as Draft
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
export default QmsAddInternalProblems
