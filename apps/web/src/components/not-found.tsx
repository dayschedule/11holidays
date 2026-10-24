import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-24 text-center">
      <div className="text-6xl" aria-hidden>
        🎈
      </div>
      <h1 className="text-3xl font-bold">This page took a holiday</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find what you were looking for. Try searching for a
        holiday or browse all countries.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/countries">Browse countries</Link>
        </Button>
      </div>
    </div>
  );
}
