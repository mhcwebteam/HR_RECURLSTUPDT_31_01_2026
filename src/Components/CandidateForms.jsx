





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
    const [personalData, setPersonalData] = useState([]);
    const [isViewOnly, setIsViewOnly] = useState(false); // Add this state

    const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

    const EmpVerify = async () => {
        if (!userToken?.token) return;

        try {
            // Use the correct endpoint that returns ALL records (draft + submit)
            const response = await axios.get(
                `${API_BASE_URL}/emp-verify-drftdata`, // Changed from emp-verify-drftdata
                {
                    headers: { Authorization: `Bearer ${userToken.token}` },
                }
            );

            console.log("All records response:", response);

            if (response.data?.success && response.data?.data) {
                // Get all records
                const allRecords = response.data.data;


                console.log("alll recxxxxxxxxxxx", allRecords);
                
                if (allRecords.length > 0) {
              
                         const latestRecord = allRecords.sort((a, b) => 
                        new Date(b.created_at) - new Date(a.created_at)
                    )[0];

                    console.log("latest oneeeeeeeeeeeeeee",latestRecord);
                    
                    // Check if this is a submitted record
                    if (latestRecord.status?.toLowerCase() == "Pending") {

                      console.log("new");
                        setIsViewOnly(true); // Make form read-only for submitted data
                    } else {
                        setIsViewOnly(false);
                                console.log("new11111111"); // Allow editing for drafts
                    }
                    
                    // Filter submit records if needed for other purposes
                    const submitOnly = allRecords.filter(
                        (item) => item.status?.toLowerCase() == "submit"
                    );
                    
                    setPersonalData(submitOnly);
                    console.log("Filtered submit data:", submitOnly);
                }
            }
        } catch (err) {
            console.error("Error fetching verify data", err);
            setPersonalData([]);
        }
    };

    const stageData = stages?.getCandidStageData?.find(
        (item) => item?.CaseId == userToken?.Emp_Id
    ) || {};

    console.log(stageData,"yyyyyyyyyy4444444444444");

    const showDocUpload = stageData.candidStage1 == "0";
    const showStackup = stageData.candidStage2 == "0";

    
    const showOffer = stageData.candidStage3 == "0";

    console.log(showOffer,)
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
            setStages(response.data);
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
                    gridTemplateColumns: 'repeat(4,300px)',
                    gap: '12px',
                    marginBottom: '10px'
                }}>
                    { showDocUpload &&
                    <FormTile
                        title="Candidate Doc Upload"
                        icon="📤"
                        color="blue"
                        isSelected={selectedForm?.type === 'Candidate Doc Upload'}
                        onClick={() => {
                            console.log("Candidate Doc Upload clicked");
                            handleFormClick('Candidate Doc Upload', 'blue');
                            EmpVerify(); // Call EmpVerify when tile is clicked
                        }}
                    />
                    }
                    {/* Candidate Stackup Approval */}
                    {showStackup && (
                        <FormTile
                            title="Candidate Stackup Approval"
                            icon="✅"
                            color="purple"
                            isSelected={selectedForm?.type === "Candidate Stackup Approval"}
                            onClick={() => handleFormClick("Candidate Stackup Approval", "purple")}
                        />
                    )}

                    {/* Candidate Offer Approval */}
                    {showOffer && (
                        <FormTile
                            title="Candidate Offer Approval"
                            icon="💼"
                            color="emerald"
                            isSelected={selectedForm?.type === "Candidate Offer Approval"}
                            onClick={() => handleFormClick("Candidate Offer Approval", "emerald")}
                        />
                    )}
                </div>

                {/* Candidate Doc Upload - Pass isViewOnly prop to RecruitmentForm */}
                {selectedForm?.type === 'Candidate Doc Upload' && (
                    <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
                        <RecruitmentForm 
                            isViewOnly={isViewOnly} // Pass the view-only state
                            userToken={userToken}
                        />
                    </div>
                )}

                {/* Candidate Stackup Approval */}
          {/* Candidate Stackup Approval */}
{selectedForm?.type === 'Candidate Stackup Approval' && (
  <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
    <CandidateStackup token={userToken?.token} caseId={userToken?.Emp_Id} /> {/* ✅ ADD caseId */}
  </div>
)}


        {/* Candidate offer Approval */}
        {/* {selectedForm?.type === 'Candidate Offer Approval' && (
          <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
            <CandidateApproval />
          </div>
        )} */}
        {selectedForm?.type === 'Candidate Offer Approval' && (
  <div style={{ marginTop: '10px', animation: 'slideDown 0.3s ease-out' }}>
    <CandidateApproval caseId={userToken?.Emp_Id} /> {/* ✅ ADD caseId */}
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
               {/* Icon + Text in single div with divider */}
<div style={{
    background: colors.iconBg,
    borderRadius: '10px',
    padding: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    width: '100%',
  border: `1px solid ${colors.hoverBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0px'
}}>
    <span style={{
        fontSize: '24px',
        lineHeight: 1,
        flexShrink: 0
    }}>
        {icon}
    </span>

    {/* Divider line */}
   

    <p style={{
        fontSize: '13px',
        fontWeight: 'bold',
        color: colors.text,
        margin: 0,
        textAlign: 'center'
    }}>
        {title}
    </p>
</div>
            </div>
        </div>
    );
};

export default CandidateForms;


