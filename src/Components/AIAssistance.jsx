import React, { useState, useRef, useEffect } from "react";
import { Bot, User, Send } from "lucide-react";
import { useLocation } from "react-router-dom";
import Fuse from "fuse.js"; // 🔥 IMPORT FUSE.JS
import { askGemmaStream } from "../Services/OllamaService";
import { masterApi } from "../Services/LaravelService";

// ============================================================
// 📊 TABLE META DATA
// ============================================================

const TABLE_META = {
  verifications: {
    label: "Verifications",
    emoji: "📋",
    fields: ["CHILD_CASEID", "FIRST_NAME", "LAST_NAME", "EMAIL", "PHONE_NUMBER", "DEPT", "status"]
  },
  emp_verification: {
    label: "My Verifications",
    emoji: "👤",
    fields: ["CHILD_CASEID", "FIRST_NAME", "LAST_NAME", "EMAIL", "DEPT", "status"]
  },
  taskAssigments: {
 label: "My Taskassignments",
    emoji: "👤",
    fields: ['case_id',
        'assigned_by',
        'assigned_to',
        'current_task',
        'status',
        'assigned_date',
        "verifyEmail",
        "actionStatus",
        "StatusTrack",
        "CUR_REV_ID",
        "hr_doc_status",
        "hrEvaluationFile",
        'ONBOARD_PLANT',
        'REPORTING_TO',
        'PROBITION',
        'COMPANY',
        'REF_NO',]

  },


  salary: {
    label: "Salary Records",
    emoji: "💰",
    fields: ["CHILD_CASEID", "offer_ctc", "basic_salary", "hra", "Net_Salary"]
  },
  candidate_approval: {
    label: "Candidate Approvals",
    emoji: "✅",
    fields: ["CHILD_CASEID", "NAME", "cand_aprvl_status", "cand_aprvl_remarks"]
  },
  note_approval: {
    label: "Note Approvals",
    emoji: "📝",
    fields: ["CHILD_CASEID", "DEPT", "CURRENT_TASK", "CURRENT_USER"]
  },
  offer_letter: {
    label: "Offer Letters",
    emoji: "📧",
    fields: ["CHILD_CASEID", "FIRST_NAME", "EMAIL", "ofrLetterStatus", "joiningDate"]
  },
  transfer: {
    label: "Transfers",
    emoji: "🔄",
    fields: ["CHILD_CASEID", "emp_id", "old_plant", "new_plant", "TRANSFER_DATE"]
  }
};

// ============================================================
// 🔍 FUSE.JS CONFIGURATION
// ============================================================

const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.4, // Lower = stricter, Higher = more fuzzy
  keys: [
    { name: 'CHILD_CASEID', weight: 0.3 },
    { name: 'FIRST_NAME', weight: 0.2 },
    { name: 'LAST_NAME', weight: 0.2 },
    { name: 'EMAIL', weight: 0.15 },
    { name: 'PHONE_NUMBER', weight: 0.15 },
    { name: 'NAME', weight: 0.2 },
    { name: 'DEPT', weight: 0.1 },
    { name: 'status', weight: 0.1 },
    { name: 'cand_aprvl_status', weight: 0.1 },
    { name: 'ofrLetterStatus', weight: 0.1 },
  ]
};

// ============================================================
// 📊 SAFE DATA ACCESS
// ============================================================

const safeArray = (data) => {
  return Array.isArray(data) ? data : [];
};

// ============================================================
// 📊 DATA FETCHING
// ============================================================

