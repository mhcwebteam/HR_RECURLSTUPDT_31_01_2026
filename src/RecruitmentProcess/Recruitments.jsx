



import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button, Chip, Switch, FormControlLabel, Paper, Tabs, Tab } from '@mui/material';
import { People as PeopleIcon, TrendingUp as TrendingUpIcon, Assignment as AssignmentIcon, Notifications as NotificationsIcon, GroupAdd as GroupAddIcon, ListAlt as ListAltIcon, UploadFile as UploadFileIcon, RequestQuote as RequestQuoteIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RecruitmentMail from './RecruitmentMail';
import { CircleCheckBig, ScrollText, Mail, ShieldCheck, DollarSign, UserCheck, FileText, Send, Zap } from 'lucide-react';
import Verification from './Verification';
import Salarystackup from './Salarystackup';
import CandidateApproval from './CandidateApproval';
import NoteForApprovals from './NoteForApprovals';
import OfferLetter from './OfferLetter';
import OfferApproved from './OfferApproved';
import Action from './Action';

const Recruitments = () => {
  const location = useLocation();
  const [onboardingEnabled, setOnboardingEnabled] = useState(true);
  const [activeRecruitmentComponent, setActiveRecruitmentComponent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredTab, setHoveredTab] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const process = queryParams.get('process');
  useEffect(() => {
    if (process) {
      setActiveRecruitmentComponent(process);
    }
  }, [process]);


  // const stats = [
  //   { 
  //     label: 'Total Employees', 
  //     value: '1,234', 
  //     icon: PeopleIcon, 
  //     color: 'blue' 
  //   },
  //   { 
  //     label: 'Active Projects', 
  //     value: '56', 
  //     icon: AssignmentIcon, 
  //     color: 'green' 
  //   },
  //   { 
  //     label: 'Pending Requests', 
  //     value: '23', 
  //     icon: NotificationsIcon, 
  //     color: 'orange' 
  //   },
  //   { 
  //     label: 'Growth Rate', 
  //     value: '+12%', 
  //     icon: TrendingUpIcon, 
  //     color: 'purple' 
  //   },
  // ];

  const RecruitmentMenuItems = [
    {
      label: 'Actions ',
      component: 'Actions',
      icon: Zap,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-300',
      hoverBg: 'hover:bg-teal-100'
    },
    {
      label: 'Recruitment Mail',
      component: 'Recruitment Mail',
      icon: Mail,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      hoverBg: 'hover:bg-purple-100'
    },
    {
      label: 'Verification',
      component: 'Verification',
      icon: ShieldCheck,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      hoverBg: 'hover:bg-blue-100'
    },
    {
      label: 'Salary Stackup',
      component: 'Salary Stack Up',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      hoverBg: 'hover:bg-green-100'
    },
    {
      label: 'Candidate Approval',
      component: 'Candidate Approval',
      icon: UserCheck,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      hoverBg: 'hover:bg-orange-100'
    },
    {
      label: 'Note For Approval',
      component: 'Note For Approval',
      icon: FileText,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-300',
      hoverBg: 'hover:bg-pink-100'
    },
    {
      label: 'Offer Letter',
      component: 'Offer Letter',
      icon: Send,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      hoverBg: 'hover:bg-indigo-100'
    },
{
  label: 'Offer Approved',
  component: 'Offer Approved',
  icon: Send,
  color: 'from-slate-600 to-slate-700',
  bgColor: 'bg-slate-50',
  borderColor: 'border-slate-300',
  hoverBg: 'hover:bg-slate-100'
}
  ];

  const handleMenuItemClick = (component) => {
    console.log('Clicked component:', component);
    setActiveRecruitmentComponent(component);
  };

  const handleOnboardingToggle = (event) => {
    setOnboardingEnabled(event.target.checked);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setActiveRecruitmentComponent(null);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const navigate = useNavigate();

  const renderRecruitmentComponent = () => {
    console.log('Current component:', activeRecruitmentComponent);
    switch (activeRecruitmentComponent) {
      case 'Actions':
        return <Action />;
      case 'Recruitment Mail':
        return <RecruitmentMail />;
      case 'Verification':
        return <Verification />
      case 'Salary Stack Up':
        return <Salarystackup />
      case 'Candidate Approval':
        return <CandidateApproval />
      case 'Note For Approval':
        return <NoteForApprovals />
      case 'Offer Letter':
        return <OfferLetter />
      case 'Offer Approved':
        return <OfferApproved />
      default:
        return null;
    }
  };

  return (
    <div className="">
      <style>
        {`
          @keyframes pulse-subtle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.95; }
          }
          
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }

          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .tab-button-active {
            animation: pulse-subtle 2s ease-in-out infinite;
          }

          .tab-container {
            animation: slide-in 0.3s ease-out;
          }
        `}
      </style>

      <Paper elevation={1} className="mb-6 p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-l-4 border-purple-500">
        {/* Header with Icon */}
        <Box className="mb-3 flex items-center justify-between">

          {/* Left Title Section */}
          <Box className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>

            <div className="flex items-center gap-2">
              <PeopleIcon className="text-purple-600" style={{ fontSize: "24px" }} />
              <Typography
                variant="h6"
                className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                Recruitment Process
              </Typography>
            </div>
          </Box>

          {/* Right Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg 
                   bg-gradient-to-r from-purple-600 to-blue-600
                   text-white text-sm font-medium
                   hover:opacity-90 transition"
          >
            <ArrowBackIcon fontSize="small" />
            Back
          </button>
        </Box>


        {/* Animated Tabs Section */}
        {(activeTab === 0 || hoveredTab === 0) && (
          <Box className="tab-container mt-3 p-4 bg-white rounded-xl border-2 border-gray-100 shadow-md">
            <Box className="flex flex-wrap gap-3">
              {RecruitmentMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeRecruitmentComponent === item.component;
                const isHovered = hoveredTab === item.component;

                console.log(isActive,"issssssssssssssssssss",activeRecruitmentComponent);

                return (
                  <button
                    key={item.component}
                    onClick={() => {
                      console.log('Button clicked:', item.component);
                      handleMenuItemClick(item.component);
                    }}
                    onMouseEnter={() => setHoveredTab(item.component)}
                    onMouseLeave={() => setHoveredTab(null)}
                   className={`
  relative group px-4 py-2.5 rounded-lg font-medium text-xs
  transition-all duration-300 ease-out
  flex items-center gap-2 border-2
  ${isActive
    ? `bg-gradient-to-r ${item.color} text-white border-transparent shadow-lg scale-105 transform tab-button-active`
    : `${item.bgColor} ${item.borderColor} text-gray-700 ${item.hoverBg} hover:shadow-md hover:scale-102 hover:border-opacity-100`
  }
`}
                  >
                    {/* Animated background glow for active state */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-lg bg-white"
                        style={{
                          opacity: 0.3,
                          animation: 'pulse-glow 2s ease-in-out infinite'
                        }}
                      ></div>
                    )}

                    {/* Icon with rotation animation */}
                    <div
                      className={`
                        relative z-10 transition-transform duration-300
                        ${isHovered || isActive ? 'scale-110 rotate-12' : 'scale-100'}
                      `}
                    >
                      <IconComponent
                        size={18}
                        className={`${isActive ? 'text-white' : 'text-gray-600'} transition-colors duration-300`}
                      />
                    </div>

                    {/* Label */}
                    <span className="relative z-10 tracking-wide">
                      {item.label}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-70"></div>
                    )}

                    {/* Hover glow effect */}
                    {(isHovered || isActive) && (
                      <div
                        className={`absolute inset-0 rounded-lg blur-md -z-10 bg-gradient-to-r ${item.color}`}
                        style={{ opacity: 0.2 }}
                      ></div>
                    )}
                  </button>
                );
              })}
            </Box>


          </Box>
        )}
      </Paper>

      {/* Show active component */}
      {activeRecruitmentComponent ? (
        <Box>
          <Paper elevation={2} className="p-2">
            <Box className="flex justify-between items-center">
              {/* <Button 
                onClick={() => setActiveRecruitmentComponent(null)}
                variant="outlined"
                size="small"
              >
                Back to Dashboard
              </Button> */}
            </Box>
            {renderRecruitmentComponent()}
          </Paper>
        </Box>
      ) : (
        <>
          {activeTab === 0 && (
            <Grid container spacing={3} className="mb-6">
              {/* {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                const colorClasses = getColorClasses(stat.color);
                return (
                  <Grid item xs={12} sm={6} lg={3} key={index}>
                    <Card className="shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200">
                      <CardContent className="p-4">
                        <Box className="flex items-center justify-between">
                          <Box>
                            <Typography 
                              variant="body2" 
                              className="text-gray-500 mb-1 font-medium"
                            >
                              {stat.label}
                            </Typography>
                            <Typography 
                              variant="h4" 
                              className="font-bold text-gray-800"
                            >
                              {stat.value}
                            </Typography>
                          </Box>
                          <Box 
                            className={`w-12 h-12 rounded-lg ${colorClasses.bg} flex items-center justify-center transition-colors`}
                          >
                            <IconComponent className={colorClasses.text} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })} */}
            </Grid>
          )}
          {/* Recent Activity */}
          {activeTab === 0 && (
            <Card className="shadow-md border border-gray-100">
              <CardContent className="p-4">
                <Box className="flex justify-between items-center mb-4">
                  <Typography variant="h6" className="font-semibold text-gray-800">
                    Recent Activity
                  </Typography>
                  <Chip
                    label="No new notifications"
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                </Box>
                <Box className="text-center py-8">
                  <NotificationsIcon className="text-gray-400 mb-2" fontSize="large" />
                  <Typography variant="body1" className="text-gray-500">
                    No recent activity to display
                  </Typography>
                  <Typography variant="body2" className="text-gray-400 mt-1">
                    New activities will appear here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Recruitments;