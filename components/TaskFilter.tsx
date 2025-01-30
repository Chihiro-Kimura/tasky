import { Button } from '@/components/ui/button';

export default function TaskFilter({
  filter,
  onFilterChange,
}: {
  filter: string;
  onFilterChange: (filter: string) => void;
}) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant={filter === 'all' ? 'default' : 'outline'}
        onClick={() => onFilterChange('all')}
      >
        すべて
      </Button>
      <Button
        variant={filter === 'todo' ? 'default' : 'outline'}
        onClick={() => onFilterChange('todo')}
      >
        未完了
      </Button>
      <Button
        variant={filter === 'done' ? 'default' : 'outline'}
        onClick={() => onFilterChange('done')}
      >
        完了
      </Button>
    </div>
  );
}
