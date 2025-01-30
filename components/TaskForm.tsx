import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';

export default function TaskForm({
  onTaskAdded,
  user,
}: {
  onTaskAdded: () => void;
  user: User | null;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium'); // ✅ 優先度の state
  const [dueDate, setDueDate] = useState(''); // ✅ 期限の state
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddTask = async () => {
    if (!user) {
      toast({ title: 'ログインしてください', variant: 'destructive' });
      return;
    }
    if (!title) {
      toast({ title: 'タスク名を入力してください', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/tasks`), {
        title,
        description,
        priority, // ✅ 優先度を Firestore に保存
        dueDate: dueDate ? new Date(dueDate).toISOString() : null, // ✅ 期限を Firestore に保存
        repeat: 'none',
        status: 'todo',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // フォームのリセット
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');

      onTaskAdded();
      toast({ title: 'タスクを追加しました' });
    } catch (error) {
      console.error('タスク追加エラー:', error);
      toast({ title: 'タスク追加に失敗しました', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <form className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            タスク名
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="タスク名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Textarea
          placeholder="タスクの詳細 (オプション)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* ✅ 優先度選択 UI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            優先度
          </label>
          <Select onValueChange={setPriority} value={priority}>
            <SelectTrigger className="w-full">優先度: {priority}</SelectTrigger>
            <SelectContent>
              <SelectItem value="high">🔥 高</SelectItem>
              <SelectItem value="medium">⚡ 中</SelectItem>
              <SelectItem value="low">🌱 低</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ✅ 期限選択 UI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            期限
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Button onClick={handleAddTask} disabled={loading} className="w-full">
          {loading ? '追加中...' : 'タスクを追加'}
        </Button>
      </div>
    </form>
  );
}
