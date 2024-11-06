import { createLazyFileRoute } from '@tanstack/react-router';
import { CrocodileDentistPixiPage } from '@/pages/crocodile-dentist-pixi';
export const Route = createLazyFileRoute('/crocodile-dentist-pixi/')({
  component: CrocodileDentistPixiPage,
});
