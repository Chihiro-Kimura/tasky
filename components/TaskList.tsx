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
    <div className="grid gap-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="transform transition-all duration-200 hover:scale-[1.01] bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
        >
          <TaskItem
            task={task}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        </div>
      ))}
    </div>
  );
}
