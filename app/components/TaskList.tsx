'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { TaskItem, getUpcomingTasks, markTaskAsCompleted, createTask } from '@/lib/google'

interface TaskListProps {
  accessToken: string
  calendarId?: string
  maxResults?: number
}

export default function TaskList({ 
  accessToken, 
  calendarId = 'primary', 
  maxResults = 20 
}: TaskListProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    location: ''
  })

  useEffect(() => {
    if (accessToken) {
      fetchTasks()
    }
  }, [accessToken, calendarId, maxResults])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedTasks = await getUpcomingTasks(accessToken, calendarId, maxResults)
      setTasks(fetchedTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskToggle = async (taskId: string, isCompleted: boolean) => {
    try {
      await markTaskAsCompleted(accessToken, taskId, isCompleted, calendarId)
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, isCompleted } 
            : task
        )
      )
    } catch (err) {
      console.error('Error toggling task:', err)
      setError('Failed to update task status')
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTask.title || !newTask.dueDate) {
      setError('Title and due date are required')
      return
    }

    try {
      const createdTask = await createTask(accessToken, newTask, calendarId)
      setTasks(prevTasks => [createdTask, ...prevTasks])
      setNewTask({ title: '', description: '', dueDate: '', dueTime: '', location: '' })
      setShowCreateForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchTasks}
          className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          <p className="text-sm text-gray-600">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} from Google Calendar
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-md font-medium text-gray-900 mb-3">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="Task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueTime: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={newTask.location}
                  onChange={(e) => setNewTask(prev => ({ ...prev, location: e.target.value }))}
                  className="input-field"
                  placeholder="Location"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                rows={3}
                placeholder="Task description"
              />
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Create Task
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming tasks</h3>
          <p className="text-gray-600">
            Create a new task or check your Google Calendar for upcoming events.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white border rounded-lg p-4 transition-all duration-200 ${
                task.isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleTaskToggle(task.id, !task.isCompleted)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.isCompleted ? (
                    <CheckCircleSolidIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        task.isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.isCompleted ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {/* Due Date/Time */}
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      <span>
                        {formatDate(task.dueDate)}
                        {task.dueTime && ` at ${formatTime(task.dueTime)}`}
                      </span>
                    </div>

                    {/* Location */}
                    {task.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        <span>{task.location}</span>
                      </div>
                    )}

                    {/* Attendees */}
                    {task.attendees && task.attendees.length > 0 && (
                      <div className="flex items-center">
                        <UserGroupIcon className="h-3 w-3 mr-1" />
                        <span>{task.attendees.length} attendee{task.attendees.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchTasks}
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          Refresh tasks
        </button>
      </div>
    </div>
  )
} 