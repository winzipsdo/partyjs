import { createLazyFileRoute } from '@tanstack/react-router';
import { LiarCardPage } from '@/pages/liar-card';

export const Route = createLazyFileRoute('/liar-card/')({
  component: LiarCardPage,
});
