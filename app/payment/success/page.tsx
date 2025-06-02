'use client';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';


export default function PaymentSuccess() {

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setMetadata(data);
      });
  }, [sessionId]);

  return (
    <div className="container py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
     
      <div className="flex flex-col items-center justify-center mt-10 gap-[40px]">
        <Button
          asChild
          className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white transition-all ease-in-out duration-200 cursor-pointer"
        >
          <a
            href={metadata?.midi_url}
            download={metadata?.filename?.split('.')[0] + '.midi' || 'converted_score.midi'}
          >
            <Download className="mr-2 h-4 w-4" />
              Download MIDI
          </a>
        </Button>
        <p className="text-md mb-1 text-blue-500 italic">If you can not download the MIDI using this button, please use the button from the main page.</p>
      </div>
      
    </div>
  );
}
