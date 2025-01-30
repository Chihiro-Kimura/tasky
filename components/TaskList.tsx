import TaskItem from './TaskItem';

export default function TaskList({ tasks, onTaskUpdated, onTaskDeleted }: any) {
  return (
    <ul className="mt-6">
      {tasks.length === 0 ? (
        <p className="text-gray-500">データがありません。</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        ))
      )}
    </ul>
  );
}
