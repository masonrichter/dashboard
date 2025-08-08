# DashboardContext: Global State Management

This document describes the DashboardContext, a comprehensive React Context that manages global state for the entire dashboard application, including selected clients, tags, CRM data, and UI state.

## Overview

The DashboardContext provides centralized state management for:
- **Tag Management**: Selected tags, available tags, and tag counts
- **Client Management**: Selected clients, all clients, and filtered clients
- **CRM Data**: Contacts, loading states, and search terms
- **UI State**: Active views, sidebar state, and navigation

## Architecture

### DashboardContext (`app/context/DashboardContext.tsx`)

A comprehensive React Context provider that manages all application state:

```typescript
interface DashboardState {
  // Tag management
  selectedTags: string[]
  availableTags: string[]
  tagCounts: Record<string, number>
  
  // Client management
  selectedClients: string[]
  allClients: CopperContactSummary[]
  filteredClients: CopperContactSummary[]
  
  // CRM data
  contacts: CopperContactSummary[]
  loading: boolean
  searchTerm: string
  
  // UI state
  activeView: 'contacts' | 'tags' | 'analytics'
  sidebarOpen: boolean
}
```

### Provider Setup

The DashboardProvider is configured at the root level in `app/layout.tsx`:

```tsx
import { DashboardProvider } from './context/DashboardContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </body>
    </html>
  )
}
```

## Hooks and Usage

### Main Hook: `useDashboard()`

Access all dashboard state and actions:

```tsx
import { useDashboard } from '@/app/context/DashboardContext'

function MyComponent() {
  const {
    selectedTags,
    selectedClients,
    contacts,
    loading,
    addSelectedTag,
    removeSelectedTag,
    addSelectedClient,
    clearSelectedClients,
    setActiveView
  } = useDashboard()
  
  // Component logic
}
```

### Specialized Hooks

#### `useTags()` - Tag Management
```tsx
import { useTags } from '@/app/context/DashboardContext'

function TagComponent() {
  const {
    selectedTags,
    availableTags,
    tagCounts,
    addSelectedTag,
    removeSelectedTag,
    clearSelectedTags,
    setAvailableTags,
    setTagCounts
  } = useTags()
}
```

#### `useClients()` - Client Management
```tsx
import { useClients } from '@/app/context/DashboardContext'

function ClientComponent() {
  const {
    selectedClients,
    allClients,
    filteredClients,
    addSelectedClient,
    removeSelectedClient,
    clearSelectedClients,
    setAllClients,
    getClientById
  } = useClients()
}
```

#### `useCRM()` - CRM Data Management
```tsx
import { useCRM } from '@/app/context/DashboardContext'

function CRMComponent() {
  const {
    contacts,
    loading,
    searchTerm,
    setContacts,
    setLoading,
    setSearchTerm,
    getContactsByTags,
    filterContactsBySearch
  } = useCRM()
}
```

## State Management Features

### Automatic Filtering
The context automatically filters contacts when selected tags change:

```tsx
// Auto-filter contacts when selected tags change
useEffect(() => {
  const filtered = getContactsByTags(state.selectedTags)
  setFilteredClients(filtered)
}, [state.selectedTags, state.contacts])
```

### Utility Functions
Built-in utility functions for common operations:

- `getClientById(id: string)` - Find client by ID
- `getContactsByTags(tags: string[])` - Filter contacts by tags (AND logic)
- `filterContactsBySearch(term: string)` - Search contacts by name, email, company, or tags

### State Persistence
State persists across component unmounts and page navigation, providing a seamless user experience.

## Component Integration

### TagExplorer Integration
```tsx
import { useTags } from '@/app/context/DashboardContext'

export default function TagExplorer() {
  const { 
    selectedTags, 
    availableTags, 
    tagCounts, 
    addSelectedTag, 
    removeSelectedTag, 
    clearSelectedTags,
    setAvailableTags,
    setTagCounts
  } = useTags()
  
  // Component uses context instead of local state
}
```

