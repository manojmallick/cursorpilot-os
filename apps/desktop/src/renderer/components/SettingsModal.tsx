import React, { useEffect, useState } from 'react';
import type { LlmSettings } from '@cursorpilot/shared';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Settings dialog where the user supplies their own Gemini API key and picks a model.
 * The key is sent to the engine (stored locally in ~/.cursorpilot/settings.json) and is
 * never displayed back in full — only a mask such as `AIza••••wXyz`.
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
    const [settings, setSettings] = useState<LlmSettings | null>(null);
    const [keyInput, setKeyInput] = useState('');
    const [model, setModel] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    // Load current settings whenever the dialog opens.
    useEffect(() => {
        if (!open) return;
        setStatus('idle');
        setError(null);
        setKeyInput('');
        window.api
            .getSettings()
            .then((s) => {
                setSettings(s);
                setModel(s.model);
            })
            .catch((err) => setError(err instanceof Error ? err.message : String(err)));
    }, [open]);

    if (!open) return null;

    const handleSave = async () => {
        setStatus('saving');
        setError(null);
        try {
            // Only send apiKey if the user typed something; leaving it blank keeps the existing key.
            const input: { apiKey?: string; model?: string } = { model };
            if (keyInput.trim() !== '') input.apiKey = keyInput.trim();
            const updated = await window.api.setSettings(input);
            setSettings(updated);
            setModel(updated.model);
            setKeyInput('');
            setStatus('saved');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleClearKey = async () => {
        setStatus('saving');
        setError(null);
        try {
            const updated = await window.api.setSettings({ apiKey: '' });
            setSettings(updated);
            setKeyInput('');
            setStatus('saved');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const keyLabel = settings?.hasKey
        ? settings.keySource === 'user'
            ? `Current key: ${settings.keyMask} (yours)`
            : `Current key: ${settings.keyMask} (from .env)`
        : 'No key configured';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">Settings</span>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <label className="settings-field">
                        <span className="settings-label">Gemini API key</span>
                        <input
                            type="password"
                            className="settings-input"
                            placeholder={settings?.hasKey ? 'Enter a new key to replace' : 'Paste your Gemini API key'}
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <span className="settings-hint">
                            {keyLabel} ·{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                                Get a key
                            </a>
                        </span>
                    </label>

                    <label className="settings-field">
                        <span className="settings-label">Model</span>
                        <select
                            className="settings-input"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                        >
                            {settings?.availableModels.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </label>

                    {error && <div className="settings-error">{error}</div>}
                    {status === 'saved' && !error && <div className="settings-ok">Saved.</div>}
                </div>

                <div className="modal-footer">
                    {settings?.keySource === 'user' && (
                        <button className="vc-btn vc-btn--ghost" onClick={handleClearKey} disabled={status === 'saving'}>
                            Clear my key
                        </button>
                    )}
                    <button className="vc-btn vc-btn--primary" onClick={handleSave} disabled={status === 'saving'}>
                        {status === 'saving' ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};
