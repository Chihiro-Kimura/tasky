import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TaskForm({ onTaskAdded }: { onTaskAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!title) {
      alert('タスク名を入力してください');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'users/user1/tasks'), {
        title,
        description,
        priority: 'medium',
        dueDate: '2025-02-15T12:00:00Z',
        repeat: 'none',
        status: 'todo',
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setDescription('');
      onTaskAdded(); // 親コンポーネントに追加完了を通知
    } catch (error) {
      console.error('タスク追加エラー:', error);
      alert('タスク追加に失敗しました');
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
