import React, { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const QmsViewDraftManagementChange = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    moc_title: "",
    moc_type: "",
    attach_document: "",
    purpose_of_chnage: "",
    potential_cosequences: "",
    moc_remarks: "",
    moc_no: "",
    date: "",
    related_record_format: "",
    resources_required: "",
    impact_on_process: "",
    rivision: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/company/qms/draft-management-change");
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    // Fetch management change data when component mounts
    const fetchManagementChangeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/qms/changes-get/${id}/`);
        
        console.log("API Response:", response.data); // Debug log
        
        // Map API response to component state
        const data = response.data;
        setFormData({
          moc_title: data.moc_title || 'N/A',
          moc_type: data.moc_type || 'N/A',
          attach_document: data.attach_document || '',
          purpose_of_chnage: data.purpose_of_chnage || 'N/A',
          potential_cosequences: data.potential_cosequences || 'N/A',
          moc_remarks: data.moc_remarks || 'N/A',
          moc_no: data.moc_no || 'N/A',
          date: data.date ? formatDate(data.date) : 'N/A',
          related_record_format: data.related_record_format || 'N/A',
          resources_required: data.resources_required || 'N/A',
          impact_on_process: data.impact_on_process || 'N/A',
          rivision: data.rivision || 'N/A'
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load management change data");
        setLoading(false);
        console.error("Error fetching management change data:", err);
      }
    };

    if (id) {
      fetchManagementChangeData();
    }
  }, [id]);

  if (loading) {
    return <div className="text-white text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div>
      <div className="bg-[#1C1C24] text-white rounded-lg w-full p-5">
        <div className="flex justify-between items-center border-b border-[#383840] pb-5">
          <h2 className="training-info-head">
            Management of Change Information
          </h2>
          <button
            onClick={handleClose}
            className="text-white bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
          >
            <X size={24} />
          </button>
        </div>

        <div className="pt-5 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-[40px] border-r border-[#383840]">
            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                MOC Name/Title
              </p>
              <p className="text-white view-training-data">{formData.moc_title}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                MOC Type
              </p>
              <p className="text-white view-training-data">{formData.moc_type}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Attach Document
              </p>
              {formData.attach_document ? (
                <button className="text-[#1E84AF] flex items-center gap-2 click-view-file-btn !text-[18px]">
                  Click to view file <Eye size={20} className="text-[#1E84AF]" />
                </button>
              ) : (
                <p className="text-white view-training-data">No document attached</p>
              )}
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Purpose of Change
              </p>
              <p className="text-white view-training-data">
                {formData.purpose_of_chnage}
              </p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Potential Consequences of Change
              </p>
              <p className="text-white view-training-data">
                {formData.potential_cosequences}
              </p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                MOC Remarks{" "}
              </p>
              <p className="text-white view-training-data">
                {formData.moc_remarks}
              </p>
            </div>
          </div>

          <div className="space-y-[40px] ml-5">
            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                MOC Number
              </p>
              <p className="text-white view-training-data">{formData.moc_no}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Date
              </p>
              <p className="text-white view-training-data">{formData.date}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Related Record Format
              </p>
              <p className="text-white view-training-data">
                {formData.related_record_format}
              </p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Resources Required
              </p>
              <p className="text-white view-training-data">
                {formData.resources_required}
              </p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Impact on Processes/Activity{" "}
              </p>
              <p className="text-white view-training-data">{formData.impact_on_process}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">
                Revision
              </p>
              <p className="text-white view-training-data">
                {formData.rivision}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QmsViewDraftManagementChange;