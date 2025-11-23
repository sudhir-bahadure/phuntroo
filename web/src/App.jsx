import React, { useState, useEffect } from 'react';
import VRMAvatar from './components/VRMAvatar';
import ChatInterface from './components/ChatInterface';
import { llamaService } from './services/llm/LlamaService';
import { whisperService } from './services/stt/WhisperService';
import './App.css';

function App() {
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: "Hello! I'm PHUNTROO. I run fully locally in your browser!",
        timestamp: new Date().toISOString()
    }]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('Initializing...');
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [isTalking, setIsTalking] = useState(false);

    // Local Model State
    const [modelReady, setModelReady] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        const initModel = async () => {
            try {
                setStatus('Downloading AI Brain...');
                await llamaService.initialize((progress) => {
                    setLoadingProgress(progress);
                });

                // Initialize Whisper in background
                whisperService.initialize().catch(err => {
                    console.warn('Whisper failed to load:', err);
                });

                setModelReady(true);
                setStatus('Ready');
            } catch (error) {
                console.error('Failed to load model:', error);
                setStatus('Error loading model');
            }
        };
        initModel();
    }, []);

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
            // Use Local LLM
            const response = await llamaService.generateResponse(
                [...messages, userMessage],
                (token) => {
                    // Optional: Stream tokens here if we want real-time typing
                }
            );

            const aiResponse = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiResponse]);
            setStatus('Ready');
        } catch (error) {
            console.error('Error generating response:', error);
            const errorResponse = {
                role: 'assistant',
                content: `Error: ${error.message}`,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorResponse]);
            setStatus('Error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVoiceToggle = async () => {
        if (isRecording) {
            // Stop recording and transcribe
            setIsRecording(false);
            setStatus('Transcribing...');
            try {
                const text = await whisperService.stopRecording();
                if (text) {
                    await handleSendMessage(text);
                }
            } catch (error) {
                console.error('Voice error:', error);
                setStatus('Voice error');
            }
        } else {
            // Start recording
            try {
                await whisperService.startRecording();
                setIsRecording(true);
                setStatus('Listening...');
            } catch (error) {
                console.error('Failed to start recording:', error);
                setStatus('Microphone error');
            }
        }
    };


    if (!modelReady) {
        return (
            <div className="loading-screen">
                <h1>🚀 PHUNTROO AI</h1>
                <p>Downloading AI Brain (Llama-3-8B)...</p>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${loadingProgress}%` }}
                    />
                </div>
                <p>{loadingProgress.toFixed(1)}%</p>
                <small>This happens only once. Please wait.</small>
            </div>
        );
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-left">
                    <h1 className="app-title">🚀 PHUNTROO AI (Local)</h1>
                    <div className="live-badge">
                        <div className="live-dot" />
                        <span>Offline Capable</span>
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
                        onVoiceToggle={handleVoiceToggle}
                        isProcessing={isProcessing}
                        isRecording={isRecording}
                        status={status}
                    />
                </div>
            </main>

            <footer className="app-footer">
                <p>PHUNTROO AI | Powered by Llama-3 WASM</p>
            </footer>
        </div>
    );
}

export default App;
