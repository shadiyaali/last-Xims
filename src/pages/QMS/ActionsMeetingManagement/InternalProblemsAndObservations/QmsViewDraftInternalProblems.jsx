import React, { useState } from "react";
import { X } from "lucide-react";
import edits from "../../../../assets/images/Company Documentation/edit.svg";
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from "react-router-dom";

const QmsViewDraftInternalProblems = () => {
 const [formData, setFormData] = useState({
         cause: "Anonymous",
         description: "Anonymous",
         action: "Anonymous",
         executor: "Anonymous",
         solve: "Yes",
         dateProblem: "15-04-2025",
         correctiveAction: "Yes",
     });
     const navigate = useNavigate();
 
     const handleClose = () => {
         navigate("/company/qms/draft-internal-problems-observations");
     };
 
 
     return (
         <div className="bg-[#1C1C24] text-white rounded-lg p-5">
             <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                 <h2 className="view-employee-head">Internal Problems and Observations Information</h2>
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
                             Select Causes / Root Cause
                         </label>
                         <div className="view-employee-data">{formData.cause}</div>
                     </div>
 
                     <div>
                         <label className="block view-employee-label mb-[6px]">
                             Problem/ Observation Description
                         </label>
                         <div className="view-employee-data">{formData.description}</div>
                     </div>
 
                     <div>
                         <label className="block view-employee-label mb-[6px]">
                             Immediate Action Taken
                         </label>
                         <div className="view-employee-data">{formData.action}</div>
                     </div>
                     <div>
                         <label className="block view-employee-label mb-[6px]">
                             Executor
                         </label>
                         <div className="view-employee-data">{formData.executor}</div>
                     </div>
                     <div>
                         <label className="block view-employee-label mb-[6px]">
                             Solved After Action?
                         </label>
                         <div className="view-employee-data">{formData.solve}</div>
                     </div>
                     <div>
                         <label className="block view-employee-label mb-[6px]">
                             Date Problem
                         </label>
                         <div className="view-employee-data">{formData.dateProblem}</div>
                     </div>
                     <div>
                         <label className="block view-employee-label mb-[6px]">
                             Corrective Action Needed ?
                         </label>
                         <div className="view-employee-data">{formData.correctiveAction}</div>
                     </div>
                 </div>
             </div>
         </div>
     );
 };
 
export default QmsViewDraftInternalProblems