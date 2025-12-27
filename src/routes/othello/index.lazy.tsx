import { createLazyFileRoute } from '@tanstack/react-router';
import { OthelloPage } from '@/pages/othello';

export const Route = createLazyFileRoute('/othello/')({
  component: OthelloPage,
});
