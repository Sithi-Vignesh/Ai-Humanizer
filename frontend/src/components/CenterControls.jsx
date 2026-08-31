import { useState, useRef, useEffect } from 'react';

const MODEL_OPTIONS = [
  { value: 'minimax/minimax-m3:free', label: 'MiniMax M3' },
  { value: 'z-ai/glm-5.2:free', label: 'Z.ai GLM 5.2' },
  { value: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'NVIDIA Nemotron 3 Super' },
  { value: 'google/gemma-4-31b-it:free', label: 'Google Gemma 4 31B' },
  { value: 'liquid/lfm-2.5-2.6b:free', label: 'LiquidAI LFM2.5-2.6B' },
];

export default function CenterControls({ onHumanizeClick, selectedModel, onModelChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabel =
    MODEL_OPTIONS.find((opt) => opt.value === selectedModel)?.label || MODEL_OPTIONS[0].label;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (value) => {
    onModelChange(value);
    setIsOpen(false);
  };

  return (
    <div className="center-col">
      <button className="btn-humanize" id="humanize-btn" onClick={onHumanizeClick}>
        <span className="btn-text">Humanize</span>
        <span className="btn-arrow">→</span>
      </button>

      <div className="model-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="model-dropdown-trigger"
          onClick={() => setIsOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selectedLabel}</span>
          <span className={`model-dropdown-arrow${isOpen ? ' model-dropdown-arrow--open' : ''}`}>
            ▾
          </span>
        </button>

        {isOpen && (
          <ul className="model-dropdown-list" role="listbox">
            {MODEL_OPTIONS.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === selectedModel}
                className={`model-dropdown-option${opt.value === selectedModel ? ' model-dropdown-option--selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
