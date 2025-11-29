import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

export default function ChatInterface({ messages, onSendMessage, onVoiceToggle, isProcessing, isRecording, status }) {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputText.trim() && !isProcessing) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="chat-interface">
            <div className="chat-header">
                <h2>💬 Phuntroo AI</h2>
                <span className="status-badge">{status}</span>
            </div>

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role}`}
                    >
                        <div className="message-avatar">
                            {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <textarea
                    className="chat-input"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isProcessing}
                    rows={2}
                />
                <button
                    type="button"
                    className="attach-button"
                    onClick={() => document.getElementById('file-upload').click()}
                    disabled={isProcessing}
                    title="Attach file"
                >
                    📎
                </button>
                <input
                    type="file"
                    id="file-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => console.log('File attached:', e.target.files[0])}
                />
                {onVoiceToggle && (
                    <button
                        type="button"
                        className={`voice-button ${isRecording ? 'recording' : ''}`}
                        onClick={onVoiceToggle}
                        disabled={isProcessing}
                    >
                        {isRecording ? '⏹️' : '🎤'}
                    </button>
                )}
                <button
                    type="submit"
                    className="send-button"
                    disabled={isProcessing || !inputText.trim()}
                >
                    {isProcessing ? '⏳' : '📤'}
                </button>
            </form>
        </div>
    );
}
