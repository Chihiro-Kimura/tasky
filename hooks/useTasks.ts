import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  collectionGroup,
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'done';
  priority: string;
  dueDate?: string;
  ownerId: string;
  sharedWith?: string[];
}

interface TaskFilters {
  status: string;
  sortBy: string;
  searchQuery: string;
}

export const useTasks = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilters>({
    status: 'all',
    sortBy: 'createdAt',
    searchQuery: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filterTasks = (tasks: Task[], filters: TaskFilters) => {
    let filteredTasks = [...tasks];

    if (filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === filters.status
      );
    }

    if (filters.searchQuery) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    return filteredTasks;
  };

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { sortBy } = filter;
      const orderConfig = {
        field:
          sortBy === 'priority'
            ? 'priority'
            : sortBy === 'dueDate'
            ? 'dueDate'
            : 'createdAt',
        direction: sortBy === 'dueDate' ? 'asc' : ('desc' as 'asc' | 'desc'),
      };

      const tasksQuery = query(
        collection(db, `users/${user.uid}/tasks`),
        orderBy(orderConfig.field, orderConfig.direction)
      );

      const sharedTasksQuery = query(
        collectionGroup(db, 'tasks'),
        where('sharedWith', 'array-contains', user.uid),
        orderBy(orderConfig.field, orderConfig.direction)
      );

      const [tasksSnapshot, sharedTasksSnapshot] = await Promise.all([
        getDocs(tasksQuery),
        getDocs(sharedTasksQuery),
      ]);

      const taskList = [...tasksSnapshot.docs, ...sharedTasksSnapshot.docs].map(
        (doc) => ({ id: doc.id, ...doc.data() } as Task)
      );

      const filteredTasks = filterTasks(taskList, filter);
      setTasks(filteredTasks);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  return {
    tasks,
    filter,
    isLoading,
    error,
    setFilter,
    refreshTasks: fetchTasks,
  };
};
