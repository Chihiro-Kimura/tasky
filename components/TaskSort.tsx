import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TaskSort({
  onSortChange,
}: {
  onSortChange: (sortBy: string) => void;
}) {
  const [sortBy, setSortBy] = useState('createdAt'); // デフォルトは作成日時順

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value); // 親コンポーネントへソート条件を通知
  };

  return (
    <div className="mb-4">
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="並び替え" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">新しい順</SelectItem>
          <SelectItem value="priority">優先度（高 → 低）</SelectItem>
          <SelectItem value="dueDate">期限が近い順</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
