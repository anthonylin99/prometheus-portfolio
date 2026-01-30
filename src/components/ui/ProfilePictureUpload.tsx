'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  fallbackInitial?: string;
  fallbackColor?: string;
  size?: 'sm' | 'md' | 'lg';
  onUpload: (imageDataUrl: string) => void;
  onRemove?: () => void;
  editable?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export function ProfilePictureUpload({
  currentImage,
  fallbackInitial = '?',
  fallbackColor = '#8b5cf6',
  size = 'md',
  onUpload,
  onRemove,
  editable = true,
  className,
}: ProfilePictureUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }

      setIsLoading(true);
      try {
        // Resize and compress image
        const dataUrl = await resizeImage(file, 256, 256);
        onUpload(dataUrl);
        setShowModal(false);
      } catch (err) {
        console.error('Failed to process image:', err);
        alert('Failed to process image');
      } finally {
        setIsLoading(false);
      }
    },
    [onUpload]
  );

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
      setShowModal(false);
    }
  }, [onRemove]);

  return (
    <>
      {/* Profile Picture */}
      <div
        className={cn('relative', sizeClasses[size], className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {currentImage ? (
          <Image
            src={currentImage}
            alt="Profile"
            fill
            className="rounded-full object-cover border-2 border-violet-400/30"
          />
        ) : (
          <div
            className={cn(
              'rounded-full flex items-center justify-center text-white font-bold border-2 border-violet-400/30',
              sizeClasses[size],
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-lg',
              size === 'lg' && 'text-2xl'
            )}
            style={{ backgroundColor: fallbackColor }}
          >
            {fallbackInitial.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Edit Overlay */}
        {editable && (isHovered || showModal) && (
          <button
            onClick={() => setShowModal(true)}
            className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center transition-opacity"
          >
            <Camera className={cn('text-white', iconSizes[size])} />
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card p-6 rounded-2xl w-full max-w-sm">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Change Profile Picture</h2>

            {/* Preview */}
            <div className="flex justify-center mb-6">
              {currentImage ? (
                <div className="relative w-24 h-24">
                  <Image
                    src={currentImage}
                    alt="Current"
                    fill
                    className="rounded-full object-cover border-2 border-violet-400/30"
                  />
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-violet-400/30"
                  style={{ backgroundColor: fallbackColor }}
                >
                  {fallbackInitial.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-400 hover:bg-violet-400 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload New Photo
                  </>
                )}
              </button>

              {currentImage && onRemove && (
                <button
                  onClick={handleRemove}
                  className="w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              Max 2MB. Supports JPG, PNG, GIF.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// Helper to resize image
async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
