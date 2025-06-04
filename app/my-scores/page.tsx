'use client';

import { useUser } from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type MidiFile = {
  id: string;
  user_id: string;
  midi_url: string;
  file_name: string;
  score_url: string;
  created_at: string;
};

export default function MyScores() {
  const { user, loading } = useUser();
  const [scores, setScores] = useState<MidiFile[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/midi/files?user_id=${user.id}`)
        .then(res => res.json())
        .then(res => {
          setScores(res.data || []);
          setLoadingScores(false);
        });
    }
  }, [user]);

  if (loading || loadingScores) return <div className="text-center py-16">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex justify-center flex-grow site-background">
        <section className="container py-16 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8">My Scores</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {scores.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground text-lg py-12">
                You have not uploaded any scores yet.
              </div>
            ) : (
              scores.map(score => (
                <ScoreCard
                  key={score.id}
                  score={score} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
const ScoreCard = ({ score }: { score: MidiFile }) => (
  <Card className="card-background border border-white/10 shadow-xl backdrop-blur-md transition-transform hover:scale-[1.025] hover:shadow-2xl duration-200 flex flex-col items-center justify-between min-h-[410px]">
    <CardContent className="flex flex-col items-center gap-3 pt-6">
      <div className="rounded-lg overflow-hidden shadow-lg bg-black/10">
        <Image
          src={score.score_url}
          alt={score.file_name}
          width={200}
          height={260}
          className="object-contain aspect-[3/4] rounded-md"
        />
      </div>
      <div className="font-semibold text-lg text-card-foreground text-center mt-2">{score.file_name}</div>
      <div className="text-xs text-muted-foreground mb-2">{new Date(score.created_at).toLocaleString()}</div>
    </CardContent>
    <CardFooter className="w-full flex justify-center pb-6">
      <Button
        asChild
        className="w-full max-w-[140px] bg-gradient-to-r from-blue-800/80 to-blue-500/80 hover:from-blue-900 hover:to-blue-700 text-white shadow-lg">
        <a
          href={score.midi_url}
          download>
          Download
        </a>
      </Button>
    </CardFooter>
  </Card>
);