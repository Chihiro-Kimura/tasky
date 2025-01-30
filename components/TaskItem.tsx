import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TaskItem({ task, onTaskUpdated, onTaskDeleted }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const handleUpdateTask = async () => {
    try {
      const taskRef = doc(db, 'users/user1/tasks', task.id);
      await updateDoc(taskRef, {
        title: editTitle,
        description: editDescription,
      });

      onTaskUpdated(task.id, editTitle, editDescription);
      setIsEditing(false);
    } catch (error) {
      console.error('タスク更新エラー:', error);
      alert('タスクの更新に失敗しました');
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('このタスクを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'users/user1/tasks', task.id));
      onTaskDeleted(task.id);
    } catch (error) {
      console.error('タスク削除エラー:', error);
      alert('タスクの削除に失敗しました');
    }
  };

  return (
    <li className="border p-4 rounded mb-2 flex flex-col gap-2">
      {isEditing ? (
        <div>
          <Input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleUpdateTask}>保存</Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{task.title}</h2>
            <p>{task.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              編集
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              削除
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
