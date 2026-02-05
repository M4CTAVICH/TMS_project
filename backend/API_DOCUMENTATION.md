# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "manager@logistics.com",
  "password": "manager123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "manager@logistics.com",
      "firstName": "System",
      "lastName": "Manager",
      "role": "MANAGER"
    }
  },
  "message": "Login successful"
}
```

### GET /auth/profile

Get current user profile (requires authentication).

### POST /auth/change-password

Change password (requires authentication).

**Request Body:**

```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## User Management

### POST /users

Create a new user (Manager only).

**Request Body:**

```json
{
  "email": "newuser@logistics.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PRODUCTION_CLIENT"
}
```

**Roles:**

- `MANAGER` - Full system access
- `RAW_STOCK_MANAGER` - Manages raw material inventory
- `PRODUCTION_CLIENT` - Orders raw materials, runs production
- `DISTRIBUTOR` - Orders finished products
- `TRANSPORT_PROVIDER` - Manages transport operations

### GET /users

List all users (with pagination).

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role

### GET /users/:id

Get user by ID.

### PUT /users/:id

Update user (Manager only).

### DELETE /users/:id

Delete user (Manager only).

---

## Products

### POST /products

Create a product (Manager only).

**Request Body:**

```json
{
  "name": "Steel Rod",
  "description": "High-grade steel rod",
  "sku": "RAW-STEEL-001",
  "type": "RAW_MATERIAL",
  "unitWeight": 5.0,
  "unitPrice": 25.0
}
```

**Product Types:**

- `RAW_MATERIAL` - Raw materials for production
- `FINISHED_PRODUCT` - Finished products for distribution

### GET /products

List all products.

### GET /products/raw-materials

List only raw materials.

### GET /products/finished-products

List only finished products.

### GET /products/:id

Get product by ID.

### PUT /products/:id

Update product (Manager only).

---

## Locations

### POST /locations

Create a location (Manager only).

**Request Body:**

```json
{
  "name": "Main Warehouse",
  "address": "123 Street, City",
  "latitude": 40.7128,
  "longitude": -74.006,
  "locationType": "RAW_WAREHOUSE",
  "userId": "user-id-optional"
}
```

### GET /locations

List all locations.

### GET /locations/calculate-distance

Calculate distance between two locations.

**Query Parameters:**

- `fromLocationId`: Starting location ID
- `toLocationId`: Destination location ID

**Response:**

```json
{
  "success": true,
  "data": {
    "from": { "id": "...", "name": "...", "coordinates": {...} },
    "to": { "id": "...", "name": "...", "coordinates": {...} },
    "distanceKm": 25.5
  }
}
```

---

## Stock Management

### GET /stock/raw-material

Get raw material stock levels.

**Query Parameters:**

- `locationId` (optional): Filter by location
- `productId` (optional): Filter by product

### PUT /stock/raw-material/:productId/:locationId

Update raw material stock.

**Request Body:**

```json
{
  "quantity": 100,
  "operation": "ADD"
}
```

**Operations:**

- `ADD` - Add to current quantity
- `REMOVE` - Subtract from current quantity
- `SET` - Set to specific quantity

### GET /stock/production

Get production stock levels.

### PUT /stock/production/:productId/:locationId

Update production stock (same format as raw material).

### GET /stock/finished-product

Get finished product stock levels.

### PUT /stock/finished-product/:productId/:locationId

Update finished product stock.

### GET /stock/overview

Get comprehensive stock overview (Manager only).

---

## Transport Management

### POST /transport/providers

Create transport provider (Manager only).

**Request Body:**

```json
{
  "name": "Fast Transport Co.",
  "userId": "transport-user-id"
}
```

### GET /transport/providers

List all transport providers.

### POST /transport/vehicles

Create vehicle.

**Request Body:**

```json
{
  "providerId": "provider-id",
  "name": "Heavy Truck 1",
  "licensePlate": "TRUCK-001",
  "capacityKg": 5000,
  "costPerKm": 2.5
}
```

### GET /transport/vehicles

List all vehicles.

**Query Parameters:**

- `providerId` (optional): Filter by provider
- `status` (optional): Filter by status (AVAILABLE, IN_USE, MAINTENANCE, INACTIVE)

### PUT /transport/vehicles/:id

Update vehicle.

### POST /transport/calculate-cost

Calculate transport cost for a job.

**Request Body:**

```json
{
  "providerId": "provider-id",
  "totalWeight": 1500,
  "distanceKm": 50
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "allocations": [{ "vehicleId": "...", "cost": 125.0 }],
    "totalCost": 125.0
  }
}
```

### GET /transport/jobs

List all transport jobs.

### GET /transport/jobs/:id

Get transport job details.

### PUT /transport/jobs/:id/status

Update transport job status.

---

## Orders

### POST /orders

Create a new order.

**Request Body:**

```json
{
  "type": "RAW_MATERIAL_ORDER",
  "fromLocationId": "warehouse-id",
  "toLocationId": "production-facility-id",
  "transportProviderId": "provider-id",
  "items": [
    {
      "productId": "steel-rod-id",
      "quantity": 50
    },
    {
      "productId": "plastic-pellets-id",
      "quantity": 200
    }
  ]
}
```

**Order Types:**

- `RAW_MATERIAL_ORDER` - Production client orders raw materials
- `FINISHED_PRODUCT_ORDER` - Distributor orders finished products

**What Happens Automatically:**

1. System validates stock availability
2. Calculates distance between locations
3. Calculates product costs
4. Calculates transport costs (vehicle allocation)
5. Reserves stock
6. Creates transport job
7. Allocates vehicles
8. Returns complete order with total cost

### GET /orders

List all orders.

**Query Parameters:**

