import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onOneTime: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ open, onClose, onSubscribe, onOneTime }) => {
  if (!open) return null;
  return createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl shadow-2xl border border-zinc-700 p-8 w-full max-w-md mx-4 animate-fade-in">
      <button
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors"
        onClick={onClose}
        aria-label="Close modal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"><path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <h2 className="text-2xl font-extrabold mb-3 text-center text-zinc-100 tracking-tight drop-shadow">Download MIDI File</h2>
      <p className="mb-7 text-center text-zinc-400 text-base">
          To download the MIDI file, please choose one of the following options:
      </p>
      <div className="flex flex-col gap-4">
        <Button
          className="bg-green-500/90 hover:bg-green-500 text-white font-semibold shadow-green-900/40 shadow-lg transition-all focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          size="lg"
          onClick={onSubscribe}
        >
          <span className="inline-flex items-center gap-2">
              Subscribe for unlimited downloads
          </span>
        </Button>
        <Button
          className="bg-blue-500/90 hover:bg-blue-500 text-white font-semibold shadow-blue-900/40 shadow-lg transition-all focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          size="lg"
          onClick={onOneTime}
        >
          <span className="inline-flex items-center gap-2">
              One-time purchase for this MIDI
          </span>
        </Button>
        <Button
          variant="outline"
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-700/60 hover:text-white transition-all"
          size="lg"
          onClick={onClose}
        >
            Cancel
        </Button>
      </div>
    </div>
  </div>,
  document.body);
};

export default DownloadModal;
