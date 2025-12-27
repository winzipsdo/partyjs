import { createLazyFileRoute } from '@tanstack/react-router';
import { GomokuPage } from '@/pages/gomoku';

export const Route = createLazyFileRoute('/gomoku/')({
  component: GomokuPage,
});
