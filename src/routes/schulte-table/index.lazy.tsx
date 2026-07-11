import { createLazyFileRoute } from '@tanstack/react-router';
import { SchulteTablePage } from '@/pages/schulte-table';

export const Route = createLazyFileRoute('/schulte-table/')({
  component: SchulteTablePage,
});
