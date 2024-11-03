import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/partyjs/home/')({
  component: RouteComponent,
});

function RouteComponent() {
  return 'Hello /partyjs/home/!';
}
