# Golf Module

Golf course and sports facilities management.

---

## Overview

The Golf module manages tee time bookings, facility reservations, and IoT integration for automated lighting and facility control.

---

## Features

### Golf Course

18-hole championship golf course.

**Course Details:**
- Par: 72
- Yardage: 6,800 yards (from back tees)
- Rating: 73.2
- Slope: 138
- Greens: Bermuda
- Fairways: Bermuda

**Tee Time Options:**
- 9-hole rounds (morning only)
- 18-hole rounds (all day)
- Twilight rates (after 3 PM)
- Replay rates (same day)

---

### Tee Time Booking

Book tee times up to 7 days in advance.

**Booking Rules:**
- Maximum 7 days advance booking
- Minimum 2 players, maximum 4 players
- Cancellation up to 24 hours before
- No-show penalty: 50% of fee
- Resident priority: First 48 hours

**Booking Flow:**
```
1. User selects date and time
2. System shows available tee times
3. User selects time and enters players
4. Payment processed via wallet
5. Confirmation sent
6. QR code generated for check-in
```

---

### Sports Facilities

Multiple sports facilities available for booking.

**Facilities:**

| Facility | Capacity | Booking Type | Rate |
|----------|----------|--------------|------|
| Tennis Court 1 | 4 | Hourly | $20/hour |
| Tennis Court 2 | 4 | Hourly | $20/hour |
| Pickleball Court 1 | 4 | Hourly | $15/hour |
| Pickleball Court 2 | 4 | Hourly | $15/hour |
| Gym | 20 | Daily pass | $10/day |
| Spa | 10 | Per service | Variable |
| Pool | 50 | Free | Free |

---

### IoT Lighting Integration

Automated lighting control for facilities.

**Features:**
- Sunset/sunrise automation
- Motion-activated lighting
- Remote on/off control
- Energy usage monitoring
- Maintenance alerts

**Control Types:**
- **Automatic:** Lights on at sunset, off at 11 PM
- **Manual:** Remote control via app
- **Motion:** Motion sensors activate when occupied
- **Schedule:** Custom schedules for events

---

## Database Schema

### Facility Model

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

enum FacilityType {
  GOLF_COURSE
  TENNIS_COURT
  PICKLEBALL_COURT
  GYM
  SPA
  POOL
}
```

### Reservation Model

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

### IoTState Model

```prisma
model IoTState {
  id              String        @id @default(cuid())
  facilityId      String
  deviceType      IoTDeviceType
  state           Json
  lastUpdated     DateTime      @default(now())
  batteryLevel    Int?
  isOnline        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  facility        Facility      @relation(fields: [facilityId], references: [id])

  @@index([facilityId])
  @@index([deviceType])
}

enum IoTDeviceType {
  LIGHT_CONTROLLER
  MOTION_SENSOR
  DOOR_LOCK
  THERMOSTAT
  METER
}
```

---

## API Endpoints

### Tee Times

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/golf/teetimes` | List available tee times |
| `POST` | `/api/golf/teetimes/book` | Book tee time |
| `GET` | `/api/golf/teetimes/my` | List user's bookings |
| `PUT` | `/api/golf/teetimes/:id` | Update booking |
| `DELETE` | `/api/golf/teetimes/:id` | Cancel booking |
| `POST` | `/api/golf/teetimes/:id/checkin` | Check-in |

### Facilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/golf/facilities` | List all facilities |
| `GET` | `/api/golf/facilities/:id` | Get facility details |
| `GET` | `/api/golf/facilities/:id/schedule` | Get facility schedule |
| `POST` | `/api/golf/facilities/:id/reserve` | Reserve facility |

### IoT Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/golf/iot/:facilityId` | Get IoT state |
| `PUT` | `/api/golf/iot/:facilityId/lights` | Control lights |
| `PUT` | `/api/golf/iot/:facilityId/lock` | Control locks |

---

## Tee Time Availability Algorithm

```typescript
async function getAvailableTeeTimes(
  date: Date,
  players: number
): Promise<TeeTimeSlot[]> {
  // Tee times are every 10 minutes from 7 AM to 5 PM
  const slots = [];
  const start = setHours(date, 7);
  const end = setHours(date, 17);

  for (let time = start; time < end; time += 10 minutes) {
    // Check if slot is available
    const booked = await prisma.reservation.count({
      where: {
        facility: { type: 'GOLF_COURSE' },
        startTime: time,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] }
      }
    });

    if (booked < 4) { // Max 4 players per tee time
      slots.push({
        time,
        availableSpots: 4 - booked,
        rate: calculateRate(time)
      });
    }
  }

  return slots;
}
```

---

## Pricing

### Golf Rates

| Time | Rate | Notes |
|------|------|-------|
| 7 AM - 12 PM | $120 | Prime time |
| 12 PM - 3 PM | $100 | Standard |
| 3 PM - Sunset | $80 | Twilight |
| Replay | $60 | Same day replay |

### Facility Rates

| Facility | Hourly | Daily |
|----------|--------|-------|
| Tennis | $20 | - |
| Pickleball | $15 | - |
| Gym | - | $10 |
| Spa | - | Per service |
| Pool | - | Free |

---

## Future Enhancements

- [ ] Golf pro shop integration
- [ ] Club rental booking
- [ ] Golf cart reservation
- [ ] Lesson booking with pros
- [ ] Tournament registration
- [ ] Handicap tracking
- [ ] League management

---

*Last updated: 2026-03-01*
