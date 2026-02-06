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
import HrInbox from './Components/HrInbox.jsx';
import HODInbox from "./Components/HODInbox.jsx";
import ProtectRoute from "./ProtectRoute/ProtectRoute.jsx";
import UserRoute from "./UserRoute.jsx";
import AssignedTasks from './Components/AssignedTasks.jsx';
export const MyContext = createContext();
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const contextValues = { isSidebarOpen, setIsSidebarOpen };
  
  const queryClient = new QueryClient();
  const router = createBrowserRouter([
    { path: "/", element: <Login />},

  {
      element: <ProtectRoute/>,
      children: [    
    {
      path: '/OnBoarding',
      exact: true,
      element: (
      <section className='main'>
            <Header/>
               <div className='contentMain flex'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar/>
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                   <Onboarding/>
                </div>
              </div>
            </section>
          )
        },
        {
          path: '/Manpower',
          exact: true,
            element: (
            <section className='main'>
                   <Header/> 
              <div className='contentMain flex'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                   <Sidebar/>
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                   <Manpower/>
                </div>
              </div>
            </section>
          )
        },
          {
            path: '/RecruitmentProcess',
            exact: true,
            element: (
            <section className='main'>
                 <Header/> 
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
          path: '/HrInbox',
          exact: true,
            element: (
            <section className='main'>
              <Header/> 
              <div className='contentMain flex'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar/>
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <HrInbox />
                </div>
              </div>
            </section>
          )
        },


         {
          path: '/PendingMRFS',
          exact: true,
            element: (
            <section className='main'>
              <Header/> 
              <div className='contentMain flex'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar/>
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <HODInbox />
                </div>
              </div>
            </section>
          )
        },


              {
          
      path: 'RecruitmentForm/:case_Id',
      exact: true,
      element: (
     <section className='main'>
        <div className='contentMain flex'>
          {/* <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
          </div> */}
          <div className={`contentRight py-4 px-4 w-[100%]`}>
            <RecruitmentForm />
          </div>
        </div>
      </section>
          )




          
    },


          {
          path: '/AssignedTasks',
          exact: true,
            element: (
            <section className='main'>
              <Header/> 
              <div className='contentMain flex'>
                <div className={`sidebarWapper ${isSidebarOpen === true ? 'w-[18%]' : 'w-[90px]'} transition-all`}>
                  <Sidebar/>
                </div>
                <div className={`contentRight py-4 px-4 ${isSidebarOpen ? 'w-[82%]' : 'w-[calc(100%-90px)]'} transition-all`}>
                  <AssignedTasks />
                </div>
              </div>
            </section>
          )
        },
   ] },

  

      
  ],
{
    basename: '/react/hrmprocess',
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