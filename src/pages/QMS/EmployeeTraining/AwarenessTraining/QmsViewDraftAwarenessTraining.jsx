import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";


const QmsViewDraftAwarenessTraining = () => {
    const [trainingData, setTrainingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
  
    useEffect(() => {
      const fetchTrainingData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${BASE_URL}/qms/awareness-get/${id}/`);
          setTrainingData(response.data);
          setError(null);
        } catch (err) {
          setError("Failed to load awareness training data");
          console.error("Error fetching awareness training data:", err);
        } finally {
          setLoading(false);
        }
      };
  
      if (id) {
        fetchTrainingData();
      }
    }, [id]);
  
    const handleClose = () => {
      navigate("/company/qms/draft-awareness-training");
    };
  
  
  
   
    const renderResourceContent = () => {
      if (!trainingData) return null;
  
      switch (trainingData.category) {
        case 'YouTube video':
          return (
            <div>
              <label className="block view-employee-label mb-[6px]">
                YouTube Link
              </label>
              <div className="view-employee-data">
                <a 
                  href={trainingData.youtube_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {trainingData.youtube_link}
                </a>
              </div>
            </div>
          );
        
        case 'Presentation':
          return (
            <div>
              <label className="block view-employee-label mb-[6px]">
                Presentation File
              </label>
              <div className="view-employee-data">
                {trainingData.upload_file ? (
                  <a 
                    href={trainingData.upload_file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View Presentation
                  </a>
                ) : (
                  <span className="text-gray-400">No file uploaded</span>
                )}
              </div>
            </div>
          );
        
        case 'Web Link':
          return (
            <div>
              <label className="block view-employee-label mb-[6px]">
                Web Link
              </label>
              <div className="view-employee-data">
                <a 
                  href={trainingData.web_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {trainingData.web_link}
                </a>
              </div>
            </div>
          );
        
        default:
          return (
            <div>
              <label className="block view-employee-label mb-[6px]">
                Resource
              </label>
              <div className="view-employee-data">N/A</div>
            </div>
          );
      }
    };
  
    if (loading) {
      return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
          Loading...
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
          {error}
        </div>
      );
    }
  
    if (!trainingData) {
      return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5 flex justify-center items-center h-64">
          Training item not found
        </div>
      );
    }
  
    return (
      <div className="bg-[#1C1C24] text-white rounded-lg p-5">
        <div className="flex justify-between items-center border-b border-[#383840] pb-5">
          <h2 className="view-employee-head">Awareness Training Information</h2>
          <button
            onClick={handleClose}
            className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
          >
            <X className="text-white" />
          </button>
        </div>
  
        <div className="p-5 relative">
          {/* Vertical divider line */}
          <div className="hidden md:block absolute top-[20px] bottom-[20px] left-1/2 border-l border-[#383840]"></div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
            <div>
              <label className="block view-employee-label mb-[6px]">
                Title
              </label>
              <div className="view-employee-data">{trainingData.title}</div>
            </div>
  
            <div>
              <label className="block view-employee-label mb-[6px]">
                Category
              </label>
              <div className="view-employee-data">{trainingData.category}</div>
            </div>
  
            <div>
              <label className="block view-employee-label mb-[6px]">
                Description
              </label>
              <div className="view-employee-data">{trainingData.description || 'N/A'}</div>
            </div>
  
            <div className="flex justify-between">
              {renderResourceContent()}
              
            
            </div>
          </div>
        </div>
      </div>
    );
  };

export default QmsViewDraftAwarenessTraining
