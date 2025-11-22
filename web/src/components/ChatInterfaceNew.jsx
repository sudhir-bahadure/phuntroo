import React from 'react';

export default function ChatInterfaceNew({ messages, onSendMessage, isProcessing, status }) {
    return (
        <div className="chat-interface">
            <div className="chat-header">
                <h2>Jarvis AI (New File)</h2>
            </div>
            <div className="messages-container">
                <p>Chat Interface New File Debug Mode</p>
            </div>
        </div>
    );
}
