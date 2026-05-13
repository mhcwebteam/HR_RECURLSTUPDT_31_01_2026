import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import logo from "../../src/asset/imagesmy.png";


const JoiningReportForm = ({ rowData, onClose }) => {
  

  if (!rowData) return null;

  const joiningDate = rowData.joining_date
    ? new Date(rowData.joining_date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '';
const today = new Date().toLocaleDateString('en-IN', {
  day: '2-digit', month: 'long', year: 'numeric'
});
  
  const InputField = ({ defaultValue = '', width = '130px', readOnly = false }) => (
  <input
    type="text"
    defaultValue={defaultValue}
    readOnly={readOnly}
    style={{ width }}
    className={`inline-block border-b border-black bg-transparent outline-none text-center text-blue-700 font-semibold text-xs px-1 mx-1 ${readOnly ? 'cursor-default' : ''}`}
  />
);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto relative">

        {/* Floating Buttons - top right */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
         
          <button
            onClick={onClose}
            className="p-0.5 rounded-lg bg-white shadow hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Letter */}
        <div  className="px-8 py-6 font-serif text-black text-sm">

          {/* Company Header */}
          <div className="border-2 border-black mb-4">
            <div className="flex items-stretch">
             <div className="border-r-2 border-black px-3 py-2 flex items-center justify-center min-w-[80px]">
  <img
  src={logo}
  alt="My Home Group"
  className="w-18 h-18 object-contain"
/>
</div>
              <div className="flex-1 flex flex-col">
                <div className="border-b border-black px-3 py-1.5 text-center">
                  <p className="text-sm font-bold tracking-wide">MY HOME CONSTRUCTIONS PVT. LTD.</p>
                </div>
                <div className="flex">
                  <div className="flex-1 px-3 py-1.5 flex items-center justify-center border-r border-black">
                    <p className="text-xs font-bold tracking-wider">Joining Report</p>
                  </div>
                  <div className="px-3 py-1.5 text-[10px] text-right min-w-[160px]">
                    <p className="font-semibold">DIR No. ASDPL-HR-F31</p>
                  <p>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p>Rev. Version 02</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* To */}
          <div className="mb-4 text-xs leading-6">
            <p>To</p>
            <p className="ml-4">The Human Resource Management,</p>
            <p className="ml-4">My Home Constructions Pvt. Ltd.,</p>
            <p className="ml-4">Hyderabad.</p>
          </div>

          {/* Subject */}
          <div className="mb-4 text-center">
            <p className="text-sm font-bold underline tracking-wide">JOINING REPORT</p>
          </div>

          {/* Salutation */}
          <div className="mb-3 text-xs">
            <p>Sir,</p>
          </div>

          {/* Body */}
          <div className="mb-6 text-xs leading-8">
  <p>
    With reference to your offer letter No
    <InputField defaultValue={rowData.CHILD_CASEID} width="120px" readOnly />
    dated
    <InputField defaultValue={joiningDate} width="120px" readOnly />
    I Mr. / Ms.
    <InputField defaultValue={rowData.employee_name} width="150px" readOnly />
    joining with our

    organization on
    <InputField defaultValue={today} width="120px" readOnly />
    at
    <InputField defaultValue={rowData.location} width="100px" readOnly />

   
    as
    <InputField defaultValue={rowData.department} width="170px" readOnly />
  </p>
</div>

          {/* Body Paragraph */}
          <div className="mb-8 text-xs leading-7 text-justify">
            <p>
              I shall be thankful to the Management for providing me an opportunity to serve the
              Organization and will discharge my duties to the utmost satisfaction of the Management.
            </p>
          </div>

          {/* Signature */}
         <div className="flex justify-end text-xs">
            <div className="text-center min-w-[180px]">
              <p>Thanking you,</p>
              <p>Yours sincerely</p>
             
              <p className="text-[12px] text-blue-800 mt-2">{rowData.employee_name || 'Sign'}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JoiningReportForm;