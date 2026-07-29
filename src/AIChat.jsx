



import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './Config/Config';
import axiosInstance from './Config/axiosConfig';
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Chip,
    Badge,
    CircularProgress,
    Alert,
    Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const AIChat = ({ 
    open, 
    onClose, 
    caseId, 
    userRole, // 'hr' or 'candidate'
    senderId,
    hrName = 'HR Team',
    candidateName
}) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [lastId, setLastId] = useState('');
    const [hrOnline, setHrOnline] = useState(false);
    const [error, setError] = useState(null);
    
const messagesEndRef = useRef(null);
const pollIntervalRef = useRef(null);

const isPollingRef = useRef(false);
const isMountedRef = useRef(true);

const readingRef = useRef(false);
const lastIdRef = useRef('');

    // Filter out AI/system messages
    const filterMessages = (msgs) => {
        return msgs.filter(msg => {
            // Remove system messages
            if (msg.sender_type === 'system') return false;
            // Remove AI responses
            if (msg.is_ai_response === true) return false;
            // Remove messages that contain AI signature
            if (msg.message && msg.message.includes('Your AI HR Assistant')) return false;
            return true;
        });
    };

    // Cleanup function
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current);
        pollIntervalRef.current = null;
    }

    isPollingRef.current = false;
}, []);

    // Fetch HR status
    const fetchHRStatus = useCallback(async () => {
        if (!caseId || !isMountedRef.current) return;
        
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/chat/hr-status/${caseId}`
            );
            if (response.data.success && isMountedRef.current) {
                setHrOnline(response.data.online);
            }
        } catch (err) {
            console.error('Error fetching HR status:', err);
        }
    }, [caseId]);

    // Fetch messages (only on initial load)
    const fetchMessages = useCallback(async () => {
        if (!caseId || !isMountedRef.current) return;
        
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `${API_BASE_URL}/chat/messages/${caseId}`,
                {
                    params: {
                        sender_type: userRole
                    }
                }
            );

            console.log("responseresponseresponse",response);

            if (response.data.success && isMountedRef.current) {
                // Filter out AI messages
                const filteredMsgs = filterMessages(response.data.messages);
                setMessages(filteredMsgs);
                if (filteredMsgs.length > 0) {
                    const last = filteredMsgs[filteredMsgs.length - 1];
                   setLastId(last.id);
              lastIdRef.current = last.id;
                }
                setHrOnline(response.data.hr_online);
                scrollToBottom();
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            if (isMountedRef.current) {
                setError('Failed to load messages');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [caseId, userRole]);

    // Poll for new messages

    // Mark as read
  const markAsRead = useCallback(async () => {
    if (!caseId || readingRef.current) return;

    readingRef.current = true;

    try {
        await axiosInstance.post(
            `${API_BASE_URL}/chat/read/${caseId}`,
            {
                sender_type: userRole
            }
        );
    } catch (err) {
        console.error('Error marking as read:', err);
    } finally {
        readingRef.current = false;
    }
}, [caseId, userRole]);

  const pollNewMessages = useCallback(async () => {

    if (isPollingRef.current || !caseId || !isMountedRef.current)
        return;

    isPollingRef.current = true;

    try {

        const response = await axiosInstance.get(
            `${API_BASE_URL}/chat/new/${caseId}`,
            {
                params: {
                    last_id: lastIdRef.current,
                    sender_type: userRole
                }
            }
        );

        if (
            response.data.success &&
            response.data.messages.length > 0 &&
            isMountedRef.current
        ) {

            const filteredMsgs = filterMessages(response.data.messages);

            if (filteredMsgs.length > 0) {

               setMessages(prev => {

    const newList = filteredMsgs.filter(newMsg =>
        !prev.some(oldMsg => oldMsg.id === newMsg.id)
    );

    return [
        ...prev,
        ...newList
    ];

});

                const last = filteredMsgs[filteredMsgs.length - 1];

                setLastId(last.id);
                lastIdRef.current = last.id;

                scrollToBottom();

                const unread = filteredMsgs.filter(
                    msg =>
                        msg.sender_type !== userRole &&
                        msg.status !== 'read'
                );


                if (unread.length > 0) {
                    await markAsRead();
                }
            }

            setHrOnline(response.data.hr_online);
        }

    } catch (err) {

        console.error(err);

    } finally {

        isPollingRef.current = false;

    }

}, [caseId, userRole, markAsRead]);
    // Send message - NO AI
    const sendMessage = async () => {
        const trimmed = newMessage.trim();
        if (!trimmed || sending || !caseId) return;

        setSending(true);
        setError(null);

        try {
            const response = await axiosInstance.post(
                `${API_BASE_URL}/chat/send`,
                {
                    case_id: caseId,
                    message: trimmed,
                    sender_type: userRole,
                    sender_id: senderId,
                    use_rag: false // Disable AI
                }
            );

            if (response.data.success) {
                // Filter the new message (shouldn't be AI anyway)
                const newMsg = response.data.message;
          if (!newMsg.is_ai_response && newMsg.sender_type !== 'system') {

    setMessages(prev => {

        // prevent duplicate message
        const exists = prev.some(
            msg => msg.id === newMsg.id
        );

        if (exists) {
            return prev;
        }

        return [...prev, newMsg];

    });


    setLastId(newMsg.id);
    lastIdRef.current = newMsg.id;
}

                setNewMessage('');
                setHrOnline(response.data.hr_online);
                scrollToBottom();
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Scroll to bottom
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    // Get message status icon
    const getStatusIcon = (status) => {
        if (status === 'read') return <DoneAllIcon sx={{ fontSize: 14, color: '#34d399' }} />;
        if (status === 'sent') return <DoneIcon sx={{ fontSize: 14, color: '#9ca3af' }} />;
        return null;
    };

    // Get sender info
    const getSenderInfo = (message) => {
        if (message.sender_type === 'hr') {
            return {
                name: hrName,
                icon: <BusinessIcon sx={{ fontSize: 18 }} />,
                color: '#4f46e5',
                bgColor: '#e0e7ff'
            };
        } else if (message.sender_type === 'candidate') {
            return {
                name: candidateName,
                icon: <PersonIcon sx={{ fontSize: 18 }} />,
                color: '#10b981',
                bgColor: '#d1fae5'
            };
        } else {
            return {
                name: 'System',
                icon: <BusinessIcon sx={{ fontSize: 18 }} />,
                color: '#7c3aed',
                bgColor: '#ede9fe'
            };
        }
    };

    const isCurrentUser = (message) => {
        return message.sender_type === userRole;
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Initialize chat
useEffect(() => {
    isMountedRef.current = true;

    if (open && caseId) {
        fetchHRStatus();
        fetchMessages();

        // Clear previous timer
        if (pollIntervalRef.current) {
            clearTimeout(pollIntervalRef.current);
        }

        const startPolling = async () => {
            if (!isMountedRef.current) return;

            await pollNewMessages();

            pollIntervalRef.current = setTimeout(startPolling, 3000);
        };

        startPolling();

        setTimeout(() => {
            const input = document.querySelector('input[type="text"]');
            if (input) {
                input.focus();
            }
        }, 500);
    }

    return () => {
        isMountedRef.current = false;

        if (pollIntervalRef.current) {
            clearTimeout(pollIntervalRef.current);
        }
    };
}, [open, caseId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, [cleanup]);

    if (!open) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: { xs: 0, sm: 20 },
                right: { xs: 0, sm: 20 },
                width: { xs: '100%', sm: 420 },
                height: { xs: '100%', sm: 580 },
                maxHeight: '100vh',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#fff',
                borderRadius: { xs: 0, sm: 3 },
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
            }}
        >
            <style>
                {`
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>

            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Badge
                        color={hrOnline ? 'success' : 'error'}
                        variant="dot"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                            {userRole === 'hr' ? <BusinessIcon /> : <PersonIcon />}
                        </Avatar>
                    </Badge>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {userRole === 'hr' ? `Chat with (${caseId})` : `Chat with HR`}
                        </Typography>
                        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: hrOnline ? '#10b981' : '#ef4444',
                                    display: 'inline-block',
                                    animation: hrOnline ? 'pulse 2s infinite' : 'none'
                                }}
                            />
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {hrOnline ? 'HR Online' : 'HR Online'}
                            </Typography>
                        </Box> */}
                    </Box>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Messages */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    bgcolor: '#f7f7f8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                }}
            >
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#9ca3af' }}>
                        <Typography variant="body2">
                            No messages yet. Start the conversation!
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#7c3aed' }}>
                            💡 Send a message to get started
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message, index) => {
                        const sender = getSenderInfo(message);
                        const isUser = isCurrentUser(message);

                        return (
                            <Box
                                key={message.id || index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                                    gap: 1,
                                    animation: 'slideUp 0.2s ease-out',
                                }}
                            >
                                {!isUser && (
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: sender.bgColor, color: sender.color }}>
                                        {sender.icon}
                                    </Avatar>
                                )}
                                <Box
                                    sx={{
                                        maxWidth: '75%',
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                        bgcolor: isUser ? '#4f46e5' : '#fff',
                                        color: isUser ? '#fff' : '#1f2937',
                                        border: isUser ? 'none' : '1px solid #e5e7eb',
                                        borderTopRightRadius: isUser ? 4 : 16,
                                        borderTopLeftRadius: isUser ? 16 : 4,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {message.message}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <Typography variant="caption" sx={{ opacity: 0.6, fontSize: 10 }}>
                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                        {isUser && getStatusIcon(message.status)}
                                    </Box>
                                </Box>
                                {isUser && (
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5' }}>
                                        {userRole === 'hr' ? <BusinessIcon sx={{ fontSize: 16 }} /> : <PersonIcon sx={{ fontSize: 16 }} />}
                                    </Avatar>
                                )}
                            </Box>
                        );
                    })
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ borderRadius: 0, flexShrink: 0 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            {/* Input */}
            <Box
                sx={{
                    p: 1.5,
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: 1,
                    bgcolor: '#fff',
                    flexShrink: 0,
                }}
            >
                <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    size="small"
                    placeholder={
                        userRole === 'hr' 
                            ? 'Type your response...' 
                            : 'Type your message...'
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    sx={{
                        '& .MuiOutlinedInput-root': { 
                            borderRadius: 3,
                            '&:hover fieldset': {
                                borderColor: '#4f46e5',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#4f46e5',
                            },
                        },
                    }}
                />
                <IconButton
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    sx={{
                        bgcolor: '#4f46e5',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 44,
                        height: 44,
                        '&:hover': { 
                            bgcolor: '#4338ca',
                            transform: 'scale(1.05)',
                        },
                        '&.Mui-disabled': { 
                            bgcolor: '#e5e7eb', 
                            color: '#9ca3af' 
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    {sending ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        <SendIcon fontSize="small" />
                    )}
                </IconButton>
            </Box>
        </Box>
    );
};

export default AIChat;