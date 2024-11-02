import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/dice-roll")({
  component: DiceRoll,
});

function DiceRoll() {
  return <h2>Dice Rolling Game</h2>;
}
