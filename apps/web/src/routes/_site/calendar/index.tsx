import { createFileRoute, redirect } from '@tanstack/react-router';
import { currentYear } from '@/lib/holidays-api';

export const Route = createFileRoute('/_site/calendar/')({
  beforeLoad: () => {
    throw redirect({ to: '/calendar/$year', params: { year: String(currentYear()) } });
  },
});
