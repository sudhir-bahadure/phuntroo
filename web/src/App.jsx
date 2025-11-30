import React, { useState, useEffect } from 'react';
import Avatar3D from './components/avatar/Avatar3D';
import ChatInterface from './components/ChatInterface';
import AutonomyLog from './components/AutonomyLog';
import { llamaService } from './services/llm/LlamaService';
import { backendService } from './services/BackendService';
import { whisperService } from './services/stt/WhisperService';
import { ttsService } from './services/tts/TTSService';
import { memorySync } from './utils/MemorySync';
import { autonomyManager } from './services/autonomy/AutonomyManager';
import { getSmartOutfit } from './services/OutfitService';
import { visionService } from './services/vision/VisionService';
import { autonomousBrain } from './services/brain/AutonomousBrain';
import BrainMonitor from './components/BrainMonitor';
import AvatarAnalysisPanel from './components/AvatarAnalysisPanel';
import './App.css';

function App() {
    console.log('👋 Phuntroo Friend AI Loading...');

    // Friend Memory State
    const [friendMemory, setFriendMemory] = useState(null);
    const [messages, setMessages] = useState([]);

    // UI State
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('Waking up...');
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [isTalking, setIsTalking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSeeing, setIsSeeing] = useState(false); // Vision State
    const [currentOutfit, setCurrentOutfit] = useState(null);

    // Model State
    const [modelReady, setModelReady] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStage, setLoadingStage] = useState('Initializing...');

    // Initialize Friend Memory & AI
    useEffect(() => {
        const initFriend = async () => {
            try {
                console.log('🧠 Initializing your friend Phuntroo...');

                // Load friend memory
                const memory = memorySync.loadLocal();
                setFriendMemory(memory);

                // Greet with personalized message
                const greeting = {
                    role: 'assistant',
                    content: `Hey ${memory.userPrefs.name}! 👋 I'm Phuntroo, your AI friend. I'm so glad to see you again! How are you feeling today?`,
                    timestamp: new Date().toISOString()
                };
                setMessages([greeting]);

                // Initialize connection to Java Backend
                setStatus('Connecting to server...');
                const isBackendReady = await backendService.checkHealth();

                if (isBackendReady) {
                    console.log('✅ Connected to Java Backend');
                } else {
                    console.warn('⚠️ Backend not reachable, please ensure Java server is running on port 8080');
                }

                setLoadingProgress(100);
                setLoadingStage('Connected');

                // Initialize voice services in background
                whisperService.initialize().catch(err => {
                    console.warn('Voice input will load when needed:', err);
                });

                ttsService.initialize().catch(err => {
                    console.warn('Voice output will load when needed:', err);
                });

                setModelReady(true);
                setStatus('Ready to chat!');

                // Start autonomous brain
                autonomousBrain.start();

                // Speak greeting
                ttsService.speak(greeting.content).catch(err => {
                    console.warn('TTS not ready yet:', err);
                });

                console.log('✅ Phuntroo is ready as your friend!');
            } catch (error) {
                console.error('Failed to initialize friend:', error);
                setStatus(`Had trouble waking up 😴 (${error.message})`);
            }
        };

        initFriend();
    }, []);

    // Unlock Audio System on first interaction (Fixes AudioContext warnings)
    useEffect(() => {
        const unlockAudio = () => {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                ctx.resume().then(() => {
                    ctx.close();
                    console.log('🔊 Audio System Unlocked');
                });
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    // Autonomous Brain Loop
    useEffect(() => {
        if (!modelReady) return;

        const brainInterval = setInterval(() => {
            // Context for the brain
            const context = {
                emotion: currentEmotion,
                isTalking: isTalking,
                lastMessage: messages.length > 0 ? messages[messages.length - 1].content : null
            };

            // Let the brain decide what to do (move, gesture, etc.)
            autonomyManager.decideAction(context);
        }, 1000); // Think every second

        return () => clearInterval(brainInterval);
    }, [modelReady, currentEmotion, isTalking, messages]);

    // Handle chat messages with friend personality
    const handleSendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        const userMessage = {
            role: 'user',
            text: messageText,
            content: messageText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        setStatus('Thinking...');

        try {
            // Call Java Backend
            const response = await backendService.sendMessage(messageText);

            const aiResponse = response.reply;
            const provider = response.provider;

            console.log(`🤖 Response from ${provider}`);

            // Smart Outfit Change based on conversation topic (Optional, keep if needed)
            // const newOutfit = await getSmartOutfit([...messages, userMessage]);
            // if (newOutfit && newOutfit.name !== currentOutfit?.name) {
            //     setCurrentOutfit(newOutfit);
            // }

            const aiMessage = {
                role: 'assistant',
                reply: aiResponse,
                content: aiResponse,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);

            // Update friend memory (Keep local memory for now)
            if (friendMemory) {
                const updatedMemory = {
                    ...friendMemory,
                    chatHistory: [...friendMemory.chatHistory, userMessage, aiMessage].slice(-50),
                    metadata: {
                        ...friendMemory.metadata,
                        lastSync: new Date().toISOString(),
                        totalInteractions: (friendMemory?.metadata?.totalInteractions || 0) + 1
                    }
                };
                setFriendMemory(updatedMemory);
                await memorySync.save(updatedMemory);
            }

            // Speak response
            setIsTalking(true);
            ttsService.speak(aiResponse).then(() => {
                setIsTalking(false);
            }).catch(err => {
                console.warn('TTS error:', err);
                setIsTalking(false);
            });

            setStatus('Ready to chat!');
        } catch (error) {
            console.error('Error generating response:', error);
            const errorResponse = {
                role: 'assistant',
                content: `I'm having trouble connecting to the server. Is it running?`,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorResponse]);
            setStatus('Connection error 🔌');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle voice recording
    const handleVoiceToggle = async () => {
        if (isRecording) {
            setIsRecording(false);
            setStatus('Listening to you...');
            try {
                const text = await whisperService.stopRecording();
                if (text) {
                    await handleSendMessage(text);
                }
            } catch (error) {
                console.error('Voice error:', error);
                setStatus('Couldn\'t hear you clearly');
            }
        } else {
            try {
                await whisperService.startRecording();
                setIsRecording(true);
                setStatus('🎤 I\'m listening!');
            } catch (error) {
                console.error('Failed to start recording:', error);
                setStatus('Microphone error');
            }
        }
    };

    // Handle Vision Toggle
    const handleVisionToggle = async () => {
        if (isSeeing) {
            visionService.stopCamera();
            setIsSeeing(false);
            setStatus('Vision off');
        } else {
            try {
                await visionService.startCamera();
                setIsSeeing(true);
                setStatus('👀 I can see you!');
            } catch (error) {
                console.error('Vision error:', error);
                setStatus('Camera error 🚫');
            }
        }
    };

    // GitHub Token Setup (one-time)
    useEffect(() => {
        if (!memorySync.getToken() && modelReady) {
            // Optionally prompt for token (non-blocking)
            setTimeout(() => {
                const needsToken = window.confirm(
                    'Want your memories to survive forever? I can sync to GitHub!\n\n' +
                    'Click OK to set up (requires free GitHub token)'
                );
                if (needsToken) {
                    const token = window.prompt(
                        'Paste your GitHub Personal Access Token:\n' +
                        '(Generate at: https://github.com/settings/tokens with \"repo\" scope)'
                    );
                    if (token) {
                        memorySync.setToken(token);
                        memorySync.syncToGitHub(friendMemory);
                    }
                }
            }, 5000); // Ask after 5 seconds
        }
    }, [modelReady, friendMemory]);

    // Loading screen
    if (!modelReady) {
        return (
            <div className="loading-screen">
                <h1>👋 Hey! Phuntroo waking up...</h1>
                <p>Connecting to cloud AI - no download needed! ☁️</p>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${loadingProgress}%` }}
                    />
                </div>
                <p>{loadingProgress.toFixed(1)}%</p>
                <small>Cloud AI - instant, no downloads, works anywhere! 🚀</small>
            </div>
        );
    }

    // Main UI
    return (
        <div className="app">
            <header className="app-header">
                <div className="header-left">
                    <h1 className="app-title">👋 Phuntroo</h1>
                    <div className="status-pill">
                        <span className="status-dot online"></span>
                        <span className="status-text">Online</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="engine-indicator">
                        <span className="engine-label">Brain:</span>
                        <span className="engine-value">Cloud AI (Free)</span>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <div className="avatar-panel">
                    <Avatar3D
                        url="/models/avatar.vrm"
                        avatarState={isTalking ? 'talking' : isProcessing ? 'thinking' : 'idle'}
                        expression={currentEmotion}
                        visemes={ttsService.visemeQueue}
                    />
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
                    {/* Vision Toggle Button (Floating) */}
                    <button
                        className={`icon-button vision-btn ${isSeeing ? 'active' : ''}`}
                        onClick={handleVisionToggle}
                        title="Toggle Vision"
                        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 200 }}
                    >
                        {isSeeing ? '👀' : '📷'}
                    </button>
                </div>
            </main>

            <footer className="app-footer">
                <p>
                    Phuntroo Friend 💙 |
                    {friendMemory?.metadata?.totalInteractions > 0 &&
                        ` ${friendMemory.metadata.totalInteractions} chats together!`
                    }
                </p>
            </footer>
            <BrainMonitor />

            {/* API Settings Button */}
            <button
                onClick={() => setShowAPISettings(true)}
                title="Configure AI Providers"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    background: 'linear-gradient(135deg, #4a9eff 0%, #3d7fd8 100%)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(74, 158, 255, 0.4)',
                    zIndex: 100,
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
                🤖
            </button>

            {/* API Key Settings Modal */}
            {showAPISettings && (
                <APIKeySettings onClose={() => setShowAPISettings(false)} />
            )}

            {/* Avatar Analysis Panel */}
            <AvatarAnalysisPanel vrmModel={null} />
        </div>
    );
}

export default App;
