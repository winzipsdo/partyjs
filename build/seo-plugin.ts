import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import {
  ALL_SEO,
  GAME_SEO,
  HOME_SEO,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
  canonicalUrl,
  fullTitle,
  type RouteSeo,
} from '../src/constants/seo';

const SEO_START = '<!--seo-->';
const SEO_END = '<!--/seo-->';
const NOSCRIPT_MARK = '<!--seo-noscript-->';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLd(seo: RouteSeo): object {
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: HOME_SEO.description,
    inLanguage: 'en',
  };

  if (seo.path === '/') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        website,
        {
          '@type': 'ItemList',
          name: 'PartyJS games',
          itemListElement: GAME_SEO.map((g, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: g.name,
            url: canonicalUrl(g),
          })),
        },
      ],
    };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      website,
      {
        '@type': 'WebApplication',
        name: seo.name,
        headline: seo.title,
        url: canonicalUrl(seo),
        description: seo.description,
        applicationCategory: seo.path === '/kegel-trainer' ? 'HealthApplication' : 'GameApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        isPartOf: { '@id': `${SITE_URL}#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: seo.name, item: canonicalUrl(seo) },
        ],
      },
    ],
  };
}

/** 生成 <head> 中的 SEO 标签块 */
export function renderSeoHead(seo: RouteSeo, opts: { noindex?: boolean } = {}): string {
  const title = esc(fullTitle(seo));
  const desc = esc(seo.description);
  const url = esc(canonicalUrl(seo));
  const image = esc(`${SITE_URL}${OG_IMAGE_PATH}`);
  const ld = JSON.stringify(jsonLd(seo)).replace(/</g, '\\u003c');

  const lines = [
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    opts.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${ld}</script>`,
  ];
  return `${SEO_START}\n    ${lines.join('\n    ')}\n    ${SEO_END}`;
}

/** 无 JS 时的兜底内容，同时给爬虫提供可跟随的站内链接 */
function renderNoscript(seo: RouteSeo): string {
  const links = ALL_SEO.map((r) => `<li><a href="${esc(canonicalUrl(r))}">${esc(r.name)}</a> – ${esc(r.description)}</li>`).join('');
  return `<noscript><h1>${esc(seo.title)}</h1><p>${esc(seo.description)}</p><p>PartyJS needs JavaScript to run. All games:</p><ul>${links}</ul></noscript>`;
}

function renderPage(template: string, seo: RouteSeo, opts: { noindex?: boolean } = {}): string {
  const start = template.indexOf(SEO_START);
  const end = template.indexOf(SEO_END);
  if (start === -1 || end === -1 || !template.includes(NOSCRIPT_MARK)) {
    throw new Error('[seo] index.html is missing <!--seo--> / <!--seo-noscript--> markers');
  }
  return (
    template.slice(0, start) + renderSeoHead(seo, opts) + template.slice(end + SEO_END.length)
  ).replace(NOSCRIPT_MARK, renderNoscript(seo));
}

function renderSitemap(): string {
  const urls = ALL_SEO.map((r) => `  <url><loc>${esc(canonicalUrl(r))}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * 构建后处理：
 * - 为每个路由输出 `<route>/index.html`（独立的 title / description / canonical / OG / JSON-LD），
 *   这样 GitHub Pages 直接以 200 返回深层链接，搜索引擎可以把每个游戏当作独立页面收录；
 * - 输出 404.html（SPA 兜底，noindex）；
 * - 输出 sitemap.xml。
 */
export function seoPlugin(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'partyjs-seo',
    configResolved(c) {
      config = c;
    },
    // dev 与 build 都先填入首页的 SEO 标签
    transformIndexHtml(html) {
      const start = html.indexOf(SEO_START);
      const end = html.indexOf(SEO_END);
      if (start === -1 || end === -1) return html;
      return html.slice(0, start) + renderSeoHead(HOME_SEO) + html.slice(end + SEO_END.length);
    },
    closeBundle() {
      if (config.command !== 'build') return;
      const outDir = path.resolve(config.root, config.build.outDir);
      const indexPath = path.join(outDir, 'index.html');
      const template = fs.readFileSync(indexPath, 'utf8');

      for (const seo of ALL_SEO) {
        const file = seo.path === '/' ? indexPath : path.join(outDir, seo.path.slice(1), 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, renderPage(template, seo));
      }
      // `/home` 与首页内容相同：输出同样的页面，canonical 指向首页
      const homeAlias = path.join(outDir, 'home', 'index.html');
      fs.mkdirSync(path.dirname(homeAlias), { recursive: true });
      fs.writeFileSync(homeAlias, renderPage(template, HOME_SEO));

      fs.writeFileSync(path.join(outDir, '404.html'), renderPage(template, HOME_SEO, { noindex: true }));
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), renderSitemap());
    },
  };
}
