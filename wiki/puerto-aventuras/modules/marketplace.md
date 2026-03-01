# Marketplace Module

Restaurant ordering and delivery services.

---

## Overview

The Marketplace module enables users to browse restaurants, place orders, and track delivery status within Puerto Aventuras.

---

## Features

### Restaurant Directory

Browse participating restaurants.

**Restaurant Information:**
- Name and cuisine type
- Menu with items and prices
- Photos and descriptions
- Rating and reviews
- Operating hours
- Delivery areas

**Participating Restaurants:**
- **Puerto Cafe** - Breakfast, lunch, coffee
- **Ocean Grill** - Seafood, steaks
- **Mario's Pizza** - Italian, pizza
- **Taco Libre** - Mexican, street tacos
- **Sushi Express** - Japanese, sushi
- **Burger House** - American, burgers

---

### Order Types

Multiple order fulfillment options.

| Type | Description | Fee |
|------|-------------|-----|
| **Delivery** | Delivered to property | $5.99 |
| **Pickup** | Pick up at restaurant | Free |
| **Dine-in** | Reserve table | Free |

---

### Ordering Flow

```
1. User browses restaurants
2. Selects restaurant and items
3. Chooses order type (delivery/pickup/dine-in)
4. Adds delivery address (if applicable)
5. Adds special instructions
6. Reviews order and tips
7. Pays via wallet
8. Order confirmation sent
9. Real-time tracking
10. Delivery/completion notification
```

---

### Delivery Tracking

Real-time order tracking.

**Status Updates:**
- **Confirmed** - Order received by restaurant
- **Preparing** - Food being prepared
- **Ready** - Ready for pickup/delivery
- **Picked Up** - Driver has order (delivery only)
- **In Transit** - On the way
- **Delivered** - Order completed

**Tracking Information:**
- Driver name and photo
- Estimated arrival time
- Live map tracking
- Driver contact option

---

### Payment & Tipping

Integrated payment via wallet.

**Tipping Options:**
- 15% - Good service
- 18% - Great service
- 20% - Excellent service
- Custom amount

**Payment Flow:**
1. User selects tip amount
2. Total calculated (subtotal + tax + fee + tip)
3. Payment processed via wallet
4. Restaurant receives payment
5. Driver receives tip (delivery orders)

---

## Database Schema

### Restaurant Model

```prisma
model Restaurant {
  id              String        @id @default(cuid())
  name            String
  cuisineType     String
  description     String?       @db.Text
  phoneNumber     String
  email           String?
  address         String
  latitude        Float?
  longitude       Float?
  openingHours    Json          // Store hours by day
  averageRating   Decimal       @default(0) @db.Decimal(3, 2)
  totalReviews    Int           @default(0)
  deliveryFee     Decimal       @default(5.99) @db.Decimal(10, 2)
  commissionRate  Decimal       @default(0.15) @db.Decimal(4, 2)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  menuItems       MenuItem[]
  orders          Order[]

  @@index([cuisineType])
  @@index([isActive])
}
```

### MenuItem Model

```prisma
model MenuItem {
  id              String        @id @default(cuid())
  restaurantId    String
  name            String
  description     String?       @db.Text
  category        String
  price           Decimal       @db.Decimal(10, 2)
  imageUrl        String?
  isAvailable     Boolean       @default(true)
  preparationTime Int           @default(15) // minutes
  spiceLevel      Int?          // 0-3
  isVegetarian    Boolean       @default(false)
  isVegan         Boolean       @default(false)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  restaurant      Restaurant    @relation(fields: [restaurantId], references: [id])
  orderItems      OrderItem[]

  @@index([restaurantId])
  @@index([category])
  @@index([isAvailable])
}
```

### Order Model

