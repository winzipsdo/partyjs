import { useNavigate } from '@tanstack/react-router';
import styles from './styles.module.css';
import githubIcon from '@/assets/github.svg';

interface GameCard {
  emoji: string;
  title: string;
  description: string;
  path: string;
  hue: string; // HSL 三元组，作为该游戏的主题色
}

const games: GameCard[] = [
  {
    emoji: '🎲',
    title: 'Dice Roll',
    description: 'Roll the dice and test your luck',
    path: '/dice-roll',
    hue: '25 95% 60%',
  },
  {
    emoji: '🔫',
    title: 'Russian Roulette',
    description: 'Dare to pull the trigger?',
    path: '/russian-roulette',
    hue: '0 85% 60%',
  },
  {
    emoji: '🃏',
    title: 'Liar Card',
    description: 'Draw a card, bluff your way',
    path: '/liar-card',
    hue: '262 85% 66%',
  },
  {
    emoji: '🦷',
    title: 'Crocodile Dentist',
    description: "Don't get bitten!",
    path: '/crocodile-dentist',
    hue: '172 70% 50%',
  },
  {
    emoji: '🎨',
    title: 'Color Memory',
    description: 'Match colors to win',
    path: '/color-memory-quest',
    hue: '322 85% 62%',
  },
  {
    emoji: '⚫',
    title: 'Gomoku',
    description: 'Five in a row wins',
    path: '/gomoku',
    hue: '38 92% 55%',
  },
  {
    emoji: '⚪',
    title: 'Othello',
    description: 'Flip to conquer',
    path: '/othello',
    hue: '152 70% 45%',
  },
  {
    emoji: '🔢',
    title: 'Schulte Table',
    description: 'Focus training, 1 to 25',
    path: '/schulte-table',
    hue: '199 90% 55%',
  },
  {
    emoji: '⚔️',
    title: 'Schulte Battle',
    description: 'Two-player number duel',
    path: '/schulte-battle',
    hue: '349 90% 60%',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-[100dvh]'>
      {/* Header */}
      <div className='relative px-4 pb-8 pt-12 text-center sm:pt-16'>
        {/* GitHub Button */}
        <a
          href='https://github.com/winzipsdo/partyjs'
          target='_blank'
          rel='noopener noreferrer'
          className='glass absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-white/10'
          title='View on GitHub'
        >
          <img src={githubIcon} alt='GitHub' className='h-5 w-5 invert opacity-80' />
        </a>

        <div className='mb-3 flex items-center justify-center gap-3'>
          <img
            src='/partyjs/partyjs.svg'
            alt='PartyJS Logo'
            className={`h-12 w-12 sm:h-14 sm:w-14 ${styles.floatLogo}`}
          />
          <h1 className={`font-mono text-4xl font-bold tracking-wide sm:text-5xl ${styles.brand}`}>PartyJS</h1>
        </div>
        <p className='text-sm tracking-wide text-slate-400'>Pick a game and have fun!</p>
      </div>

      {/* Game Grid */}
      <div className='mx-auto max-w-2xl px-4 pb-10'>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'>
          {games.map((game, i) => (
            <div
              key={game.path}
              onClick={() => navigate({ to: game.path })}
              className={styles.card}
              style={{ '--hue': game.hue, '--delay': `${i * 0.055}s` } as React.CSSProperties}
            >
              <div className='relative p-4 sm:p-5'>
                <div className={`mb-2 text-4xl sm:text-5xl ${styles.cardEmoji}`}>{game.emoji}</div>
                <h3 className='text-sm font-bold leading-tight text-white sm:text-base'>{game.title}</h3>
                <p className='mt-1 hidden text-xs leading-tight text-slate-400 sm:block'>{game.description}</p>
              </div>
              <div className={styles.cardTick} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className='pb-10 text-center'>
        <p className='text-xs tracking-wider text-slate-600'>More games coming soon...</p>
      </div>
    </div>
  );
}
