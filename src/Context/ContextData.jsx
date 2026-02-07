// import React, { createContext, useState } from "react";
// import 
// {
//   useapprovals,
//   useHrhistory,
//   usePersonalDetails,
//   usePostPersonalDetails,
//   useSubProjects,
//   useUserProjects
// } from "../Apis/userApi";


// export const ContextData = createContext({
//   projects: [],
//   isProjectsLoading: true,
//   subproject: [],
//   isSubProjectLoading: true,
//   personalData: [],
//   // HrData: [],
//   Approvals:[],
//   PersonPostData: [],
//   selectedRecord: null,
//   setSelectedRecord: () => {},
// });
// export const AppProvider = ({ children }) => 
//   {
//   const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   // Fetchng all required data using custom hooks
//   const { data, isLoading } = useUserProjects(userToken?.token);
//   const {
//     data: subProjects,
//     isLoading: isLoadingSub} = useSubProjects(userToken?.token, data?.data?.[5]);
//   const 
//   {
//     data: PersonalInfo,
//     isLoading: isLoadingInfo,
//   } = usePersonalDetails(userToken?.token);
//   // const { data: Hrhistory } = useHrhistory(userToken?.token);

//   const {data: Approvals}  = useapprovals(userToken?.token);


 
//   const { data: Personpost } = usePostPersonalDetails(userToken?.token);

//   return (
//     <ContextData.Provider
//       value={{
//         projects: data || [],
//         isProjectsLoading: isLoading,
//         subproject: subProjects || [],
//         isSubProjectLoading: isLoadingSub,
//         personalData: PersonalInfo || [],
//         // HrData: Hrhistory || [],
//         Approvals: Approvals || [],
//         PersonPostData: Personpost || [],
//         selectedRecord,
//         setSelectedRecord,
//       }}>
//       {children}
//     </ContextData.Provider>
//   );
// };



import React, { createContext, useState } from "react";
import {
  useapprovals,
  usePersonalDetails,
  usePostPersonalDetails,
} from "../Apis/userApi";

export const ContextData = createContext({
  personalData: [],
  Approvals: [],
  PersonPostData: [],
  selectedRecord: null,
  setSelectedRecord: () => {},
});

export const AppProvider = ({ children }) => {
  const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

  
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ✅ Personal details
  const { data: PersonalInfo } = usePersonalDetails(userToken?.token);

  // ✅ Approvals
  const { data: Approvals } = useapprovals(userToken?.token);

  // ✅ Post personal details
  const { data: Personpost } = usePostPersonalDetails(userToken?.token);

  return (
    <ContextData.Provider
      value={{
        personalData: PersonalInfo || [],
        Approvals: Approvals || [],
        PersonPostData: Personpost || [],
        selectedRecord,
        setSelectedRecord,
      }}
    >
      {children}
    </ContextData.Provider>
  );
};
