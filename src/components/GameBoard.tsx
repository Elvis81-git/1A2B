import { useState, useEffect, useCallback } from 'react';
import { Delete, Send } from 'lucide-react';

interface GameBoardProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

export default function GameBoard({ onSubmit, disabled = false, placeholder = '送出猜測', label = '輸入 4 位不重複的數字' }: GameBoardProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clear inputs helper
  const clearDigits = useCallback(() => {
    setDigits(['', '', '', '']);
    setActiveIndex(0);
    setErrorMsg(null);
  }, []);

  // Handle digit input
  const handleDigitInput = useCallback((val: string) => {
    if (disabled) return;
    setErrorMsg(null);

    // Unique check
    if (digits.includes(val)) {
      setErrorMsg('數字不能重複！');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }

    setDigits(prev => {
      const next = [...prev];
      next[activeIndex] = val;
      return next;
    });

    // Move to next empty index or keep activeIndex
    setActiveIndex(prev => {
      if (prev < 3) return prev + 1;
      return prev;
    });
  }, [activeIndex, digits, disabled]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (disabled) return;
    setErrorMsg(null);

    setDigits(prev => {
      const next = [...prev];
      // If current is empty, delete previous
      if (next[activeIndex] === '' && activeIndex > 0) {
        next[activeIndex - 1] = '';
        setActiveIndex(activeIndex - 1);
      } else {
        next[activeIndex] = '';
      }
      return next;
    });
  }, [activeIndex, disabled]);

  // Submit guess
  const handleSubmit = useCallback(() => {
    if (disabled) return;
    const guessString = digits.join('');

    if (guessString.length < 4) {
      setErrorMsg('必須填滿 4 個數字！');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }

    if (new Set(digits).size !== 4) {
      setErrorMsg('數字不能重複！');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }

    onSubmit(guessString);
    clearDigits();
  }, [digits, onSubmit, disabled, clearDigits]);

  // Real keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigitInput(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex(prev => (prev < 3 ? prev + 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, handleDigitInput, handleDelete, handleSubmit]);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        width: '100%',
        maxWidth: '420px',
      }}
    >
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {label}
      </div>

      {/* Digit Display Boxes */}
      <div className={`digit-input-container ${isShaking ? 'animate-shake' : ''}`}>
        {digits.map((digit, index) => (
          <div
            key={index}
            className={`digit-box ${activeIndex === index ? 'active' : ''} ${digit !== '' ? 'filled' : ''}`}
            onClick={() => !disabled && setActiveIndex(index)}
          >
            {digit}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {errorMsg ? (
        <div style={{ color: 'var(--status-danger)', fontSize: '0.85rem', fontWeight: 600, height: '1.25rem', marginBottom: '0.75rem' }}>
          ⚠️ {errorMsg}
        </div>
      ) : (
        <div style={{ height: '1.25rem', marginBottom: '0.75rem' }}></div>
      )}

      {/* On-screen Keypad */}
      <div className="keyboard-grid">
        {/* Row 1-3: Numbers 1-9 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const strNum = num.toString();
          const isUsed = digits.includes(strNum);
          return (
            <button
              key={num}
              className="key-btn"
              disabled={disabled || isUsed}
              onClick={() => handleDigitInput(strNum)}
            >
              {num}
            </button>
          );
        })}
        
        {/* Row 4: Reset, 0, Delete */}
        <button
          className="key-btn action"
          disabled={disabled || digits.every(d => d === '')}
          onClick={clearDigits}
          style={{ fontSize: '0.9rem' }}
        >
          重設
        </button>
        
        <button
          className="key-btn"
          disabled={disabled || digits.includes('0')}
          onClick={() => handleDigitInput('0')}
        >
          0
        </button>

        <button
          className="key-btn action"
          disabled={disabled}
          onClick={handleDelete}
          title="倒退鍵"
        >
          <Delete size={18} />
        </button>

        {/* Row 5: Submit Button (span 3) */}
        <button
          className="key-btn action"
          style={{ 
            gridColumn: 'span 3', 
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #6366f1 100%)', 
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700
          }}
          disabled={disabled || digits.join('').length < 4}
          onClick={handleSubmit}
        >
          <Send size={14} style={{ marginRight: '8px' }} /> {placeholder}
        </button>
      </div>
    </div>
  );
}
