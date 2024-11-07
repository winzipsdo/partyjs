import { createFileRoute } from '@tanstack/react-router';
import { ColorMemoryQuestPage } from '@/pages/color-memory-quest';

export const Route = createFileRoute('/color-memory-quest/')({
  component: ColorMemoryQuestPage,
});