const fetchAllData = async () => {
  try {
    console.log("🚀 Fetching all HRM data via Master API...");
    
    const [verifications, taskAssigments,empData, salaryData, candidateData, noteData, offerData, transferData] = await Promise.all([
      masterApi('getVerifications'),
         masterApi('getTaskAssignmentGetData'),
      masterApi('getEmpVerificationData'),
      masterApi('getSalaryStackData'),
      masterApi('getCandidateApprovalData'),
      masterApi('getNoteForApprovalData'),
      masterApi('getOfferLetterIssueList'),
      masterApi('getEmployeeTransferData'),
    ]);

    const data = {
      verifications: safeArray(verifications?.data || verifications),
      taskAssigments:safeArray(taskAssigments?.data ||taskAssigments),
      emp_verification: safeArray(empData?.data || empData),
      salary: safeArray(salaryData?.data || salaryData),
      candidate_approval: safeArray(candidateData?.data || candidateData),
      note_approval: safeArray(noteData?.data || noteData),
      offer_letter: safeArray(offerData?.data || offerData),
      transfer: safeArray(transferData?.data || transferData),
    };



    return data;
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return {
      verifications: [],
      emp_verification: [],
      taskAssigments: [],
      salary: [],
      candidate_approval: [],
      note_approval: [],
      offer_letter: [],
      transfer: [],
    };
  }
};

// ============================================================
// 🔍 FUZZY SEARCH FUNCTION
// ============================================================

const fuzzySearch = (data, searchTerm, limit = 20) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return data.slice(0, limit);
  }

  // Create Fuse instance
  const fuse = new Fuse(data, FUSE_OPTIONS);
  
  // Search
  const results = fuse.search(searchTerm);
  
  // Extract matched items
  const matched = results.map(result => result.item);
  
  console.log(`🔍 Fuzzy search for "${searchTerm}": found ${matched.length} results`);
  
  // If no results, return first few as fallback
  if (matched.length === 0) {
    return data.slice(0, limit);
  }
  
  return matched.slice(0, limit);
};

// ============================================================
// 📊 SEARCH ACROSS ALL TABLES
// ============================================================

const searchAllTables = (dbData, searchTerm, limit = 10) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return {
      verifications: dbData.verifications.slice(0, limit),
      emp_verification: dbData.emp_verification.slice(0, limit),
      taskAssigments:dbData.taskAssigments.slice(0, limit),
      salary: dbData.salary.slice(0, limit),
      candidate_approval: dbData.candidate_approval.slice(0, limit),
      note_approval: dbData.note_approval.slice(0, limit),
      offer_letter: dbData.offer_letter.slice(0, limit),
      transfer: dbData.transfer.slice(0, limit),
    };
  }

  const term = searchTerm.trim();
  
  return {
    verifications: fuzzySearch(dbData.verifications, term, limit),
    emp_verification: fuzzySearch(dbData.emp_verification, term, limit),
    taskAssigments:  fuzzySearch(dbData.taskAssigments, term, limit),
    salary: fuzzySearch(dbData.salary, term, limit),
    candidate_approval: fuzzySearch(dbData.candidate_approval, term, limit),
    note_approval: fuzzySearch(dbData.note_approval, term, limit),
    offer_letter: fuzzySearch(dbData.offer_letter, term, limit),
    transfer: fuzzySearch(dbData.transfer, term, limit),
  };
};

// ============================================================
// 📊 FORMAT DATA FOR AI CONTEXT
// ============================================================

