import React, { useState } from 'react';
import VRMAvatar from './components/VRMAvatar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: "Hello! I'm PHUNTROO with VRM Avatar support.",
        timestamp: new Date().toISOString()
    }]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('Ready');
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [isTalking, setIsTalking] = useState(false);

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        setStatus('Thinking...');

        try {
            // Call the real AI backend
            const API_BASE_URL = import.meta.env.VITE_API_URL ||
                (import.meta.env.MODE === 'production'
                    ? 'https://phuntroo-backend.onrender.com'
                    : 'http://localhost:3000');

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    conversationHistory: messages
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const aiResponse = {
                role: 'assistant',
                content: data.response || data.message || 'Sorry, I could not process that.',
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiResponse]);
            setStatus('Ready');
        } catch (error) {
            console.error('Error calling AI backend:', error);

            const errorResponse = {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, errorResponse]);
            setStatus('Error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-left">
                    <h1 className="app-title">🚀 PHUNTROO AI</h1>
                    <div className="live-badge">
                        <div className="live-dot" />
                        <span>VRM Avatar Active</span>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <div className="avatar-panel">
                    <div className="avatar-container">
                        <VRMAvatar
                            expression={currentEmotion}
                            isTalking={isTalking}
                            viseme="neutral"
                        />
                    </div>
                </div>

                <div className="chat-panel">
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isProcessing={isProcessing}
                        status={status}
                    />
                </div>
            </main>

            <footer className="app-footer">
                <p>PHUNTROO AI Assistant | VRM Avatar System</p>
            </footer>
        </div>
    );
}

export default App;
