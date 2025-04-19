import React, { useState } from 'react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg"
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QmsComposeSystemMessaging = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        attachment: null,
        message: '',
    });

    const [focusedDropdown, setFocusedDropdown] = useState(null);

    const handleInbox = () => {
        navigate('/company/qms/list-inbox')
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
        navigate('/company/qms/list-inbox')
    }; 
   

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Compose Message</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded w-[140px] h-[42px] list-training-btn duration-200"
                    onClick={handleInbox}
                >
                    Inbox
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5  ">
                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">To <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            name="to"
                            value={formData.to}
                            onChange={handleChange}
                            onFocus={() => setFocusedDropdown("to")}
                            onBlur={() => setFocusedDropdown(null)}
                            className="add-training-inputs appearance-none pr-10 cursor-pointer"
                        >
                            <option value="">Select User</option>
                            <option value="Internal">User 1</option>
                            <option value="External">user 2</option>
                        </select>
                        <ChevronDown
                            className={`absolute right-3 top-1/3 transform   transition-transform duration-300 
        ${focusedDropdown === "to" ? "rotate-180" : ""}`}
                            size={20}
                            color="#AAAAAA"
                        />
                    </div>
                </div>
                <div></div>

                
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                       Subject
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                        required
                    />
                </div>
              <div></div>
              <div className="flex flex-col gap-3">
                    <label className="add-training-label">Attach Document</label>
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

                <div></div>

                {/* Training Evaluation */}
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Message</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="add-training-inputs !h-[151px]"
                    />
                </div>
                <div></div>
               
                    <div className='flex gap-5'>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn duration-200 !w-full"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn duration-200 !w-full"
                        >
                            Save
                        </button>
                    </div>
                 
            </form>
        </div>
    );
};

export default QmsComposeSystemMessaging
