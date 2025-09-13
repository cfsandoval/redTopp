# Overview

This is a Network Topology Simulator built as a React web application. The primary purpose is to provide an interactive visualization tool for creating, editing, and analyzing network topologies using D3.js for graph rendering. The application allows users to create network diagrams with different types of nodes (servers, routers, workstations) and connections between them, featuring drag-and-drop functionality, real-time editing capabilities, and adjacency matrix analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application follows a modern React architecture using TypeScript and functional components with hooks. The codebase is organized into a clear folder structure with pages in `src/pages/`, reusable components in `src/components/`, and UI components from shadcn/ui in `src/components/ui/`. React Router handles client-side routing with routes defined in `src/App.tsx`. The main application entry point is `src/pages/Index.tsx`, which renders the primary NetworkGraph component.

## Component Design
The core functionality is built around a `NetworkGraph` component that integrates D3.js for interactive graph visualization. This component supports multiple node types (server, workstation, router) with color-coded representations, drag-and-drop positioning, and real-time editing of node properties. The component uses React hooks for state management and D3.js for DOM manipulation and force-directed graph layouts.

## Styling System
The application uses Tailwind CSS as the primary styling solution, configured with CSS custom properties for theming support. The shadcn/ui component library provides pre-built, accessible UI components with consistent design patterns. The styling system supports both light and dark themes through CSS variables defined in the global stylesheet.

## Data Management
State management is handled through React's built-in hooks (useState, useEffect) for local component state. The application uses TanStack Query for potential server state management and caching. Network topology data is structured using TypeScript interfaces for nodes, links, and configuration objects, ensuring type safety throughout the application.

## Build and Development
The project uses Vite as the build tool for fast development and optimized production builds. TypeScript provides static type checking with relaxed configuration for rapid development. ESLint handles code quality with React-specific rules, and the development server supports hot module replacement for efficient development workflow.

# External Dependencies

## UI and Visualization
- **shadcn/ui + Radix UI**: Comprehensive component library providing accessible, customizable UI components including dialogs, dropdowns, tables, and form controls
- **D3.js**: Primary visualization library for creating interactive network graphs, handling force simulations, and DOM manipulation
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design

## Development and Build Tools
- **Vite**: Modern build tool and development server with fast hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **React Router**: Client-side routing solution for single-page application navigation
- **TanStack Query**: Server state management and caching solution (installed but not actively used)

## Utility Libraries
- **class-variance-authority**: Type-safe component variant management for styling
- **clsx**: Conditional CSS class composition utility
- **date-fns**: Date manipulation and formatting utilities
- **next-themes**: Theme management for light/dark mode support

## Development Dependencies
- **@dyad-sh/react-vite-component-tagger**: Development-only plugin for component identification during development mode
- **ESLint**: Code linting and quality assurance with React and TypeScript support
- **PostCSS + Autoprefixer**: CSS processing and vendor prefix management