import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/partyjs/')({
  component: Index,
});

function Index() {
  return <h1>Party.js</h1>;
}
