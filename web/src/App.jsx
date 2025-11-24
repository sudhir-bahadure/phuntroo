import React, { useState, useEffect } from 'react';
import Avatar3D from './components/avatar/Avatar3D';
import ChatInterface from './components/ChatInterface';
import { llamaService } from './services/llm/LlamaService';
import { whisperService } from './services/stt/WhisperService';
import { ttsService } from './services/tts/TTSService';
import { analyzeTopicForOutfit, getSmartOutfit } from './services/OutfitService';
import { memoryService } from './services/memory/MemoryService';
import { vectorDB } from './services/memory/VectorDB';
import { learningEngine } from './services/learning/LearningEngine';
import { webSearchSkill } from './services/skills/WebSearchSkill';
import { knowledgeAcquisition } from './services/skills/KnowledgeAcquisition';
import { personalityEngine } from './services/personality/PersonalityEngine';
import { selfUpgradeEngine } from './services/upgrade/SelfUpgradeEngine';
import { errorMonitor } from './services/monitoring/ErrorMonitor';
import { selfHealingEngine } from './services/healing/SelfHealingEngine';
import './App.css';

function App() {
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: "Hello! I am online and ready. My brain is fully operational.",
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
    const [currentOutfit, setCurrentOutfit] = useState({
        name: 'Casual',
        colors: { primary: '#E74C3C', secondary: '#ECF0F1', accent: '#F39C12' }
    });

    useEffect(() => {
        console.log('🚀 PHUNTROO AI - Version: Fixed Deployment 1.1 (Local Fixes Applied)');
        const initModel = async () => {
            try {
                // Start error monitoring and self-healing FIRST
                errorMonitor.startMonitoring();
                selfHealingEngine.activate();

                setStatus('Downloading AI Brain...');
                await llamaService.initialize((progress) => {
                    setLoadingProgress(progress);
                });

                // Initialize Whisper in background
                whisperService.initialize().catch(err => {
                    console.warn('Whisper failed to load:', err);
                });

                // Initialize TTS
                ttsService.initialize().catch(err => {
                    console.warn('TTS failed to load:', err);
                });

                // Initialize VectorDB for memory search
                vectorDB.initialize().catch(err => {
                    console.warn('VectorDB failed to load:', err);
                });

                // Load past memories
                const stats = await memoryService.getStats();
                console.log('📚 Memory loaded:', stats);

                // Perform initial health check
                const healthReport = await selfHealingEngine.performHealthCheck();
                console.log('🏥 Health report:', healthReport);

                // Set up periodic health checks (every 5 minutes)
                setInterval(async () => {
                    await selfHealingEngine.performHealthCheck();
                }, 5 * 60 * 1000);

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
            // Check if we should search the web first
            let finalResponse = '';

            if (webSearchSkill.shouldSearch(messageText)) {
                setStatus('Searching the web...');
                const searchSummary = await webSearchSkill.searchAndSummarize(messageText);

                // Use LLM to incorporate search results
                const enhancedPrompt = `User asked: "${messageText}"\n\nWeb search results:\n${searchSummary}\n\nProvide a helpful response incorporating this information.`;
                finalResponse = await llamaService.generateResponse(
                    [...messages, { role: 'user', content: enhancedPrompt }],
                    (token) => { }
                );
            } else {
                // Use Local LLM normally
                setStatus('Thinking...');
                finalResponse = await llamaService.generateResponse(
                    [...messages, userMessage],
                    (token) => { }
                );
            }

            const aiResponse = {
                role: 'assistant',
                content: finalResponse,
                timestamp: new Date().toISOString()
            };

            const updatedMessages = [...messages, userMessage, aiResponse];
            setMessages(updatedMessages);

            // Smart outfit selection using learned preferences
            const newOutfit = await getSmartOutfit(updatedMessages, learningEngine);
            if (JSON.stringify(newOutfit) !== JSON.stringify(currentOutfit)) {
                console.log('🎨 Outfit:', newOutfit.name);
                setCurrentOutfit(newOutfit);
            }

            // Store conversation in memory
            const conversationId = await memoryService.storeConversation(
                messageText,
                finalResponse,
                {
                    outfit: newOutfit?.name,
                    emotion: currentEmotion,
                    topics: newOutfit ? [newOutfit.name] : []
                }
            );

            // Generate and store embedding asynchronously
            if (conversationId) {
                vectorDB.addEmbeddingToConversation(
                    conversationId,
                    `${messageText} ${finalResponse}`
                ).catch(err => console.warn('Embedding failed:', err));

                // Calculate conversation quality
                selfUpgradeEngine.calculateQualityScore({
                    userMessage: messageText,
                    aiResponse: finalResponse,
                    context: {
                        outfit: newOutfit?.name,
                        emotion: currentEmotion,
                        topics: newOutfit ? [newOutfit.name] : []
                    },
                    timestamp: new Date().toISOString()
                });
            }

            // Trigger learning every 5 conversations
            const stats = await memoryService.getStats();
            if (stats && stats.totalConversations % 5 === 0) {
                console.log('🎓 Learning from conversations...');
                learningEngine.updatePersonalityFromLearnings().catch(err =>
                    console.warn('Learning failed:', err)
                );
            }

            // Trigger autonomous self-upgrade every 10 conversations
            if (stats && stats.totalConversations % 10 === 0) {
                console.log('🚀 Running autonomous self-upgrade...');
                selfUpgradeEngine.autonomousUpgrade().catch(err =>
                    console.warn('Self-upgrade failed:', err)
                );
            }

            // Make avatar speak the response
            setIsTalking(true);
            ttsService.speak(finalResponse).then(() => {
                setIsTalking(false);
            }).catch(err => {
                console.warn('TTS error:', err);
                setIsTalking(false);
            });

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
                        <Avatar3D
                            expression={currentEmotion}
                            visemes={ttsService.visemeQueue}
                            avatarState={
                                isTalking ? 'talking' :
                                    isProcessing ? 'thinking' :
                                        isRecording ? 'listening' :
                                            'idle'
                            }
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
