import { createLazyFileRoute } from '@tanstack/react-router';
import { RussianRoulettePage } from '@/pages/russian-roulette';

export const Route = createLazyFileRoute('/russian-roulette/')({
  component: RussianRoulettePage,
});
