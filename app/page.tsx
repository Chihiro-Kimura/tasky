'use client';

import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import TaskFilter from '@/components/TaskFilter';
import TaskSort from '@/components/TaskSort';
import { Toaster } from '@/components/ui/toaster';
import Auth from '@/components/Auth';
import { useReminder } from '@/hooks/useReminder';
import { useTasks } from '@/hooks/useTasks';
import { useState } from 'react';
import { User } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const { tasks, filter, isLoading, error, setFilter, refreshTasks } =
    useTasks(user);

  useReminder(tasks);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          タスク管理
        </h1>
        <Toaster />
        <div className="max-w-3xl mx-auto">
          <Auth onLogin={setUser} />
          {user && (
            <div className="space-y-6">
              <TaskForm onTaskAdded={refreshTasks} user={user} />
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <TaskFilter
                  filter={filter.status}
                  onFilterChange={(value) =>
                    setFilter({
                      ...filter,
                      status: value as 'todo' | 'done' | 'all',
                    })
                  }
                />
                <TaskSort
                  onSortChange={(value) =>
                    setFilter({ ...filter, sortBy: value })
                  }
                />
              </div>
              {isLoading && (
                <div className="text-center text-gray-600 dark:text-gray-400">
                  読み込み中...
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  エラーが発生しました: {error.message}
                </div>
              )}
              <TaskList
                tasks={tasks}
                onTaskUpdated={refreshTasks}
                onTaskDeleted={refreshTasks}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
