



import React, { useState, useMemo, useEffect } from 'react';
import RecruitmentForm from '../RecruitmentProcess/RecruitmentForm'; 
import CandidateStackup from './CandidateStackup'; 
import CandidateApproval from './CandidateApproval'; 
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../Config/Config';
import axiosInstance from '../Config/axiosConfig';

const CandidateForms = () => {
    const [selectedForm, setSelectedForm] = useState(null);
    const [stages, setStages] = useState({});
    const [personalData, setPersonalData] = useState([]);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

    // Track window width for responsive design
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const EmpVerify = async () => {
        if (!userToken?.token) return;

        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/emp-verify-drftdata`,
                {
                    headers: { Authorization: `Bearer ${userToken.token}` },
                }
            );

            console.log("All records response:", response);

            if (response.data?.success && response.data?.data) {
                const allRecords = response.data.data;
                console.log("alll recxxxxxxxxxxx", allRecords);
                
                if (allRecords.length > 0) {
                    const latestRecord = allRecords.sort((a, b) => 
                        new Date(b.created_at) - new Date(a.created_at)
                    )[0];

                    console.log("latest oneeeeeeeeeeeeeee", latestRecord);
                    
                    if (latestRecord.status?.toLowerCase() == "Pending") {
                        console.log("new");
                        setIsViewOnly(true);
                    } else {
                        setIsViewOnly(false);
                        console.log("new11111111");
                    }
                    
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

    console.log(stageData, "yyyyyyyyyy4444444444444");

    const showDocUpload = stageData.candidStage1 == "0";
    const showStackup = stageData.candidStage2 == "0";
    const showOffer = stageData.candidStage3 == "0";

    const isAnyFormSelected = Boolean(selectedForm);

    const AllStages = async () => {
        try {
            const response = await axiosInstance.get(
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

    // Responsive styles based on device
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1024;
    const isDesktop = windowWidth > 1024;

    const styles = {
        container: {
            background: '#fff',
            paddingLeft: 'clamp(5px, 2vw, 20px)',
            paddingRight: 'clamp(5px, 2vw, 20px)',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box'
        },
        header: {
            marginBottom: 'clamp(6px, 2vw, 16px)'
        },
        headerBox: {
            background: 'linear-gradient(to right, #faf5ff, #ffffff)',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            padding: 'clamp(10px, 3vw, 16px)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e9d5ff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
        },
        title: {
            fontSize: 'clamp(16px, 4.5vw, 22px)',
            fontWeight: 'bold',
            color: '#49225b',
            margin: 0,
            textAlign: 'center'
        },
        // Desktop: horizontal layout (side by side)
        desktopGrid: {
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'stretch',
            marginBottom: '20px',
            flexWrap: 'wrap'
        },
        // Mobile: vertical layout (one below another)
        mobileGrid: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px'
        },
        tileWrapper: {
            flex: isDesktop ? '1' : 'none',
            minWidth: isDesktop ? '250px' : '100%',
            maxWidth: isDesktop ? '350px' : '100%'
        },
        formContainer: {
            marginTop: 'clamp(10px, 3vw, 20px)',
            animation: 'slideDown 0.3s ease-out'
        }
    };

    // Get visible tiles array
    const visibleTiles = [];
    if (showDocUpload) visibleTiles.push({ type: 'Candidate Doc Upload', icon: '📤', color: 'blue' });
    if (showStackup) visibleTiles.push({ type: 'Candidate Stackup Approval', icon: '✅', color: 'purple' });
    if (showOffer) visibleTiles.push({ type: 'Candidate Offer Approval', icon: '💼', color: 'emerald' });

    return (
        <div style={styles.container}>
            <div style={{ width: '100%', padding: 'clamp(4px, 1vw, 8px)' }}>
                {/* Header Section */}
                <div style={styles.header}>
                    <div style={styles.headerBox}>
                        <h1 style={styles.title}>
                            Candidate Access Forms
                        </h1>
                    </div>
                </div>

                {/* Responsive Tiles - Desktop: Side by Side, Mobile: Stacked */}
                <div style={isDesktop ? styles.desktopGrid : styles.mobileGrid}>
                    {showDocUpload && (
                        <div style={styles.tileWrapper}>
                            <FormTile
                                title="Candidate Doc Upload"
                                icon="📤"
                                color="blue"
                                isSelected={selectedForm?.type === 'Candidate Doc Upload'}
                                onClick={() => {
                                    console.log("Candidate Doc Upload clicked");
                                    handleFormClick('Candidate Doc Upload', 'blue');
                                    EmpVerify();
                                }}
                            />
                        </div>
                    )}
                    
                    {showStackup && (
                        <div style={styles.tileWrapper}>
                            <FormTile
                                title="Candidate Stackup Approval"
                                icon="✅"
                                color="purple"
                                isSelected={selectedForm?.type === "Candidate Stackup Approval"}
                                onClick={() => handleFormClick("Candidate Stackup Approval", "purple")}
                            />
                        </div>
                    )}

                    {showOffer && (
                        <div style={styles.tileWrapper}>
                            <FormTile
                                title="Candidate Offer Approval"
                                icon="💼"
                                color="emerald"
                                isSelected={selectedForm?.type === "Candidate Offer Approval"}
                                onClick={() => handleFormClick("Candidate Offer Approval", "emerald")}
                            />
                        </div>
                    )}
                </div>

                {/* Candidate Doc Upload */}
                {selectedForm?.type === 'Candidate Doc Upload' && (
                    <div style={styles.formContainer}>
                        <RecruitmentForm 
                            isViewOnly={isViewOnly}
                            userToken={userToken}
                        />
                    </div>
                )}

                {/* Candidate Stackup Approval */}
                {selectedForm?.type === 'Candidate Stackup Approval' && (
                    <div style={styles.formContainer}>
                        <CandidateStackup token={userToken?.token} caseId={userToken?.Emp_Id} />
                    </div>
                )}

                {/* Candidate Offer Approval */}
                {selectedForm?.type === 'Candidate Offer Approval' && (
                    <div style={styles.formContainer}>
                        <CandidateApproval caseId={userToken?.Emp_Id} />
                    </div>
                )}
            </div>
        </div>
    );
};

const FormTile = ({ title, icon, color, isSelected, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth <= 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const tileStyles = {
        container: {
            background: colors.bgGradient,
            borderRadius: 'clamp(10px, 3vw, 16px)',
            padding: 'clamp(8px, 2.5vw, 16px)',
            border: `3px solid ${isSelected ? colors.selectedBorder : (isHovered ? colors.hoverBorder : colors.border)}`,
            boxShadow: isSelected || isHovered ? colors.hoverShadow : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            transform: isSelected ? 'translateY(-2px) scale(1.02)' : (isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)'),
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            boxSizing: 'border-box',
            height: '100%'
        },
        content: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(6px, 2vw, 12px)',
            width: '100%'
        },
        iconWrapper: {
            background: colors.iconBg,
            borderRadius: 'clamp(8px, 2.5vw, 12px)',
            padding: 'clamp(8px, 2vw, 12px)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${colors.hoverBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(8px, 2vw, 12px)',
            width: '100%',
            flexDirection: isMobile ? 'row' : 'row'
        },
        icon: {
            fontSize: isMobile ? 'clamp(20px, 6vw, 24px)' : '28px',
            lineHeight: 1,
            flexShrink: 0
        },
        title: {
            fontSize: isMobile ? 'clamp(12px, 3.5vw, 13px)' : '14px',
            fontWeight: 'bold',
            color: colors.text,
            margin: 0,
            textAlign: 'center',
            wordBreak: 'break-word',
            flex: 1
        }
    };

    // For mobile devices, handle touch events properly
    const handleTouchStart = (e) => {
        e.preventDefault();
        setIsHovered(true);
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        setIsHovered(false);
        onClick();
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={tileStyles.container}
        >
            <div style={tileStyles.content}>
                <div style={tileStyles.iconWrapper}>
                    <span style={tileStyles.icon}>
                        {icon}
                    </span>
                    <p style={tileStyles.title}>
                        {title}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CandidateForms;