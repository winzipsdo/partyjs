import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate, createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { useState, useEffect } from 'react';

const routes = [
  { label: '🏠 Home', path: '/home' },
  { label: '🎲 Dice Roll', path: '/dice-roll' },
  { label: '🔫 Russian Roulette', path: '/russian-roulette' },
  { label: '🃏 Liar Card', path: '/liar-card' },
];

export const Route = createRootRoute({
  component: () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };
      document.addEventListener('keydown', down);
      return () => document.removeEventListener('keydown', down);
    }, []);

    return (
      <>
        <div className="p-2">
          <button
            onClick={() => setOpen(true)}
            className="w-full justify-between text-sm text-muted-foreground border rounded-md px-3 py-2"
          >
            Search navigation... <kbd className="text-xs">⌘K</kbd>
          </button>
        </div>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command>
            <CommandInput placeholder="Type to search..." autoFocus={false} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                {routes.map((route) => (
                  <CommandItem
                    key={route.path}
                    onSelect={() => {
                      navigate({ to: route.path });
                      setOpen(false);
                    }}
                  >
                    {route.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        <hr />
        <Outlet />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </>
    );
  },
});
