'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Preset avatar icons (using emoji for simplicity)
const PRESET_AVATARS = [
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'chart', emoji: '📈', label: 'Chart' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'bolt', emoji: '⚡', label: 'Bolt' },
  { id: 'moon', emoji: '🌙', label: 'Moon' },
  { id: 'sun', emoji: '☀️', label: 'Sun' },
  { id: 'globe', emoji: '🌍', label: 'Globe' },
  { id: 'target', emoji: '🎯', label: 'Target' },
  { id: 'brain', emoji: '🧠', label: 'Brain' },
];

// Color palette for avatar backgrounds
const AVATAR_COLORS = [
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#22d3ee', // cyan
  '#10b981', // emerald
  '#84cc16', // lime
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#a855f7', // purple
  '#64748b', // slate
];

interface AvatarPickerProps {
  currentIcon?: string;
  currentColor?: string;
  onSave: (icon: string, color: string) => Promise<void>;
  onClose: () => void;
}

export function AvatarPicker({
  currentIcon = 'rocket',
  currentColor = '#8b5cf6',
  onSave,
  onClose,
}: AvatarPickerProps) {
  const [selectedIcon, setSelectedIcon] = useState(currentIcon);
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedIcon, selectedColor);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const selectedAvatar = PRESET_AVATARS.find((a) => a.id === selectedIcon);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl transition-colors"
          style={{ backgroundColor: selectedColor }}
        >
          {selectedAvatar?.emoji || '🚀'}
        </div>
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-sm text-slate-400 mb-3">
          Choose an icon
        </label>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedIcon(avatar.id)}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all',
                selectedIcon === avatar.id
                  ? 'bg-violet-600 ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-900'
                  : 'bg-slate-800/50 hover:bg-slate-700/50'
              )}
              title={avatar.label}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-sm text-slate-400 mb-3">
          Background color
        </label>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={cn(
                'w-12 h-12 rounded-xl transition-all flex items-center justify-center',
                selectedColor === color && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
              )}
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && (
                <Check className="w-5 h-5 text-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700/50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Avatar'
          )}
        </button>
      </div>
    </div>
  );
}
