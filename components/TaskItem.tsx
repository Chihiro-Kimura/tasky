import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import TaskShare from '@/components/TaskShare';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  ownerId: string;
  priority: string;
  dueDate?: string;
  sharedWith?: string[];
}

export default function TaskItem({
  task,
  onTaskUpdated,
  onTaskDeleted,
}: {
  task: Task;
  onTaskUpdated: (
    id: string,
    title?: string,
    description?: string,
    dueDate?: string,
    priority?: string
  ) => void;
  onTaskDeleted: (id: string) => void;
}) {
  console.log('📌 TaskItem.tsx に渡された task:', task);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [showShare, setShowShare] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    const sharedWithList = task.sharedWith ?? []; // ✅ `undefined` の回避

    console.log('📌 現在のユーザー UID:', currentUserUid);
    console.log('📌 Task の sharedWith:', sharedWithList);

    if (!task.sharedWith) {
      console.warn(
        '⚠️ Firestore に sharedWith フィールドがないタスクがあります:',
        task.id
      );
    }

    setIsShared(sharedWithList.includes(currentUserUid));
  }, [task]);

  // 🔹 期限チェック
  const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
  const today = new Date();
  const isToday =
    taskDueDate && taskDueDate.toDateString() === today.toDateString();
  const isOverdue = taskDueDate && taskDueDate < today;

  useEffect(() => {
    if (isToday) {
      toast({
        title: '📢 期限が今日のタスク！',
        description: `「${task.title}」の締切が今日です！`,
      });
    }
  }, [isToday, task.title, toast]);

  const handleUpdateTask = async () => {
    try {
      const taskRef = doc(db, `users/${task.ownerId}/tasks`, task.id);
      await updateDoc(taskRef, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate || null,
        priority: editPriority,
        sharedWith: task.sharedWith ?? [], // ✅ `undefined` の場合は `[]` をセット
      });

      onTaskUpdated(
        task.id,
        editTitle,
        editDescription,
        editDueDate,
        editPriority
      );
      setIsEditing(false);
      toast({ title: 'タスクを更新しました' });
    } catch (error) {
      console.error('タスク更新エラー:', error);
      toast({ title: 'タスクの更新に失敗しました', variant: 'destructive' });
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('このタスクを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, `users/${task.ownerId}/tasks`, task.id));
      onTaskDeleted(task.id);
      toast({ title: 'タスクを削除しました' });
    } catch (error) {
      console.error('タスク削除エラー:', error);
      toast({ title: 'タスクの削除に失敗しました', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = task.status === 'todo' ? 'done' : 'todo';
      const taskRef = doc(db, `users/${task.ownerId}/tasks`, task.id);

      await updateDoc(taskRef, { status: newStatus });

      onTaskUpdated(
        task.id,
        task.title,
        task.description,
        editDueDate,
        editPriority
      );
      toast({ title: 'ステータスを更新しました' });
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      toast({
        title: 'ステータスの更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  return (
    <li
      className={`border p-4 rounded mb-2 flex flex-col gap-2 ${
        task.status === 'done' ? 'bg-gray-200' : isOverdue ? 'bg-red-100' : ''
      }`}
    >
      {isEditing ? (
        <div className="space-y-2">
          <Input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <Input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
          />
          <Select value={editPriority} onValueChange={setEditPriority}>
            <SelectTrigger>
              <span>優先度: {editPriority}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={handleUpdateTask}>保存</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h2>{task.title}</h2>
          <p>{task.description}</p>
          {task.dueDate && (
            <p className={`text-sm ${isOverdue ? 'text-red-500' : ''}`}>
              期限: {task.dueDate}
            </p>
          )}
          <p className="text-sm">優先度: {task.priority}</p>
          <div className="flex gap-2 mt-2">
            <Button onClick={() => setIsEditing(true)}>編集</Button>
            <Button onClick={handleToggleStatus}>
              {task.status === 'todo' ? '完了' : '未完了'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              削除
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowShare(true)}
              disabled={!task.ownerId}
            >
              共有
            </Button>
          </div>
        </div>
      )}

      {showShare && (
        <TaskShare
          taskId={task.id}
          ownerId={task.ownerId}
          onClose={() => setShowShare(false)}
        />
      )}
    </li>
  );
}