```prisma
model Order {
  id              String        @id @default(cuid())
  restaurantId    String
  userId          String
  orderType       OrderType
  status          OrderStatus   @default(PENDING)
  subtotal        Decimal       @db.Decimal(10, 2)
  tax             Decimal       @db.Decimal(10, 2)
  deliveryFee     Decimal       @db.Decimal(10, 2)
  tip             Decimal       @default(0) @db.Decimal(10, 2)
  totalAmount     Decimal       @db.Decimal(10, 2)
  paidAmount      Decimal       @default(0) @db.Decimal(10, 2)
  paymentStatus   PaymentStatus @default(PENDING)

  // Delivery details
  deliveryAddress String?       @db.Text
  deliveryLat    Float?
  deliveryLng    Float?
  estimatedTime  Int?          // minutes

  // Tracking
  placedAt        DateTime      @default(now())
  confirmedAt     DateTime?
  preparingAt     DateTime?
  readyAt         DateTime?
  pickedUpAt      DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?

  // Special instructions
  specialInstructions String?   @db.Text

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  restaurant      Restaurant    @relation(fields: [restaurantId], references: [id])
  user            User          @relation(fields: [userId], references: [id])
  items           OrderItem[]

  @@index([restaurantId])
  @@index([userId])
  @@index([status])
  @@index([placedAt])
}

enum OrderType {
  DELIVERY
  PICKUP
  DINE_IN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  REFUNDED
  FAILED
}
```

### OrderItem Model

```prisma
model OrderItem {
  id              String        @id @default(cuid())
  orderId         String
  menuItemId      String
  quantity        Int
  unitPrice       Decimal       @db.Decimal(10, 2)
  totalPrice      Decimal       @db.Decimal(10, 2)
  specialInstructions String?   @db.Text
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  order           Order         @relation(fields: [orderId], references: [id])
  menuItem        MenuItem      @relation(fields: [menuItemId], references: [id])

  @@index([orderId])
  @@index([menuItemId])
}
```

---

## API Endpoints

### Restaurants

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/marketplace/restaurants` | List restaurants |
| `GET` | `/api/marketplace/restaurants/:id` | Get restaurant details |
| `GET` | `/api/marketplace/restaurants/:id/menu` | Get menu |
| `GET` | `/api/marketplace/cuisines` | List cuisine types |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/marketplace/orders` | Place order |
| `GET` | `/api/marketplace/orders` | List user's orders |
| `GET` | `/api/marketplace/orders/:id` | Get order details |
| `PUT` | `/api/marketplace/orders/:id/cancel` | Cancel order |
| `GET` | `/api/marketplace/orders/:id/track` | Track order status |

---

## Order Processing Flow

```typescript
async function placeOrder(userId: string, request: PlaceOrderRequest) {
  // 1. Validate order
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: request.restaurantId }
  });
  if (!restaurant?.isActive) {
    throw new Error('Restaurant not available');
  }

  // 2. Calculate totals
  const subtotal = request.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  const tax = subtotal * 0.16; // 16% VAT
  const deliveryFee = request.orderType === 'DELIVERY'
    ? restaurant.deliveryFee
    : 0;
  const total = subtotal + tax + deliveryFee + request.tip;

  // 3. Create order
  const order = await prisma.order.create({
    data: {
      restaurantId: request.restaurantId,
      userId,
      orderType: request.orderType,
      subtotal,
      tax,
      deliveryFee,
      tip: request.tip,
      totalAmount: total,
      deliveryAddress: request.deliveryAddress,
      specialInstructions: request.specialInstructions,
      status: 'PENDING',
      items: {
        create: request.items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          specialInstructions: item.specialInstructions
        }))
      }
    }
  });

  // 4. Process payment via wallet
  const payment = await walletService.charge(
    userId,
    total,
    `Order: ${order.id}`
  );

  // 5. Update order status
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
      paymentStatus: 'COMPLETED'
    }
  });

  // 6. Send notifications
  await notificationService.send(userId, {
    type: 'ORDER_CONFIRMED',
    orderId: order.id
  });

  return order;
}
```

---

## Commission Structure

Restaurants pay commission on each order.

**Commission Rates:**
- **Standard:** 15% of subtotal
- **Premium restaurants:** 12%
- **New restaurants:** 10% (first 3 months)

**Commission Distribution:**
- Platform fee: 10%
- Payment processing: 2%
- Driver fee (delivery): 3%

---

## Future Enhancements

- [ ] Scheduled orders
- [ ] Group orders
- [ ] Loyalty program integration
- [ ] Promo codes and discounts
- [ ] Restaurant reviews and ratings
- [ ] Favorite orders reordering
- [ ] Dietary preferences filtering
- [ ] Multi-restaurant orders

---

*Last updated: 2026-03-01*
