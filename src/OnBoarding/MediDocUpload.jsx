import React from "react";
import logo from "../../src/asset/imagesmy.png"
import { X } from "lucide-react";
const MediDocUpload = ({ rowData, onClose }) => {

    console.log("gtggggggggggggggggggggg",rowData);
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl font-serif rounded-lg shadow-xl overflow-y-auto max-h-[90vh] p-6">

   
        {/* Header */}
        <div className="border border-gray-400">
          
<div className="border-2 border-black mb-4 relative">

  {/* Top header row */}
  <div className="flex justify-between items-start">

    {/* LEFT SIDE (logo + text) */}
    <div className="flex items-stretch w-full">
      
      {/* Logo */}
      <div className="border-r-2 border-black px-3 py-2 flex items-center justify-center min-w-[80px]">
        <img
          src={logo}
          alt="My Home Group"
          className="w-18 h-18 object-contain"
        />
      </div>

      {/* Text Section */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-black px-3 py-1.5 text-center">
          <p className="text-sm font-bold tracking-wide">
            MY HOME CONSTRUCTIONS PVT. LTD.
          </p>
        </div>

        <div className="flex">
          <div className="flex-1 px-3 py-1.5 flex items-center justify-center border-r border-black">
            <p className="text-xs font-bold tracking-wider">
              Mediclaim Data Enrolment Form
            </p>
          </div>

          <div className="px-3 py-1.5 text-[10px] text-right min-w-[160px]">
            <p className="font-semibold">DIR No. ASDPL-HR-F31</p>
            <p>
              Date:{" "}
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p>Rev. Version 02</p>
          </div>
        </div>
      </div>
    </div>

    {/* RIGHT SIDE (close icon) */}
    <button
      onClick={onClose}
      className="mt-0 mr-0 p-0.5 rounded-md bg-white shadow hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
    >
      <X size={15} />
    </button>

  </div>
</div>

        <table className="w-full text-xs border-collapse">
  <tbody>
    {[
   {
  label: "Name of the employee",
  value:
    rowData?.employee_name?.toUpperCase() 
   
   
},
      {
        label: "Emp. ID",
        value: rowData?.child_caseid || rowData?.CHILD_CASEID,
      },
      {
        label: "Designation",
        value: rowData?.DESIG?.toUpperCase()
      },
      {
        label: "Department",
        value:  rowData?.fullData?.DEPT?.toUpperCase(),
      },
      {
        label: "Location",
        value:
          rowData?.fullData?.PLANT?.toUpperCase(),
 
      },
      {
        label: "Gender",
        value: rowData?.fullData?.GENDER?.toUpperCase(),
      },
    ].map((item, index) => (
      <tr key={index} className="border-t border-gray-400">
        <td className="border-r border-gray-400 w-10 p-2 text-center">
          {index + 1}
        </td>

        <td className="border-r border-gray-400 p-2 w-1/3">
          {item.label}
        </td>

        <td className="p-2 font-semibold">
          {item.value || "-"}
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>

        {/* Family Details Section */}
        <div className="border border-gray-400 mt-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="border-r border-gray-400 p-2">Emp Name</th>
                <th className="border-r border-gray-400 p-2">Spouse Name</th>
                <th className="border-r border-gray-400 p-2">Son/Daughter</th>
                <th className="p-2">Son/Daughter</th>
              </tr>
            </thead>

            <tbody>
              {/* Name Row */}
              <tr className="border-t border-gray-400">
                {[1, 2, 3, 4].map((_, i) => (
                  <td key={i} className="border-r border-gray-400 p-2">
                    <div className="bg-gray-200 h-6 rounded-full"></div>
                  </td>
                ))}
              </tr>

              {/* Photo Row */}
              <tr className="border-t border-gray-400">
                {[1, 2, 3, 4].map((_, i) => (
                  <td key={i} className="border-r border-gray-400 p-6 text-center">
                    <p className="text-gray-600">
                      Paste Photo here <br />
                      (passport size / stamp size)
                    </p>
                  </td>
                ))}
              </tr>

              {/* Date of Birth Row */}
              <tr className="border-t border-gray-400">
                {[1, 2, 3, 4].map((_, i) => (
                  <td key={i} className="border-r border-gray-400 p-2">
                    <p className="text-xs mb-1">Date of Birth</p>
                    <div className="bg-gray-200 h-6 rounded-full"></div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="text-xs mt-6 space-y-1">
          <p>A. Write the names in BLOCK LETTERS in the box.</p>
          <p>B. Date of birth should be in the (DD/MM/YYYY) format</p>
          <p>C. In case of un-married self only applicable</p>
        </div>

        {/* Declaration */}
        <div className="text-xs mt-4">
          <p>
            I hereby declare that the particulars stated above are true to best
            of my knowledge.
          </p>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between items-center mt-8 text-xs">
          <div>
            <div className=" h-6 w-40  mb-1"></div>
              <span className="text-blue-700">{ rowData?.employee_name}</span>
            <p>Employee Signature</p>
          
            
          </div>

          <div>
            <p className="font-semibold">HR Dept.</p>
          </div>

      <div className="flex items-center gap-3">
  <div className=" h-6 w-36"></div>
 <p className="text-xs">Date</p>
  <span className="text-blue-700 text-sm font-medium">
    {new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}
  </span>

 
</div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default MediDocUpload;