import TaskList from '../components/TaskList'

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-600">
          Manage your tasks and to-dos efficiently.
        </p>
      </div>
      <TaskList />
    </div>
  )
} 