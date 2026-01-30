'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_CATEGORIES, Category } from '@/types/portfolio';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface EditHoldingModalProps {
  ticker: string;
  name: string;
  shares: number;
  costBasis?: number;
  category: Category;
  notes?: string;
  logoDomain?: string;
  existingCategories: string[];
  onSave: (updates: {
    shares?: number;
    costBasis?: number;
    category?: string;
    notes?: string;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

export function EditHoldingModal({
  ticker,
  name,
  shares: initialShares,
  costBasis: initialCostBasis,
  category: initialCategory,
  notes: initialNotes,
  logoDomain,
  existingCategories,
  onSave,
  onDelete,
  onClose,
}: EditHoldingModalProps) {
  const [shares, setShares] = useState(initialShares.toString());
  const [costBasis, setCostBasis] = useState(
    initialCostBasis?.toString() || ''
  );
  const [category, setCategory] = useState(initialCategory);
  const [categoryInput, setCategoryInput] = useState(initialCategory);
  const [notes, setNotes] = useState(initialNotes || '');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // All available categories
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  );
  const filteredCategories = categoryInput
    ? allCategories.filter((c) =>
        c.toLowerCase().includes(categoryInput.toLowerCase())
      )
    : allCategories;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    const numShares = Number(shares);
    if (isNaN(numShares) || numShares <= 0) {
      setError('Shares must be a positive number');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updates: {
        shares?: number;
        costBasis?: number;
        category?: string;
        notes?: string;
      } = {};

      // Only include changed fields
      if (numShares !== initialShares) {
        updates.shares = numShares;
      }

      const numCostBasis = costBasis ? Number(costBasis) : undefined;
      if (numCostBasis !== initialCostBasis) {
        updates.costBasis = numCostBasis;
      }

      const finalCategory = categoryInput.trim() || category;
      if (finalCategory !== initialCategory) {
        updates.category = finalCategory;
      }

      if (notes !== (initialNotes || '')) {
        updates.notes = notes || undefined;
      }

      await onSave(updates);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass-card p-6 rounded-2xl w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Edit Holding</h2>

        {/* Stock Info */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-800/30 rounded-xl">
          <CompanyLogo ticker={ticker} domain={logoDomain} size="md" />
          <div>
            <p className="text-white font-mono font-semibold">{ticker}</p>
            <p className="text-slate-400 text-sm truncate max-w-[250px]">
              {name}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Shares */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Shares</label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min="0.01"
              step="any"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50"
            />
          </div>

          {/* Cost Basis */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Cost Basis (per share)
            </label>
            <input
              type="number"
              value={costBasis}
              onChange={(e) => setCostBasis(e.target.value)}
              placeholder="Optional"
              min="0"
              step="any"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Category
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => {
                  setCategoryInput(e.target.value);
                  setCategory(e.target.value);
                  setShowCategoryDropdown(true);
                }}
                onFocus={() => setShowCategoryDropdown(true)}
                placeholder="Select or type a category"
                className="w-full px-4 py-3 pr-10 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />

              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700/60 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setCategoryInput(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm hover:bg-slate-700/50 transition-colors',
                        cat === category
                          ? 'text-violet-400'
                          : 'text-slate-300'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this position..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-400/50 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-sm mb-3">
                Are you sure you want to delete <strong>{ticker}</strong> from your portfolio?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {onDelete && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-colors"
                title="Delete holding"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-300 font-medium rounded-xl hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || showDeleteConfirm}
              className="flex-1 py-3 bg-violet-400 hover:bg-violet-400 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
