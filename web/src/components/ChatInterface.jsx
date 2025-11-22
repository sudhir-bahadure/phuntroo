import React from 'react';

export default function ChatInterface({ messages, onSendMessage, isProcessing, status }) {
    return (
        <div className="chat-interface">
            <div className="chat-header">
                <h2>Jarvis AI (Debug)</h2>
            </div>
            <div className="messages-container">
                <p>Chat Interface Debug Mode</p>
            </div>
        </div>
    );
}
