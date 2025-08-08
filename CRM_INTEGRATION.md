# CRM Integration: TagExplorer ↔ CopperCRM

This document describes the integration between the TagExplorer and CopperCRM components, which allows for synchronized tag-based filtering across both components.

## Overview

The integration uses React Context to share selected tag state between the TagExplorer and CopperCRM components. When tags are selected in the TagExplorer, the CopperCRM table automatically filters to show only contacts that have ALL selected tags.

## Architecture

### TagContext (`app/components/TagContext.tsx`)

A React Context provider that manages the shared tag selection state:

```typescript
interface TagContextType {
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  addSelectedTag: (tag: string) => void
  removeSelectedTag: (tag: string) => void
  clearSelectedTags: () => void
}
```

### Components

1. **TagExplorer** (`app/components/TagExplorer.tsx`)
   - Displays all available tags with contact counts
   - Allows tag selection for filtering
   - Shows visual indicators for selected tags
   - Syncs selections with the global context

2. **CopperCRM** (`app/components/CopperCRM.tsx`)
   - Displays contacts in a table format
   - Filters contacts based on selected tags from context
   - Shows notification banner when tags are active
   - Provides local tag filtering controls

## Usage

### Basic Setup

Wrap your components with the TagProvider:

```tsx
import { TagProvider } from './components/TagContext'

function App() {
  return (
    <TagProvider>
      <TagExplorer />
      <CopperCRM />
    </TagProvider>
  )
}
```

### Demo Pages

Two demo pages are provided:

1. **CRM Management** (`app/pages/crm.tsx`)
   - Tabbed interface to switch between contacts and tag explorer
   - Shows components in separate views

2. **Integration Demo** (`app/pages/demo.tsx`)
   - Side-by-side view of both components
   - Demonstrates real-time filtering

## Features

### Tag Selection
- Click tags in TagExplorer to select/deselect them
- Selected tags are highlighted with "Active Filter" badge
- Multiple tags can be selected simultaneously

### Contact Filtering
- CopperCRM shows only contacts that have ALL selected tags
- Filter logic uses AND operation (not OR)
- Real-time updates as tags are selected/deselected

### Visual Feedback
- TagExplorer shows which tags are active filters
- CopperCRM displays a notification banner with active filters
- Clear visual indicators for selected state

### Filter Management
- Clear all filters from either component
- Individual tag removal
- Persistent state across component switches

## Implementation Details

### State Management
- Uses React Context for global state
- Local component state for UI-specific features
- Automatic synchronization between components

### Performance
- Efficient filtering with useMemo/useCallback where appropriate
- Minimal re-renders through context optimization
- Lazy loading of contact data

### Error Handling
- Graceful fallbacks for API failures
- Loading states for async operations
- User-friendly error messages

## API Integration

The components integrate with the Copper CRM API through the `@/lib/copper` module:

- `getAllTags()` - Fetch available tags
- `getContactCountByTag()` - Get contact counts per tag
- `getContactsWithFallback()` - Load contacts with error handling
- `searchContacts()` - Search contacts by query
- `getContactsByTag()` - Get contacts for specific tag

## Styling

Uses Tailwind CSS with custom primary color palette:
- Primary colors: Blue-based theme
- Consistent spacing and typography
- Responsive design for mobile/desktop
- Accessible color contrasts

## Future Enhancements

Potential improvements:
- Tag categories and grouping
- Advanced filtering options (OR logic, date ranges)
- Bulk tag operations
- Tag analytics and insights
- Export filtered contacts
- Tag-based automation workflows 