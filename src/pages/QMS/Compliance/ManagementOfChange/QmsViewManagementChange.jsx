import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import edits from '../../../../assets/images/Company Documentation/edit.svg';
import deletes from '../../../../assets/images/Company Documentation/delete.svg';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const QmsViewManagementChange = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managementChange, setManagementChange] = useState({
    moc_title: '',
    moc_type: '',
    attach_document: '',
    purpose_of_chnage: '',
    potential_cosequences: '',
    moc_remarks: '',
    moc_no: '',
    date: '',
    related_record_format: '',
    resources_required: '',
    impact_on_process: '',
    rivision: '',
  });
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagementChangeData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/qms/changes-get/${id}/`);
        setManagementChange(response.data);
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

  const handleClose = () => {
    navigate('/company/qms/list-management-change');
  };

  const handleEdit = () => {
    navigate(`/company/qms/edit-management-change/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this management change record?")) {
      try {
        await axios.delete(`${BASE_URL}/qms/changes-get/${id}/`);
        navigate('/company/qms/list-management-change');
      } catch (err) {
        console.error("Error deleting management change:", err);
        alert("Failed to delete management change record");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="bg-[#1C1C24] text-white rounded-lg w-full p-5">
        <div className="flex justify-between items-center border-b border-[#383840] pb-5">
          <h2 className="training-info-head">Management of Change Information</h2>
          <button onClick={handleClose} className="text-white bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md">
            <X size={24} />
          </button>
        </div>

        <div className="pt-5 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-[40px] border-r border-[#383840]">
            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">MOC Name/Title</p>
              <p className="text-white view-training-data">{managementChange.moc_title}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">MOC Type</p>
              <p className="text-white view-training-data">{managementChange.moc_type}</p>
            </div>

            {managementChange.attach_document && (
              <div>
                <p className="text-[#AAAAAA] view-training-label mb-[6px]">Attach Document</p>
                <a 
                  href={managementChange.attach_document} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#1E84AF] flex items-center gap-2 click-view-file-btn !text-[18px]"
                >
                  Click to view file <Eye size={20} className='text-[#1E84AF]' />
                </a>
              </div>
            )}

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">Purpose of Change</p>
              <p className="text-white view-training-data">{managementChange.purpose_of_chnage}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">Potential Consequences of Change</p>
              <p className="text-white view-training-data">{managementChange.potential_cosequences}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">MOC Remarks</p>
              <p className="text-white view-training-data">{managementChange.moc_remarks}</p>
            </div>
          </div>

          <div className="space-y-[40px] ml-5">
            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">MOC Number</p>
              <p className="text-white view-training-data">{managementChange.moc_no}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">Date</p>
              <p className="text-white view-training-data">{formatDate(managementChange.date)}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">Related Record Format</p>
              <p className="text-white view-training-data">{managementChange.related_record_format}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">Resources Required</p>
              <p className="text-white view-training-data">{managementChange.resources_required}</p>
            </div>

            <div>
              <p className="text-[#AAAAAA] view-training-label mb-[6px]">Impact on Processes/Activity</p>
              <p className="text-white view-training-data">{managementChange.impact_on_process}</p>
            </div>

            <div className='flex justify-between'>
              <div>
                <p className="text-[#AAAAAA] view-training-label mb-[6px]">Revision</p>
                <p className="text-white view-training-data">{managementChange.rivision}</p>
              </div>
              <div className="flex gap-10">
                <button
                  onClick={handleEdit}
                  className="flex flex-col gap-2 items-center justify-center edit-btn"
                >
                  Edit
                  <img src={edits} alt="Edit Icon" className='w-[18px] h-[18px]' />
                </button>

                <button
                  onClick={handleDelete}
                  className="flex flex-col gap-2 items-center justify-center delete-btn"
                >
                  Delete
                  <img src={deletes} alt="Delete Icon" className='w-[18px] h-[18px]' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QmsViewManagementChange;