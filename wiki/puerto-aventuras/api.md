# API Reference

REST API reference for Puerto Aventuras Super-App.

---

## Overview

The API is built with **Fastify** and follows REST conventions. All endpoints require authentication except where noted.

**Base URL:** `http://localhost:3000/api` (development)

---

## Authentication

### Register

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "+52 998 123 4567",
  "rfc": "ABC123456XYZ",
  "curp": "ABCD123456EFGHIJ01",
  "ownerName": "John Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "RESIDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

Authenticate a user.

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "RESIDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Refresh Token

Get a new access token using refresh token.

```http
POST /api/auth/refresh
Content-Type: application/json
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout

Invalidate the current session.

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Security Module

### Visitors

#### Create Visitor

```http
POST /api/security/visitors
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyId": "prop_123",
  "name": "Jane Smith",
  "phone": "+52 998 987 6543",
  "type": "GUEST",
  "expiresAt": "2026-03-02T18:00:00Z"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "vis_123",
    "name": "Jane Smith",
    "qrCode": "QR-ABC123XYZ",
    "expiresAt": "2026-03-02T18:00:00Z"
  }
}
```

#### Validate QR Code

```http
POST /api/security/qr/validate
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "qrCode": "QR-ABC123XYZ"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "visitor": {
      "id": "vis_123",
      "name": "Jane Smith",
      "type": "GUEST"
    },
    "property": {
      "id": "prop_123",
      "address": "123 Main Street"
    }
  }
}
```

---

## Marina Module

### List Available Slips

```http
GET /api/marina/slips/available?checkIn=2026-03-10&checkOut=2026-03-15&boatSize=40
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "slip_123",
      "number": "A-42",
      "size": "FT_40",
      "dailyRate": 300.00,
      "hasWater": true,
      "hasElectric": true,
      "hasWiFi": true
    }
  ]
}
```

### Create Reservation

```http
POST /api/marina/reservations
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "slipId": "slip_123",
  "boatId": "boat_456",
  "checkInDate": "2026-03-10T14:00:00Z",
  "checkOutDate": "2026-03-15T11:00:00Z",
  "reservationType": "TRANSIENT"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "res_789",
    "totalAmount": 1500.00,
    "status": "PENDING",
    "checkInQR": "QR-XYZ789ABC"
  }
}
```

---

## Golf Module

### Get Available Tee Times

```http
GET /api/golf/teetimes?date=2026-03-10&players=4
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "time": "2026-03-10T07:00:00Z",
      "availableSpots": 2,
      "rate": 120.00
    },
    {
      "time": "2026-03-10T07:10:00Z",
      "availableSpots": 4,
      "rate": 120.00
    }
  ]
}
```

### Book Tee Time

```http
POST /api/golf/teetimes/book
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "date": "2026-03-10T07:10:00Z",
  "players": 4,
  " numberOfPlayers": 4
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "res_456",
    "totalAmount": 480.00,
    "qrCode": "QR-GOLF123"
  }
}
```

---

## Marketplace Module

### List Restaurants

```http
GET /api/marketplace/restaurants?cuisine=Italian
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "rest_123",
      "name": "Mario's Pizza",
      "cuisineType": "Italian",
      "averageRating": 4.5,
      "deliveryFee": 5.99,
      "isOpen": true
    }
  ]
}
```

### Create Order

```http
POST /api/marketplace/orders
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "restaurantId": "rest_123",
  "orderType": "DELIVERY",
  "items": [
    {
      "menuItemId": "menu_456",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "deliveryAddress": "123 Main Street, Villa 5",
  "tip": 5.00
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "order_789",
    "status": "PENDING",
    "subtotal": 35.98,
    "tax": 5.76,
    "deliveryFee": 5.99,
    "tip": 5.00,
    "totalAmount": 52.73,
    "estimatedTime": 45
  }
}
```

---

## Payments Module

### Get Wallet

```http
GET /api/payments/wallet
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "cashBalance": 1500.00,
    "promotionalBalance": 50.00,
    "loyaltyPoints": 2500
  }
}
```

### Add Funds

```http
POST /api/payments/wallet/add-funds
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 100.00,
  "paymentMethodId": "pm_123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "cashBalance": 1600.00,
    "transactionId": "txn_456"
  }
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INSUFFICIENT_FUNDS` | 400 | Wallet balance too low |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limiting

API requests are rate limited:

| Tier | Requests | Window |
|------|----------|--------|
| **Resident** | 100 | 1 hour |
| **Staff** | 500 | 1 hour |
| **Admin** | 1000 | 1 hour |

Rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1677699200
```

---

## Pagination

List endpoints support pagination:

```http
GET /api/marketplace/orders?page=1&limit=20&sort=createdAt&order=desc
```

**Response:**

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## Webhooks

### Order Status Update

Webhook URL receives order status updates.

**Payload:**

```json
{
  "event": "order.status_updated",
  "data": {
    "orderId": "order_789",
    "status": "DELIVERED",
    "timestamp": "2026-03-01T15:30:00Z"
  }
}
```

---

*Last updated: 2026-03-01*
