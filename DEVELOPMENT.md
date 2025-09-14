# Portal Services - Development Guide

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose
- Node.js 18+ (for local development)

### Development Environment Setup

1. **Run the setup script** (optional but recommended):
   ```bash
   ./dev-setup.sh
   ```

2. **Start all services with Docker**:
   ```bash
   npm run dev
   ```

This single command will start:
- **PostgreSQL Database** on port `5432`
- **Backend API** on port `3001`
- **Frontend Application** on port `3000`

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services with Docker (rebuilds images) |
| `npm run dev:detached` | Start all services in background |
| `npm run dev:stop` | Stop all Docker services |
| `npm run dev:restart` | Restart all Docker services |
| `npm run dev:logs` | View logs from all services |
| `npm run dev:local` | Run backend and frontend locally (without Docker) |

### Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432
- **Health Check**: http://localhost:3001/health

### Database Connection

Default database credentials (for development):
- **Host**: localhost
- **Port**: 5432
- **Database**: portalservicesdb
- **User**: admin
- **Password**: admin

### Local Development (Without Docker)

If you prefer to run services locally:

1. **Start PostgreSQL** (using Docker or local installation)
2. **Install dependencies**:
   ```bash
   npm run install:all
   ```
3. **Run services**:
   ```bash
   npm run dev:local
   ```

## Production Deployment (Render.com)

The project includes a `render.yaml` file configured for deployment on Render.com:

### Services Deployed:
1. **PostgreSQL Database** (Free tier)
2. **Backend API** (Node.js service)
3. **Frontend** (Static site)

### Deployment Steps:
1. Push your code to GitHub
2. Connect your repository to Render.com
3. Render will automatically detect the `render.yaml` and deploy all services
4. Database credentials will be automatically injected into the backend service

### Environment Variables (Production):
- Database connections are handled automatically by Render
- Set `GOOGLE_AI_API_KEY` in the Render dashboard for AI features
- Frontend will connect to the backend automatically via environment variables

## Project Structure

```
/
├── appserver/          # Backend (Node.js + TypeScript)
├── appclient/          # Frontend (React + TypeScript)
├── services/           # Service-specific configurations
│   ├── backend/        # Backend deployment config
│   ├── frontend/       # Frontend deployment config
│   └── database/       # Database Docker setup
├── docker-compose.yml  # Development Docker setup
├── render.yaml         # Production deployment config
└── dev-setup.sh        # Development setup script
```

## Troubleshooting

### Docker Issues
- **Port conflicts**: Stop other services using ports 3000, 3001, or 5432
- **Permission errors**: Make sure Docker daemon is running
- **Build failures**: Try `docker-compose down --volumes` then `npm run dev`

### Database Connection Issues
- Check if PostgreSQL container is healthy: `docker-compose logs postgres`
- Verify database credentials in environment variables
- Ensure backend waits for database to be ready (health checks configured)

### Frontend/Backend Connection Issues
- Frontend connects to backend via `REACT_APP_API_URL`
- In Docker, services communicate via container names
- For local development, use `localhost` addresses