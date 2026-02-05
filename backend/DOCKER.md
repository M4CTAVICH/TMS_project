# Docker Setup Guide

## Quick Start with Docker

### Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### 1. Start the Database

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if containers are running
docker-compose ps
```

This will start:

- **PostgreSQL** on `localhost:5432`
- **pgAdmin** on `http://localhost:5050`

### 2. Database Connection

The `.env` file is already configured for Docker:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logistics_db?schema=public"
```

### 3. Run Migrations and Seed

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

### 4. Start the Application

```bash
npm run dev
```

## Using pgAdmin (Optional)

Access pgAdmin at `http://localhost:5050`

**Login Credentials:**

- Email: `admin@logistics.com`
- Password: `admin123`

**To connect to PostgreSQL:**

1. Click "Add New Server"
2. General Tab:
   - Name: `Logistics DB`
3. Connection Tab:
   - Host: `postgres` (or `host.docker.internal` on Mac/Windows)
   - Port: `5432`
   - Database: `logistics_db`
   - Username: `postgres`
   - Password: `postgres`

## Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v

# View logs
docker-compose logs -f

# View PostgreSQL logs only
docker-compose logs -f postgres

# Restart containers
docker-compose restart

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d logistics_db
```

## Database Backup & Restore

### Backup

```bash
# Backup to file
docker-compose exec postgres pg_dump -U postgres logistics_db > backup.sql

# Or with custom format (recommended)
docker-compose exec postgres pg_dump -U postgres -Fc logistics_db > backup.dump
```

### Restore

```bash
# From SQL file
docker-compose exec -T postgres psql -U postgres logistics_db < backup.sql

# From custom format
docker-compose exec postgres pg_restore -U postgres -d logistics_db backup.dump
```

## Reset Database

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait a moment for PostgreSQL to initialize, then:
npm run prisma:migrate
npm run prisma:seed
```

## Troubleshooting

### Port 5432 Already in Use

If you have PostgreSQL installed locally:

```bash
# Stop local PostgreSQL
sudo systemctl stop postgresql  # Linux
brew services stop postgresql   # macOS

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"

# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/logistics_db?schema=public"
```

### Connection Refused

```bash
# Check if container is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart containers
docker-compose restart
```

### Permission Issues on Linux

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then test
docker ps
```

## Production Deployment

For production, update `docker-compose.yml`:

1. **Use strong passwords:**

   ```yaml
   environment:
     POSTGRES_PASSWORD: ${DB_PASSWORD}
   ```

2. **Add proper volumes:**

   ```yaml
   volumes:
     - ./postgres-data:/var/lib/postgresql/data
   ```

3. **Remove pgAdmin** or secure it properly

4. **Consider using managed database** services like:
   - AWS RDS
   - Google Cloud SQL
   - Azure Database for PostgreSQL
   - DigitalOcean Managed Databases

## Environment Variables

Create `.env` file with:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logistics_db?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# API
API_PREFIX=/api/v1
CORS_ORIGIN=*
```

## Complete Setup Workflow

```bash
# 1. Clone/navigate to project
cd /home/mactavich/Desktop/logistics

# 2. Install dependencies
npm install

# 3. Start Docker containers
docker-compose up -d

# 4. Wait for database to be ready (check health)
docker-compose ps

# 5. Run Prisma setup
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 6. Start development server
npm run dev

# 7. Test API
curl http://localhost:3000/health
```

Your logistics platform is now running! 🚀

Access:

- **API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050
- **Health Check**: http://localhost:3000/health
