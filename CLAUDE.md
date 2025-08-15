# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polymet React App - A manufacturing management system for CNC orders, part analysis, and supplier management. Built with React, TypeScript, Vite, and integrates with Supabase for backend services and Clerk for authentication.

## ⚠️ IMPORTANT: Legacy Data Fields

**NEVER use `_atos` fields for ordering, filtering, or primary operations:**
- All fields ending with `_atos` (like `created_at_atos`, `updated_at_atos`, etc.) are legacy data from a previous system
- These fields should be avoided in queries, ordering, and business logic
- Use standard fields like `created_at`, `updated_at`, `id` for ordering instead
- When encountering `_atos` fields in existing code, prefer refactoring to use non-legacy alternatives

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Environment Variables Required

Create a `.env` file with these variables:

```env
# 3D API Configuration
VITE_API_3D_BASE_URL=http://localhost:3001

# Supabase Configuration (required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Autodesk Forge (for 3D viewer)
VITE_FORGE_CLIENT_ID=your_forge_client_id
VITE_FORGE_CLIENT_SECRET=your_forge_client_secret

# Clerk Authentication (if using Clerk)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## Code Architecture

### Core Structure
- **src/polymet/**: Main application code - pages, components, services for the manufacturing platform
- **src/components/ui/**: Shared UI components using Radix UI and shadcn/ui patterns
- **src/hooks/**: Custom React hooks organized by domain (cnc, supplier, quotation, etc.)
- **src/services/**: API service layers for different entities (suppliers, RFQs, part numbers)
- **src/types/**: TypeScript type definitions organized by domain

### Key Features
- **Technical Analysis**: 2D/3D CAD file analysis with AI assistance and region-specific analysis
- **RFQ Management**: Request for Quote workflows and bidding with integrated global quotation system
- **Part Number Management**: Detailed part tracking and analysis with quotation management
- **Global Quotations**: RFQ-based quotation system with centralized workflow management
- **Supplier Management**: CNC suppliers and raw material suppliers
- **3D Visualization**: Autodesk Forge integration for STEP file viewing
- **Document Processing**: PDF analysis and OCR capabilities with region selection

### Authentication & Permissions
- Uses Clerk for authentication with role-based permissions
- Protected routes with granular permission checking:
  - `org:all:access` - Full admin access
  - `org:view:dashboard` - Dashboard viewing
  - `org:view:orders` - Order viewing

### API Integration
- **Supabase**: Primary database and auth backend
- **3D API**: External service at `api-3d.autana.ai` for CAD analysis
- **Autodesk Forge**: For 3D model viewing and translation
- **OCR Services**: For document processing

### State Management
- React hooks for local state
- Zustand for global state (check usage patterns in existing components)
- React Query patterns for API state management

### Styling
- **Tailwind CSS** with custom design tokens
- **shadcn/ui** components following established patterns
- **Radix UI** primitives for accessibility
- CSS custom properties for theming in `index.css`

## File Organization Patterns

### Component Structure
```
polymet/components/
  ├── [feature]-page.tsx          # Main page components
  ├── [feature]-list-item.tsx     # List display components  
  ├── [feature]-details-form.tsx  # Form components
  ├── [feature]-profile-page.tsx  # Profile/detail pages
  └── [feature]-modal.tsx         # Modal dialogs
```

### Hook Structure
```
hooks/[domain]/
  ├── use[Entity].ts              # Main entity hook
  └── use[Entity][Action].ts      # Specific action hooks
```

### Service Structure
```
services/[domain]/
  └── [entity]Api.ts              # API service layer
```

## Testing & Quality

Always run linting before commits:
```bash
npm run lint
```

## Key Dependencies to Know

- **@clerk/clerk-react**: Authentication and user management
- **@supabase/supabase-js**: Database and backend services
- **@radix-ui/react-***: UI component primitives
- **react-router-dom**: Client-side routing
- **zustand**: State management (if used)
- **react-hook-form**: Form handling with validation
- **tailwindcss**: Utility-first CSS framework

## 3D Visualization Setup

For 3D viewer functionality:
1. Configure Autodesk Forge credentials in `.env`
2. Set up bucket named `aos-files-urn` in Forge
3. API expects STEP files with URN format: `urn:adsk.objects:os.object:aos-files-urn/step-v2-...`

## Global Quotation System

### Architecture
The Global Quotation system is **RFQ-centric** with the following data relationships:
- `tb_global_quotation` has a direct `rfq` field linking to `tb_rfq`
- Global Quotations are created exclusively from `/rfqs/:id` context
- Customer views (`/customers/:id`) are **read-only** for quotation browsing

### Key Components
- **RfqPnsTab**: Handles quotation selection and global quotation creation
- **RfqGlobalQuotationsTab**: Displays global quotations filtered by RFQ ID
- **CustomerGlobalQuotationsTab**: Shows all global quotations with RFQ origin links
- **CustomerPartNumbersTab**: Read-only view with RFQ navigation

### API Structure
```typescript
// Global quotation creation (RFQ context only)
globalQuotationApi.create({
  company_id: string,
  rfq: string,        // Direct RFQ relationship
  name: string,
  status: 'draft'
})

// Filtering methods
globalQuotationApi.getByRfqId(rfqId)     // RFQ-specific quotations
globalQuotationApi.getByCompanyId(companyId) // All company quotations with RFQ info
```

### Workflow
1. Navigate to `/rfqs/:id` → PNs tab
2. Select quotations from part numbers
3. Create global quotation (automatically linked to RFQ)
4. View results in Global Quotations tab
5. Customer view shows all quotations with RFQ origin links

## Development Notes

- The app uses Vite with React and TypeScript
- Path aliases configured: `@/` for `src/`, `@components/` for components
- Proxy configuration routes `/api/3d/analyze` to external 3D analysis service
- Permission-based routing throughout the application
- Heavy use of server-side state synchronization patterns
- Global quotation workflow is centralized in RFQ context for better data integrity