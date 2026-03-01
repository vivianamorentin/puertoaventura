# Security Module

Access control and visitor management for Puerto Aventuras.

---

## Overview

The Security module provides comprehensive access control through QR codes, License Plate Recognition (LPR), and visitor management.

---

## Features

### QR Code Access

Generate and validate QR codes for property access.

**Use Cases:**
- Resident access
- Visitor passes
- Temporary access
- Service provider entry

**Implementation:**
```typescript
import { generateQR, validateQR } from '@pa/security';

// Generate QR for visitor
const qrCode = await generateQR({
  visitorId: 'VIS-001',
  propertyId: 'PROP-001',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
});

// Validate QR at gate
const result = await validateQR(qrCode);
```

---

### License Plate Recognition (LPR)

Automated vehicle identification.

**Features:**
- Real-time plate detection
- Confidence scoring
- Vehicle logging
- Alert system

**Data Model:**
```typescript
interface Vehicle {
  id: string;
  propertyId: string;
  plateNumber: string;
  plateHash: string;        // For privacy
  make?: string;
  model?: string;
  color?: string;
  lprConfidence: number;    // 0-100
}
```

**LPR Workflow:**
```
1. Camera captures image
2. LPR service extracts plate
3. Hash plate for lookup
4. Match against registered vehicles
5. Log access event
6. Open gate if authorized
```

---

### Visitor Management

Complete visitor registration and tracking.

**Visitor Types:**
- **Guest** - Temporary visitor (< 24 hours)
- **Contractor** - Service provider (multi-day)
- **Delivery** - Delivery person (< 4 hours)
- **Permanent** - Long-term access

**Visitor Flow:**
```
1. Resident registers visitor via app
2. System generates QR code
3. Visitor shows QR at gate
4. System validates and grants access
5. Access logged for audit
```

---

## Database Schema

### Visitor Model

```prisma
model Visitor {
  id           String   @id @default(cuid())
  propertyId   String
  name         String
  phone        String?  @db.Text
  phoneHash    String   @unique
  type         VisitorType
  qrCode       String   @unique
  expiresAt    DateTime
  accessedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  property     Property @relation(fields: [propertyId], references: [id])

  @@index([propertyId])
  @@index([phoneHash])
}

enum VisitorType {
  GUEST
  CONTRACTOR
  DELIVERY
  PERMANENT
}
```

### Vehicle Model

```prisma
model Vehicle {
  id            String   @id @default(cuid())
  propertyId    String
  plateNumber   String?  @db.Text  // Encrypted
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

### AccessLog Model

```prisma
model AccessLog {
  id          String      @id @default(cuid())
  type        AccessType
  method      AccessMethod
  userId      String?
  visitorId   String?
  vehicleId   String?
  success     Boolean
  deniedReason String?
  timestamp   DateTime    @default(now())
  metadata    Json?

  user        User?      @relation(fields: [userId], references: [id])
  visitor     Visitor?   @relation(fields: [visitorId], references: [id])
  vehicle     Vehicle?   @relation(fields: [vehicleId], references: [id])

  @@index([timestamp])
  @@index([type])
}

enum AccessType {
  ENTRY
  EXIT
  DENIED
}

enum AccessMethod {
  QR_CODE
  LPR
  MANUAL
  KEYCARD
}
```

---

## API Endpoints

### QR Code Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/security/visitors` | Register visitor |
| `GET` | `/api/security/visitors/:id` | Get visitor details |
| `PUT` | `/api/security/visitors/:id` | Update visitor |
| `DELETE` | `/api/security/visitors/:id` | Cancel visitor |
| `POST` | `/api/security/qr/validate` | Validate QR code |

### Vehicle Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/security/vehicles` | Register vehicle |
| `GET` | `/api/security/vehicles` | List vehicles |
| `PUT` | `/api/security/vehicles/:id` | Update vehicle |
| `DELETE` | `/api/security/vehicles/:id` | Remove vehicle |
| `POST` | `/api/security/lpr/identify` | Identify vehicle by plate |

### Access Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/security/logs` | List access logs |
| `GET` | `/api/security/logs/:id` | Get log details |
| `GET` | `/api/security/properties/:id/logs` | Logs by property |

---

## Security Considerations

### QR Code Security

- **Expiration:** All QR codes have expiration time
- **One-time use:** Some QR codes are single-use
- **Encryption:** QR payload is encrypted
- **Rate limiting:** Prevent brute force attacks

### LPR Privacy

- **Plate hashing:** Plates are hashed for privacy
- **Confidence threshold:** Low confidence matches require manual review
- **Data retention:** Logs retained per policy (90 days)

### Access Control

- **Role-based:** Different access levels for different user roles
- **Time-based:** Access can be time-restricted
- **Location-based:** Some areas require additional permissions

---

## Testing

### Unit Tests

```typescript
describe('QR Code Generation', () => {
  it('should generate valid QR code', async () => {
    const qr = await generateQR({
      visitorId: 'VIS-001',
      propertyId: 'PROP-001',
      expiresAt: new Date(Date.now() + 3600000)
    });
    expect(qr).toMatch(/^QR-/);
  });
});

describe('QR Code Validation', () => {
  it('should validate unexpired QR code', async () => {
    const result = await validateQR(validQR);
    expect(result.valid).toBe(true);
  });

  it('should reject expired QR code', async () => {
    const result = await validateQR(expiredQR);
    expect(result.valid).toBe(false);
  });
});
```

---

## Future Enhancements

- [ ] Biometric authentication (fingerprint, face)
- [ ] Mobile app push notifications for visitors
- [ ] Integration with local authorities
- [ ] AI-powered anomaly detection
- [ ] Visitor pre-approval workflow

---

*Last updated: 2026-03-01*
