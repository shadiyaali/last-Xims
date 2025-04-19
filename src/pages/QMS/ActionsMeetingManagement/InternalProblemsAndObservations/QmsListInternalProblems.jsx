import React, { useState } from 'react';
import { Search } from 'lucide-react';
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from 'react-router-dom';

const QmsListInternalProblems = () => {
    const initialData = [
        { id: 1, description: 'Anonymous', cause: 'Anonymous', car: '123', date_problem: '03-12-2024', status: 'Solved' },
        { id: 2, description: 'Anonymous', cause: 'Anonymous', car: '123', date_problem: '03-12-2024', status: 'Not Solved' },
        { id: 3, description: 'Anonymous', cause: 'Anonymous', car: '123', date_problem: '03-12-2024', status: 'Solved' },
    ];

    // State
    const [internalProblems, setInternalProblems] = useState(initialData);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        description: '',
        cause: '',
        date_problem: '',
        car: '',
        status: 'Solved'  // Default status set to 'Requested'
    });

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setSearchTerm(value); // Update searchTerm as well
        setCurrentPage(1);
    };


    // Pagination
    const itemsPerPage = 10;
    const totalItems = internalProblems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = internalProblems.slice(indexOfFirstItem, indexOfLastItem);

    // Search functionality
     
    const filteredTrainings = currentItems.filter(internalProblem =>
        internalProblem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internalProblem.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internalProblem.car.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add new  internalProblem
    const handleAddTraining = (e) => {
        e.preventDefault();
        const newTraining = {
            id: internalProblems.length + 1,
            ...formData
        };
        setInternalProblems([...internalProblems, newTraining]);
        setFormData({
            title: '',
            type: '',
            venue: '',
            datePlanned: '',
            status: 'Requested'
        });
        setShowAddModal(false);
    };

    const handleAddInternalProblems = () => {
        navigate('/company/qms/add-internal-problems-observations')
    }

    const handleDraftTraining = () => {
        navigate('/company/qms/draft- internalProblem')
    }

    const handleQmsViewTraining = () => {
        navigate('/company/qms/view- internalProblem')
    }

    const handleQmsEditTraining = () => {
        navigate('/company/qms/edit- internalProblem')
    }


    // Delete  internalProblem
    const handleDeleteTraining = (id) => {
        setInternalProblems(internalProblems.filter(internalProblem => internalProblem.id !== id));
    };

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-manual-head">Internal Problems and Observations</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="serach-input-manual focus:outline-none bg-transparent"
                        />
                        <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                            <Search size={18} />
                        </div>
                    </div>
                    <button
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white !w-[100px]"
                        onClick={handleDraftTraining}
                    >
                        <span>Drafts</span>

                    </button>
                    <button
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleAddInternalProblems}
                    >
                        <span>  Add Internal Problem/Observation</span>
                        <img src={plusIcon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className='bg-[#24242D]'>
                        <tr className="h-[48px]">
                            <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                            <th className="px-2 text-left add-manual-theads">Description</th>
                            <th className="px-2 text-left add-manual-theads">Cause</th>
                            <th className="px-2 text-left add-manual-theads">Date Problem</th>
                            <th className="px-2 text-left add-manual-theads">CAR</th>
                            <th className="px-2 text-center add-manual-theads">Status</th>
                            <th className="px-2 text-center add-manual-theads">View</th>
                            <th className="px-2 text-center add-manual-theads">Edit</th>
                            <th className="pr-2 text-center add-manual-theads">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrainings.map((internalProblem, index) => (
                            <tr key={internalProblem.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                <td className="pl-5 pr-2 add-manual-datas">{internalProblem.id}</td>
                                <td className="px-2 add-manual-datas">{internalProblem.description}</td>
                                <td className="px-2 add-manual-datas">{internalProblem.cause}</td>
                                <td className="px-2 add-manual-datas">{internalProblem.date_problem}</td>
                                <td className="px-2 add-manual-datas">{internalProblem.car}</td>
                                <td className="px-2 add-manual-datas !text-center">
                                    <span className={`inline-block rounded-[4px] px-[6px] py-[3px] text-xs ${internalProblem.status === 'Solved' ? 'bg-[#36DDAE11] text-[#36DDAE]' : 'bg-[#dd363611] text-[#dd3636]'
                                        }`}>
                                        {internalProblem.status}
                                    </span>
                                </td>
                                <td className="px-2 add-manual-datas !text-center">
                                    <button onClick={handleQmsViewTraining}>
                                        <img src={viewIcon} alt="View Icon" style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(32%) saturate(4%) hue-rotate(53deg) brightness(94%) contrast(86%)' }} />
                                    </button>
                                </td>
                                <td className="px-2 add-manual-datas !text-center">
                                    <button onClick={handleQmsEditTraining}>
                                        <img src={editIcon} alt="Edit Icon" />
                                    </button>
                                </td>
                                <td className="px-2 add-manual-datas !text-center">
                                    <button>
                                        <img src={deleteIcon} alt="Delete Icon" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 text-sm">
                <div className='text-white total-text'>Total-{totalItems}</div>
                <div className="flex items-center gap-5">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`${currentPage === number ? 'pagin-active' : 'pagin-inactive'
                                }`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QmsListInternalProblems
