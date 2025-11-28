import React, { useState } from 'react';
import { llamaService } from '../services/llm/LlamaService';
import './APIKeySettings.css';

export default function APIKeySettings({ onClose }) {
    const [groqKey, setGroqKey] = useState(sessionStorage.getItem('groq_api_key') || '');
    const [togetherKey, setTogetherKey] = useState(sessionStorage.getItem('together_api_key') || '');
    const [hfKey, setHfKey] = useState(sessionStorage.getItem('hf_api_key') || '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        llamaService.setApiKeys({
            groq: groqKey,
            together: togetherKey,
            huggingFace: hfKey
        });

        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            if (onClose) onClose();
        }, 1500);
    };

    const status = llamaService.getStatus();

    return (
        <div className="api-key-settings-overlay" onClick={onClose}>
            <div className="api-key-settings" onClick={(e) => e.stopPropagation()}>
                <h2>🤖 AI Provider Settings</h2>
                <p className="subtitle">Configure free AI providers for Phuntroo</p>

                <div className="provider-status">
                    <strong>Available Providers:</strong> {status.availableProviders.join(', ') || 'None'}
                </div>

                <div className="api-key-input">
                    <label>
                        <span className="label-text">
                            Groq API Key (Primary - Fastest)
                            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">Get Key</a>
                        </span>
                        <input
                            type="password"
                            value={groqKey}
                            onChange={(e) => setGroqKey(e.target.value)}
                            placeholder="gsk_..."
                        />
                    </label>
                </div>

                <div className="api-key-input">
                    <label>
                        <span className="label-text">
                            Together AI Key (Fallback)
                            <a href="https://api.together.xyz" target="_blank" rel="noopener noreferrer">Get Key</a>
                        </span>
                        <input
                            type="password"
                            value={togetherKey}
                            onChange={(e) => setTogetherKey(e.target.value)}
                            placeholder="..."
                        />
                    </label>
                </div>

                <div className="api-key-input">
                    <label>
                        <span className="label-text">
                            Hugging Face Token (Optional)
                            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">Get Token</a>
                        </span>
                        <input
                            type="password"
                            value={hfKey}
                            onChange={(e) => setHfKey(e.target.value)}
                            placeholder="hf_..."
                        />
                    </label>
                </div>

                <div className="api-key-actions">
                    <button onClick={handleSave} className="save-btn">
                        {saved ? '✅ Saved!' : '💾 Save Keys'}
                    </button>
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                </div>

                <div className="api-key-info">
                    <p><strong>Note:</strong> Keys are stored in session storage (cleared when you close the browser)</p>
                    <p>At least one provider key is required for AI to work</p>
                </div>
            </div>
        </div>
    );
}
