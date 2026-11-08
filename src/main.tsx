import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

const BASE = import.meta.env.BASE_URL; // '/partyjs/'

// 兼容旧的 hash 链接：/partyjs/#/dice-roll -> /partyjs/dice-roll/
if (window.location.hash.startsWith('#/')) {
  const legacyPath = window.location.hash.slice(2).replace(/\/+$/, '');
  window.history.replaceState(null, '', legacyPath ? `${BASE}${legacyPath}/` : BASE);
}

// 使用真实路径（而非 hash）路由，搜索引擎才能把每个游戏当作独立页面收录。
// 构建时会为每个路由生成 `<route>/index.html`，见 build/seo-plugin.ts。
const router = createRouter({
  routeTree,
  basepath: BASE,
  trailingSlash: 'always',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
