import React, { useEffect, useState } from 'react';
import { CONSENT_OPEN_EVENT, getConsent, setConsent } from '../lib/consent';

/** First-party cookie banner. No vendor request happens until Accept. */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
    const open = () => setVisible(true);
    document.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => document.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const choose = (choice: 'accepted' | 'declined') => {
    setConsent(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[9999] rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] p-5 text-zinc-200 shadow-2xl sm:left-auto sm:max-w-md"
    >
      <p className="text-sm font-semibold text-[#f3e5ab]">We value your privacy</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
        Strictly necessary storage keeps the store working. Analytics and optional third-party scripts
        stay off until you accept.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => choose('accepted')}
          className="flex-1 rounded-lg bg-[#d4af37] px-4 py-2.5 text-xs font-bold text-black transition hover:bg-[#f3e5ab]"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose('declined')}
          className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-900"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
