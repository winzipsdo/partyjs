/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()
const RussianRouletteIndexLazyImport = createFileRoute('/russian-roulette/')()
const HomeIndexLazyImport = createFileRoute('/home/')()
const DiceRollIndexLazyImport = createFileRoute('/dice-roll/')()

// Create/Update Routes

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const RussianRouletteIndexLazyRoute = RussianRouletteIndexLazyImport.update({
  id: '/russian-roulette/',
  path: '/russian-roulette/',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/russian-roulette/index.lazy').then((d) => d.Route),
)

const HomeIndexLazyRoute = HomeIndexLazyImport.update({
  id: '/home/',
  path: '/home/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/home/index.lazy').then((d) => d.Route))

const DiceRollIndexLazyRoute = DiceRollIndexLazyImport.update({
  id: '/dice-roll/',
  path: '/dice-roll/',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/dice-roll/index.lazy').then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/dice-roll/': {
      id: '/dice-roll/'
      path: '/dice-roll'
      fullPath: '/dice-roll'
      preLoaderRoute: typeof DiceRollIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/home/': {
      id: '/home/'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof HomeIndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/russian-roulette/': {
      id: '/russian-roulette/'
      path: '/russian-roulette'
      fullPath: '/russian-roulette'
      preLoaderRoute: typeof RussianRouletteIndexLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/dice-roll': typeof DiceRollIndexLazyRoute
  '/home': typeof HomeIndexLazyRoute
  '/russian-roulette': typeof RussianRouletteIndexLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/dice-roll': typeof DiceRollIndexLazyRoute
  '/home': typeof HomeIndexLazyRoute
  '/russian-roulette': typeof RussianRouletteIndexLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/dice-roll/': typeof DiceRollIndexLazyRoute
  '/home/': typeof HomeIndexLazyRoute
  '/russian-roulette/': typeof RussianRouletteIndexLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/dice-roll' | '/home' | '/russian-roulette'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/dice-roll' | '/home' | '/russian-roulette'
  id: '__root__' | '/' | '/dice-roll/' | '/home/' | '/russian-roulette/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  DiceRollIndexLazyRoute: typeof DiceRollIndexLazyRoute
  HomeIndexLazyRoute: typeof HomeIndexLazyRoute
  RussianRouletteIndexLazyRoute: typeof RussianRouletteIndexLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  DiceRollIndexLazyRoute: DiceRollIndexLazyRoute,
  HomeIndexLazyRoute: HomeIndexLazyRoute,
  RussianRouletteIndexLazyRoute: RussianRouletteIndexLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/dice-roll/",
        "/home/",
        "/russian-roulette/"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/dice-roll/": {
      "filePath": "dice-roll/index.lazy.tsx"
    },
    "/home/": {
      "filePath": "home/index.lazy.tsx"
    },
    "/russian-roulette/": {
      "filePath": "russian-roulette/index.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
