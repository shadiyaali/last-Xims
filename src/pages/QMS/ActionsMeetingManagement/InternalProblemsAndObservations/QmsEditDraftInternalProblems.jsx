import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import InternalProblemsModal from '../InternalProblemsModal';
import AddCarNumberModal from '../AddCarNumberModal';
import { BASE_URL } from "../../../../Utils/Config";

const QmsEditDraftInternalProblems = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isCauseModalOpen, setIsCauseModalOpen] = useState(false);
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [causes, setCauses] = useState([]);
    const [executors, setExecutors] = useState([]);
    const [carNumbers, setCarNumbers] = useState([]);
    const [focusedDropdown, setFocusedDropdown] = useState(null);
    
    // Separate state for date parts for easier handling
    const [dateObj, setDateObj] = useState({
        day: '',
        month: '',
        year: ''
    });
    
    const [formData, setFormData] = useState({
        cause: '',
        problem: '',
        immediate_action: '',
        executor: '',
        solve_after_action: '',
        date: '',
        corrective_action: '',
        correction: '',
        car_no: '',
    });

    const parseDateString = (dateString) => {
        if (!dateString) return { day: '', month: '', year: '' };
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { day: '', month: '', year: '' };
        
        return {
            day: String(date.getDate()).padStart(2, '0'),
            month: String(date.getMonth() + 1).padStart(2, '0'),
            year: String(date.getFullYear())
        };
    };

    // Format day, month, year into ISO date string
    const formatDateForSubmission = (day, month, year) => {
        if (!day || !month || !year) return null;
        return `${year}-${month}-${day}`;
    };

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

    // Fetch problem data and related dropdowns
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get company ID from local storage
                const companyId = getUserCompanyId();
                if (!companyId) {
                    setError('Company ID not found. Please log in again.');
                    return;
                }
                
                // Fetch problem data
                const problemResponse = await axios.get(`${BASE_URL}/qms/internal-problems/${id}/`);
                
                // Fetch causes
                const causesResponse = await axios.get(`${BASE_URL}/qms/cause/company/${companyId}/`);
                
                // Fetch executors (users)
                const executorsResponse = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);
             
                // Fetch CAR numbers if needed
                const carNumbersResponse = await axios.get(`${BASE_URL}/qms/car_no/company/${companyId}/`);
                
                // Set fetched data to state
                const problem = problemResponse.data;
                setCauses(causesResponse.data.results || causesResponse.data);
                setExecutors(executorsResponse.data.results || executorsResponse.data);
                setCarNumbers(carNumbersResponse.data.results || carNumbersResponse.data);
                
                // Parse date and set to dateObj state
                const parsedDate = parseDateString(problem.date);
                setDateObj(parsedDate);
                
                // Set form data based on fetched problem
                setFormData({
                    cause: problem.cause ? problem.cause.id : '',
                    problem: problem.problem || '',
                    immediate_action: problem.immediate_action || '',
                    executor: problem.executor ? problem.executor.id : '',
                    solve_after_action: problem.solve_after_action || '',
                    date: problem.date || '',
                    corrective_action: problem.corrective_action || '',
                    correction: problem.correction || '',
                    car_no: problem.car_no ? problem.car_no.id : '',
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load data. Please try again.');
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const handleListInternalProblems = () => {
        navigate('/company/qms/draft-internal-problem');
    };

    const handleOpenCauseModal = () => {
        setIsCauseModalOpen(true);
    };
    
    const handleOpenCarModal = () => {
        setIsCarModalOpen(true);
    };

    const handleCloseCauseModal = () => {
        setIsCauseModalOpen(false);
    };
    
    const handleCloseCarModal = () => {
        setIsCarModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle date inputs
        if (name.startsWith('date.')) {
            const datePart = name.split('.')[1];
            const newDateObj = { ...dateObj, [datePart]: value };
            setDateObj(newDateObj);
            
            // Update the ISO date string if all parts are filled
            if (newDateObj.day && newDateObj.month && newDateObj.year) {
                const formattedDate = formatDateForSubmission(
                    newDateObj.day, 
                    newDateObj.month, 
                    newDateObj.year
                );
                
                setFormData({
                    ...formData,
                    date: formattedDate
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleAddCause = (newCauses) => {
        setCauses([...causes, ...newCauses]);
    };

    const handleAddCar = (newCars) => {
        setCarNumbers([...carNumbers, ...newCars]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.put(`${BASE_URL}/qms/internal-problems/${id}/`, formData);
            navigate('/company/qms/draft-internal-problem');
        } catch (err) {
            console.error('Error updating internal problem:', err);
    
            if (err.response?.data?.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else {
                setError('Failed to update internal problem. Please try again.');
            }
    
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        navigate('/company/qms/draft-internal-problem');
    };

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
        return (
            <div className="bg-[#1C1C24] text-white p-5 rounded-lg min-h-[300px] flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {error && (
                <div className="bg-red-900/30 border border-red-500 text-white p-3 rounded mb-4 flex items-start gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}
            
            <InternalProblemsModal
                isOpen={isCauseModalOpen}
                onClose={handleCloseCauseModal}
                onAddCause={handleAddCause}
            />

            <AddCarNumberModal
                isOpen={isCarModalOpen}
                onClose={handleCloseCarModal}
                onAddCause={handleAddCar}
            />

            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Edit Internal Problems and Observations</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded px-3 h-[42px] list-training-btn duration-200"
                    onClick={handleListInternalProblems}
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
                            <option value="" disabled>Select Cause</option>
                            {causes.map(cause => (
                                <option key={cause.id} value={cause.id}>
                                    {cause.title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform transition-transform duration-300 
                            ${focusedDropdown === "cause" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                    <button
                        type="button"
                        className='flex justify-start add-training-label !text-[#1E84AF]'
                        onClick={handleOpenCauseModal}
                    >
                        Add Causes / Causes
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Problem/ Observation Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="problem"
                        value={formData.problem}
                        onChange={handleChange}
                        className="add-training-inputs !h-[152px]"
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Immediate Action Taken :</label>
                    <textarea
                        name="immediate_action"
                        value={formData.immediate_action}
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
                            {executors.map(user => (
                                <option key={user.id} value={user.id}>
                                    {`${user.first_name} ${user.last_name}`}
                                </option>
                            ))}
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
                            name="solve_after_action"
                            value={formData.solve_after_action}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("solve_after_action")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        >
                            <option value="" disabled>Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-[60%] transform transition-transform duration-300 
                            ${focusedDropdown === "solve_after_action" ? "rotate-180" : ""}`}
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
                                name="date.day"
                                value={dateObj.day}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("date.day")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>dd</option>
                                {generateOptions(1, 31)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "date.day" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
    
                        {/* Month */}
                        <div className="relative">
                            <select
                                name="date.month"
                                value={dateObj.month}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("date.month")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>mm</option>
                                {generateOptions(1, 12)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "date.month" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>
    
                        {/* Year */}
                        <div className="relative">
                            <select
                                name="date.year"
                                value={dateObj.year}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("date.year")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>yyyy</option>
                                {generateOptions(2023, 2030)}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                ${focusedDropdown === "date.year" ? "rotate-180" : ""}`}
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
                            name="corrective_action"
                            value={formData.corrective_action}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("corrective_action")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        >
                            <option value="" disabled>Select Action</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform transition-transform duration-300
                            ${focusedDropdown === "corrective_action" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>

                {/* Conditionally render Corrections and Number CAR fields */}
                {formData.corrective_action === 'Yes' && (
                    <>
                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">Corrections</label>
                            <input
                                type='text'
                                name="correction"
                                value={formData.correction}
                                onChange={handleChange}
                                className="add-training-inputs"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">Number CAR</label>
                            <div className="relative">
                                <select
                                    name="car_no"
                                    value={formData.car_no}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedDropdown("car_no")}
                                    onBlur={() => setFocusedDropdown(null)}
                                    className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                >
                                    <option value="" disabled>Select</option>
                                    {carNumbers.map(car => (
                                        <option key={car.id} value={car.id}>
                                            {car.action_no}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-1/3 transform transition-transform duration-300
                                    ${focusedDropdown === "car_no" ? "rotate-180" : ""}`}
                                    size={20}
                                    color="#AAAAAA"
                                />
                            </div>
                            <button
                                type="button"
                                className='flex justify-start add-training-label !text-[#1E84AF]'
                                onClick={handleOpenCarModal}
                            >
                                Add CAR Number
                            </button>
                        </div>
                    </>
                )}

                {/* Form Actions */}
                <div className="md:col-span-2 flex gap-4 justify-end">
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
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QmsEditDraftInternalProblems;