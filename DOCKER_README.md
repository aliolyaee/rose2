# Youtaab Docker Setup

This repository contains a complete Docker setup for the Youtaab project, including:
- Backend API (NestJS)
- Admin Panel (Next.js)
- Hotel Frontend (Vite + React)
- PostgreSQL Database
- Nginx Reverse Proxy

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of free RAM
- Ports 80, 3000, 3002, 5000, and 5432 available

### 1. Production Environment

```bash
# Start all services
./docker.sh prod

# Or manually:
docker-compose up -d
```

**Access URLs:**
- Main Website: http://localhost (via Nginx)
- Admin Panel: http://admin.localhost (via Nginx)
- API: http://api.localhost (via Nginx)
- Direct access:
  - Frontend: http://localhost:5000
  - Admin Panel: http://localhost:3002
  - Backend API: http://localhost:3000

### 2. Development Environment

```bash
# Start development environment with hot reload
./docker.sh dev

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

**Access URLs:**
- Frontend: http://localhost:5000
- Admin Panel: http://localhost:3002
- Backend API: http://localhost:3000
- Database: localhost:5432

## Docker Management Script

Use the `docker.sh` script for easy management:

```bash
./docker.sh [COMMAND]
```

**Available Commands:**
- `dev` - Start development environment
- `prod` - Start production environment
- `stop` - Stop all services
- `restart` - Restart all services
- `logs` - Show logs for all services
- `clean` - Clean up containers, images, and volumes
- `build` - Build all images
- `status` - Show status of all services
- `help` - Show help message

## Environment Variables

Each service requires environment variables. Create the following files:

### Backend (.env in youtaab-backend-main/)
```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=youtaab
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your-jwt-secret
```

### Admin Panel (.env in admin-panel-main/)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Frontend (Environment variables are handled by Vite)
```env
VITE_API_URL=http://localhost:3000
```

## Architecture

### Production Setup
- **Nginx**: Reverse proxy handling routing
- **Backend**: NestJS API on port 3000
- **Admin Panel**: Next.js app on port 3002 (mapped from internal 3000)
- **Frontend**: React/Vite app on port 5000
- **Database**: PostgreSQL on port 5432

### Development Setup
- All services run with hot reload enabled
- Source code is mounted as volumes
- Debug port 9229 exposed for backend
- Direct port access without Nginx

## Database

PostgreSQL 16 Alpine is used as the database. Data is persisted in Docker volumes:
- Production: `postgres_data`
- Development: `postgres_data_dev`

### Database Migrations

```bash
# Run migrations (backend container must be running)
docker-compose exec backend npm run migration:run

# Generate new migration
docker-compose exec backend npm run migration:generate --name=YourMigrationName
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80, 3000, 3002, 5000, 5432 are available
2. **Permission issues**: Ensure Docker has proper permissions
3. **Memory issues**: Increase Docker memory allocation if builds fail

### Logs

```bash
# View all logs
./docker.sh logs

# View specific service logs
docker-compose logs -f [service-name]
```

### Reset Everything

```bash
# Clean up everything and start fresh
./docker.sh clean
./docker.sh build
./docker.sh prod
```

## File Structure

```
youtaab/
├── docker-compose.yml              # Production setup
├── docker-compose.dev.yml          # Development setup
├── docker.sh                       # Management script
├── nginx.conf                      # Nginx configuration
├── .dockerignore                   # Docker ignore patterns
├── admin-panel-main/
│   ├── Dockerfile                  # Production build
│   ├── Dockerfile.dev              # Development build
│   └── docker-compose.yml          # Individual service
├── youtaab-backend-main/
│   ├── Dockerfile                  # Production build
│   ├── Dockerfile.dev              # Development build
│   └── docker-compose.yml          # Individual service
└── youtaab-hotel-front-master/
    ├── Dockerfile                  # Production build
    ├── Dockerfile.dev              # Development build
    └── docker-compose.yml          # Individual service
```

## Security Notes

- Default database credentials are used (change in production)
- JWT secret should be generated securely
- Nginx configuration should be adjusted for production use
- SSL certificates should be added for HTTPS

## Performance Optimization

- All images use multi-stage builds
- Non-root users are used in containers
- Production images are optimized for size
- Health checks are implemented for service monitoring
