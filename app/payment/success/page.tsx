'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentType, setPaymentType] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID.');
      setLoading(false);
      return;
    }
    // Fetch the Stripe session to determine payment type
    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((stripeSession) => {
        const type = stripeSession?.type;
        setPaymentType(type);
        if (type === 'subscription') {
          // Proceed with subscription activation
          fetch('/api/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                setSuccess(true);
                setError(null);
                setSuccessMessage('Purchase successful! Your MIDI file is ready to download. You can close this window.');
              } else {
                setError(data.error || 'Failed to activate subscription.');
                setSuccess(false);
              }
            })
            .catch(() => {
              setError('Network error. Please try again later.');
              setSuccess(false);
            })
            .finally(() => {
              setLoading(false);
            });
          return;
        } else if (type === 'onetime') {
          setPaymentType('onetime');
          if (stripeSession && stripeSession.purchaseConfirmed) {
            setSuccess(true);
            setError(null);
            setSuccessMessage('Purchase successful! Your MIDI file is ready to download. You can close this window.');
          } else {
            setError('We could not confirm your purchase in our database. Please contact support if you do not receive your MIDI file.');
            setSuccess(false);
          }
          setLoading(false);
          return;
        } else {
          setError('Unknown payment type.');
          setSuccess(false);
          setLoading(false);
        }
      })
      .catch(() => {
        setError('Unable to verify payment session.');
        setSuccess(false);
        setLoading(false);
      });
  }, [sessionId]);

  return (
    <div className="container py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
      {loading && (
        <div className="flex flex-col items-center justify-center gap-6">
          <svg
            className="animate-spin h-10 w-10 text-blue-400 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <div className="max-w-md mx-auto bg-zinc-900/80 border border-zinc-700 text-zinc-100 rounded-xl px-6 py-5 shadow-lg">
            <p className="text-xl font-semibold mb-1">
              {paymentType === 'subscription' && 'Processing your subscription...'}
              {paymentType === 'onetime' && 'Processing your one-time purchase...'}
              {!paymentType && 'Processing your payment...'}
            </p>
            <p className="text-base text-zinc-400">Please do not leave this page.</p>
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="max-w-md w-full bg-red-900/80 border border-red-700 text-red-100 rounded-xl px-6 py-5 shadow-lg">
            <p className="text-lg font-bold mb-1">There was an error processing your subscription.</p>
            <p className="text-base text-red-300">{error}</p>
          </div>
        </div>
      )}
      {!loading && success && (
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="max-w-md w-full bg-green-900/80 border border-green-700 text-green-100 rounded-xl px-6 py-5 shadow-lg">
            <p className="text-lg font-bold mb-1">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
