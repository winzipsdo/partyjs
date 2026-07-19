import { createLazyFileRoute } from '@tanstack/react-router';
import { SchulteBattlePage } from '@/pages/schulte-battle';

export const Route = createLazyFileRoute('/schulte-battle/')({
  component: SchulteBattlePage,
});
