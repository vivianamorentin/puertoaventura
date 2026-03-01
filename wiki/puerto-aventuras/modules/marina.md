# Marina Module

Management of 143 boat slips in Puerto Aventuras marina.

---

## Overview

The Marina module manages all aspects of the marina including slip inventory, boat registration, reservations, and service requests.

---

## Features

### Slip Inventory

143 slips across 5 sizes.

| Size | Count | Daily Rate | Monthly Rate |
|------|-------|------------|--------------|
| 20FT | 25 | $150 | $3,500 |
| 30FT | 40 | $200 | $4,500 |
| 40FT | 45 | $300 | $6,500 |
| 50FT | 25 | $400 | $8,500 |
| 60FT | 8 | $500 | $10,500 |

**Slip Features:**
- Water and electric hookups
- WiFi access
- Pump-out station access
- 24/7 security
- Bathrooms and showers
- Parking for vehicle and trailer

---

### Boat Registration

Complete boat information management.

**Required Information:**
- Boat name
- Registration number
- Length, beam, draft
- Owner information
- Insurance details
- Emergency contact

**Data Model:**
```typescript
interface Boat {
  id: string;
  name: string;
  registrationNumber: string;
  length: number;          // feet
  beam: number;            // feet
  draft: number;           // feet
  year: number;
  make: string;
  model: string;
  insuranceCompany?: string;
  insurancePolicy?: string;
  ownerId: string;
}
```

---

### Reservation System

Book slips for transient or long-term stays.

**Reservation Types:**
- **Transient** - Daily/weekly stays
- **Seasonal** - 3-6 month stays
- **Annual** - Full year commitment
- **Dry Storage** - Land-based storage

**Booking Flow:**
```
1. User selects dates and boat size
2. System shows available slips
3. User selects slip and confirms
4. Payment processed via wallet
5. Confirmation sent via email/app
6. Check-in QR code generated
```

---

### Check-in/Check-out

Automated arrival and departure process.

**Check-in:**
1. User presents QR code at marina office
2. Staff validates reservation
3. Assign slip key/card
4. Boat inspection documented
5. Service requests can be made

**Check-out:**
1. Staff inspects slip and boat
2. Any damages documented
3. Final invoice generated
4. Payment processed
5. Slip returned to inventory

---

### Service Requests

Request marina services during stay.

**Available Services:**
- Pump-out
- Water delivery
- Fuel delivery
- Boat cleaning
- Maintenance requests
- Concierge services

---

## Database Schema

### Slip Model

```prisma
model Slip {
  id              String    @id @default(cuid())
  number          String    @unique
  size            SlipSize
  dailyRate       Decimal   @db.Decimal(10, 2)
  monthlyRate     Decimal   @db.Decimal(10, 2)
  hasWater        Boolean   @default(true)
  hasElectric     Boolean   @default(true)
  hasWiFi         Boolean   @default(true)
  status          SlipStatus @default(AVAILABLE)
  currentBoatId   String?
  currentReservationId String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  currentBoat     Boat?     @relation("SlipBoat", fields: [currentBoatId], references: [id])
  currentReservation MarinaReservation? @relation(fields: [currentReservationId], references: [id])
  reservations    MarinaReservation[]

  @@index([size])
  @@index([status])
}

enum SlipSize {
  FT_20
  FT_30
  FT_40
  FT_50
  FT_60
}

enum SlipStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  RESERVED
}
```

### Boat Model

```prisma
model Boat {
  id                    String   @id @default(cuid())
  name                  String
  registrationNumber    String   @unique
  length                Int      // feet
  beam                  Int      // feet
  draft                 Int      // feet
  year                  Int
      make                 String
  model                 String
  insuranceCompany      String?
  insurancePolicy       String?
  ownerId               String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  owner                 User     @relation(fields: [ownerId], references: [id])
  reservations          MarinaReservation[]
  currentSlip           Slip?    @relation("SlipBoat")

  @@index([registrationNumber])
  @@index([ownerId])
}
```

### MarinaReservation Model

