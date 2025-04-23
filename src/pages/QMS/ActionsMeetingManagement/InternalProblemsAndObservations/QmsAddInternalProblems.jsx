import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import InternalProblemsModal from '../InternalProblemsModal';

const QmsAddInternalProblems = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        cause: 'Internal',
        description: '',
        action: '',
        executor: '',
        solved: '',
        dateProblem: {
            day: '',
            month: '',
            year: ''
        },
        correctiveAction: '',
      
    });

    const [focusedDropdown, setFocusedDropdown] = useState(null);

    const handleListInternalProblems = () => {
        navigate('/company/qms/list-internal-problems-observations')
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle checkboxes
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

    const handleAddCause = (cause) => {
        setFormData({
            ...formData,
            cause: cause
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form data submitted:', formData);
        // Here you would typically send the data to your backend
    };

    const handleCancel = () => {
        navigate('/company/qms/list-internal-problems-observations')
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

            {/* <InternalProblemsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddCause={handleAddCause}
            /> */}


            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Add Internal Problems and Observations</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded px-3 h-[42px] list-training-btn duration-200"
                    onClick={() => handleListInternalProblems()}
                >
                    Internal Problems and Observations
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">

                <div className="flex flex-col gap-3 relative">
                    <div className='flex justify-between'>
                        <label className="add-training-label">Select Causes / Root Cause</label>
                    </div>
                    <div className="relative">
                        <select
                            name="cause"
                            value={formData.cause}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("cause")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        >
                            <option value="Internal">Internal</option>
                            <option value="External">External</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform transition-transform duration-300 
                            ${focusedDropdown === "cause" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                    <button className='flex justify-start add-training-label !text-[#1E84AF]'
                        onClick={handleOpenModal}
                    >
                        Add Causes / Root Causes
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Problem/ Observation Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="add-training-inputs !h-[152px]"
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Immediate Action Taken :</label>
                    <textarea
                        name="action"
                        value={formData.action}
                        onChange={handleChange}
                        className="add-training-inputs !h-[151px]"
                    >
                    </textarea>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-5">
                    <div className='flex flex-col gap-3 relative'>
                        <label className="add-training-label">
                            Executor:
                        </label>
                        <select
                            name="executor"
                            value={formData.executor}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("executor")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select User</option>
                            <option value="User1">User 1</option>
                            <option value="User2">User 2</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-[60%] transform transition-transform duration-300 
                            ${focusedDropdown === "executor" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>

                    <div className="flex flex-col gap-3 relative">
                        <label className="add-training-label">Solved After Action?</label>
                        <select
                            name="solved"
                            value={formData.solved}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("solved")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        >
                            <option value="" disabled>Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>

                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-[60%] transform transition-transform duration-300 
                            ${focusedDropdown === "solved" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date Problem</label>
                    <div className="grid grid-cols-3 gap-5">

                        {/* Day */}
                        <div className="relative">
                            <select
                                name="dateProblem.day"
                                value={formData.dateProblem.day}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("dateProblem.day")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>dd</option>
                                {generateOptions(1, 31)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "dateProblem.day" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Month */}
                        <div className="relative">
                            <select
                                name="dateProblem.month"
                                value={formData.dateProblem.month}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("dateProblem.month")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>mm</option>
                                {generateOptions(1, 12)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "dateProblem.month" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        {/* Year */}
                        <div className="relative">
                            <select
                                name="dateProblem.year"
                                value={formData.dateProblem.year}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("dateProblem.year")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>yyyy</option>
                                {generateOptions(2023, 2030)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "dateProblem.year" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Corrective Action Needed ?</label>
                    <div className="relative">
                        <select
                            name="correctiveAction"
                            value={formData.correctiveAction}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("correctiveAction")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        >
                            <option value="" disabled>Select Action</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform transition-transform duration-300
                            ${focusedDropdown === "correctiveAction" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>

                <div></div>
                

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

export default QmsAddInternalProblems;