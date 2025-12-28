import { useNavigate } from '@tanstack/react-router';
import styles from './styles.module.css';
import githubIcon from '@/assets/github.svg';

interface GameCard {
  emoji: string;
  title: string;
  description: string;
  path: string;
  color: string;
}

const games: GameCard[] = [
  {
    emoji: '🎲',
    title: 'Dice Roll',
    description: 'Roll the dice and test your luck',
    path: '/dice-roll',
    color: 'from-red-400 to-orange-500',
  },
  {
    emoji: '🔫',
    title: 'Russian Roulette',
    description: 'Dare to pull the trigger?',
    path: '/russian-roulette',
    color: 'from-gray-600 to-gray-800',
  },
  {
    emoji: '🃏',
    title: 'Liar Card',
    description: 'Draw a card, bluff your way',
    path: '/liar-card',
    color: 'from-purple-400 to-indigo-600',
  },
  {
    emoji: '🦷',
    title: 'Crocodile Dentist',
    description: "Don't get bitten!",
    path: '/crocodile-dentist',
    color: 'from-green-400 to-emerald-600',
  },
  {
    emoji: '🎨',
    title: 'Color Memory',
    description: 'Match colors to win',
    path: '/color-memory-quest',
    color: 'from-pink-400 to-rose-500',
  },
  {
    emoji: '⚫',
    title: 'Gomoku',
    description: 'Five in a row wins',
    path: '/gomoku',
    color: 'from-amber-400 to-orange-500',
  },
  {
    emoji: '⚪',
    title: 'Othello',
    description: 'Flip to conquer',
    path: '/othello',
    color: 'from-teal-400 to-emerald-600',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Header */}
      <div className='pt-8 pb-6 px-4 text-center relative'>
        {/* GitHub Button */}
        <a
          href='https://github.com/winzipsdo/partyjs'
          target='_blank'
          rel='noopener noreferrer'
          className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
          title='View on GitHub'
        >
          <img src={githubIcon} alt='GitHub' className='w-6 h-6 invert' />
        </a>

        <div className='flex items-center justify-center gap-3 mb-2'>
          <img src='/partyjs/partyjs.svg' alt='PartyJS Logo' className={`w-12 h-12 ${styles.animateBounce}`} />
          <h1 className={`text-3xl sm:text-4xl font-bold font-mono tracking-wide ${styles.glitch}`} data-text='PartyJS'>
            PartyJS
          </h1>
        </div>
        <p className='text-slate-400 text-sm'>Pick a game and have fun!</p>
      </div>

      {/* Game Grid */}
      <div className='px-4 pb-8 max-w-2xl mx-auto'>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'>
          {games.map((game) => (
            <div
              key={game.path}
              onClick={() => navigate({ to: game.path })}
              className={`
                relative overflow-hidden rounded-2xl cursor-pointer
                bg-gradient-to-br ${game.color}
                transform transition-all duration-200
                hover:scale-105 hover:shadow-xl hover:shadow-black/30
                active:scale-95
                group
              `}
            >
              {/* Card content */}
              <div className='p-4 sm:p-5'>
                <div className='text-4xl sm:text-5xl mb-2 transform group-hover:scale-110 transition-transform'>
                  {game.emoji}
                </div>
                <h3 className='text-white font-bold text-sm sm:text-base leading-tight'>{game.title}</h3>
                <p className='text-white/70 text-xs mt-1 leading-tight hidden sm:block'>{game.description}</p>
              </div>

              {/* Decorative elements */}
              <div className='absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl' />
              <div className='absolute -right-2 -top-2 w-12 h-12 bg-white/5 rounded-full' />
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className='text-center pb-8'>
        <p className='text-slate-500 text-xs'>More games coming soon...</p>
      </div>
    </div>
  );
}
