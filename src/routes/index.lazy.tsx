import { createLazyFileRoute } from '@tanstack/react-router';
import { Home } from './home/index.lazy';

export const Route = createLazyFileRoute('/')({
  component: Home,
});
