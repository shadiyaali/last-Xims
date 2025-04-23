import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg";

const AddMinutesModal = ({ 
  isVisible, 
  selectedMeeting, 
  onClose, 
  onSave,
  isExiting,
  isAnimating
}) => {
  const [focusedDropdown, setFocusedDropdown] = useState(null);
  const [minutesData, setMinutesData] = useState({
    minutes: '',
    file: null, // Changed to null since we're storing actual file object
    fileNames: [], // Add this to store file names for display
    date: { day: '', month: '', year: '' },
    meetingType: '',
    venue: '',
    startTime: { hour: '', min: '' },
    endTime: { hour: '', min: '' }
  });

  // Populate form with meeting data when selectedMeeting changes
  useEffect(() => {
    if (selectedMeeting) {
      // Parse date if it exists
      const dateParts = selectedMeeting.date ? selectedMeeting.date.split('-') : ['', '', ''];
      const startTimeParts = selectedMeeting.start_time ? selectedMeeting.start_time.split(':') : ['', ''];
      const endTimeParts = selectedMeeting.end_time ? selectedMeeting.end_time.split(':') : ['', ''];

      setMinutesData(prev => ({
        ...prev,
        date: {
          day: dateParts[2] || '',
          month: dateParts[1] || '',
          year: dateParts[0] || ''
        },
        meetingType: selectedMeeting.meeting_type || '',
        venue: selectedMeeting.venue || '',
        startTime: { 
          hour: startTimeParts[0] || '', 
          min: startTimeParts[1] || '' 
        },
        endTime: { 
          hour: endTimeParts[0] || '', 
          min: endTimeParts[1] || '' 
        },
        minutes: selectedMeeting.minutes || ''
      }));
    }
  }, [selectedMeeting]);

  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      const value = i < 10 ? `0${i}` : `${i}`;
      options.push(<option key={i} value={value}>{value}</option>);
    }
    return options;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setMinutesData({
        ...minutesData,
        [parent]: {
          ...minutesData[parent],
          [child]: value
        }
      });
    } else {
      setMinutesData({
        ...minutesData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setMinutesData({
        ...minutesData,
        file: selectedFile,
        fileNames: [selectedFile.name]
      });
    }
  };

  const handleSave = () => {
 
    const formData = new FormData();
    formData.append('minutes', minutesData.minutes);
    
    if (minutesData.file) {
        formData.append('file', minutesData.file);
    }
    
    onSave(formData);
};

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`absolute inset-0 bg-black transition-opacity ${isExiting ? 'bg-opacity-0' : 'bg-opacity-50'}`}></div>
      <div className={`bg-[#1C1C24] rounded-lg shadow-xl relative w-[1014px] p-5 transform transition-all duration-300 ease-in-out ${isAnimating ? 'modal-enter' : ''} ${isExiting ? 'modal-exit' : ''}`}>
        <div className="flex justify-between items-center px-[102px] border-b border-[#383840] pt-5">
          <h3 className="list-awareness-training-head">Add Meeting Minutes</h3>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5 px-[102px]">
          {/* Date - Readonly */}
          <div className="flex flex-col gap-3">
            <label className="add-training-label">Date</label>
            <div className="grid grid-cols-3 gap-5">
              {/* Day */}
              <div className="relative">
                <select
                  name="date.day"
                  value={minutesData.date.day}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("date.day")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  disabled
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
                  value={minutesData.date.month}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("date.month")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  disabled
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
                  value={minutesData.date.year}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("date.year")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  disabled
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

          {/* Meeting Type - Readonly */}
          <div className="flex flex-col gap-3 relative">
            <label className="add-training-label">Meeting Type</label>
            <div className="relative">
              <select
                name="meetingType"
                value={minutesData.meetingType}
                onChange={handleChange}
                onFocus={() => setFocusedDropdown("meetingType")}
                onBlur={() => setFocusedDropdown(null)}
                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                disabled
              >
                <option value="">Select type</option>
                <option value="Normal">Normal</option>
                <option value="Specific">Specific</option>
              </select>
              <ChevronDown
                className={`absolute right-3 top-1/3 transform transition-transform duration-300 
                  ${focusedDropdown === "meetingType" ? "rotate-180" : ""}`}
                size={20}
                color="#AAAAAA"
              />
            </div>
          </div>

          {/* Venue - Readonly */}
          <div className="flex flex-col gap-3">
            <label className="add-training-label">Venue</label>
            <input
              type="text"
              name="venue"
              value={minutesData.venue}
              onChange={handleChange}
              className="add-training-inputs"
              disabled
            />
          </div>

          {/* Start Time - Readonly */}
          <div className="flex flex-col gap-3 w-2/3">
            <label className="add-training-label">Start</label>
            <div className="grid grid-cols-2 gap-5">
              <div className="relative">
                <select
                  name="startTime.hour"
                  value={minutesData.startTime.hour}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("startTime.hour")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  disabled
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
              <div className="relative">
                <select
                  name="startTime.min"
                  value={minutesData.startTime.min}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("startTime.min")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  disabled
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

          {/* End Time - Readonly */}
          <div className="flex flex-col gap-3 w-2/3">
            <label className="add-training-label">End</label>
            <div className="grid grid-cols-2 gap-5">
              <div className="relative">
                <select
                  name="endTime.hour"
                  value={minutesData.endTime.hour}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("endTime.hour")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  disabled
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
              <div className="relative">
                <select
                  name="endTime.min"
                  value={minutesData.endTime.min}
                  onChange={handleChange}
                  onFocus={() => setFocusedDropdown("endTime.min")}
                  onBlur={() => setFocusedDropdown(null)}
                  className="add-training-inputs appearance-none pr-10 cursor-pointer"
                  disabled
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

          {/* Minutes - Editable */}
          <div className="flex flex-col gap-3">
            <label className="add-training-label">Minutes</label>
            <textarea
              name="minutes"
              value={minutesData.minutes}
              onChange={handleChange}
              className="add-training-inputs focus:outline-none h-[100px]"
              required
            />
          </div>

          {/* Upload Attachments - Editable */}
          <div className="flex flex-col gap-3">
            <label className="add-training-label">Minutes Attached</label>
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
                <img src={file} alt="Upload file" />
              </label>
            </div>
            <p className="no-file text-[#AAAAAA] flex justify-end !mt-0">
              {minutesData.fileNames.length > 0
                ? minutesData.fileNames.join(', ')
                : 'No file chosen'}
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-3 justify-end">
            <div className='flex gap-5'>
              <button
                type="button"
                onClick={onClose}
                className="cancel-btn duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="save-btn duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMinutesModal;