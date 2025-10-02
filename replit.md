# Excel Data Search Web Application

## Overview

This is a web application designed to search and analyze data from Excel files by RR (Registration Reference) numbers. Users can upload Excel files (.xlsx, .xls), and the system extracts and indexes the data to enable fast searching across multiple sheets. The application provides a clean interface for file management, search functionality, and data visualization with results organized by file and sheet.

## User Preferences

Preferred communication style: Simple, everyday language.

## Deployment Information

### Render Deployment (Recommended for Non-Technical Users)
- **Platform**: Render.com - managed Node.js hosting
- **Cost**: $7/month (Starter plan)
- **Deployment Method**: GitHub integration with automatic builds
- **Configuration**: render.yaml file configured with build and start commands
- **Benefits**: 
  - No command line required
  - Automatic deployments on git push
  - Instant startup (2-3 seconds)
  - Background data loading for 166K+ rows
  - Built-in SSL and monitoring
- **Guide**: See RENDER_DEPLOYMENT_GUIDE.txt for step-by-step instructions

### Alternative: Hostinger VPS Deployment
- **Platform**: Hostinger VPS ($6.99/month)
- **Note**: Requires technical knowledge (terminal commands, server configuration)
- **Configuration**: setup.sh script available for automated installation
- **Not recommended for non-technical users**

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system supporting light/dark themes
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **File Processing**: XLSX library for parsing Excel files
- **File Uploads**: Multer middleware for handling multipart form data
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Data Processing**: Custom RR number extraction from Excel row data
- **API Design**: RESTful endpoints for file operations and search functionality

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Two main tables - `excel_files` for metadata and `excel_data` for extracted row data
- **Indexing**: RR numbers extracted and stored separately for fast searching
- **Relations**: Foreign key relationship between files and their data rows with cascade deletion

### Data Processing Pipeline
- **File Upload**: Validates file types (.xlsx, .xls) and size limits (10MB)
- **Excel Parsing**: Extracts all worksheets and converts to JSON format
- **RR Extraction**: Automated detection of RR numbers from row data using pattern matching
- **Data Storage**: Structured storage with sheet metadata, row indices, and searchable fields

### Search Architecture
- **Search Strategy**: Direct RR number matching with optional sheet and date filtering
- **Result Organization**: Groups results by file and sheet with highlighted matching rows
- **Performance**: Pre-extracted RR numbers enable fast lookups without re-parsing Excel files

### Design System
- **Theme Support**: Comprehensive light/dark mode with CSS custom properties
- **Typography**: Inter font family from Google Fonts with semantic sizing
- **Color Palette**: Material Design inspired with blue primary colors and neutral backgrounds
- **Component System**: Consistent spacing, borders, and elevation patterns using Tailwind utilities

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for Neon hosting
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Schema validation integration

### UI Libraries
- **@radix-ui/***: Accessible UI primitives for complex components
- **@tanstack/react-query**: Server state management and caching
- **class-variance-authority**: Utility for component variant styling
- **cmdk**: Command palette functionality

### File Processing
- **multer**: Express middleware for file uploads
- **xlsx**: Excel file parsing and manipulation library

### Development Tools
- **typescript**: Static type checking
- **vite**: Fast development server and build tool
- **tailwindcss**: Utility-first CSS framework
- **tsx**: TypeScript execution for development

### Database Tools
- **drizzle-kit**: Database migration and schema management
- **connect-pg-simple**: PostgreSQL session store for Express