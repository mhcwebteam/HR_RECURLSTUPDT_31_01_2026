



import React, { createContext, useState } from "react";
import {
  // useapprovals,
  // usePersonalDetails,
  // usePostPersonalDetails,
} from "../Apis/userApi";

export const ContextData = createContext({
  // personalData: [],
  // Approvals: [],
  // PersonPostData: [],
  // selectedRecord: null,
  // setSelectedRecord: () => {},
});

export const AppProvider = ({ children }) => {
  
  // const userToken = JSON.parse(localStorage.getItem("userInfo")) || {};

  
  // const [selectedRecord, setSelectedRecord] = useState(null);

  // ✅ Personal details
  // const { data: PersonalInfo } = usePersonalDetails(userToken?.token);

  // ✅ Approvals
  // const { data: Approvals } = useapprovals(userToken?.token);

  // ✅ Post personal details
  // const { data: Personpost } = usePostPersonalDetails(userToken?.token);

  return (
    <ContextData.Provider
      value={{
        // personalData: PersonalInfo || [],
        // Approvals: Approvals || [],
        // PersonPostData: Personpost || [],
        // selectedRecord,
        // setSelectedRecord,
      }}
    >
      {children}
    </ContextData.Provider>
  );
};
