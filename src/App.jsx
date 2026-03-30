import React, { createContext, useState, useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Login from "./Components/Forms/Login";
import { AppProvider } from "./Context/ContextData";

import Sidebar from "./Components/Layout/Sidebar";
import Header from "./Components/Layout/Header";

import Manpower from "./ManpowerComponent/ManPower";
import Onboarding from "./OnBoarding/Onboarding";
import Recruitments from "./RecruitmentProcess/Recruitments";
import RecruitmentForm from "./RecruitmentProcess/RecruitmentForm";

import HrInbox from "./Components/HrInbox.jsx";
import HODInbox from "./Components/HODInbox.jsx";
import AssignedTasks from "./Components/AssignedTasks.jsx";

import CandidateForms from "./Components/CandidateForms.jsx";
import CandidateStackup from "./Components/CandidateStackup.jsx";
import CandidateApproval from "./Components/CandidateApproval.jsx";
import ProtectRoute from "./ProtectRoute/ProtectRoute.jsx";
import RoleRoute from "./ProtectRoute/RoleRoute.jsx";
import SidebarRoutes from "./Components/SidebarRoutes.jsx";

import History from "./RecruitmentProcess/History";
import HODHistory from "./HODHistory.jsx";

import PreviewPage from "./RecruitmentProcess/previewPage.jsx";
import VerifyPreviewPage from "./RecruitmentProcess/VerifyPreviewPage.jsx";
import Reports from "./Components/Reports.jsx";

export const MyContext = createContext();

// Move Layout outside of App component to prevent recreation
const Layout = ({ children, isSidebarOpen }) => (
  <section className="main">
    <Header />
    <div className="contentMain flex">
      <div
        className={`sidebarWapper ${
          isSidebarOpen ? "w-[18%]" : "w-[90px]"
        } transition-all`}
      >
        <Sidebar />
      </div>
      <div
        className={`contentRight py-4 px-4 ${
          isSidebarOpen ? "w-[82%]" : "w-[calc(100%-90px)]"
        } transition-all`}
      >
        {children}
      </div>
    </div>
  </section>
);

// Create wrapper components to pass isSidebarOpen
const HrInboxWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><HrInbox /></Layout>;
};

const ReportsWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><Reports /></Layout>;
};

const OnboardingWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><Onboarding /></Layout>;
};

const HODInboxWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><HODInbox /></Layout>;
};

const AssignedTasksWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><AssignedTasks /></Layout>;
};

const CandidateFormsWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><CandidateForms /></Layout>;
};

const CandidateStackupWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><CandidateStackup /></Layout>;
};

const CandidateApprovalWrapper = () => {
  const { isSidebarOpen } = React.useContext(MyContext);
  return <Layout isSidebarOpen={isSidebarOpen}><CandidateApproval /></Layout>;
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const contextValues = useMemo(() => ({ isSidebarOpen, setIsSidebarOpen }), [isSidebarOpen]);

  const queryClient = useMemo(() => new QueryClient(), []);

  const router = useMemo(() => createBrowserRouter(
    [
      { path: "/", element: <Login /> },
      {
        element: <ProtectRoute />,
        children: [
          {
            element: <RoleRoute allowedRoles={["HR"]} />,
            children: [
              { path: "/HrInbox", element: <HrInboxWrapper /> },
              { path: "/Reports", element: <ReportsWrapper /> },
              { path: "/OnBoarding", element: <OnboardingWrapper /> }
            ]
          },
          {
            element: <RoleRoute allowedRoles={["HOD"]} />,
            children: [
              { path: "/PendingMRFS", element: <HODInboxWrapper /> },
              { path: "/AssignedTasks", element: <AssignedTasksWrapper /> },
            ]
          },
          {
            path: "/RecruitmentForm/:case_Id",
            element: (
              <section className="main">
                <div className="contentMain flex">
                  <div className="contentRight py-4 px-4 w-[100%]">
                    <RecruitmentForm />
                  </div>
                </div>
              </section>
            )
          },
          {
            path: "/RecruitmentProcess",
            element: (
              <section className='main'>
                <Header />
                <div className='contentMain flex'>
                  <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                    <Sidebar/>
                  </div>
                  <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                    <Recruitments />
                  </div>
                </div>
              </section>
            )
          },
          {
            path: "/History",
            element: (
              <section className='main'>
                <Header />
                <div className='contentMain flex'>
                  <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                    <Sidebar/>
                  </div>
                  <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                    <History />
                  </div>
                </div>
              </section>
            )
          },
          {
            path: "/HODHistory",
            element: (
              <section className='main'>
                <Header />
                <div className='contentMain flex'>
                  <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                    <Sidebar/>
                  </div>
                  <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                    <HODHistory />
                  </div>
                </div>
              </section>
            )
          },
          {
            path: '/SidebarRoutes',
            exact: true,
            element: (
              <section className='main'>
                <Header/> 
                <div className='contentMain flex'>
                  <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                    <Sidebar/>
                  </div>
                  <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                    <SidebarRoutes />
                  </div>
                </div>
              </section>
            )
          },
          {
            children: [
              { path: "/CandidateForms", element: <CandidateFormsWrapper /> },
              { path: "/CandidateStackup", element: <CandidateStackupWrapper /> },
              { path: "/CandidateApproval", element: <CandidateApprovalWrapper /> }
            ]
          }
        ]
      },
      {
        path: "/PreviewPage",
        element: (
          <section className='main'>
            <div className='contentMain flex'>
              <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                <PreviewPage />
              </div>
            </div>
          </section>
        )
      },
      {
        path: "/VerifyPreviewPage",
        element: (
          <section className='main'>
            <div className='contentMain flex'>
              <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                <VerifyPreviewPage />
              </div>
            </div>
          </section>
        )
      },
      {
        path: "*",
        element: (
          <h2 style={{ textAlign: "center", marginTop: "50px", color: 'red'}}>
            404 - Page Not Found
          </h2>
        )
      }
    ],
    {
      basename: "/react/hrmprocess"
    }
  ), [isSidebarOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <MyContext.Provider value={contextValues}>
          <RouterProvider router={router} />
        </MyContext.Provider>
      </AppProvider>
    </QueryClientProvider>
  );
}