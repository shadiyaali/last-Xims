import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";


const QmsEditDraftAwarenessTraining = () => {
    const [formData, setFormData] = useState({
        title: "",
        category: "YouTube video",
        description: "",
        youtube_link: "",
        web_link: "",
        upload_file: null
      });
      
      const [selectedFile, setSelectedFile] = useState("");
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");
 
      const [errors, setErrors] = useState({});
      const [dropdownOpen, setDropdownOpen] = useState(false);
      
      const { id } = useParams();
      const navigate = useNavigate();
      
      const categories = [
        "YouTube video",
        "Presentation",
        "Web Link"
      ];
    
      useEffect(() => {
        const fetchAwarenessData = async () => {
          try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/qms/awareness-get/${id}/`);
            const data = response.data;
            
            setFormData({
              title: data.title || "",
              category: data.category || "YouTube video",
              description: data.description || "",
              youtube_link: data.youtube_link || "",
              web_link: data.web_link || "",
            });
    
            if (data.upload_file) {
              setSelectedFile(data.upload_file.split('/').pop());
            }
    
            setLoading(false);
          } catch (err) {
            setError("Failed to load awareness training data");
            setLoading(false);
            console.error("Error fetching awareness training data:", err);
          }
        };
    
        if (id) {
          fetchAwarenessData();
        }
      }, [id]);
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
    
        // Clear error when user starts typing
        if (errors[name]) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
          }));
        }
      };
    
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setFormData((prevData) => ({
            ...prevData,
            upload_file: file,
          }));
          setSelectedFile(file.name);
        }
      };
    
      const validateForm = () => {
        const newErrors = {};
      
        if (!formData.title.trim()) {
          newErrors.title = "Title is required";
        }
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
          return;
        }
    
        const submitData = new FormData();
        
        Object.keys(formData).forEach(key => {
          if (key === 'upload_file') {
            if (formData[key] && typeof formData[key] === 'object') {
              submitData.append(key, formData[key]);
            }
          } else if (formData[key] !== null && formData[key] !== undefined) {
            submitData.append(key, formData[key]);
          }
        });
        
        try {
          const response = await axios.put(`${BASE_URL}/qms/awareness/${id}/update/`, submitData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log("Awareness training updated successfully:", response.data);
     
          setTimeout(() => {
     
            navigate("/company/qms/list-awareness-training");
          }, 1500);
    
        } catch (err) {
          console.error("Error updating awareness training:", err);
          setError("Failed to update awareness training");
 
          setTimeout(() => {
      
          }, 3000);
        }
      };
    
      const handleListAwarenessTraining = () => {
        navigate("/company/qms/draft-awareness-training");
      };
    
      const handleCancel = () => {
        navigate("/company/qms/draft-awareness-training");
      };
    
      if (loading) {
        return <div className="text-white text-center p-5">Loading...</div>;
      }
    
      return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      
    
          <div className="flex justify-between items-center px-[104px] pb-5 border-b border-[#383840]">
            <h1 className="add-awareness-training-head">Edit Awareness Training</h1>
            <button
              className="border border-[#858585] text-[#858585] rounded px-[10px] h-[42px] w-[213px] list-training-btn duration-200"
              onClick={handleListAwarenessTraining}
            >
              List Awareness Training
            </button>
          </div>
    
          <form onSubmit={handleSubmit} className="px-[104px] pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block employee-performace-label">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full employee-performace-inputs"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
    
              <div>
                <label className="block employee-performace-label">
                  Choose Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      handleChange(e);
                      setDropdownOpen((prev) => !prev);
                      // Simulate the dropdown closing after selection
                      setTimeout(() => setDropdownOpen(false), 200);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setDropdownOpen(false)}
                    className="w-full employee-performace-inputs appearance-none cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ease-in-out ${
                        dropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
    
              <div>
                <label className="block employee-performace-label">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  className="w-full employee-performace-inputs !h-[84px]"
                />
              </div>
    
              {formData.category === "YouTube video" && (
                <div>
                  <label className="block employee-performace-label">
                    YouTube Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="youtube_link"
                    value={formData.youtube_link || ""}
                    onChange={handleChange}
                    className="w-full employee-performace-inputs"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {errors.youtube_link && <p className="text-red-500 text-sm mt-1">{errors.youtube_link}</p>}
                </div>
              )}
    
              {formData.category === "Web Link" && (
                <div>
                  <label className="block employee-performace-label">
                    Web Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="web_link"
                    value={formData.web_link || ""}
                    onChange={handleChange}
                    className="w-full employee-performace-inputs"
                    placeholder="https://..."
                  />
                  {errors.web_link && <p className="text-red-500 text-sm mt-1">{errors.web_link}</p>}
                </div>
              )}
    
              {formData.category === "Presentation" && (
                <div>
                  <label className="block employee-performace-label">
                    Upload Presentation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="upload_file"
                      name="upload_file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                    />
                    <label
                      htmlFor="upload_file"
                      className="w-full employee-performace-inputs flex items-center cursor-pointer"
                    >
                      <span className="truncate">
                        {selectedFile || "Choose file..."}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => document.getElementById('upload_file').click()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2C2C35] px-4 py-1 rounded"
                    >
                      Browse
                    </button>
                  </div>
                  {errors.upload_file && <p className="text-red-500 text-sm mt-1">{errors.upload_file}</p>}
                </div>
              )}
            </div>
    
            <div className="flex justify-end mt-8 gap-5">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn duration-200"
              >
                Cancel
              </button>
              <button type="submit" className="save-btn duration-200">
                Save
              </button>
            </div>
          </form>
        </div>
      );
    };

export default QmsEditDraftAwarenessTraining
