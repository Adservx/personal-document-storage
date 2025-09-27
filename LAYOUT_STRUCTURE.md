# Layout Structure

## Overview
The SecureDoc Manager has been restructured with a clean, professional layout architecture that separates concerns and improves maintainability.

## Structure

### Layout Components (`src/components/layout/`)
- **Header.tsx** - Top navigation bar with user info and mobile menu
- **Sidebar.tsx** - Document categories navigation with responsive design
- **Layout.tsx** - Main layout wrapper that combines header and sidebar

### Pages (`src/pages/`)
- **DocumentsPage.tsx** - Main documents view with upload and grid display

### Key Features

#### Responsive Design
- **Desktop**: Fixed sidebar with full header
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablet**: Adaptive layout that works on all screen sizes

#### Professional Styling
- Clean, modern design with consistent spacing
- Professional color scheme using CSS variables
- Smooth transitions and hover effects
- Accessible design with proper ARIA labels

#### Component Architecture
- Separation of layout from business logic
- Reusable components with clear interfaces
- Clean import structure with index files

## CSS Classes

### Layout Classes
- `.app-layout` - Main application container
- `.app-header` - Header component styling
- `.app-container` - Main content area container
- `.app-sidebar` - Sidebar component styling
- `.main-content` - Main content area
- `.content-wrapper` - Content padding and max-width

### Responsive Classes
- `.mobile-menu-btn` - Mobile hamburger menu button
- `.sidebar-overlay` - Mobile sidebar overlay
- `.sidebar-open` - Mobile sidebar open state

### Component Classes
- `.category-btn` - Category selection buttons
- `.user-info` - User information display
- `.empty-state` - Empty document state
- `.documents-grid` - Document cards grid layout

## Mobile Experience
- Touch-friendly interface with proper button sizes
- Smooth sidebar animations
- Optimized for mobile performance
- Accessible navigation patterns

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on all screen sizes
- CSS Grid and Flexbox for layout
- CSS Variables for theming