import TaskItem from './TaskItem';
import { auth } from '@/lib/firebase';

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

export default function TaskList({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
}: {
  tasks: Task[];
  onTaskUpdated: (
    id: string,
    title?: string,
    description?: string,
    dueDate?: string,
    priority?: string
  ) => void;
  onTaskDeleted: (id: string) => void;
}) {
  const currentUserUid = auth.currentUser?.uid;
  console.log('📌 TaskList.tsx に渡された tasks:', tasks);

  tasks.forEach((task) => {
    const sharedWithList = task.sharedWith ?? []; // ✅ `undefined` を回避
    console.log(`📌 タスク (${task.id}) の sharedWith:`, sharedWithList);
    console.log(
      `🔍 ユーザー (${currentUserUid}) が sharedWith に含まれる？:`,
      sharedWithList.includes(currentUserUid)
    );
  });

  if (!tasks || tasks.length === 0) {
    return <p className="text-gray-500">タスクがありません。</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      ))}
    </ul>
  );
}
