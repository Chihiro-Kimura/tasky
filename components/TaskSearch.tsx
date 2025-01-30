import { Input } from '@/components/ui/input';

export default function TaskSearch({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  return (
    <div className="mb-4">
      <Input
        type="text"
        placeholder="タスクを検索..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
