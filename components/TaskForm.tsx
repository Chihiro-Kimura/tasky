import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddTask = async () => {
    if (!user) {
      toast({
        title: 'ログインしてください',
        variant: 'destructive',
      });
      return;
    }
    if (!title) {
      toast({
        title: 'タスク名を入力してください',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/tasks`), {
        title,
        description,
        priority: 'medium',
        dueDate: '2025-02-15T12:00:00Z',
        repeat: 'none',
        status: 'todo',
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setDescription('');
      onTaskAdded(); // 親コンポーネントに追加完了を通知
      toast({
        title: 'タスクを追加しました',
      });
    } catch (error) {
      console.error('タスク追加エラー:', error);
      toast({
        title: 'タスク追加に失敗しました',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <Input
        type="text"
        placeholder="タスク名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="タスクの詳細 (オプション)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2"
      />
      <Button onClick={handleAddTask} disabled={loading} className="mt-2">
        {loading ? '追加中...' : 'タスクを追加'}
      </Button>
    </div>
  );
}
