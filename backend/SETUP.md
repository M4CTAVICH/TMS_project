# Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up PostgreSQL Database

1. Start PostgreSQL service:

   ```bash
   # Linux
   sudo systemctl start postgresql

   # macOS (with Homebrew)
   brew services start postgresql
   ```

2. Create the database:

   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE logistics_db;

   # Exit PostgreSQL
   \q
   ```

3. Update the `.env` file with your database credentials:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/logistics_db?schema=public"
   ```

## Step 3: Run Prisma Migrations

Generate Prisma client and create database tables:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

## Step 4: Seed the Database

Populate the database with initial test data:

```bash
npm run prisma:seed
```

This will create:

- 5 test user accounts (one for each role)
- Sample locations (warehouse, production facility, distribution center)
- Sample products (raw materials and finished products)
- Initial stock levels
- Transport provider with vehicles
- Sample production recipe

### Test Accounts

After seeding, you can login with these accounts:

| Role               | Email                     | Password       |
| ------------------ | ------------------------- | -------------- |
| Manager            | manager@logistics.com     | manager123     |
| Raw Stock Manager  | rawstock@logistics.com    | stock123       |
| Production Client  | production@logistics.com  | production123  |
| Distributor        | distributor@logistics.com | distributor123 |
| Transport Provider | transport@logistics.com   | transport123   |

## Step 5: Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Step 6: Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@logistics.com",
    "password": "manager123"
  }'
```

Save the token from the response and use it for authenticated requests:

```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Optional: Use Prisma Studio

Prisma Studio provides a GUI to view and edit your database:

```bash
npm run prisma:studio
```

This will open Prisma Studio in your browser at `http://localhost:5555`

## Production Build

To build for production:

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Ensure PostgreSQL is running:

   ```bash
   # Check status
   systemctl status postgresql  # Linux
   brew services list           # macOS
   ```

2. Verify credentials in `.env` file

3. Test connection manually:
   ```bash
   psql -U postgres -d logistics_db
   ```

### Port Already in Use

If port 3000 is already in use, change it in `.env`:

```
PORT=3001
```

### Prisma Migration Issues

If migrations fail:

1. Reset the database:

   ```bash
   npx prisma migrate reset
   ```

2. Run migrations again:

   ```bash
   npm run prisma:migrate
   ```

3. Re-seed:
   ```bash
   npm run prisma:seed
   ```

## Next Steps

1. Read the [API Documentation](./API_DOCUMENTATION.md) for complete API reference
2. Test the complete workflows in the documentation
3. Explore the codebase structure in the main README.md
4. Customize the system for your specific needs

## Development Tools

### Useful Commands

```bash
# Watch mode (auto-restart on changes)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed
```

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time
- `API_PREFIX` - API route prefix (default: /api/v1)

## Support

For issues or questions:

1. Check the API documentation
2. Review the code comments
3. Check Prisma logs for database issues
4. Enable debug logging by setting `NODE_ENV=development`
