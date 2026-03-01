# Database Schema

Complete database schema for Puerto Aventuras Super-App.

---

## Overview

The database uses **PostgreSQL 16** with **Prisma ORM**. All PII is encrypted using AES-256 via the `@pa/crypto` package.

---

## Core Models

### User

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  role              UserRole  @default(RESIDENT)
  emailVerified     Boolean   @default(false)
  isActive          Boolean   @default(true)
  lastLoginAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Encrypted PII
  encryptedPhone    String?   @db.Text
  encryptedRfc      String?   @db.Text
  encryptedCurp     String?   @db.Text
  encryptedOwnerName String?  @db.Text

  // Relations
  properties        Property[]
  vehicles          Vehicle[]
  visitors          Visitor[]
  wallet            Wallet?
  reservations      Reservation[]
  orders            Order[]
  marinaReservations MarinaReservation[]
  boats             Boat[]

  @@index([email])
  @@index([role])
}

enum UserRole {
  RESIDENT
  STAFF
  ADMIN
  PROVIDER
}
```

### Property

```prisma
model Property {
  id              String       @id @default(cuid())
  userId          String
  type            PropertyType
  address         String
  streetNumber    String
  building        String?
  unit            String?
  floor           Int?
  numberOfBedrooms Int?
  numberOfBathrooms Int?
  areaSqm         Int?
  hasPool         Boolean      @default(false)
  hasGarden       Boolean      @default(false)
  parkingSpots    Int          @default(1)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user            User         @relation(fields: [userId], references: [id])
  vehicles        Vehicle[]
  visitors        Visitor[]

  @@index([userId])
  @@index([type])
}

