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
import { ErrorBoundary } from '@/components/ErrorBoundary';

const gameRoutes = [
  { label: '🏠 Home', path: '/home' },
  { label: '🎲 Dice Roll', path: '/dice-roll' },
  { label: '🔫 Russian Roulette', path: '/russian-roulette' },
  { label: '🃏 Liar Card', path: '/liar-card' },
  { label: '🦷 Crocodile Dentist', path: '/crocodile-dentist' },
  { label: '🎨 Color Memory Quest', path: '/color-memory-quest' },
  { label: '⚫ Gomoku', path: '/gomoku' },
  { label: '⚪ Othello', path: '/othello' },
  { label: '🔢 Schulte Table', path: '/schulte-table' },
  { label: '⚔️ Schulte Battle', path: '/schulte-battle' },
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
        <div className='sticky top-0 z-50 border-b border-white/[0.08] bg-[#0a0b14]/70 backdrop-blur-md'>
          <div className='flex items-center justify-between px-2 py-2'>
            <button
              onClick={() => navigate({ to: '/home' })}
              className='flex items-center gap-2 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white'
            >
              <Home className='w-5 h-5' />
              <span className='text-sm font-medium hidden sm:inline'>Home</span>
            </button>

            <div className='flex items-center gap-1'>
              <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-2 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white'
                title='Search games (⌘K)'
              >
                <Search className='w-5 h-5' />
                <span className='text-sm hidden sm:inline'>Search</span>
                <kbd className='hidden sm:inline-flex items-center gap-1 rounded bg-white/[0.07] px-2 py-0.5 text-xs text-slate-500'>
                  ⌘K
                </kbd>
              </button>

              <a
                href='https://github.com/winzipsdo/partyjs'
                target='_blank'
                rel='noopener noreferrer'
                className='rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white'
                title='View on GitHub'
              >
                <img src={GithubIcon} alt='GitHub' width={20} height={20} className='invert opacity-70' />
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

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
