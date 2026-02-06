import React, { useState } from 'react';
import {  Box,  Paper,  Typography} from '@mui/material';
import {  GroupAdd as GroupAddIcon} from '@mui/icons-material';
import { FileText, Settings, BarChart3 } from 'lucide-react';
import JoiningReportList from './JoiningReportList';
import Appointement from './Appointement'

const Onboarding = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);


  const onboardingMenuItems = [
    {
      label: 'Joining Report',
      component: 'joining-report',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      hoverBg: 'hover:bg-orange-100'
    },
 

    {

       label: 'Appointment',
      component: 'Appointement',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      hoverBg: 'hover:bg-orange-100'
    }



  ];

  const renderOnboardingComponent = () => {
    switch (activeComponent) {
      case 'joining-report':
        return <JoiningReportList />;
      
      case 'Appointement':

    return <Appointement />;

       

      default:
        return (
          <Paper className="p-8 text-center">
            <GroupAddIcon fontSize="large" className="text-gray-400 mb-2" />
            <Typography variant="h6">
              Employee Onboarding
            </Typography>
            <Typography className="text-gray-500 mt-1">
              Select an option above to continue
            </Typography>
          </Paper>
        );
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

      <Paper elevation={1} className="mb-6 p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-l-4 border-orange-500">
        {/* Header with Icon */}
        <Box className="mb-3 flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-orange-600 to-amber-600 rounded-full"></div>
          <div className="flex items-center gap-2">
            <GroupAddIcon className="text-orange-600" style={{ fontSize: '24px' }} />
            <Typography 
              variant="h6" 
              className="font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
            >
              Onboarding Process
            </Typography>
          </div>
        </Box>

        {/* Animated Tabs Section */}
        <Box className="tab-container mt-3 p-4 bg-white rounded-xl border-2 border-gray-100 shadow-md">
          <Box className="flex flex-wrap gap-3">
            {onboardingMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeComponent === item.component;
              const isHovered = hoveredTab === item.component;
              return (
                <button
                  key={item.component}
                  onClick={() => setActiveComponent(item.component)}
                  onMouseEnter={() => setHoveredTab(item.component)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    relative group px-5 py-3 rounded-lg font-semibold text-sm
                    transition-all duration-300 ease-out
                    flex items-center gap-2.5 border-2
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
      </Paper>

      {/* Show active component */}
      {activeComponent ? (
        <Box>
          <Paper elevation={2} className="p-2">
            {renderOnboardingComponent()}
          </Paper>
        </Box>
      ) : (
        renderOnboardingComponent()
      )}
    </div>
  );
};

export default Onboarding;