enum PropertyType {
  VILLA
  CONDO
  APARTMENT
}
```

---

## Authentication & Security

### Session

```prisma
model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  refreshToken String?  @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
  @@index([token])
}
```

---

## Access Control

### Visitor

```prisma
model Visitor {
  id           String      @id @default(cuid())
  propertyId   String
  name         String
  phone        String?     @db.Text
  phoneHash    String      @unique
  type         VisitorType
  qrCode       String      @unique
  expiresAt    DateTime
  accessedAt   DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  property     Property    @relation(fields: [propertyId], references: [id])

  @@index([propertyId])
  @@index([phoneHash])
}
```

### Vehicle

```prisma
model Vehicle {
  id            String   @id @default(cuid())
  propertyId    String
  plateNumber   String?  @db.Text
  plateHash     String   @unique
  make          String?
  model         String?
  color         String?
  year          Int?
  lprConfidence Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  property      Property @relation(fields: [propertyId], references: [id])

  @@index([propertyId])
  @@index([plateHash])
}
```

### AccessLog

```prisma
model AccessLog {
  id           String      @id @default(cuid())
  type         AccessType
  method       AccessMethod
  userId       String?
  visitorId    String?
  vehicleId    String?
  success      Boolean
  deniedReason String?
  timestamp    DateTime    @default(now())
  metadata     Json?

  @@index([timestamp])
  @@index([type])
}
```

---

## Marina

### Slip

```prisma
model Slip {
  id                   String     @id @default(cuid())
  number               String     @unique
  size                 SlipSize
  dailyRate            Decimal    @db.Decimal(10, 2)
  monthlyRate          Decimal    @db.Decimal(10, 2)
  hasWater             Boolean    @default(true)
  hasElectric          Boolean    @default(true)
  hasWiFi              Boolean    @default(true)
  status               SlipStatus @default(AVAILABLE)
  currentBoatId        String?
  currentReservationId String?
  createdAt            DateTime   @default(now())
  updatedAt            DateTime   @updatedAt

  currentBoat          Boat?      @relation("SlipBoat", fields: [currentBoatId], references: [id])
  currentReservation   MarinaReservation? @relation(fields: [currentReservationId], references: [id])
  reservations         MarinaReservation[]

  @@index([size])
  @@index([status])
}
```

### Boat

```prisma
model Boat {
  id                 String   @id @default(cuid())
  name               String
  registrationNumber String   @unique
  length             Int
  beam               Int
  draft              Int
  year               Int
  make               String
  model              String
  insuranceCompany   String?
  insurancePolicy    String?
  ownerId            String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  owner              User     @relation(fields: [ownerId], references: [id])
  reservations       MarinaReservation[]
  currentSlip        Slip?    @relation("SlipBoat")

  @@index([registrationNumber])
  @@index([ownerId])
}
```

### MarinaReservation

```prisma
model MarinaReservation {
  id              String           @id @default(cuid())
  slipId          String
  boatId          String
  userId          String
  checkInDate     DateTime
  checkOutDate    DateTime
  reservationType ReservationType
  status          ReservationStatus @default(PENDING)
  totalAmount     Decimal          @db.Decimal(10, 2)
  paidAmount      Decimal          @default(0) @db.Decimal(10, 2)
  checkInQR       String?          @unique
  checkInAt       DateTime?
  checkOutAt      DateTime?
  notes           String?          @db.Text
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  slip            Slip             @relation(fields: [slipId], references: [id])
  boat            Boat             @relation(fields: [boatId], references: [id])
  user            User             @relation(fields: [userId], references: [id])
  serviceRequests MarinaService[]

  @@index([slipId])
  @@index([boatId])
  @@index([userId])
  @@index([checkInDate, checkOutDate])
}
```

---

## Golf & Facilities

### Facility

```prisma
model Facility {
  id              String        @id @default(cuid())
  name            String
  type            FacilityType
  capacity        Int
  hourlyRate      Decimal?      @db.Decimal(10, 2)
  hasIoTControl   Boolean       @default(false)
  requiresLighting Boolean      @default(false)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  reservations    Reservation[]
  iotStates       IoTState[]

  @@index([type])
  @@index([isActive])
}
```

### Reservation (Facilities)

```prisma
model Reservation {
  id              String        @id @default(cuid())
  facilityId      String
  userId          String
  startTime       DateTime
  endTime         DateTime
  numberOfPlayers Int           @default(1)
  status          ReservationStatus @default(PENDING)
  totalAmount     Decimal       @db.Decimal(10, 2)
  paidAmount      Decimal       @default(0) @db.Decimal(10, 2)
  qrCode          String?       @unique
  checkedInAt     DateTime?
  cancelledAt     DateTime?
  notes           String?       @db.Text
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  facility        Facility      @relation(fields: [facilityId], references: [id])
  user            User          @relation(fields: [userId], references: [id])

  @@index([facilityId])
  @@index([userId])
  @@index([startTime])
}
```

---

## Marketplace

### Restaurant

```prisma
model Restaurant {
  id              String    @id @default(cuid())
  name            String
  cuisineType     String
  description     String?   @db.Text
  phoneNumber     String
  email           String?
  address         String
  latitude        Float?
  longitude       Float?
  openingHours    Json
  averageRating   Decimal   @default(0) @db.Decimal(3, 2)
  totalReviews    Int       @default(0)
  deliveryFee     Decimal   @default(5.99) @db.Decimal(10, 2)
  commissionRate  Decimal   @default(0.15) @db.Decimal(4, 2)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  menuItems       MenuItem[]
  orders          Order[]

  @@index([cuisineType])
  @@index([isActive])
}
```

### Order

```prisma
model Order {
  id                   String        @id @default(cuid())
  restaurantId         String
  userId               String
  orderType            OrderType
  status               OrderStatus   @default(PENDING)
  subtotal             Decimal       @db.Decimal(10, 2)
  tax                  Decimal       @db.Decimal(10, 2)
  deliveryFee          Decimal       @db.Decimal(10, 2)
  tip                  Decimal       @default(0) @db.Decimal(10, 2)
  totalAmount          Decimal       @db.Decimal(10, 2)
  paidAmount           Decimal       @default(0) @db.Decimal(10, 2)
  paymentStatus        PaymentStatus @default(PENDING)
  deliveryAddress      String?       @db.Text
  deliveryLat          Float?
  deliveryLng          Float?
  estimatedTime        Int?
  placedAt             DateTime      @default(now())
  confirmedAt          DateTime?
  preparingAt          DateTime?
  readyAt              DateTime?
  pickedUpAt           DateTime?
  deliveredAt          DateTime?
  cancelledAt          DateTime?
  specialInstructions  String?       @db.Text
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  restaurant           Restaurant   @relation(fields: [restaurantId], references: [id])
  user                 User         @relation(fields: [userId], references: [id])
  items                OrderItem[]

  @@index([restaurantId])
  @@index([userId])
  @@index([status])
  @@index([placedAt])
}
```

---

## Payments

### Wallet

```prisma
model Wallet {
  id                 Decimal   @id @default(cuid())
  userId             String    @unique
  cashBalance        Decimal   @default(0) @db.Decimal(12, 2)
  promotionalBalance Decimal   @default(0) @db.Decimal(12, 2)
  loyaltyPoints      Int       @default(0)
  promoExpiration    DateTime?
  autoReloadAmount   Decimal?  @db.Decimal(10, 2)
  autoReloadThreshold Decimal? @db.Decimal(10, 2)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  user               User      @relation(fields: [userId], references: [id])
  transactions       Transaction[]

  @@index([userId])
}
```

### Transaction

```prisma
model Transaction {
  id             String          @id @default(cuid())
  walletId       String
  type           TransactionType
  amount         Decimal         @db.Decimal(12, 2)
  balanceBefore  Decimal         @db.Decimal(12, 2)
  balanceAfter   Decimal         @db.Decimal(12, 2)
  pointsBefore   Int?
  pointsAfter    Int?
  description    String
  metadata       Json?
  status         TransactionStatus @default(COMPLETED)
  createdAt      DateTime        @default(now())

  wallet         Wallet          @relation(fields: [walletId], references: [id])

  @@index([walletId])
  @@index([type])
  @@index([createdAt])
}
```

---

## Enums

### UserRole

```prisma
enum UserRole {
  RESIDENT    # Full access to resident features
  STAFF       # Staff access
  ADMIN       # Administrative access
  PROVIDER    # Service provider access
}
```

### VisitorType

```prisma
enum VisitorType {
  GUEST       # < 24 hours
  CONTRACTOR  # Multi-day access
  DELIVERY    # < 4 hours
  PERMANENT   # Long-term access
}
```

### SlipSize

```prisma
enum SlipSize {
  FT_20
  FT_30
  FT_40
  FT_50
  FT_60
}
```

### FacilityType

```prisma
enum FacilityType {
  GOLF_COURSE
  TENNIS_COURT
  PICKLEBALL_COURT
  GYM
  SPA
  POOL
}
```

---

## Cascade Delete Rules

### User Deletion

When a User is deleted:
- Properties → Deleted
- Vehicles → Deleted
- Visitors → Deleted
- Wallet → Deleted
- Reservations → Deleted
- Orders → Deleted
- Marina reservations → Deleted
- Boats → Deleted

### Property Deletion

When a Property is deleted:
- Vehicles → Deleted
- Visitors → Deleted

---

## Migration Commands

```bash
cd packages/database

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create migration (production)
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

---

## Encryption Notes

All PII fields are encrypted using `@pa/crypto`:

```typescript
import { encrypt, decrypt } from '@pa/crypto';

// Encrypt PII before storing
const encryptedPhone = encrypt(phone, process.env.ENCRYPTION_KEY);

// Decrypt PII after retrieving
const decryptedPhone = decrypt(user.encryptedPhone, process.env.ENCRYPTION_KEY);
```

**Encrypted Fields:**
- `User.encryptedPhone`
- `User.encryptedRfc`
- `User.encryptedCurp`
- `User.encryptedOwnerName`
- `Vehicle.plateNumber`

---

*Last updated: 2026-03-01*
