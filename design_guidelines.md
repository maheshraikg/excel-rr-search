# Design Guidelines: Excel Data Search Web Application

## Design Approach
**System-Based Approach** using Material Design principles, optimized for data-heavy, productivity-focused applications. This choice supports the utility-focused nature of database searching and file management while maintaining professional aesthetics.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 216 100% 50% (Modern blue for trust and professionalism)
- Secondary: 216 100% 95% (Light blue backgrounds)
- Surface: 0 0% 98% (Clean white-gray for cards)
- Text: 220 13% 18% (Dark charcoal for readability)

**Dark Mode:**
- Primary: 216 100% 60% (Slightly lighter blue for contrast)
- Secondary: 216 50% 15% (Dark blue backgrounds)
- Surface: 220 13% 12% (Dark gray cards)
- Text: 0 0% 95% (Off-white for readability)

### B. Typography
**Font Family:** Inter (via Google Fonts CDN)
- Headers: 600 weight, sizes 24px-32px
- Body text: 400 weight, 16px
- Labels: 500 weight, 14px
- Data tables: 400 weight, 14px (monospace for numbers)

### C. Layout System
**Tailwind Spacing Units:** Consistent use of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Element gaps: gap-4, gap-6
- Container max-width: max-w-6xl

### D. Component Library

**Navigation:**
- Clean header with app title and file management actions
- Breadcrumb navigation for multi-step processes
- Minimal sidebar for file list (if multiple files uploaded)

**File Upload:**
- Large drag-and-drop zone with dashed border
- File type indicators (.xls, .xlsx)
- Upload progress indicators
- File list with delete options

**Search Interface:**
- Prominent search bar with RR number input
- Search button with loading state
- Clear/reset functionality
- Search history dropdown (optional)

**Data Display:**
- Clean data tables with alternating row colors
- Column headers with sorting indicators
- Responsive cards on mobile
- Sheet source labels for multi-sheet results
- Export functionality buttons

**Form Elements:**
- Outlined input fields with floating labels
- Primary and secondary button styles
- File input with custom styling
- Loading spinners and success states

**Overlays:**
- Modal dialogs for file management
- Toast notifications for actions
- Confirmation dialogs for deletions

### E. Layout Structure

**Main Dashboard:**
1. Header with app title and primary actions
2. File upload section (prominent when no files)
3. Search interface (prominent when files uploaded)
4. Results display area with sheet tabs
5. Footer with app info

**Key Interactions:**
- Single-click search execution
- Keyboard shortcuts (Enter for search)
- File drag-and-drop anywhere on upload area
- Responsive table scrolling on mobile

**Data Presentation:**
- Results grouped by sheet with clear labels
- Matching rows highlighted
- Column headers always visible
- Export options for filtered results

This design prioritizes functionality and data clarity while maintaining a modern, professional appearance suitable for business users working with survey and institutional data.