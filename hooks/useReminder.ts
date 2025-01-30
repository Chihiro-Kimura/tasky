import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  dueDate?: string;
}

export function useReminder(tasks: Task[]) {
  const { toast } = useToast();

  useEffect(() => {
    if (!tasks.length) return;

    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; // YYYY-MM-DD 形式

    tasks.forEach((task) => {
      if (!task.dueDate) return;

      const taskDueDate = new Date(task.dueDate).toISOString().split('T')[0];

      if (taskDueDate === todayString) {
        toast({
          title: '⏳ 期限が今日のタスク！',
          description: `「${task.title}」の締切は今日です！`,
        });
      }
    });
  }, [tasks, toast]);
}