```prisma
model MarinaReservation {
  id                String           @id @default(cuid())
  slipId            String
  boatId            String
  userId            String
  checkInDate       DateTime
  checkOutDate      DateTime
  reservationType   ReservationType
  status            ReservationStatus @default(PENDING)
  totalAmount       Decimal          @db.Decimal(10, 2)
  paidAmount        Decimal          @default(0) @db.Decimal(10, 2)
  checkInQR         String?          @unique
  checkInAt         DateTime?
  checkOutAt        DateTime?
  notes             String?          @db.Text
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  slip              Slip             @relation(fields: [slipId], references: [id])
  boat              Boat             @relation(fields: [boatId], references: [id])
  user              User             @relation(fields: [userId], references: [id])
  serviceRequests   MarinaService[]

  @@index([slipId])
  @@index([boatId])
  @@index([userId])
  @@index([checkInDate, checkOutDate])
}

enum ReservationType {
  TRANSIENT
  SEASONAL
  ANNUAL
  DRY_STORAGE
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
}
```

### MarinaService Model

```prisma
model MarinaService {
  id              String      @id @default(cuid())
  reservationId   String
  type            ServiceType
  status          ServiceStatus @default(REQUESTED)
  requestedAt     DateTime    @default(now())
  scheduledAt     DateTime?
  completedAt     DateTime?
  notes           String?     @db.Text
  cost            Decimal?    @db.Decimal(10, 2)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  reservation     MarinaReservation @relation(fields: [reservationId], references: [id])

  @@index([reservationId])
  @@index([status])
}

enum ServiceType {
  PUMP_OUT
  WATER_DELIVERY
  FUEL_DELIVERY
  CLEANING
  MAINTENANCE
  CONCIERGE
}

enum ServiceStatus {
  REQUESTED
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## API Endpoints

### Slip Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/marina/slips` | List all slips |
| `GET` | `/api/marina/slips/:id` | Get slip details |
| `GET` | `/api/marina/slips/available` | Find available slips |
| `PUT` | `/api/marina/slips/:id/status` | Update slip status |

### Boat Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/marina/boats` | Register boat |
| `GET` | `/api/marina/boats` | List user's boats |
| `GET` | `/api/marina/boats/:id` | Get boat details |
| `PUT` | `/api/marina/boats/:id` | Update boat |
| `DELETE` | `/api/marina/boats/:id` | Remove boat |

### Reservations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/marina/reservations` | Create reservation |
| `GET` | `/api/marina/reservations` | List user's reservations |
| `GET` | `/api/marina/reservations/:id` | Get reservation details |
| `PUT` | `/api/marina/reservations/:id` | Update reservation |
| `POST` | `/api/marina/reservations/:id/checkin` | Check-in |
| `POST` | `/api/marina/reservations/:id/checkout` | Check-out |
| `DELETE` | `/api/marina/reservations/:id` | Cancel reservation |

### Service Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/marina/services` | Request service |
| `GET` | `/api/marina/services` | List service requests |
| `GET` | `/api/marina/services/:id` | Get service details |
| `PUT` | `/api/marina/services/:id` | Update service |

---

## Availability Algorithm

### Find Available Slips

```typescript
async function findAvailableSlips(
  checkIn: Date,
  checkOut: Date,
  boatSize: number
): Promise<Slip[]> {
  // Find slips that fit boat size
  const suitableSlips = await prisma.slip.findMany({
    where: {
      size: { gte: boatSize },
      status: 'AVAILABLE'
    }
  });

  // Filter out slips with overlapping reservations
  const available = suitableSlips.filter(async (slip) => {
    const overlapping = await prisma.marinaReservation.findFirst({
      where: {
        slipId: slip.id,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        OR: [
          { checkInDate: { lte: checkOut }, checkOutDate: { gte: checkIn } }
        ]
      }
    });
    return !overlapping;
  });

  return available;
}
```

---

## Future Enhancements

- [ ] Dynamic pricing based on demand
- [ ] Slip upgrade options
- [ ] Multi-boat discounts
- [ ] Loyalty points for marina services
- [ ] Integration with weather services
- [ ] Automated billing via wallet

---

*Last updated: 2026-03-01*
