'use client';

import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/common/utils/api/client';
import { getEmployeeIdFromCookie, isAuthenticated } from '@/lib/auth-utils';
import './ChatBot.css';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    isError?: boolean;
}

interface ChatResponse {
    response: string;
    timestamp: Date;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: "Hello! I'm Arcana, your AI assistant. I can help you with questions about your profile, policies, departments, leaves, and more. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Only render if authenticated
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        setShouldRender(isAuthenticated());
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateId = () => Math.random().toString(36).substring(2, 11);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: generateId(),
            content: inputValue.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await apiClient.post<ChatResponse>('/chatbot/message', {
                message: userMessage.content,
            });

            if (response.error) {
                throw new Error(response.error);
            }

            const botMessage: Message = {
                id: generateId(),
                content: response.data?.response || 'I apologize, but I could not process your request.',
                sender: 'bot',
                timestamp: new Date(response.data?.timestamp || Date.now()),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: generateId(),
                content: error instanceof Error ? error.message : 'Sorry, something went wrong. Please try again.',
                sender: 'bot',
                timestamp: new Date(),
                isError: true,
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!shouldRender) {
        return null;
    }

    return (
        <div className="chatbot-container">
            {/* Floating Action Button */}
            <button
                className={`chatbot-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                <div className="chatbot-stars">
                    <span className="chatbot-star"></span>
                    <span className="chatbot-star"></span>
                    <span className="chatbot-star"></span>
                </div>
                {isOpen ? (
                    <svg className="chatbot-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="chatbot-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a8 8 0 0 0-8 8c0 2.21.895 4.21 2.343 5.657L12 22l5.657-6.343A8 8 0 0 0 12 2z" />
                        <circle cx="12" cy="10" r="3" />
                        <path d="M8 21h8" />
                        <path d="M12 17v4" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a8 8 0 0 0-8 8c0 2.21.895 4.21 2.343 5.657L12 22l5.657-6.343A8 8 0 0 0 12 2z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <div className="chatbot-info">
                            <h3>Arcana AI</h3>
                            <span className="chatbot-status">Online</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chatbot-message ${message.sender} ${message.isError ? 'error' : ''}`}
                            >
                                {message.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Ask me anything..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            aria-label="Send message"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
