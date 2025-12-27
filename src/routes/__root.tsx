import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate, createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { useState, useRef, useEffect } from 'react';
import GithubIcon from '@/assets/github.svg';
import { Home, Search } from 'lucide-react';

const gameRoutes = [
  { label: '🏠 Home', path: '/home' },
  { label: '🎲 Dice Roll', path: '/dice-roll' },
  { label: '🔫 Russian Roulette', path: '/russian-roulette' },
  { label: '🃏 Liar Card', path: '/liar-card' },
  { label: '🦷 Crocodile Dentist', path: '/crocodile-dentist' },
  { label: '🎨 Color Memory Quest', path: '/color-memory-quest' },
  { label: '⚫ Gomoku', path: '/gomoku' },
  { label: '⚪ Othello', path: '/othello' },
];

function RootComponent() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const isHomePage = location.pathname === '/home' || location.pathname === '/' || location.pathname === '';

  useEffect(() => {
    const handleCustomCommand = () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    };

    // Keyboard shortcut: Cmd/Ctrl + K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    document.addEventListener('toggleCommand', handleCustomCommand);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('toggleCommand', handleCustomCommand);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Top navigation bar - only show when not on home page */}
      {!isHomePage && (
        <div className='sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b'>
          <div className='flex items-center justify-between px-2 py-2'>
            <button
              onClick={() => navigate({ to: '/home' })}
              className='flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <Home className='w-5 h-5' />
              <span className='text-sm font-medium hidden sm:inline'>Home</span>
            </button>

            <div className='flex items-center gap-1'>
              <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
                title='Search games (⌘K)'
              >
                <Search className='w-5 h-5' />
                <span className='text-sm hidden sm:inline'>Search</span>
                <kbd className='hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded'>
                  ⌘K
                </kbd>
              </button>

              <a
                href='https://github.com/winzipsdo/partyjs'
                target='_blank'
                rel='noopener noreferrer'
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
                title='View on GitHub'
              >
                <img src={GithubIcon} alt='GitHub' width={20} height={20} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Command palette for quick search */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className='w-full sm:w-[400px] touch-manipulation rounded-lg'>
          <CommandInput ref={inputRef} placeholder='Search games...' />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading='Games'>
              {gameRoutes.map((route) => (
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

      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
