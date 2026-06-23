import { useState, useEffect } from "react";
import { sounds } from "../../utils/sounds";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Load sound preference from localStorage
    const saved = localStorage.getItem("sound-enabled");
    if (saved !== null) {
      const isEnabled = saved === "true";
      setEnabled(isEnabled);
      sounds.setEnabled(isEnabled);
    }
  }, []);

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    sounds.setEnabled(newValue);
    localStorage.setItem("sound-enabled", String(newValue));
    if (newValue) {
      sounds.playClick();
    }
  };

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      title={enabled ? "Mute sounds" : "Enable sounds"}
    >
      {enabled ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}
    </button>
  );
}
