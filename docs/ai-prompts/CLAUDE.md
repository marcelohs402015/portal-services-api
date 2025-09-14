# CLAUDE.md

This file provides guidance for Claude Code (claude.ai/code) when working with the code in this repository.

## Project Overview

Portal Services is a complete system for automatic categorization and response of Gmail emails using **MOCK DATA ONLY**. **The project is now restructured for production deployment on Render.com with separated client and server architecture.**

**Target Audience:** This application was developed especially for professionals who offer portal services — contractors who perform home repairs, maintenance and small repair services. The solution helps these professionals efficiently manage service requests, quotes, complaints, product inquiries, support and sales communications received via email.

**IMPORTANT:** The project uses only mock data - no real connection to PostgreSQL or Gmail API.

**DEPLOYMENT READY:** The project is now organized with separated client and server directories, complete build scripts, and ready for deployment on cloud platforms like Render.com.

The project uses Node.js with TypeScript on the backend, React with Tailwind on the frontend and mock data in memory. **The application is exclusively in English.**

### Main Features

#### Email System
- Email reading simulation (mock data)
- Intelligent categorization by keywords (complaint, quote, product information, support, sales)
- **🤖 AI Automation System** - Intelligent automation rules with manager approval workflow
- Response system with personalized templates
- **Response template management** - Complete CRUD implemented with mock data

#### Service System
- **Complete service registration** - Electrical, plumbing, painting, gardening, cleaning, etc.
- Categorization by service type
- Prices, units of measurement and estimated time
- List of necessary materials
- Active/inactive service status

#### Quote System
- **Personalized quote generation** for clients
- Service and quantity selection
- Automatic calculation of totals with discount
- **Direct email sending** - Complete modal for composition and sending
- **Attachment in email responses** - Quote selection on response screen
- Tracking status (draft, sent, accepted, rejected, completed)
- **Complete email-quote integration** - Two implemented sending methods

#### Client System
- **Complete client registration** with contact information
- Addresses and personalized observations
- History of appointments and quotes
- Search and filter system

#### Schedule System
- **Complete calendar** with weekly and daily view
- Visit and service scheduling
- Integration with clients and quotes
- Appointment status (scheduled, confirmed, in progress, completed, cancelled)
- Intuitive date navigation

#### AI Automation System
- **Smart automation rules** - Keyword-based email detection and quote generation
- **Manager approval workflow** - Review and approve AI-generated quotes
- **Performance analytics** - Conversion rates, response times, and trends
- **Bulk operations** - Approve/reject multiple quotes at once
- **Mock AI simulation** - Realistic automation scenarios for development

#### Dashboard and Statistics
- **Complete dashboard** with statistics for portal services businesses
- **Dedicated statistics page** (`/stats`) - Detailed business metrics
- Web interface to view and respond to emails
- **Settings page** - Interface to manage templates

### Implemented Technical Features
- **React Frontend** with Tailwind CSS and TypeScript
- **Complete routing system** with React Router
- **Global state** managed with React Query
- **Mock REST API** with delay simulation
- **Complete CRUD** for all entities
- **Form validation** and visual feedback
- **Responsive system** for desktop and mobile
- **Modal components** for email composition and selection
- **Email-quote integration** with two sending methods
- **🌐 Internationalization (i18n)** - English-only system using react-i18next
- **🎨 Dynamic Theme System** - Light and Dark themes with CSS custom properties
- **Contact Information System** - Modal with support contacts accessible via footer
- **Professional Footer** - Copyright information and contact access

### Recent UI/UX Enhancements
- **🎨 Theme System** - Light and Dark themes with real-time switching
- **📞 Contact Information** - Modal with Marcelo Hernandes and Sarah Ribeiro contacts
- **📄 Professional Footer** - Copyright information with contact access icon
- **🎯 Clean Interface** - Streamlined header without unnecessary buttons
- **💾 Theme Persistence** - User theme preference saved in localStorage

### Statistics Specific for Service Providers
- **Business dashboard** - Complete view of statistics
- Service demand analysis (electrical, plumbing, painting, etc.)
- Quote management (conversion, average values, response time)
- Service performance (response time, satisfaction, complaints)
- Client analysis (recurring vs new, communication patterns)
- Business metrics (volume, estimated revenue, profitability per service)
- **Revenue evolution** - Monthly history with trends
- **Performance by category** - Analysis of most demanded services

## Key Components

### Theme System
- **ThemeContext.tsx** - Global theme management with React Context
- **ThemeSelector.tsx** - Theme switching component with visual previews
- **ContactModal.tsx** - Contact information modal with professional design

### Layout Updates
- **Layout.tsx** - Updated with theme integration and contact functionality
- **Footer** - Professional copyright with contact access
- **Header** - Clean interface without unnecessary buttons

## Development Commands

