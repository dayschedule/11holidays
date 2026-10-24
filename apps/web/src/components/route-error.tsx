import { useEffect } from 'react';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-24 text-center">
      <div className="text-6xl" aria-hidden>
        🌧️
      </div>
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">Please try again in a moment.</p>
      <Button onClick={() => router.invalidate()}>Try again</Button>
    </div>
  );
}
