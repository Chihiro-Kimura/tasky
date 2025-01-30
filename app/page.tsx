'use client'; // 👈 **これを追加！**

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  collectionGroup,
} from 'firebase/firestore';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import TaskFilter from '@/components/TaskFilter';
import TaskSort from '@/components/TaskSort';
import { Toaster } from '@/components/ui/toaster';
import Auth from '@/components/Auth';
import { useReminder } from '@/hooks/useReminder';

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [filter, sortBy, searchQuery, user]);

  useReminder(tasks);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      console.log('🔍 Firestore からタスクを取得開始…');
      console.log('🔍 現在のユーザー UID:', user.uid); // ✅ 現在のユーザー UID を確認
      let orderField = 'createdAt';
      let orderDirection: 'asc' | 'desc' = 'desc';

      if (sortBy === 'priority') {
        orderField = 'priority';
        orderDirection = 'desc';
      } else if (sortBy === 'dueDate') {
        orderField = 'dueDate';
        orderDirection = 'asc';
      }

      const tasksQuery = query(
        collection(db, `users/${user.uid}/tasks`),
        orderBy(orderField, orderDirection)
      );

      const sharedTasksQuery = query(
        collectionGroup(db, 'tasks'),
        where('sharedWith', 'array-contains', user.uid),
        orderBy(orderField, orderDirection)
      );

      const [tasksSnapshot, sharedTasksSnapshot] = await Promise.all([
        getDocs(tasksQuery),
        getDocs(sharedTasksQuery),
      ]);

      const taskList = tasksSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('📌 取得したタスク:', data);
        return { id: doc.id, ...data };
      });

      const sharedTaskList = sharedTasksSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('📌 取得した共有タスク:', data);
        return { id: doc.id, ...data };
      });

      console.log('✅ Firestore から取得した自分のタスク:', taskList);
      console.log('✅ Firestore から取得した共有タスク:', sharedTaskList);

      let combinedTasks = [...taskList, ...sharedTaskList];

      if (filter === 'todo') {
        combinedTasks = combinedTasks.filter((task) => task.status === 'todo');
      } else if (filter === 'done') {
        combinedTasks = combinedTasks.filter((task) => task.status === 'done');
      }

      if (searchQuery) {
        combinedTasks = combinedTasks.filter((task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setTasks(combinedTasks);
    } catch (error) {
      console.error('🔥 データ取得エラー:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">タスク管理</h1>
      <Toaster />
      <Auth onLogin={setUser} />
      {user && (
        <>
          <TaskForm onTaskAdded={fetchTasks} user={user} />
          <div className="flex gap-4 mb-4">
            <TaskFilter filter={filter} onFilterChange={setFilter} />
            <TaskSort onSortChange={setSortBy} />
          </div>
          <TaskList
            tasks={tasks}
            onTaskUpdated={fetchTasks}
            onTaskDeleted={fetchTasks}
          />
        </>
      )}
    </div>
  );
}
