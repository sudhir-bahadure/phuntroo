import React, { useState, useRef, useEffect } from 'react';
import './VoiceControl.css';

export default function VoiceControl({ onVoiceInput, onTTSComplete, isProcessing }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [volume, setVolume] = useState(0);

    const recognitionRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-IN'; // Indian English

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);

                if (event.results[current].isFinal) {
                    onVoiceInput(transcriptText);
                    setTranscript('');
                    setIsListening(false);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [onVoiceInput]);

    // Toggle voice input
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Text-to-Speech with Indian female voice
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Try to find Indian English female voice
            const voices = window.speechSynthesis.getVoices();
            const indianVoice = voices.find(voice =>
                voice.lang.includes('en-IN') && voice.name.includes('female')
            ) || voices.find(voice =>
                voice.lang.includes('en-IN')
            ) || voices.find(voice =>
                voice.lang.includes('hi-IN')
            );

            if (indianVoice) {
                utterance.voice = indianVoice;
            }

            utterance.lang = 'en-IN';
            utterance.pitch = 1.1;
            utterance.rate = 0.95;
            utterance.volume = 1;

            utterance.onstart = () => {
                setIsSpeaking(true);
                startVolumeVisualization();
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                stopVolumeVisualization();
                if (onTTSComplete) {
                    onTTSComplete();
                }
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsSpeaking(false);
                stopVolumeVisualization();
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    // Volume visualization for speaking
    const startVolumeVisualization = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
        }

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const updateVolume = () => {
            if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setVolume(average / 255);
            }
            animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
    };

    const stopVolumeVisualization = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setVolume(0);
    };

    // Expose speak function to parent
    useEffect(() => {
        window.jarvisTTS = speak;
    }, []);

    return (
        <div className="voice-control">
            {/* Microphone Button */}
            <button
                className={`mic-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
                onClick={toggleListening}
                disabled={isProcessing || isSpeaking}
                title={isListening ? 'Stop listening' : 'Start voice input'}
            >
                <div className="mic-icon-wrapper">
                    {isListening ? (
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mic-icon pulse"
                        >
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    ) : (
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mic-icon"
                        >
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    )}
                </div>

                {/* Volume visualization */}
                {(isListening || isSpeaking) && (
                    <div className="volume-bars">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="volume-bar"
                                style={{
                                    height: `${Math.random() * 100}%`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </button>

            {/* Transcript Display */}
            {transcript && (
                <div className="transcript-display fade-in">
                    <div className="transcript-label">Listening...</div>
                    <div className="transcript-text">{transcript}</div>
                </div>
            )}

            {/* Status */}
            <div className="voice-status">
                {isListening && <span className="status-text">🎤 Listening...</span>}
                {isSpeaking && <span className="status-text">🔊 Speaking...</span>}
                {!isListening && !isSpeaking && !isProcessing && (
                    <span className="status-text">Click to speak</span>
                )}
            </div>
        </div>
    );
}
