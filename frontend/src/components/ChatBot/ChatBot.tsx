'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { apiClient } from '@/common/utils/api/client';
import { isAuthenticated } from '@/lib/auth-utils';
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

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
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
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Only render if authenticated
    const [shouldRender, setShouldRender] = useState(false);

    // Check for Speech API support
    useEffect(() => {
        setShouldRender(isAuthenticated());

        // Check for speech recognition support
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            setSpeechSupported(true);
            recognitionRef.current = new SpeechRecognitionAPI();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';
        }

        // Check for speech synthesis support
        if (window.speechSynthesis) {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateId = () => Math.random().toString(36).substring(2, 11);

    // Text-to-Speech function
    const speakText = useCallback((text: string) => {
        if (!synthRef.current || !ttsEnabled) return;

        // Cancel any ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        // Try to find a good voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v =>
            v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    }, [ttsEnabled]);

    // Stop speaking
    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    // Speech-to-Text functions
    const startListening = useCallback(() => {
        if (!recognitionRef.current || isListening) return;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognitionRef.current.onerror = (event: Event) => {
            console.error('Speech recognition error:', event);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        try {
            recognitionRef.current.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || inputValue;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: Message = {
            id: generateId(),
            content: textToSend.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Stop any ongoing speech when sending a new message
        stopSpeaking();

        try {
            const response = await apiClient.post<ChatResponse>('/chatbot/message', {
                message: userMessage.content,
            });

            if (response.error) {
                throw new Error(response.error);
            }

            const botResponse = response.data?.response || 'I apologize, but I could not process your request.';

            const botMessage: Message = {
                id: generateId(),
                content: botResponse,
                sender: 'bot',
                timestamp: new Date(response.data?.timestamp || Date.now()),
            };

            setMessages(prev => [...prev, botMessage]);

            // Speak the bot's response
            speakText(botResponse);
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

    const toggleTts = () => {
        setTtsEnabled(prev => !prev);
        if (isSpeaking) {
            stopSpeaking();
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
                            <span className="chatbot-status">
                                {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : 'Online'}
                            </span>
                        </div>
                        {/* TTS Toggle Button */}
                        <button
                            className={`chatbot-tts-toggle ${ttsEnabled ? 'enabled' : ''}`}
                            onClick={toggleTts}
                            aria-label={ttsEnabled ? 'Disable voice responses' : 'Enable voice responses'}
                            title={ttsEnabled ? 'Voice responses on' : 'Voice responses off'}
                        >
                            {ttsEnabled ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                    <line x1="23" y1="9" x2="17" y2="15" />
                                    <line x1="17" y1="9" x2="23" y2="15" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chatbot-message ${message.sender} ${message.isError ? 'error' : ''}`}
                            >
                                {message.content}
                                {/* Speaker button for bot messages */}
                                {message.sender === 'bot' && !message.isError && synthRef.current && (
                                    <button
                                        className="chatbot-speak-btn"
                                        onClick={() => speakText(message.content)}
                                        aria-label="Read aloud"
                                        title="Read aloud"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        </svg>
                                    </button>
                                )}
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
                        {/* Microphone Button */}
                        {speechSupported && (
                            <button
                                className={`chatbot-mic-btn ${isListening ? 'listening' : ''}`}
                                onClick={isListening ? stopListening : startListening}
                                disabled={isLoading}
                                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                                title={isListening ? 'Stop listening' : 'Speak your message'}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                            </button>
                        )}

                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder={isListening ? "Listening..." : "Ask me anything..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading || isListening}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={() => handleSendMessage()}
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
