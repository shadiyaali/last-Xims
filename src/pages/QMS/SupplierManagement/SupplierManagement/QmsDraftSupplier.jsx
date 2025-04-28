import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../../Utils/Config';

const QmsDraftSupplier = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const getUserCompanyId = () => {
        const role = localStorage.getItem("role");

        if (role === "company") {
            return localStorage.getItem("company_id");
        } else if (role === "user") {
            try {
                const userCompanyId = localStorage.getItem("user_company_id");
                return userCompanyId ? JSON.parse(userCompanyId) : null;
            } catch (e) {
                console.error("Error parsing user company ID:", e);
                return null;
            }
        }

        return null;
    };

    const companyId = getUserCompanyId();

    // Fetch suppliers data
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const companyId = getUserCompanyId();
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/suppliers-draft/${companyId}/`);
                const formattedData = response.data.map((supplier, index) => ({
                    id: index + 1,
                    supplier_id: supplier.id,
                    supplier_name: supplier.company_name || 'Anonymous',
                    product: supplier.qualified_to_supply || 'Anonymous',
                    date: supplier.approved_date || 'N/A',
                    status: supplier.status || 'Not Approved',
                    active: supplier.active === 'active'
                }));
                setSuppliers(formattedData);
                setError(null);
                console.log('suppliers', response);

            } catch (err) {
                setError('Failed to fetch suppliers data');
                console.error('Error fetching suppliers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, [companyId]);

    // Handle search
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };



    // Handle delete supplier
    const handleDeleteSupplier = async (supplierId) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await axios.delete(`${BASE_URL}/qms/suppliers/${supplierId}/`);
                setSuppliers(suppliers.filter(supplier => supplier.supplier_id !== supplierId));
            } catch (err) {
                console.error('Error deleting supplier:', err);
                alert('Failed to delete supplier');
            }
        }
    };

    // Navigation handlers
    const handleAddSupplier = () => {
        navigate('/company/qms/add-supplier');
    };

    const handleDraftSupplier = () => {
        navigate('/company/qms/draft-supplier');
    };

    const handleViewSupplier = (supplierId) => {
        navigate(`/company/qms/view-supplier/${supplierId}`);
    };

    const handleEditSupplier = (supplierId) => {
        navigate(`/company/qms/edit-supplier/${supplierId}`);
    };

    // Pagination
    const itemsPerPage = 10;
    const totalItems = suppliers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Search and filter
    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.product.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-[#36DDAE11] text-[#36DDAE]';
            case 'Not Approved':
                return 'bg-[#dd363611] text-[#dd3636]';
            case 'Provisional':
                return 'bg-[#f5a62311] text-[#f5a623]';
            default:
                return 'bg-[#36DDAE11] text-[#36DDAE]';
        }
    };

    // Pagination handlers
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    if (loading) return <div className="flex justify-center items-center h-64 text-white">Loading suppliers...</div>;
    if (error) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-manual-head">List Supplier</h1>
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
                        onClick={handleDraftSupplier}
                    >
                        <span>Drafts</span>
                    </button>
                    <button
                        className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleAddSupplier}
                    >
                        <span>Add Supplier</span>
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
                            <th className="px-2 text-left add-manual-theads">Supplier</th>
                            <th className="px-2 text-left add-manual-theads">Product / Service</th>
                            <th className="px-2 text-left add-manual-theads">Date</th>
                            <th className="px-2 text-left add-manual-theads">Action</th>
                            <th className="px-2 text-center add-manual-theads">View</th>
                            <th className="pr-2 text-center add-manual-theads">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((supplier, index) => (
                                <tr key={supplier.supplier_id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                    <td className="pl-5 pr-2 add-manual-datas">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-2 add-manual-datas">{supplier.supplier_name}</td>
                                    <td className="px-2 add-manual-datas">{supplier.product}</td>
                                    <td className="px-2 add-manual-datas">{supplier.date}</td>
                                    <td className="px-2 add-manual-datas !text-left text-[#1E84AF]">
                                        <button onClick={() => handleEditSupplier(supplier.supplier_id)}>
                                            Click to Continue
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleViewSupplier(supplier.supplier_id)}>
                                            <img src={viewIcon} alt="View Icon" style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(32%) saturate(4%) hue-rotate(53deg) brightness(94%) contrast(86%)' }} />
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleDeleteSupplier(supplier.supplier_id)}>
                                            <img src={deleteIcon} alt="Delete Icon" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-4">No suppliers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
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
                                className={`${currentPage === number ? 'pagin-active' : 'pagin-inactive'}`}
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
            )}
        </div>
    );
};
export default QmsDraftSupplier
