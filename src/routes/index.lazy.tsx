import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

export function Index() {
  return <h1>Party.js</h1>;
}