### NEW STRUCTURE - Root Commands (MAIN)
```bash
# Setup and Installation
npm run install:all   # Install all dependencies (root, client, server)

# Development (backend + frontend) - MAIN COMMAND
npm run dev
# ⚡ Starts both: Backend (3001) + Frontend (3000)

# Individual commands
npm run server:dev    # Backend only (from root)
npm run client:dev    # Frontend only (from root)

# Build and production
npm run build         # Complete build (both client and server)
npm run build:server  # Build server only
npm run build:client  # Build client only
npm start            # Start production server

# Verification
npm run typecheck    # Type checking (both client and server)
npm run test         # Run tests

# ⚠️ SETUP NOT REQUIRED - System uses only mock data
```

### Individual Module Commands
```bash
# Server (from /server directory)
cd server
npm run dev           # Development with hot-reload
npm run build         # Build TypeScript to JavaScript
npm run start         # Start production server
npm run typecheck     # TypeScript verification

# Client (from /client directory)  
cd client
npm run dev           # React development server
npm run build         # Build for production
npm run test          # Run tests
npm run typecheck     # TypeScript verification
```

## Architecture - NEW SEPARATED STRUCTURE

### 🚀 Production-Ready Structure
```
project-email-attendant/
├── client/                 # React Frontend (Separate Service)
├── server/                 # Node.js Backend (Separate Service)  
├── build.sh               # Render.com build script
├── start.sh               # Render.com start script
├── render.yaml            # Render.com configuration
├── DEPLOY.md              # Complete deployment guide
└── package.json           # Root package.json with unified scripts
```

