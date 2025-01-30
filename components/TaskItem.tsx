import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import TaskShare from '@/components/TaskShare';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  ownerId: string; // 🔹 タスクの作成者情報を追加
}

export default function TaskItem({
  task,
  onTaskUpdated,
  onTaskDeleted,
}: {
  task: Task;
  onTaskUpdated: (id: string, title?: string, description?: string) => void;
  onTaskDeleted: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  const handleUpdateTask = async () => {
    try {
      const taskRef = doc(db, `users/${auth.currentUser?.uid}/tasks`, task.id);
      await updateDoc(taskRef, {
        title: editTitle,
        description: editDescription,
      });

      onTaskUpdated(task.id, editTitle, editDescription);
      setIsEditing(false);
      toast({
        title: 'タスクを更新しました',
      });
    } catch (error) {
      console.error('タスク更新エラー:', error);
      toast({
        title: 'タスクの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('このタスクを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser?.uid}/tasks`, task.id));
      onTaskDeleted(task.id);
      toast({
        title: 'タスクを削除しました',
      });
    } catch (error) {
      console.error('タスク削除エラー:', error);
      toast({
        title: 'タスクの削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = task.status === 'todo' ? 'done' : 'todo';
      const taskRef = doc(db, `users/${auth.currentUser?.uid}/tasks`, task.id);

      await updateDoc(taskRef, { status: newStatus });

      onTaskUpdated(task.id, task.title, task.description);
    } catch (error) {
      toast({
        title: 'ステータスの更新に失敗しました',
        variant: 'destructive',
      });
      console.error('ステータス更新エラー:', error);
    }
  };

  return (
    <li
      className={`border p-4 rounded mb-2 flex flex-col gap-2 ${
        task.status === 'done' ? 'bg-gray-200' : ''
      }`}
    >
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
            <h2
              className={`text-lg font-semibold ${
                task.status === 'done' ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h2>
            <p>{task.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleToggleStatus}>
              {task.status === 'todo' ? '完了' : '未完了'}
            </Button>
            <Button variant="outline" onClick={() => setShowShare(!showShare)}>
              共有
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              編集
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              削除
            </Button>
          </div>
        </div>
      )}
      {showShare && (
        <TaskShare
          taskId={task.id}
          ownerId={task.ownerId}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </li>
  );
}
