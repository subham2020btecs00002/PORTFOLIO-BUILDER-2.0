import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ComboBox.css';

interface ComboBoxProps {
  id?: string;
  name: string;
  value: string;
  placeholder?: string;
  suggestions: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

/**
 * ComboBox — a free-text input that also shows filterable preset suggestions.
 * The user can type any custom value OR pick from the dropdown list.
 */
const ComboBox: React.FC<ComboBoxProps> = ({
  id,
  name,
  value,
  placeholder,
  suggestions,
  onChange,
  onBlur,
  required = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const listboxId = `combobox-list-${name}-${id ?? 'default'}`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions by the current value (case-insensitive contains match)
  const filtered = value.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    : suggestions;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index whenever the filtered list changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(true);
    onChange(e);
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay blur so clicks on dropdown options register first
    setTimeout(() => {
      setOpen(false);
      setHighlightedIndex(-1);
      onBlur?.(e);
    }, 150);
  };

  const handleSelect = useCallback(
    (selectedValue: string) => {
      // Simulate a synthetic change event so parent handlers work uniformly
      const syntheticEvent = {
        target: { name, value: selectedValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
      setOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [name, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Highlight matched portion of text in the suggestion label
  const renderHighlightedText = (text: string) => {
    if (!value.trim()) return text;
    const idx = text.toLowerCase().indexOf(value.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + value.length)}</mark>
        {text.slice(idx + value.length)}
      </>
    );
  };

  return (
    <div className="combobox-wrapper" ref={wrapperRef}>
      <div className="combobox-input-row">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          role="combobox"
        />
        <span className={`combobox-chevron ${open ? 'open' : ''}`}>▼</span>
      </div>

      {open && (
        <div id={listboxId} className="combobox-dropdown" role="listbox">
          {filtered.length > 0 ? (
            filtered.map((option, idx) => (
              <div
                key={option}
                className={`combobox-option ${idx === highlightedIndex ? 'highlighted' : ''}`}
                role="option"
                aria-selected={idx === highlightedIndex}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur before click
                  handleSelect(option);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {renderHighlightedText(option)}
              </div>
            ))
          ) : (
            <div className="combobox-empty">No suggestions match. Type to use custom value.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComboBox;
