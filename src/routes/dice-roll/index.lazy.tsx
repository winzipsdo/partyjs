import { createLazyFileRoute } from '@tanstack/react-router';
import { DiceRollPage } from '@/pages/dice-roll';

export const Route = createLazyFileRoute('/dice-roll/')({
  component: DiceRollPage,
});
