# Task Management Functionality

This document describes the task management functionality implemented in the Avista Dashboard.

## Overview

The task management system integrates with Google Calendar to display upcoming events as tasks with completion tracking. Users can view, create, and mark tasks as completed.

## Features

### 1. Task Display
- **Upcoming Tasks**: Shows calendar events from the next 30 days
- **Task Details**: Displays title, description, due date/time, location, and attendees
- **Visual Indicators**: Tasks show completion status with checkboxes and color coding

### 2. Task Creation
- **New Task Form**: Allows users to create new calendar events as tasks
- **Required Fields**: Title and due date
- **Optional Fields**: Description, time, and location
- **Real-time Updates**: New tasks appear immediately in the list

### 3. Task Completion
- **Checkbox Interface**: Click to mark tasks as completed/incomplete
- **Visual Feedback**: Completed tasks show green styling and strikethrough text
- **Calendar Integration**: Completion status is saved to Google Calendar event descriptions

### 4. Authentication
- **OAuth Integration**: Uses Google OAuth 2.0 for secure authentication
- **Multiple Scopes**: Supports both Calendar and Gmail API access
- **Token Management**: Secure token storage and automatic refresh

## Implementation Details

### Files Modified/Created

1. **`lib/google.ts`** - Added task-related functions:
   - `getUpcomingTasks()` - Fetches calendar events as tasks
   - `markTaskAsCompleted()` - Updates task completion status
   - `createTask()` - Creates new calendar events
   - `TaskItem` interface - Type definition for tasks

2. **`app/components/TaskList.tsx`** - New component:
   - Displays task list with completion checkboxes
   - Task creation form
   - Date/time formatting
   - Error handling and loading states

3. **`app/pages/tasks.tsx`** - Updated page:
   - Added tab navigation (Tasks/Email)
   - Integrated TaskList component
   - Updated OAuth scopes to include Calendar access

4. **`lib/oauth.ts`** - Updated token storage:
   - Changed from Gmail-specific to generic Google token storage
   - Added Calendar OAuth scopes

### API Integration

The system uses the Google Calendar API v3 to:
- Fetch upcoming events (`GET /calendar/v3/calendars/{calendarId}/events`)
- Create new events (`POST /calendar/v3/calendars/{calendarId}/events`)
- Update existing events (`PUT /calendar/v3/calendars/{calendarId}/events/{eventId}`)

### OAuth Scopes Required

- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/calendar.events` - Create/update calendar events
- `https://www.googleapis.com/auth/gmail.readonly` - Read Gmail messages
- `https://www.googleapis.com/auth/gmail.modify` - Modify Gmail messages

## Usage

1. **Authentication**: Click "OAuth Setup" to authenticate with Google
2. **View Tasks**: Navigate to the Tasks tab to see upcoming calendar events
3. **Create Tasks**: Click "New Task" to create a new calendar event
4. **Complete Tasks**: Click the checkbox next to any task to mark it as completed
5. **Refresh**: Click "Refresh tasks" to reload the task list

## Technical Notes

- Tasks are stored as Google Calendar events
- Completion status is tracked by adding completion timestamps to event descriptions
- The system fetches events from the next 30 days by default
- All API calls include proper error handling and loading states
- The UI is responsive and works on mobile devices

## Future Enhancements

Potential improvements could include:
- Task categories/tags
- Recurring task support
- Task priority levels
- Due date reminders
- Task search and filtering
- Bulk task operations
- Integration with other task management systems 