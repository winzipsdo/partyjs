import { createLazyFileRoute } from '@tanstack/react-router';
import { CrocodileDentistPage } from '@/pages/crocodile-dentist';
export const Route = createLazyFileRoute('/crocodile-dentist/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <CrocodileDentistPage />;
}
