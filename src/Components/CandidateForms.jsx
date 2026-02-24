import React, { useState ,useMemo, useEffect} from 'react';
import RecruitmentForm from '../RecruitmentProcess/RecruitmentForm'; 
import CandidateStackup from './CandidateStackup'; 
import CandidateApproval from './CandidateApproval'; 
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../Config/Config';



const CandidateForms = () => {
    // const { case_Id } = useParams(); 


  const [selectedForm, setSelectedForm] = useState(null);

  const [stages, setStages] = useState({});

 


  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};



// const stageData = stages?.getCandidStageData?.[0] || {};




const stageData = stages?.getCandidStageData?.find(
  (item) => item?.CaseId == userToken?.Emp_Id
) || {};









const isDocUploadDisabled = stageData.candidStage1 == "1";
const isStackupDisabled = stageData.candidStage2 == "1";
const isOfferDisabled = stageData.candidStage3 == "1";


const isAnyFormSelected = Boolean(selectedForm);




  const AllStages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/candGetStages`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${userToken?.token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      setStages(response.data); // This will trigger re-render and recalculate stageData
    } catch (err) {
      console.error("Error In Getting Candidate Stage Data:", err);
    }
  };

  useEffect(() => {
    if (userToken?.token) {
      AllStages();
    }
  }, [userToken?.token]);


  const handleFormClick = (formType, color) => {
    setSelectedForm({ type: formType, color: color });
  };

  return (
    <div style={{ background: '#fff', paddingLeft: '5px', overflow: 'hidden' }}>
      <div style={{ width: '100%', padding: '4px 4px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{
            background: 'linear-gradient(to right, #faf5ff, #ffffff)',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e9d5ff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#49225b',
              margin: 0
            }}>
              Candidate Access Forms
            </h1>
          </div>
        </div>

        {/* 4 Form Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px',
          marginBottom: '10px'
        }}>
          {/* Candidate Doc Upload */}
<FormTile
  title="Candidate Doc Upload"
  icon="📤"
  color="blue"
  isSelected={selectedForm?.type == 'Candidate Doc Upload'}
  onClick={
    !isDocUploadDisabled
      ? () => handleFormClick('Candidate Doc Upload', 'blue')
      : undefined
  }
  disabled={isDocUploadDisabled}
/>



          {/* Candidate Stackup Approval */}
    <FormTile
  title="Candidate Stackup Approval"
  icon="✅"
  color="purple"
  isSelected={selectedForm?.type === 'Candidate Stackup Approval'}
  onClick={
    !isStackupDisabled
      ? () => handleFormClick('Candidate Stackup Approval', 'purple')
      : undefined
  }
  disabled={isStackupDisabled}
/>

        

          {/* Candidate Offer Approval */}
  <FormTile
  title="Candidate Offer Approval"
  icon="💼"
  color="emerald"
  isSelected={selectedForm?.type === 'Candidate Offer Approval'}
  onClick={
    !isOfferDisabled
      ? () => handleFormClick('Candidate Offer Approval', 'emerald')
      : undefined
  }
  disabled={isOfferDisabled}
/>

          {/* Candidate Form */}
          <FormTile
            title="Candidate Form"
            icon="📋"
            color="orange"
            isSelected={selectedForm?.type === 'Candidate Form'}
            onClick={() => handleFormClick('Candidate Form', 'orange')}
          />
        </div>

      {/* Candidate Doc Upload */}
{selectedForm?.type === 'Candidate Doc Upload' && (
  <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
    <RecruitmentForm />
  </div>
)}

{/* Candidate Stackup Approval */}
{selectedForm?.type === 'Candidate Stackup Approval' && (
  <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
    <CandidateStackup  token={userToken?.token} /> 
  </div>
)}

{/* Candidate offer Approval */}
{selectedForm?.type === 'Candidate Offer Approval' && (
  <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
    <CandidateApproval />
  </div>
)}


      </div>
    </div>
  );
};

const FormTile = ({ title, icon, color, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: {
      bgGradient: 'linear-gradient(to bottom right, #eff6ff, #dbeafe, #eff6ff)',
      text: '#1e40af',
      iconBg: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)',
      border: '#dbeafe',
      hoverBorder: '#60a5fa',
      selectedBorder: '#2563eb',
      hoverShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)'
    },
    purple: {
      bgGradient: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff, #faf5ff)',
      text: '#7c3aed',
      iconBg: 'linear-gradient(to bottom right, #f3e8ff, #e9d5ff)',
      border: '#f3e8ff',
      hoverBorder: '#a855f7',
      selectedBorder: '#7c3aed',
      hoverShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.3)'
    },
    emerald: {
      bgGradient: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5, #ecfdf5)',
      text: '#047857',
      iconBg: 'linear-gradient(to bottom right, #d1fae5, #a7f3d0)',
      border: '#d1fae5',
      hoverBorder: '#34d399',
      selectedBorder: '#059669',
      hoverShadow: '0 20px 25px -5px rgba(52, 211, 153, 0.3)'
    },
    orange: {
      bgGradient: 'linear-gradient(to bottom right, #fff7ed, #fed7aa, #fff7ed)',
      text: '#c2410c',
      iconBg: 'linear-gradient(to bottom right, #fed7aa, #fdba74)',
      border: '#fed7aa',
      hoverBorder: '#f97316',
      selectedBorder: '#ea580c',
      hoverShadow: '0 20px 25px -5px rgba(249, 115, 22, 0.3)'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: colors.bgGradient,
        borderRadius: '10px',
        padding: '8px',
        border: `3px solid ${isSelected ? colors.selectedBorder : (isHovered ? colors.hoverBorder : colors.border)}`,
        boxShadow: isSelected || isHovered ? colors.hoverShadow : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        transform: isSelected ? 'translateY(-2px) scale(1.02)' : (isHovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)'),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Button (60%) and Icon (40%) */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: '6px',
        width: '100%'
      }}>
        <div style={{
          background: colors.iconBg,
          borderRadius: '6px',
          padding: '8px 6px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          flex: '0 0 60%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: colors.text,
            margin: 0
          }}>
            {title}
          </p>
        </div>
        <div style={{
          background: colors.iconBg,
          borderRadius: '6px',
          padding: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          flex: '0 0 40%',
          fontSize: '24px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const FormDisplay = ({ formType, color }) => {
  const colorClasses = {
    blue: {
      bgGradient: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
      border: '#60a5fa',
      text: '#1e40af'
    },
    purple: {
      bgGradient: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)',
      border: '#a855f7',
      text: '#7c3aed'
    },
    emerald: {
      bgGradient: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)',
      border: '#34d399',
      text: '#047857'
    },
    orange: {
      bgGradient: 'linear-gradient(to bottom right, #fff7ed, #fed7aa)',
      border: '#f97316',
      text: '#c2410c'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div style={{
      background: colors.bgGradient,
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '20px',
      marginTop: '10px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: '15px',
        borderBottom: `2px solid ${colors.border}`,
        paddingBottom: '10px'
      }}>
        {formType}
      </h2>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '15px',
        minHeight: '200px'
      }}>
        <p style={{ color: '#4b5563', margin: 0 }}>
          Form content for <strong>{formType}</strong> will be displayed here.
        </p>
     
      </div>
    </div>
  );
};

export default CandidateForms;


// import React, { useState, useMemo } from 'react';
// import RecruitmentForm from '../RecruitmentProcess/RecruitmentForm';
// import CandidateStackup from './CandidateStackup';
// import CandidateApproval from './CandidateApproval';
// import { useParams } from 'react-router-dom';
// import { UserCheck } from "lucide-react";

// const CandidateForms = () => {


//   const [selectedForm, setSelectedForm] = useState(null);

//   const [stages, setStages] = useState({});

 


//   const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};


//   const stageData = stages?.getCandidStageData?.find(
//   (item) => item?.CaseId == userToken?.Emp_Id
// ) || {};


// const isDocUploadDisabled = stageData.candidStage1 == "1";
// const isStackupDisabled = stageData.candidStage2 == "1";
// const isOfferDisabled = stageData.candidStage3 == "1";


//   const handleFormClick = (formType, color) => {
//     setSelectedForm({ type: formType, color: color });
//   };

// console.log(stageData,"rttttttttttt");


//   return (
//     <div style={{ background: '#fff', paddingLeft: '5px', overflow: 'hidden' }}>
//       <div style={{ width: '100%', padding: '4px 4px' }}>
//         {/* Header Section */}
//         <div style={{ marginBottom: '6px' }}>
//           <div style={{
//             background: 'linear-gradient(to right, #faf5ff, #ffffff)',
//             borderRadius: '8px',
//             padding: '10px',
//             boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
//             border: '1px solid #e9d5ff',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             width: '100%'
//           }}>
//             <h1 style={{
//               fontSize: '18px',
//               fontWeight: 'bold',
//               color: '#49225b',
//               margin: 0,
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}>
//               <UserCheck size={20} strokeWidth={2} color="#49225b" />
//               Candidate Access Forms
//             </h1>
//           </div>
//         </div>

//         {/* 4 Form Tiles */}
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//           gap: '12px',
//           marginBottom: '10px'
//         }}>
//           {/* Candidate Doc Upload — changed from blue to teal */}
//    <FormTile
//   title="Candidate Doc Upload"
//   icon="📤"
//   color="blue"
//   isSelected={selectedForm?.type == 'Candidate Doc Upload'}
//   onClick={
//     !isDocUploadDisabled
//       ? () => handleFormClick('Candidate Doc Upload', 'blue')
//       : undefined
//   }
//   disabled={isDocUploadDisabled}
// />

//           {/* Candidate Stackup Approval */}
//        <FormTile
//   title="Candidate Stackup Approval"
//   icon="✅"
//   color="purple"
//   isSelected={selectedForm?.type === 'Candidate Stackup Approval'}
//   onClick={
//     !isStackupDisabled
//       ? () => handleFormClick('Candidate Stackup Approval', 'purple')
//       : undefined
//   }
//   disabled={isStackupDisabled}
// />

//           {/* Candidate Offer Approval */}
//         <FormTile
//   title="Candidate Offer Approval"
//   icon="💼"
//   color="emerald"
//   isSelected={selectedForm?.type === 'Candidate Offer Approval'}
//   onClick={
//     !isOfferDisabled
//       ? () => handleFormClick('Candidate Offer Approval', 'emerald')
//       : undefined
//   }
//   disabled={isOfferDisabled}
// />

//           {/* Candidate Form — 4th tile now active */}
//           {/* <FormTile
//             title="Candidate Form"
//             icon="📋"
//             color="orange"
//             isSelected={selectedForm?.type === 'Candidate Form'}
//             onClick={() => handleFormClick('Candidate Form', 'orange')}
//           /> */}
//         </div>

//         {/* Candidate Doc Upload */}
//         {selectedForm?.type === 'Candidate Doc Upload' && (
//           <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
//             <RecruitmentForm />
//           </div>
//         )}

//         {/* Candidate Stackup Approval */}
//         {selectedForm?.type === 'Candidate Stackup Approval' && (
//           <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
//             <CandidateStackup />
//           </div>
//         )}

//         {/* Candidate Offer Approval */}
//         {selectedForm?.type === 'Candidate Offer Approval' && (
//           <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
//             <CandidateApproval />
//           </div>
//         )}

//         {/* Candidate Form — 4th tile content */}
//         {/* {selectedForm?.type === 'Candidate Form' && (
//           <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
//             {/* Replace below with your actual CandidateForm component */}
//             {/* <div style={{
//               background: 'linear-gradient(to bottom right, #fff7ed, #fed7aa)',
//               border: '2px solid #f97316',
//               borderRadius: '12px',
//               padding: '20px',
//               boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
//             }}>
//               <h2 style={{ color: '#c2410c', marginBottom: '12px', borderBottom: '2px solid #f97316', paddingBottom: '8px' }}>
//                 Candidate Form
//               </h2>
//               <div style={{ background: '#fff', borderRadius: '8px', padding: '15px', minHeight: '200px' }}>
//                 <p style={{ color: '#4b5563', margin: 0 }}>
//                   Candidate Form content goes here.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )} */} 
//       </div>
//     </div>
//   );
// };

// const FormTile = ({ title, icon, color, isSelected, onClick }) => {
//   const [isHovered, setIsHovered] = useState(false);

//   const colorClasses = {
//     teal: {
//       bgGradient: 'linear-gradient(to bottom right, #ffffff, #f8f8f8, #fcfcfc)',
//       text: '#3730a3',
//       iconBg: 'linear-gradient(to bottom right, #e0e7ff, #c7d2fe)',
//       border: '#e0e7ff',
//       hoverBorder: '#6366f1',
//       selectedBorder: '#4338ca',
//       hoverShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.3)',
//       innerBorder: '#aaabd7'
//     },
//     purple: {
//       bgGradient: 'linear-gradient(to bottom right, #ffffff, #f8f8f8, #fcfcfc)',
//       text: '#7c3aed',
//       iconBg: 'linear-gradient(to bottom right, #f3e8ff, #e9d5ff)',
//       border: '#f3e8ff',
//       hoverBorder: '#a855f7',
//       selectedBorder: '#7c3aed',
//       hoverShadow: '0 20px 25px -5px rgba(168, 85, 247, 0.3)',
//       innerBorder: '#c197e8'
//     },
//     emerald: {
//       bgGradient: 'linear-gradient(to bottom right, #ffffff, #f8f8f8, #fcfcfc)',
//       text: '#047857',
//       iconBg: 'linear-gradient(to bottom right, #d1fae5, #a7f3d0)',
//       border: '#d1fae5',
//       hoverBorder: '#34d399',
//       selectedBorder: '#059669',
//       hoverShadow: '0 20px 25px -5px rgba(52, 211, 153, 0.3)',
//       innerBorder: '#70e7bf'
//     },
//     // orange: {
//     //   bgGradient: 'linear-gradient(to bottom right, #ffffff, #f8f8f8, #fcfcfc)',
//     //   text: '#c2410c',
//     //   iconBg: 'linear-gradient(to bottom right, #fed7aa, #fdba74)',
//     //   border: '#fed7aa',
//     //   hoverBorder: '#f97316',
//     //   selectedBorder: '#ea580c',
//     //   hoverShadow: '0 20px 25px -5px rgba(249, 115, 22, 0.3)',
//     //   innerBorder: '#f97316'
//     // }
//   };

//   const colors = colorClasses[color] || colorClasses.teal;

//  return (
//     <div
//       onClick={onClick}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       style={{
//         background: colors.bgGradient,
//         borderRadius: '10px',
//         padding: '8px',
//         border: `3px solid ${isSelected ? colors.selectedBorder : (isHovered ? colors.hoverBorder : colors.border)}`,
//         boxShadow: isSelected || isHovered ? colors.hoverShadow : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//         transition: 'all 0.3s ease',
//         transform: isSelected ? 'translateY(-2px) scale(1.02)' : (isHovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)'),
//         cursor: 'pointer',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center'
//       }}
//     >
//       {/* Button (60%) and Icon (40%) */}
//     <div style={{
//   background: colors.iconBg,
//   borderRadius: '6px',
//   padding: '8px 12px',
//   boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
//   width: '100%',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   gap: '8px'
// }}>
//   <div style={{
//     fontSize: '20px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     color: colors.text
//   }}>
//     {icon}
//   </div>
//   <p style={{
//     fontSize: '13px',
//     fontWeight: 'bold',
//     color: colors.text,
//     margin: 0
//   }}>
//     {title}
//   </p>
// </div>
//     </div>
//   );
// };

// export default CandidateForms;


