# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dual-architecture tax calculator application:
1. **Static HTML App** (`index.html` + `app.js`) - The main production application
2. **React/Vite Template** (`src/` directory) - A scaffolded React template that isn't used in production

The primary application is a static HTML-based tax calculator for the 2025 "One Big, Beautiful Bill" (BBB) tax benefits, targeting small business owners, freelancers, and side hustlers.

## Development Commands

```bash
# Start development server (React template)
pnpm dev

# Build production bundle (React template)
pnpm build

# Lint code
pnpm lint

# Preview production build
pnpm preview

# Serve static HTML version locally
python -m http.server 8000
# or
npx serve .
```

## Architecture Overview

### Static HTML Application (Production)
- **Main Files**: `index.html` + `app.js`
- **Styling**: TailwindCSS via CDN
- **Icons**: Lucide via CDN
- **PDF Export**: jsPDF via CDN
- **State Management**: Global JavaScript objects
- **Calculators**: QBI Deduction, Vehicle Loan Interest, Asset Financing

### React Template (Development Scaffold)
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS v4 + shadcn/ui components
- **Icons**: Lucide React
- **State**: React hooks (useState, etc.)
- **Components**: Extensive shadcn/ui library in `src/components/ui/`

## Key Features

### Help System
- Interactive help buttons (🛈) next to all input fields
- Modal tooltips with IRS form guidance
- Plain English explanations for tax concepts
- Mobile-responsive design

### Calculators
1. **QBI Calculator** - Qualified Business Income deduction with phase-out warnings
2. **Vehicle Loan** - New U.S.-assembled vehicle interest deduction
3. **Asset Financing** - Equipment, real estate, and vehicle financing benefits

### Export Functions
- CSV export for spreadsheet analysis
- PDF generation for professional reports
- Real-time calculation updates

## Working with This Codebase

### Primary Development Target
The static HTML application (`index.html` + `app.js`) is the production version. The React template in `src/` is unused scaffolding.

### Code Organization
- **Help Content**: Defined in `helpContent` object in `app.js`
- **Calculations**: Tax logic embedded in event handlers
- **State Management**: Global `calculatorData` object
- **UI Components**: Vanilla HTML with TailwindCSS classes

### Component Structure (React Template)
- All shadcn/ui components are pre-configured
- Path aliases: `@/` maps to `src/`
- Utility functions in `src/lib/utils.js`
- Custom hooks in `src/hooks/`

## Development Guidelines

### For Static HTML Changes
- Modify `index.html` for structure
- Update `app.js` for functionality
- Use TailwindCSS classes for styling
- Test with local HTTP server

### For React Template Changes
- Use existing shadcn/ui components
- Follow React 19 patterns
- Maintain TypeScript compatibility (JSDoc comments)
- Use the `cn()` utility for class merging

## Testing

No formal test suite exists. Manual testing recommendations:
- Test all calculator functions with edge cases
- Verify help modals display correctly
- Test export functionality (CSV/PDF)
- Ensure mobile responsiveness
- Validate tax calculations against known scenarios