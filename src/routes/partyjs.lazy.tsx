import { createLazyFileRoute } from "@tanstack/react-router";
import { Index } from "./index.lazy";

export const Route = createLazyFileRoute("/partyjs")({
  component: Index,
});
