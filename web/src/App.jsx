import React, { useState, useEffect } from 'react';
import Avatar3D from './components/avatar/Avatar3D';
import ChatInterface from './components/ChatInterface';
import { llamaService } from './services/llm/LlamaService';
import { whisperService } from './services/stt/WhisperService';
import { ttsService } from './services/tts/TTSService';
import { memorySync } from './utils/MemorySync';
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

    // Model State
    const [modelReady, setModelReady] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

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

                // Initialize AI brain
                setStatus('Connecting to cloud AI...');
                await llamaService.initialize((progress) => {
                    setLoadingProgress(progress.progress * 100);
                });

                // Initialize voice services in background
                whisperService.initialize().catch(err => {
                    console.warn('Voice input will load when needed:', err);
                });

                ttsService.initialize().catch(err => {
                    console.warn('Voice output will load when needed:', err);
                });

                setModelReady(true);
                setStatus('Ready to chat!');

                // Speak greeting if TTS is ready
                if (ttsService.isReady()) {
                    ttsService.speak(greeting.content);
                }

                console.log('✅ Phuntroo is ready as your friend!');
            } catch (error) {
                console.error('Failed to initialize friend:', error);
                setStatus('Had trouble waking up 😴');
            }
        };

        initFriend();
    }, []);

    // Handle chat messages with friend personality
    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || !modelReady) return;

        const userMessage = {
            role: 'user',
            text: messageText,
            content: messageText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        setStatus('Thinking as your friend...');

        try {
            // Build friend context from memory
            const context = friendMemory ? {
                userPrefs: friendMemory.userPrefs,
                recentChats: friendMemory.chatHistory.slice(-5),
                emotion: currentEmotion
            } : {};

            // Generate friend response
            const aiResponse = await llamaService.generateResponse(messageText, context);

            const aiMessage = {
                role: 'assistant',
                reply: aiResponse,
                content: aiResponse,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);

            // Update friend memory
            if (friendMemory) {
                const updatedMemory = {
                    ...friendMemory,
                    chatHistory: [...friendMemory.chatHistory, userMessage, aiMessage].slice(-50), // Keep last 50
                    metadata: {
                        ...friendMemory.metadata,
                        lastSync: new Date().toISOString(),
                        totalInteractions: (friendMemory.metadata.totalInteractions || 0) + 1
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
                content: `I'm having trouble thinking right now, buddy. Can you try again?`,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorResponse]);
            setStatus('Had a brain hiccup 🤯');
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
                        '(Generate at: https://github.com/settings/tokens with "repo" scope)'
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
                    <h1 className="app-title">👋 Phuntroo - Your AI Friend</h1>
                    <div className="live-badge">
                        <div className="live-dot" />
                        <span>Evolving & Learning</span>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <div className="avatar-panel">
                    <div className="avatar-container">
                        <Avatar3D
                            expression={currentEmotion}
                            visemes={ttsService.visemeQueue}
                            avatarState={
                                isTalking ? 'talking' :
                                    isProcessing ? 'thinking' :
                                        isRecording ? 'listening' :
                                            'idle'
                            }
                            url="/phuntroo/models/avatar.vrm"
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
                <p>
                    Phuntroo Friend 💙 |
                    {friendMemory?.metadata?.totalInteractions > 0 &&
                        ` ${friendMemory.metadata.totalInteractions} chats together!`
                    }
                </p>
            </footer>
        </div>
    );
}

export default App;