const formatDataForAI = (dbData, searchTerm = null) => {
  if (!dbData) {
    return "No data available. Please try again.";
  }

  // If there's a search term, use fuzzy search
  if (searchTerm && searchTerm.trim().length >= 2) {
    const searchResults = searchAllTables(dbData, searchTerm, 15);
    
    let result = `🔍 **Fuzzy Search Results for "${searchTerm}":**\n\n`;
    
    // Count total found
    const totalFound = 
      searchResults.verifications.length +
      searchResults.emp_verification.length +
    searchResults.taskAssigments.length +
      searchResults.salary.length +
      searchResults.candidate_approval.length +
      searchResults.note_approval.length +
      searchResults.offer_letter.length +
      searchResults.transfer.length;
    
    if (totalFound === 0) {
      return `No records found matching "${searchTerm}". Try a different search term.`;
    }
    
    result += `📊 **Total matches: ${totalFound}**\n\n`;
    
    // Verifications
    if (searchResults.verifications.length > 0) {
      result += `📋 **Verifications** (${searchResults.verifications.length}):\n`;
      searchResults.verifications.slice(0, 10).forEach((v, i) => {
        result += `  ${i+1}. ${v?.FIRST_NAME || ''} ${v?.LAST_NAME || ''} (${v?.CHILD_CASEID || 'N/A'})\n`;
        if (v?.EMAIL) result += `     📧 ${v.EMAIL}\n`;
        if (v?.status) result += `     Status: ${v.status}\n`;
      });
      if (searchResults.verifications.length > 10) {
        result += `  ... and ${searchResults.verifications.length - 10} more\n`;
      }
      result += `\n`;
    }
    
    // Candidate Approvals
    if (searchResults.candidate_approval.length > 0) {
      result += `✅ **Candidate Approvals** (${searchResults.candidate_approval.length}):\n`;
      searchResults.candidate_approval.slice(0, 10).forEach((c, i) => {
        result += `  ${i+1}. ${c?.NAME || 'N/A'} (${c?.CHILD_CASEID || 'N/A'})\n`;
        if (c?.cand_aprvl_status) result += `     Status: ${c.cand_aprvl_status}\n`;
      });
      if (searchResults.candidate_approval.length > 10) {
        result += `  ... and ${searchResults.candidate_approval.length - 10} more\n`;
      }
      result += `\n`;
    }
    
    // Offer Letters
    if (searchResults.offer_letter.length > 0) {
      result += `📧 **Offer Letters** (${searchResults.offer_letter.length}):\n`;
      searchResults.offer_letter.slice(0, 10).forEach((o, i) => {
        result += `  ${i+1}. ${o?.FIRST_NAME || 'N/A'} (${o?.CHILD_CASEID || 'N/A'})\n`;
        if (o?.ofrLetterStatus) result += `     Status: ${o.ofrLetterStatus}\n`;
      });
      if (searchResults.offer_letter.length > 10) {
        result += `  ... and ${searchResults.offer_letter.length - 10} more\n`;
      }
      result += `\n`;
    }
    
    return result;
  }

  // ============================================================
  // 📊 FULL SUMMARY (No Search Term)
  // ============================================================
  const verifications = safeArray(dbData.verifications);
  const empVerification = safeArray(dbData.emp_verification);
    const taskAssigments = safeArray(dbData.taskAssigments);
  const salary = safeArray(dbData.salary);
  const candidateApproval = safeArray(dbData.candidate_approval);
  const noteApproval = safeArray(dbData.note_approval);
  const offerLetter = safeArray(dbData.offer_letter);
  const transfer = safeArray(dbData.transfer);

  let formattedData = "📊 **HRM Database Summary**\n\n";
  
  formattedData += `📋 Verifications: ${verifications.length} records\n`;
  formattedData += `👤 My Verifications: ${empVerification.length} records\n`;
   formattedData += `👤 My taskassignments: ${taskAssigments.length} records\n`;
  formattedData += `💰 Salary Records: ${salary.length} records\n`;
  formattedData += `✅ Candidate Approvals: ${candidateApproval.length} records\n`;
  formattedData += `📝 Note Approvals: ${noteApproval.length} records\n`;
  formattedData += `📧 Offer Letters: ${offerLetter.length} records\n`;
  formattedData += `🔄 Transfers: ${transfer.length} records\n\n`;
  
  // Sample CASE IDs
  if (verifications.length > 0) {
    const sampleIds = verifications.slice(0, 5).map(v => v?.CHILD_CASEID || 'N/A').join(', ');
    formattedData += `📋 Sample CASE IDs: ${sampleIds}\n\n`;
  }
  
  const total = verifications.length + empVerification.length + salary.length + taskAssigments.length +
                candidateApproval.length + noteApproval.length + offerLetter.length + transfer.length;
  formattedData += `📊 Grand Total: ${total} records\n\n`;
  formattedData += `💡 Try searching by: Name, CASE ID, Email, or Phone`;

  return formattedData;
};

// ============================================================
// 📝 BUILD PROMPT FOR AI
// ============================================================

