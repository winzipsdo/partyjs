// SEO 元数据：浏览器端（切换路由时更新 title / description / canonical）
// 和构建插件（为每个路由生成静态 HTML 与 sitemap）共用同一份数据。
// 注意：此文件会被 vite.config.ts 直接 import，不要使用 `@/` 别名或浏览器 API。

export const SITE_ORIGIN = 'https://winzipsdo.github.io';
export const SITE_BASE = '/partyjs/';
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE}`;
export const SITE_NAME = 'PartyJS';
export const OG_IMAGE_PATH = 'og-image.png';

export interface RouteSeo {
  /** 路由路径，不含 base，例如 `/dice-roll` */
  path: string;
  /** 页面标题（不含站点名后缀） */
  title: string;
  /** meta description，建议 70~160 个字符 */
  description: string;
  /** 首页卡片/列表中使用的短名称 */
  name: string;
}

export const HOME_SEO: RouteSeo = {
  path: '/',
  name: 'PartyJS',
  title: 'PartyJS – Free Online Party Games in Your Browser',
  description:
    'Free party games you can play instantly in the browser: dice roller, Russian roulette, liar card, crocodile dentist, Gomoku, Othello, Schulte table and more. No download, no sign-up, works on phone and desktop.',
};

export const GAME_SEO: RouteSeo[] = [
  {
    path: '/dice-roll',
    name: 'Dice Roll',
    title: 'Online Dice Roller – Roll a Virtual Die',
    description:
      'Roll a virtual six-sided die online for board games, drinking games and party games, with roll history and per-number statistics. Free, no download.',
  },
  {
    path: '/russian-roulette',
    name: 'Russian Roulette',
    title: 'Russian Roulette Party Game – Spin & Pull the Trigger',
    description:
      'A harmless online Russian roulette party game: spin the cylinder, pass the phone and see who gets the bang. Great for drinking games and truth or dare.',
  },
  {
    path: '/liar-card',
    name: 'Liar Card',
    title: "Liar's Card Game – Draw a Random Card & Bluff",
    description:
      "Draw a random playing card for liar's bar style bluffing games with friends: one tap to draw and reveal on a shared device. Free and instant.",
  },
  {
    path: '/crocodile-dentist',
    name: 'Crocodile Dentist',
    title: 'Crocodile Dentist Online – Press a Tooth, Don’t Get Bitten',
    description:
      'Play crocodile dentist online: take turns pressing teeth, one of them makes the crocodile bite. A quick luck game for parties and kids.',
  },
  {
    path: '/color-memory-quest',
    name: 'Color Memory Quest',
    title: 'Color Memory Quest – Color Matching Memory Game',
    description:
      'A color matching memory game: flip tiles, remember where each color hides and collect matching pairs. Take turns with friends to see who collects the most.',
  },
  {
    path: '/gomoku',
    name: 'Gomoku',
    title: 'Gomoku Online – Two-Player Five in a Row',
    description:
      'Play Gomoku (Five in a Row) against a friend on the same device. Get five stones in a row horizontally, vertically or diagonally to win. Free, no sign-up.',
  },
  {
    path: '/othello',
    name: 'Othello',
    title: 'Othello (Reversi) Online – Two-Player Board Game',
    description:
      'Play Othello / Reversi with a friend on one device. Place discs, flip your opponent’s pieces and own the board. Legal moves highlighted, free in the browser.',
  },
  {
    path: '/schulte-table',
    name: 'Schulte Table',
    title: 'Schulte Table Online – Focus & Speed Reading Training',
    description:
      'Train attention and peripheral vision with Schulte tables: find numbers 1 to 25 in order as fast as you can. Multiple grid sizes, timer and grading.',
  },
  {
    path: '/schulte-battle',
    name: 'Schulte Battle',
    title: 'Schulte Battle – Two-Player Schulte Table Duel',
    description:
      'Race a friend on the same screen in a two-player Schulte table duel. Find the numbers in order faster than your opponent to win.',
  },
  {
    path: '/kegel-trainer',
    name: 'Kegel Trainer',
    title: 'Kegel Trainer – Daily Pelvic Floor Exercise Timer',
    description:
      'A guided daily Kegel exercise timer: follow-along squeeze and relax cues with sound for pelvic floor training. Free, private, runs in your browser.',
  },
];

export const ALL_SEO: RouteSeo[] = [HOME_SEO, ...GAME_SEO];

/** 规范化路由路径：去掉尾部斜杠，`/home` 视为首页 */
export function normalizeSeoPath(pathname: string): string {
  const p = pathname.replace(/\/+$/, '') || '/';
  return p === '/home' ? '/' : p;
}

export function findRouteSeo(pathname: string): RouteSeo {
  const p = normalizeSeoPath(pathname);
  return ALL_SEO.find((r) => r.path === p) ?? HOME_SEO;
}

export function fullTitle(seo: RouteSeo): string {
  return seo.path === '/' ? seo.title : `${seo.title} | ${SITE_NAME}`;
}

/** 规范 URL：GitHub Pages 对目录会 301 到带尾斜杠的地址，因此统一带 `/` */
export function canonicalUrl(seo: RouteSeo): string {
  return seo.path === '/' ? SITE_URL : `${SITE_URL}${seo.path.slice(1)}/`;
}
