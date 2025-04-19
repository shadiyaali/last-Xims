
import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import edits from '../../../../assets/images/Company Documentation/edit.svg';
import deletes from '../../../../assets/images/Company Documentation/delete.svg';
import "./qmsviewtraining.css";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";


const QmsViewDraftTraining = () => {
    const [training, setTraining] = useState({
        training_title: '',
        type_of_training: '',
        expected_results: '',
        actual_results: '',
        training_attendees: [],
        status: '',
        requested_by: null,
        date_planned: '',
        date_conducted: '',
        start_time: '',
        end_time: '',
        venue: '',
        attachment: null,
        training_evaluation: '',
        evaluation_date: '',
        evaluation_by: null,
        is_draft: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendees, setAttendees] = useState([]);

    const { id } = useParams(); // Get training ID from URL
    const navigate = useNavigate();

    // Format date to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    // Format time from HH:MM:SS to readable format
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        return `${hours} hour${hours !== '1' ? 's' : ''}, ${minutes} minute${minutes !== '1' ? 's' : ''}`;
    };

    useEffect(() => {
        // Fetch training data when component mounts
        const fetchTrainingData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/training-get/${id}/`);
                setTraining(response.data);
                setLoading(false);
                console.log("sssssssssssssss", response.data)
            } catch (err) {
                setError("Failed to load training data");
                setLoading(false);
                console.error("Error fetching training data:", err);
            }
        };

        if (id) {
            fetchTrainingData();
        }
    }, [id]);

    const handleClose = () => {
        navigate('/company/qms/draft-training');
    };

 

    return (
        <div>
            <div className="bg-[#1C1C24] text-white rounded-lg w-full p-5">
                <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                    <h2 className="training-info-head">Training Information</h2>
                    <button onClick={handleClose} className="text-white bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md">
                        <X size={24} />
                    </button>
                </div>

                <div className="pt-5 grid grid-cols-1 md:grid-cols-2">
                    <div className="space-y-[40px] border-r border-[#383840]">
                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Training Title</p>
                            <p className="text-white view-training-data">{training.training_title}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Expected Results</p>
                            <p className="text-white view-training-data">{training.expected_results || 'None specified'}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Training Attendees</p>
                            <p className="text-white view-training-data">
                                {training.training_attendees && training.training_attendees.length > 0 ?
                                    training.training_attendees.map(attendee =>
                                        `${attendee.first_name} ${attendee.last_name}`
                                    ).join(', ')
                                    : 'None specified'}
                            </p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Requested By</p>
                            <p className="text-white view-training-data">
                                {training.requested_by ?
                                    `${training.requested_by.first_name} ${training.requested_by.last_name}`
                                    : 'None specified'}
                            </p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Date Conducted</p>
                            <p className="text-white view-training-data">{formatDate(training.date_conducted)}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">End Time</p>
                            <p className="text-white view-training-data">{formatTime(training.end_time)}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Attachment</p>
                            {training.attachment ? (
                                <button
                                    onClick={() => window.open(training.attachment, '_blank')}
                                    className="text-[#1E84AF] flex items-center gap-2 click-view-file-btn !text-[18px]"
                                >
                                    Click to view file <Eye size={20} className='text-[#1E84AF]' />
                                </button>
                            ) : (
                                <p className="text-white view-training-data">No attachment</p>
                            )}
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Evaluation Date</p>
                            <p className="text-white view-training-data">{formatDate(training.evaluation_date) || 'Not evaluated yet'}</p>
                        </div>
                    </div>

                    <div className="space-y-[40px] ml-5">
                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Type of Training</p>
                            <p className="text-white view-training-data">{training.type_of_training}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Actual Results</p>
                            <p className="text-white view-training-data">{training.actual_results || 'None specified'}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Status</p>
                            <p className="text-white view-training-data">
                                <span className={`inline-block rounded-[4px] px-[6px] py-[3px] text-xs ${training.status === 'Completed' ? 'bg-[#36DDAE11] text-[#36DDAE]' : 'bg-[#ddd23611] text-[#ddd236]'
                                    }`}>
                                    {training.status}
                                </span>
                            </p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Date Planned</p>
                            <p className="text-white view-training-data">{formatDate(training.date_planned)}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Start Time</p>
                            <p className="text-white view-training-data">{formatTime(training.start_time)}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Venue</p>
                            <p className="text-white view-training-data">{training.venue}</p>
                        </div>

                        <div>
                            <p className="text-[#AAAAAA] view-training-label mb-[6px]">Training Evaluation</p>
                            <p className="text-white view-training-data">{training.training_evaluation || 'Not evaluated yet'}</p>
                        </div>

                        <div className='flex justify-between'>
                            <div>
                                <p className="text-[#AAAAAA] view-training-label mb-[6px]">Evaluation By</p>
                                <p className="text-white view-training-data">
                                    {training.evaluation_by ?
                                        `${training.evaluation_by.first_name} ${training.evaluation_by.last_name}`
                                        : 'None specified'}
                                </p>
                            </div>
                             
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default QmsViewDraftTraining
