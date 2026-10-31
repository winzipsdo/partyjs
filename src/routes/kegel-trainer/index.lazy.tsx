import { createLazyFileRoute } from '@tanstack/react-router';
import { KegelTrainerPage } from '@/pages/kegel-trainer';

export const Route = createLazyFileRoute('/kegel-trainer/')({
  component: KegelTrainerPage,
});
