import React, { createContext, useState } from "react";
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

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const contextValues = { isSidebarOpen, setIsSidebarOpen };

  const queryClient = new QueryClient();

  // 🔹 Common Layout Wrapper
  const Layout = ({ children }) => (
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

  const router = createBrowserRouter(
    [
  
      { path: "/", element: <Login /> },

  
      {
        element: <ProtectRoute />,
        children: [
       
          {
            element: <RoleRoute allowedRoles={["HR"]} />,
            children: [
              { path: "/HrInbox", element: <Layout><HrInbox /></Layout> },
            { path: "/Reports", element: <Layout><Reports /></Layout> },
              { path: "/OnBoarding", element: <Layout><Onboarding /></Layout> }
              
            ]
          },

          // 🟢 HOD Routes
          {
            element: <RoleRoute allowedRoles={["HOD"]} />,
            children: [
              { path: "/PendingMRFS", element: <Layout><HODInbox /></Layout> },
              { path: "/AssignedTasks", element: <Layout><AssignedTasks /></Layout> },
              
              // { path: "/RecruitmentProcess", element: <Layout><Recruitments /></Layout> }
            ]
          },

          // 🟢 EVC / DIRECTOR Routes
          // {
          //   element: <RoleRoute allowedRoles={["EVC", "DIRECTOR"]} />,
          //   children: [
          //     { path: "/RecruitmentProcess", element: <Layout><Recruitments /></Layout> },
          //     {
          //       path: "/RecruitmentForm/:case_Id",
          //       element: (
          //         <section className="main">
          //           <div className="contentMain flex">
          //             <div className="contentRight py-4 px-4 w-[100%]">
          //               <RecruitmentForm />
          //             </div>
          //           </div>
          //         </section>
          //       )
          //     }
          //   ]
          // },

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



// Accessible to any logged-in user
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





          // 🟢 Common Routes (HR + HOD)
     {
  children: [
    { path: "/CandidateForms", element: <Layout><CandidateForms /></Layout> },
    { path: "/CandidateStackup", element: <Layout><CandidateStackup /></Layout> },
    { path: "/CandidateApproval", element: <Layout><CandidateApproval /></Layout> }
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
  );

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
