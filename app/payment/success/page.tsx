import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

async function getSessionData(sessionId?: string) {
  if (!sessionId) return null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/stripe/session?session_id=${sessionId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PaymentSuccess({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams.session_id;
  const metadata = await getSessionData(sessionId);

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
        <p className="text-md mb-1 text-blue-500 italic">
          If you can not download the MIDI using this button, please use the button from the main page.
        </p>
      </div>
    </div>
  );
}