### CopperCRM Integration
```tsx
import { useTags, useCRM } from '@/app/context/DashboardContext'

export default function CopperCRM() {
  const { selectedTags, addSelectedTag, removeSelectedTag, clearSelectedTags } = useTags()
  const { contacts, loading, searchTerm, setContacts, setLoading, setSearchTerm } = useCRM()
  
  // Component uses context for all state management
}
```

### Layout Integration
```tsx
import { useDashboard } from '@/app/context/DashboardContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useDashboard()
  
  // Layout uses context for sidebar state
}
```

## Demo Pages

### Dashboard Demo (`app/pages/dashboard-demo.tsx`)
Comprehensive demonstration of all DashboardContext features:
- **Overview**: Real-time state monitoring
- **Contacts**: CRM management with global state
- **Tags**: Tag exploration and filtering
- **Clients**: Client selection interface
- **Analytics**: Data insights and context visualization

### CRM Management (`app/pages/crm.tsx`)
Tabbed interface for CRM operations with shared state.

### Integration Demo (`app/pages/demo.tsx`)
Side-by-side demonstration of component synchronization.

## Benefits

### 1. Centralized State Management
- Single source of truth for all application state
- Eliminates prop drilling
- Consistent state across all components

### 2. Real-time Synchronization
- Changes in one component immediately reflect across the entire application
- Automatic filtering and updates
- Seamless user experience

### 3. Performance Optimization
- Efficient state updates with React's built-in optimization
- Minimal re-renders through context design
- Lazy loading and caching capabilities

### 4. Developer Experience
- Type-safe state management with TypeScript
- Specialized hooks for different concerns
- Clear separation of concerns

### 5. Scalability
- Easy to add new state properties
- Modular hook design
- Extensible architecture

## Migration from TagContext

The DashboardContext replaces the previous TagContext with enhanced functionality:

### Before (TagContext)
```tsx
import { useTagContext } from './TagContext'

const { selectedTags, addSelectedTag, removeSelectedTag, clearSelectedTags } = useTagContext()
```

### After (DashboardContext)
```tsx
import { useTags } from '@/app/context/DashboardContext'

const { 
  selectedTags, 
  availableTags, 
  tagCounts, 
  addSelectedTag, 
  removeSelectedTag, 
  clearSelectedTags,
  setAvailableTags,
  setTagCounts
} = useTags()
```

## Best Practices

### 1. Use Specialized Hooks
Prefer specialized hooks (`useTags`, `useClients`, `useCRM`) over the main `useDashboard()` hook when possible for better performance.

### 2. Minimize Context Updates
Batch related state updates to minimize re-renders:

```tsx
// Good: Batch updates
const updateContactData = (newContacts: CopperContactSummary[]) => {
  setContacts(newContacts)
  setAllClients(newContacts)
  setLoading(false)
}

// Avoid: Multiple separate updates
setContacts(newContacts)
setAllClients(newContacts)
setLoading(false)
```

### 3. Leverage Utility Functions
Use built-in utility functions instead of implementing custom logic:

```tsx
// Good: Use built-in function
const filteredContacts = getContactsByTags(selectedTags)

// Avoid: Custom implementation
const filteredContacts = contacts.filter(contact => 
  selectedTags.every(tag => contact.tags.includes(tag))
)
```

### 4. Handle Loading States
Always check loading states before rendering data:

```tsx
if (loading) {
  return <LoadingSpinner />
}
```

## Future Enhancements

Potential improvements for the DashboardContext:

1. **Persistence Layer**: Add localStorage/sessionStorage persistence
2. **Undo/Redo**: Implement state history management
3. **Optimistic Updates**: Add optimistic UI updates for better UX
4. **State Validation**: Add runtime state validation
5. **Performance Monitoring**: Add performance metrics and optimization
6. **Plugin System**: Allow components to register custom state
7. **DevTools Integration**: Add Redux DevTools-like debugging
8. **State Migration**: Add state migration capabilities for version updates 