### Backend (/server/) - **Mock REST API**
- **server.ts** - Main Express server (port 3001)
- **routes/emailRoutes.ts** - **All API routes** (emails, services, clients, appointments, quotes, templates)
- **shared/data/** - Mock data (moved from client)
- **shared/logger.ts** - Logging utilities
- **types/** - Backend TypeScript types
- **package.json** - Server dependencies
- **tsconfig.json** - TypeScript configuration
- **.env.example** - Environment template

### Frontend (/client/src) - **Complete React Interface**
- **App.tsx** - Main application with complete routes
- **components/Layout.tsx** - Responsive layout with side navigation
- **pages/Dashboard.tsx** - Dashboard with statistics
- **pages/EmailList.tsx** - Email list with filters
- **pages/EmailDetail.tsx** - Details and response with quote selection
- **pages/Services.tsx** - **Complete service CRUD**
- **pages/Quotations.tsx** - **Quote system with email sending**
- **pages/Clients.tsx** - **Client management**
- **pages/Calendar.tsx** - **Calendar schedule**
- **pages/Stats.tsx** - **Dedicated statistics page**
- **pages/Automation.tsx** - **AI Automation dashboard with rules management**
- **pages/Settings.tsx** - Settings and templates
- **services/api.ts** - **Complete mock API** with all functionalities
- **config/api.ts** - API configuration for different environments

#### AI Automation Components
- **components/AutomationRuleModal.tsx** - Create/edit automation rules with keyword management
- **components/PendingQuoteCard.tsx** - AI-generated quote approval cards
- **components/AutomationMetrics.tsx** - Performance analytics and trends visualization

#### Email-Quote Integration Components
- **components/QuotationSelector.tsx** - Quote selection modal
- **components/EmailQuotationModal.tsx** - Complete email composition with quote
- **components/BusinessStats.tsx** - Complete business statistics

#### Internationalization System
- **i18n.ts** - react-i18next configuration (English-only)
- **locales/en.json** - English translations
- **data/mockEmails.ts** - English mock email data

### Mock Data (/client/src/data & /server/shared/data)
- **mockData.ts** - Complete in-memory database with English content
- **mockEmails.ts** - English email data for portal services
- **mockAutomationData.ts** - AI automation rules, pending quotes, and metrics
- Emails, templates, services, clients, appointments, quotes, automation data
- Realistic data for demonstration in English
- **Shared between client and server** for consistency

### TypeScript Types
- **/client/src/types/api.ts** - Frontend type definitions
- **/server/types/** - Backend type definitions
- Consistent interface between frontend and backend

## Main Components

### Gmail Integration
- OAuth 2.0 authentication
- Email reading with query filters
- Adding labels to categorized emails
- Sending email responses

### Email Categorization
Categories: complaint, quote, product information, support, sales
- Keyword matching
- RegExp patterns
- Domain filtering
- Additional heuristics

### Response Template System
- Standard templates for each category
- **Complete template CRUD** - Create, view, edit and delete templates
- **Management interface** - Dedicated page accessible via "Settings" menu
- **Smart selection** - Dropdown with all available templates on response screen
- **Real-time preview** - Template visualization with replaced variables
- Variable substitution (${subject}, ${protocol})
- Support for personalized messages
- **Validations and confirmations** - Confirmation system for template deletion

### Database Schema
- **emails** table - Stores categorized emails
- **email_templates** table - Response templates
- Indexes for performance optimization

### API Endpoints
- GET /api/emails - Email list with pagination/filters
- POST /api/emails/sync - Gmail synchronization
- **POST /api/emails/:id/reply** - Send response (with quote attachment support)
- GET /api/templates - List templates
- **POST /api/templates** - Create new template
- **PUT /api/templates/:id** - Update existing template
- **DELETE /api/templates/:id** - Delete template
- **GET /api/templates/:id** - Get template by ID
- GET /api/stats/categories - Statistics by category
- **GET /api/stats/business** - Complete business statistics
- **GET /api/stats/revenue** - Revenue evolution by period
- **POST /api/quotations/:id/send** - Send quote by email
- GET /api/quotations - List quotes with filters
- GET/POST/PUT/DELETE /api/services - Complete service CRUD
- GET/POST/PUT/DELETE /api/clients - Complete client CRUD
- GET/POST/PUT/DELETE /api/appointments - Complete appointment CRUD
- **GET /api/automation/rules** - List automation rules
- **POST /api/automation/rules** - Create automation rule
- **PUT /api/automation/rules/:id** - Update automation rule
- **DELETE /api/automation/rules/:id** - Delete automation rule
- **GET /api/automation/pending-quotes** - List AI-generated pending quotes
- **POST /api/automation/pending-quotes/:id/approve** - Approve pending quote
- **POST /api/automation/pending-quotes/:id/reject** - Reject pending quote
- **GET /api/automation/metrics** - Automation performance metrics

## Configuration

### Required Files
- `config/credentials.json` - Gmail API credentials (Google Cloud Console)
- `config/token.json` - OAuth tokens (generated during setup)
- `.env` - Environment variables

### Gmail API Configuration
1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials for Desktop
3. Download credentials.json
4. Run `npm run setup` for authentication flow

### Database Configuration
PostgreSQL database with tables created automatically during setup.

## Implemented Features

#### Response Template Management
- **Settings Page** (`/settings`) - Complete interface to manage templates
- **Complete CRUD** - Create, view, edit and delete response templates
- **Responsive Modal** - Intuitive form for template creation/editing
- **Validations** - Confirmation system for critical operations like deletion
- **Response Integration** - Template selection and preview on email response screen
- **Mock System** - Fully operational functionality with mock data for development

#### Email-Quote Integration System **[NEW]**
- **Quote Attachment** - Quote selection in email responses
- **Direct Quote Sending** - Complete modal to send quotes by email
- **Automatic Validation** - Verification of existing quotes
- **Visual Feedback** - Loading and confirmation states
- **Auto-fill** - Client data automatically filled
- **Two Methods** - Attachment in response or independent direct sending

#### Business Statistics **[NEW]**
- **Dedicated Page** (`/stats`) - Complete statistics dashboard
- **Real-time Metrics** - Revenue, quotes, appointments, clients
- **Performance by Category** - Analysis of most demanded services
- **Revenue Evolution** - History with monthly trends
- **Response Rate** - Service performance analysis
- **Interactive Visualization** - Colored cards and visual progress

#### Navigation and UX
- Side menu with direct access to Settings and Statistics
- Visual cards for template and statistics display
- Real-time preview with variable substitution
- Visual feedback for operations (loading states, confirmations)
- Responsive modals with real-time validation
- Consistent color system for status and categories

#### Internationalization System (i18n)
- **🌐 English-Only Application** - Complete interface in English
- **react-i18next Integration** - Translation system configured for English
- **Translated Interface** - All interface texts using translation keys
- **Consistent Terminology** - Professional portal services terminology
- **Mock Data Translation** - All sample data in English

## 🚀 Deployment Notes - RENDER.COM READY

### Production Deployment (Render.com)
The project is **READY FOR DEPLOYMENT** on Render.com with complete full-stack automation:

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render.com**
   - **Blueprint deployment** (automatic detection of `render.yaml`)
   - **Deploys 2 services**: Backend API + Frontend App
   - **Complete integration** with cross-service communication

3. **Service Configuration** (Automated via render.yaml)
   - **Backend**: `portal-services-backend` (Node.js API)
     - `NODE_ENV=production`, `PORT=10000`
     - `CLIENT_URL=https://portal-services-frontend.onrender.com`
   - **Frontend**: `portal-services-frontend` (Static Site)
     - `REACT_APP_API_URL=https://portal-services-backend.onrender.com`

### Local Development Setup
```bash
# Quick setup
git clone [repo]
cd project-email-attendant
npm run install:all  # Install all dependencies
npm run dev          # Start development servers
```

### Build Process
- **`build.sh`** - Automated build script for Render.com
- **`start.sh`** - Production startup script
- **`render.yaml`** - Service configuration
- **TypeScript compilation** - Server builds to `/dist` directory
- **React build** - Client builds to `/build` directory

### Important Files for Deployment
- ✅ **`render.yaml`** - Render.com configuration
- ✅ **`build.sh`** - Build automation
- ✅ **`start.sh`** - Production startup
- ✅ **`DEPLOY.md`** - Complete deployment guide
- ✅ **Environment templates** - `.env.example` files
- ✅ **Separated packages** - Independent client/server dependencies

### ⚠️ SETUP NOT REQUIRED
- **No PostgreSQL** - System uses only mock data
- **No Gmail API** - Demonstration system only
- **No external dependencies** - Everything included
- **Mock templates** are available for development and testing

### 📝 For More Details
See complete deployment guide: **[DEPLOY.md](DEPLOY.md)**