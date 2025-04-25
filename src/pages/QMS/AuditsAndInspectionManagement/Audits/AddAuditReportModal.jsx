import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import { useNavigate } from 'react-router-dom';


const AddAuditReportModal = ({
  isVisible,
  onClose,
  onSave,
  isExiting,
  isAnimating,
  selectedAudit // Add this prop
}) => {
  const [formData, setFormData] = useState({
    upload_audit_report: '',
    upload_non_coformities_report: '',
  });
  
  
  // State to store object URLs for previewing files
  const [fileURLs, setFileURLs] = useState({
    audit_report: '',
    non_conformities_report: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = new FormData();
      console.log("sssssssss",formData)
      
      if (formData.audit_report instanceof File) {
        submissionData.append('upload_audit_report', formData.audit_report);
      }
      
      if (formData.non_conformities_report instanceof File) {
        submissionData.append('upload_non_coformities_report', formData.non_conformities_report);
      }
      

      // Use selectedAudit.id instead of id from useParams
      if (!selectedAudit || !selectedAudit.id) {
        throw new Error('No audit selected or audit ID is missing');
      }

      const response = await axios.post(`${BASE_URL}/qms/audits/${selectedAudit.id}/upload-reports/`, submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Audit updated successfully:', response.data);
      onSave && onSave(response.data); // Call onSave if provided
      setTimeout(() => {
        navigate('/company/qms/list-audit');
      }, 1500);
    } catch (error) {
      console.error('Error updating audit:', error);
      setError('Failed to update audit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create and clean up object URLs when files change
  useEffect(() => {
    // Clean up previous URLs to prevent memory leaks
    return () => {
      if (fileURLs.audit_report) URL.revokeObjectURL(fileURLs.audit_report);
      if (fileURLs.non_conformities_report) URL.revokeObjectURL(fileURLs.non_conformities_report);
    };
  }, [fileURLs]);

  if (!isVisible) return null;

  const handleFileChange = (e, fieldName) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // Revoke previous URL if it exists
      if (fileURLs[fieldName]) {
        URL.revokeObjectURL(fileURLs[fieldName]);
      }

      // Create a new URL for the file
      const fileURL = URL.createObjectURL(selectedFile);

      setFormData({
        ...formData,
        [fieldName]: selectedFile
      });

      setFileURLs({
        ...fileURLs,
        [fieldName]: fileURL
      });
    }
  };

  // Function to handle clicking the view file button
  const handleViewFile = (fieldName, e) => {
    e.preventDefault();

    if (fileURLs[fieldName]) {
      window.open(fileURLs[fieldName], '_blank');
    }
  };

  // Function to truncate file name if it's too long
  const truncateFileName = (fileName, maxLength = 20) => {
    if (!fileName) return "";
    if (fileName.length <= maxLength) return fileName;

    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));

    // Keep the first (maxLength - 5) characters, add "..." and the extension
    return `${nameWithoutExtension.substring(0, maxLength - 5)}...${extension}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className={`absolute inset-0 bg-black transition-opacity ${isExiting ? 'bg-opacity-0' : 'bg-opacity-50'}`}
      ></div>
      <div className={`bg-[#1C1C24] rounded-lg shadow-xl relative w-[1014px] p-5 transform transition-all duration-300 ease-in-out ${isAnimating ? 'modal-enter' : ''} ${isExiting ? 'modal-exit' : ''}`}>
        <div className="flex justify-between items-center px-[102px] border-b border-[#383840] pt-5">
          <h3 className="list-awareness-training-head">Add Audit Report</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className='px-[102px] flex justify-between gap-5'>
            <div className="flex flex-col gap-3 mt-5 w-full">
              <label className="add-training-label">Upload Audit Report</label>
              <div className="flex">
                <input
                  type="file"
                  id="audit-report-upload"
                  onChange={(e) => handleFileChange(e, 'audit_report')}
                  className="hidden"
                />
                <label
                  htmlFor="audit-report-upload"
                  className="add-training-inputs w-full flex justify-between items-center cursor-pointer !bg-[#1C1C24] border !border-[#383840]"
                >
                  <span className="text-[#AAAAAA] choose-file">Choose File</span>
                  <img src={file} alt="" />
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <button
                  onClick={(e) => handleViewFile('audit_report', e)}
                  disabled={!fileURLs.audit_report}
                  className='flex items-center gap-2 click-view-file-btn text-[#1E84AF] cursor-pointer'
                >
                  Click to view file <Eye size={17} />
                </button>
                {formData.audit_report && (
                  <p className="no-file !text-white flex justify-end !mt-0" title={formData.audit_report.name}>
                    {truncateFileName(formData.audit_report.name)}
                  </p>
                )}
                {!formData.audit_report && (
                  <p className="no-file !text-white flex justify-end !mt-0">No file chosen</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-5 w-full">
              <label className="add-training-label">Upload Non Conformities Report</label>
              <div className="flex">
                <input
                  type="file"
                  id="non-conformities-upload"
                  onChange={(e) => handleFileChange(e, 'non_conformities_report')}
                  className="hidden"
                />
                <label
                  htmlFor="non-conformities-upload"
                  className="add-training-inputs w-full flex justify-between items-center cursor-pointer !bg-[#1C1C24] border !border-[#383840]"
                >
                  <span className="text-[#AAAAAA] choose-file">Choose File</span>
                  <img src={file} alt="" />
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <button
                  onClick={(e) => handleViewFile('non_conformities_report', e)}
                  disabled={!fileURLs.non_conformities_report}
                  className='flex items-center gap-2 click-view-file-btn text-[#1E84AF] cursor-pointer'
                >
                  Click to view file <Eye size={17} />
                </button>
                {formData.non_conformities_report && (
                  <p className="no-file !text-white flex justify-end !mt-0" title={formData.non_conformities_report.name}>
                    {truncateFileName(formData.non_conformities_report.name)}
                  </p>
                )}
                {!formData.non_conformities_report && (
                  <p className="no-file !text-white flex justify-end !mt-0">No file chosen</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 mt-3 text-center">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-5 mt-8 px-[102px]">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn duration-200"
              disabled={loading}
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
        </form>
      </div>
    </div>
  );
};

export default AddAuditReportModal;