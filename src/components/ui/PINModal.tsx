'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPIN: string;
}

export function PINModal({ isOpen, onClose, onSuccess, correctPIN }: PINModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if PIN is complete
    if (value && index === 3) {
      const enteredPIN = newPin.join('');
      if (enteredPIN === correctPIN) {
        onSuccess();
        onClose();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin(['', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newPin = [...pin];
      for (let i = 0; i < pastedData.length && i < 4; i++) {
        newPin[i] = pastedData[i];
      }
      setPin(newPin);
      
      if (pastedData.length === 4) {
        if (pastedData === correctPIN) {
          onSuccess();
          onClose();
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin(['', '', '', '']);
            inputRefs.current[0]?.focus();
          }, 500);
        }
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-sm mx-4 p-6 rounded-2xl",
        "bg-gradient-to-b from-slate-900 to-slate-950",
        "border border-violet-500/20 shadow-2xl shadow-violet-500/10",
        shake && "animate-shake"
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center border border-violet-500/30">
            <Lock className="w-8 h-8 text-violet-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Enter PIN
        </h2>
        <p className="text-sm text-slate-400 text-center mb-6">
          Enter your 4-digit PIN to reveal portfolio values
        </p>

        {/* PIN Input */}
        <div className="flex justify-center gap-3 mb-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={cn(
                "w-14 h-14 text-center text-2xl font-bold rounded-xl",
                "bg-slate-800/50 border-2 transition-all duration-200",
                "text-white placeholder-slate-600",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                error 
                  ? "border-red-500/50 bg-red-500/10" 
                  : digit 
                    ? "border-violet-500/50" 
                    : "border-slate-700/50 hover:border-slate-600/50"
              )}
            />
          ))}
        </div>

        {/* Show/Hide PIN toggle */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowPin(!showPin)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPin ? 'Hide PIN' : 'Show PIN'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Incorrect PIN. Try again.</span>
          </div>
        )}
      </div>

    </div>
  );
}
