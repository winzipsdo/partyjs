import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/partyjs/dice-roll" className="[&.active]:font-bold">
          Dice Roll
        </Link>{' '}
        <Link to="/partyjs/russian-roulette" className="[&.active]:font-bold">
          Russian Roulette
        </Link>
      </div>
      <hr />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
