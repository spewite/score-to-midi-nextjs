import React from 'react';
import { Button } from '@/components/ui/button';

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onOneTime: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ open, onClose, onSubscribe, onOneTime }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Download MIDI File</h2>
        <p className="mb-6 text-center text-gray-700">
          To download the MIDI file, please choose one of the following options:
        </p>
        <div className="flex flex-col gap-4">
          <Button className="bg-green-600 text-white hover:bg-green-700" onClick={onSubscribe}>
            Subscribe for unlimited downloads
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={onOneTime}>
            One-time purchase for this MIDI
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