const buildPrompt = (userQuery, contextData) => {
  return `You are an HRM Assistant. Answer the user's question based ONLY on the data provided below.

CONTEXT DATA:
${contextData}

USER QUESTION: ${userQuery}

INSTRUCTIONS:
1. Answer based ONLY on the data above
2. Use the fuzzy search results provided
3. If the data doesn't contain the answer, say "I don't have that information in my database"
4. Be concise and helpful
5. Format responses with clear sections using emojis

ANSWER:`;
};

// ============================================================
// 🎯 MAIN COMPONENT
// ============================================================

const AIAssistance = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [dbData, setDbData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllData();
        setDbData(data);
        
        const total = data.verifications.length + 
                      data.emp_verification.length + 
                      data.salary.length + 
                      data.candidate_approval.length +
                      data.note_approval.length +
                      data.offer_letter.length +
                      data.transfer.length;
        
        setMessages(prev => [...prev, {
          sender: "ai",
          text: `✅ **Data Loaded Successfully!**\n\n📊 Total Records: ${total}\n\n💡 Try searching by name, CASE ID, or any text - fuzzy search will find matches!`
        }]);
      } catch (error) {
        console.error("Failed to load data:", error);
        setMessages(prev => [...prev, {
          sender: "ai",
          text: "⚠️ Failed to load database. Please refresh the page."
        }]);
      }
    };
    loadData();
  }, []);

  // Auto-send from Header
  useEffect(() => {
    const state = location.state;
    if (state?.prompt && state?.autoSend && !hasAutoSent && dbData) {
      console.log("🚀 Auto-sending:", state.prompt);
      setHasAutoSent(true);
      setTimeout(() => {
        handleSend(null, state.prompt);
      }, 500);
    }
  }, [location.state, hasAutoSent, dbData]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🚀 HANDLE SEND
  const handleSend = async (e, overrideText) => {
    e?.preventDefault?.();
    const prompt = (overrideText ?? input).trim();
    if (!prompt || loading || !dbData) return;

    setMessages(prev => [...prev, { sender: 'user', text: prompt }]);
    if (!overrideText) setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { sender: 'ai', text: '', streaming: true }]);

    try {
      // Use fuzzy search - pass the prompt as search term
      const contextData = formatDataForAI(dbData, prompt);

      // Build prompt with context
      const finalPrompt = buildPrompt(prompt, contextData);

      console.log("🤖 Sending to AI with fuzzy search context...");
      console.log("📊 Context length:", contextData.length);

      await askGemmaStream(finalPrompt, (token, fullText) => {
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { 
              ...updated[updated.length - 1], 
              text: fullText,
              streaming: true 
            };
          }
          return updated;
        });
      });

      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = { 
            ...updated[updated.length - 1], 
            streaming: false 
          };
        }
        return updated;
      });

    } catch (error) {
      console.error("❌ Chat error:", error);
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = { 
            sender: 'ai', 
            text: `❌ **Error**: ${error.message || 'Something went wrong. Please try again.'}`,
            streaming: false 
          };
        }
        return updated;
      });
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const suggestions = [
    "John",
    "2000100005201",
    "Pending",
    "HR",
    "Email",
    "Salary"
  ];

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">AI Assistant</h2>
            <p className="text-indigo-200 text-sm">
              {dbData ? `📊 ${dbData.verifications?.length || 0} records loaded` : 'Loading data...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold">Welcome to AI Assistant!</h3>
            <p className="text-sm">Search using fuzzy matching - try any text!</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(null, suggestion)}
                  className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg whitespace-pre-wrap ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200'
              }`}>
                {msg.text || (msg.streaming && '')}
                {msg.streaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-indigo-500 animate-pulse"></span>
                )}
              </div>
            </div>
          );
        })}
        {loading && (!messages.length || !messages[messages.length - 1]?.text) && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-md border border-gray-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-white rounded-b-lg flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name, CASE ID, email, phone... (Fuzzy Search)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={!dbData}
          />
          <button
            onClick={(e) => handleSend(e)}
            disabled={loading || !input.trim() || !dbData}
            className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-all ${
              loading || !input.trim() || !dbData
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-lg'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          🔍 Fuzzy search enabled - try typing any text
        </p>
      </div>
    </div>
  );
};

export default AIAssistance;