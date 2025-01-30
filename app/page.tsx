'use client';

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
import { Toaster } from '@/components/ui/toaster';
import Auth from '@/components/Auth';
import { User } from '@/lib/firebase';

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [filter, user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      console.log('✅ Firestore からタスクを取得開始…');

      // 🔹 自分が作成したタスクを取得
      const tasksQuery = query(
        collection(db, `users/${user.uid}/tasks`),
        orderBy('createdAt', 'desc')
      );

      // 🔹 共有されたタスクを取得（`sharedWith` を `user.uid` に変更）
      const sharedTasksQuery = query(
        collectionGroup(db, 'tasks'),
        where('sharedWith', 'array-contains', user.uid), // 🔹 `user.email` → `user.uid` に変更
        orderBy('createdAt', 'desc')
      );

      const [tasksSnapshot, sharedTasksSnapshot] = await Promise.all([
        getDocs(tasksQuery),
        getDocs(sharedTasksQuery),
      ]);

      const taskList = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sharedTaskList = sharedTasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('✅ Firestore から取得した自分のタスク:', taskList);
      console.log('✅ Firestore から取得した共有タスク:', sharedTaskList);

      let combinedTasks = [...taskList, ...sharedTaskList];

      // 🔹 フィルター（"todo" / "done"）
      if (filter === 'todo') {
        combinedTasks = combinedTasks.filter((task) => task.status === 'todo');
      } else if (filter === 'done') {
        combinedTasks = combinedTasks.filter((task) => task.status === 'done');
      }

      setTasks(combinedTasks);
    } catch (error) {
      console.error('データ取得エラー:', error);
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
          <TaskFilter filter={filter} onFilterChange={setFilter} />
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