- `userId` (optional): Filter by user (non-managers see only their orders)
- `status` (optional): Filter by status
- `type` (optional): Filter by type

**Order Statuses:**

- `PENDING` - Order created, awaiting processing
- `CONFIRMED` - Order confirmed
- `PREPARING` - Being prepared for shipment
- `IN_TRANSIT` - On the way
- `DELIVERED` - Successfully delivered
- `CANCELLED` - Order cancelled

### GET /orders/:id

Get order details.

### PUT /orders/:id/status

Update order status.

**Request Body:**

```json
{
  "status": "CONFIRMED"
}
```

### POST /orders/:id/cancel

Cancel an order.

---

## Production

### POST /production/recipes

Create a production recipe (Manager only).

**Request Body:**

```json
{
  "name": "Widget Production Recipe",
  "description": "Standard widget recipe",
  "inputs": [
    { "productId": "steel-rod-id", "quantity": 2 },
    { "productId": "plastic-pellets-id", "quantity": 10 }
  ],
  "outputs": [{ "productId": "widget-id", "quantity": 1 }]
}
```

### GET /production/recipes

List all recipes.

### GET /production/recipes/:id

Get recipe details.

### POST /production/batches

Create a production batch.

**Request Body:**

```json
{
  "recipeId": "recipe-id",
  "locationId": "production-facility-id",
  "multiplier": 10
}
```

The multiplier scales the recipe (e.g., multiplier=10 produces 10x the output).

### GET /production/batches

List all production batches.

**Query Parameters:**

- `locationId` (optional): Filter by location
- `status` (optional): Filter by status
- `producedById` (optional): Filter by producer

**Batch Statuses:**

- `PLANNED` - Created but not started
- `IN_PROGRESS` - Raw materials consumed, production underway
- `COMPLETED` - Finished products auto-transferred to finished stock
- `CANCELLED` - Batch cancelled

### GET /production/batches/:id

Get batch details.

### POST /production/batches/:id/start

Start production batch.

**What Happens:**

1. Validates raw material availability in production stock
2. Deducts raw materials from production stock
3. Records input consumption
4. Changes status to IN_PROGRESS

### POST /production/batches/:id/complete

Complete production batch.

**What Happens:**

1. Creates finished products
2. **Auto-transfers to finished product stock** (no manual intervention)
3. Records output production
4. Changes status to COMPLETED

### POST /production/batches/:id/cancel

Cancel production batch.

---

## Payments

**Note:** Payments functionality has been removed from the platform. All orders are non-monetary transactions.

------

## Reports (Manager Only)

### GET /reports/dashboard

Get comprehensive dashboard statistics.

**Response includes:**

- Order statistics (by status, type, revenue)
- Stock statistics (all levels)
- Production statistics
- Payment statistics
- Transport statistics

### GET /reports/orders

Get order analytics.

**Query Parameters:**

- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

### GET /reports/production

Get production analytics.

**Query Parameters:**

- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

### GET /reports/stock-movements

Get stock movement report.

**Query Parameters:**

- `locationId` (optional): Filter by location

---

## Complete Workflow Examples

### Example 1: Raw Material Order

1. **Production client logs in**

   ```
   POST /auth/login
   ```

2. **Check available raw materials**

   ```
   GET /stock/raw-material?locationId=warehouse-id
   ```

3. **Calculate transport cost**

   ```
   POST /transport/calculate-cost
   {
     "providerId": "provider-id",
     "totalWeight": 500,
     "distanceKm": 25
   }
   ```

4. **Create order**

   ```
   POST /orders
   {
     "type": "RAW_MATERIAL_ORDER",
     "fromLocationId": "warehouse-id",
     "toLocationId": "production-facility-id",
     "transportProviderId": "provider-id",
     "items": [...]
   }
   ```

   System automatically:

   - Reserves stock
   - Allocates vehicles
   - Calculates total cost
   - Creates transport job

5. **Create payment**

   ```
   POST /payments
   {
     "orderId": "order-id",
     "payerId": "production-client-id",
     "receiverId": "warehouse-manager-id",
     "method": "BANK_TRANSFER"
   }
   ```

6. **Complete payment**

   ```
   POST /payments/:paymentId/complete
   ```

   Order status changes to CONFIRMED

7. **Update order status as it progresses**

   ```
   PUT /orders/:orderId/status
   { "status": "IN_TRANSIT" }
   ```

8. **Mark as delivered**

   ```
   PUT /orders/:orderId/status
   { "status": "DELIVERED" }
   ```

   System automatically:

   - Deducts from raw stock
   - Adds to production stock
   - Releases vehicles

### Example 2: Production Workflow

1. **Create production batch**

   ```
   POST /production/batches
   {
     "recipeId": "recipe-id",
     "locationId": "production-facility-id",
     "multiplier": 5
   }
   ```

2. **Start production**

   ```
   POST /production/batches/:batchId/start
   ```

   System automatically:

   - Deducts raw materials from production stock
   - Records consumption

3. **Complete production**

   ```
   POST /production/batches/:batchId/complete
   ```

   System automatically:

   - Creates finished products
   - **Auto-transfers to finished product stock**
   - Records output

### Example 3: Finished Product Order

1. **Distributor checks finished stock**

   ```
   GET /stock/finished-product
   ```

2. **Create finished product order**

   ```
   POST /orders
   {
     "type": "FINISHED_PRODUCT_ORDER",
     "fromLocationId": "production-facility-id",
     "toLocationId": "distribution-center-id",
     "transportProviderId": "provider-id",
     "items": [...]
   }
   ```

3. **Complete payment and delivery** (same as Example 1)

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [] // Optional, for validation errors
}
```

**Common Status Codes:**

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error
