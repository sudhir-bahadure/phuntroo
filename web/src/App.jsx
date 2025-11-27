import React, { useState, useEffect } from 'react';
import Avatar3D from './components/avatar/Avatar3D';
import ChatInterface from './components/ChatInterface';
import AutonomyLog from './components/AutonomyLog';
import { llamaService } from './services/llm/LlamaService';
import { whisperService } from './services/stt/WhisperService';
import { ttsService } from './services/tts/TTSService';
import { memorySync } from './utils/MemorySync';
import { autonomyManager } from './services/autonomy/AutonomyManager';
import { getSmartOutfit } from './services/OutfitService';
import { visionService } from './services/vision/VisionService';
import { autonomousBrain } from './services/brain/AutonomousBrain';
import BrainMonitor from './components/BrainMonitor';
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

                // Start autonomous brain
                autonomousBrain.start();

                // Speak greeting
                ttsService.speak(greeting.content).catch(err => {
                    console.warn('TTS not ready yet:', err);
                });

                console.log('✅ Phuntroo is ready as your friend!');
            } catch (error) {
                console.error('Failed to initialize friend:', error);
                setStatus('Had trouble waking up 😴');
            }
        };

        initFriend();
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
                emotion: currentEmotion,
                outfit: currentOutfit,
                image: isSeeing ? visionService.captureImage() : null // Capture image if seeing
            } : {};

            // Generate friend response
            // Pass full message history for better context
            const rawResponse = await llamaService.generateResponse([...messages, userMessage], context);

            // Parse actions from response (e.g. [action: wave])
            let aiResponse = rawResponse;
            const actionMatch = rawResponse.match(/\[(action|expression): ([^\]]+)\]/);

            if (actionMatch) {
                const type = actionMatch[1];
                const value = actionMatch[2];

                // Remove tag from spoken text
                aiResponse = rawResponse.replace(/\[(action|expression): [^\]]+\]/g, '').trim();

                console.log(`🤖 AI Action: ${type} -> ${value}`);

                if (type === 'action') {
                    // Map common actions to gestures
                    if (['wave', 'nod', 'shake', 'clap'].includes(value)) {
                        autonomyManager.setGesture(value);
                    } else {
                        autonomyManager.setAction(value);
                    }
                } else if (type === 'expression') {
                    setCurrentEmotion(value);
                }
            }

            // Smart Outfit Change based on conversation topic
            const newOutfit = await getSmartOutfit([...messages, userMessage]);
            if (newOutfit && newOutfit.name !== currentOutfit?.name) {
                console.log(`👗 Changing outfit to: ${newOutfit.name}`);
                setCurrentOutfit(newOutfit);
            }

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
                    <h1 className="app-title">👋 Phuntroo - Your AI Friend</h1>
                    <div className="live-badge">
                        <div className="live-dot" />
                        <span>Evolving & Learning</span>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <div className="avatar-panel">
                    <Avatar3D
                        url="/models/avatar.vrm"
                        avatarState={isTalking ? 'talking' : isProcessing ? 'thinking' : 'idle'}
                        expression={currentEmotion}
                        visemes={[]}
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
        </div>
    );
}

export default App;
