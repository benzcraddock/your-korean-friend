import { useEffect, useState } from 'react';
import { Wordmark } from '../components/Wordmark';
import { useSessionStore } from '../state/sessionStore';

export function Settings() {
  const { goTo, mockMode, setMockMode } = useSessionStore();
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    window.api?.settings.hasOpenAIKey().then(setHasKey).catch(() => setHasKey(false));
  }, []);

  const save = async () => {
    if (!key.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      await window.api.settings.setOpenAIKey(key.trim());
      setHasKey(true);
      setKey('');
      setMsg('Saved to OS keychain.');
    } catch (e) {
      setMsg((e as Error).message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    await window.api.settings.clearOpenAIKey();
    setHasKey(false);
    setMsg('Cleared.');
  };

  return (
    <div className="h-full flex flex-col">
      <header className="app-drag flex items-center justify-between px-6 pt-6">
        <div className="app-no-drag">
          <Wordmark />
        </div>
        <button
          className="app-no-drag text-xs text-ink2 hover:text-ink transition-colors"
          onClick={() => goTo('landing')}
        >
          Close
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-16">
        <div className="max-w-xl mx-auto pt-12">
          <div className="text-[11px] tracking-[0.12em] uppercase text-ink2 mb-3">
            Settings
          </div>
          <h1 className="text-[28px] leading-tight tracking-display mb-10">
            API keys & preferences
          </h1>

          <section className="mb-10">
            <label className="block text-sm text-ink mb-2">OpenAI API key</label>
            <p className="text-xs text-ink2 mb-3">
              Required for STT, TTS, and the LLM judge. Stored in your OS keychain via
              Electron safeStorage. Never written to plaintext.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={hasKey ? '••••••••• (a key is saved)' : 'sk-...'}
                className="flex-1 px-3 py-2 text-sm border border-muted focus:border-ink outline-none bg-transparent"
              />
              <button
                onClick={save}
                disabled={saving || !key.trim()}
                className="px-4 py-2 text-sm border border-ink bg-ink text-bg disabled:opacity-40"
                style={{ borderRadius: 6 }}
              >
                Save
              </button>
              {hasKey && (
                <button
                  onClick={clear}
                  className="px-4 py-2 text-sm border border-muted hover:border-ink transition-colors"
                  style={{ borderRadius: 6 }}
                >
                  Clear
                </button>
              )}
            </div>
            {msg && <div className="text-xs text-ink2 mt-2">{msg}</div>}
          </section>

          <section className="mb-10">
            <label className="block text-sm text-ink mb-2">ElevenLabs API key</label>
            <p className="text-xs text-ink2 mb-3">v2, not yet used.</p>
            <input
              type="password"
              disabled
              placeholder="Coming in v2"
              className="w-full px-3 py-2 text-sm border border-muted bg-transparent opacity-50"
            />
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between gap-6">
              <div>
                <label className="block text-sm text-ink mb-1">Mock mode</label>
                <p className="text-xs text-ink2">
                  Use hardcoded sample conversation instead of calling OpenAI.
                  On by default in v0.1. Turn off once TTS and dialogue are wired.
                </p>
              </div>
              <button
                onClick={() => setMockMode(!mockMode)}
                className="relative w-10 h-5 rounded-full transition-colors shrink-0"
                style={{ background: mockMode ? '#111111' : '#E8E6E0' }}
                aria-pressed={mockMode}
                aria-label="Toggle mock mode"
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bg transition-transform"
                  style={{
                    transform: mockMode ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between gap-6">
              <div>
                <label className="block text-sm text-ink mb-1">Orb lab</label>
                <p className="text-xs text-ink2">
                  Preview the v2 R3F orb with state buttons and an amplitude slider.
                  Dev only; not wired into sessions yet.
                </p>
              </div>
              <button
                onClick={() => goTo('orb-lab')}
                className="px-4 py-2 text-sm border border-ink hover:bg-ink hover:text-bg transition-colors shrink-0"
                style={{ borderRadius: 6 }}
              >
                Open
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
