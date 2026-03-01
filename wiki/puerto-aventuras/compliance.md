# LFPDPPP Compliance Guide

Compliance with Mexican Federal Data Protection Law (LFPDPPP).

---

## Overview

The Puerto Aventuras Super-App complies with **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)**.

**Key Requirements:**
- ARCO rights
- PII encryption
- Data breach notification
- Consent management
- Data retention policies

---

## ARCO Rights

Users have the following rights under LFPDPPP:

### A - Acceso (Access)

Users can access their personal data.

**Implementation:**

```typescript
// API endpoint for data access
GET /api/user/data
Authorization: Bearer <token>

// Response includes all personal data
{
  "personalData": {
    "email": "user@example.com",
    "phone": "+52 998 123 4567",
    "rfc": "ABC123456XYZ",
    ...
  },
  "transactions": [...],
  "reservations": [...]
}
```

---

### R - Rectificación (Rectification)

Users can correct inaccurate data.

**Implementation:**

```typescript
// API endpoint for data correction
PUT /api/user/data
Authorization: Bearer <token>
Content-Type: application/json

{
  "field": "phone",
  "newValue": "+52 998 987 6543",
  "reason": "Changed phone number"
}

// System logs all changes with audit trail
await prisma.auditLog.create({
  data: {
    action: 'DATA_RECTIFIED',
    userId,
    field: 'phone',
    oldValue: encrypted(oldPhone),
    newValue: encrypted(newPhone),
    timestamp: new Date()
  }
});
```

---

### C - Cancelación (Cancellation)

Users can request deletion of their data.

**Implementation:**

```typescript
// API endpoint for data deletion
DELETE /api/user/account
Authorization: Bearer <token>

// Soft delete (anonymize data)
await prisma.user.update({
  where: { id: userId },
  data: {
    email: `deleted_${userId}@anon.com`,
    encryptedPhone: encrypt('DELETED', key),
    encryptedRfc: null,
    encryptedCurp: null,
    isActive: false,
    deletedAt: new Date()
  }
});

// Hard delete after 30 days (background job)
```

**Data Retention:**

| Data Type | Retention Period |
|-----------|-----------------|
| Account data | 30 days post-deletion |
| Transaction logs | 5 years (fiscal requirement) |
| Access logs | 90 days |
| Analytics data | 2 years (anonymized) |

---

### O - Oposición (Opposition)

Users can opt-out of data processing.

**Implementation:**

```typescript
// User preferences model
model UserPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  marketingOptIn        Boolean  @default(false)
  analyticsOptIn        Boolean  @default(true)
  dataSharingOptIn      Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// Opt-out of processing
await prisma.userPreferences.update({
  where: { userId },
  data: {
    analyticsOptIn: false,
    marketingOptIn: false
  }
});
```

---

## PII Encryption

### Encryption Standards

All PII is encrypted using **AES-256-CBC**:

```typescript
import { encrypt, decrypt, hashPII } from '@pa/crypto';

// Encryption
const encrypted = encrypt(phone, process.env.ENCRYPTION_KEY);

// Hashing (for searchable indexes)
const hash = hashPII(phone);

// Decryption
const decrypted = decrypt(encrypted, process.env.ENCRYPTION_KEY);
```

### Encrypted Fields

| Field | Purpose | Searchable Via |
|-------|---------|----------------|
| `encryptedPhone` | Phone number | `phoneHash` |
| `encryptedRfc` | Tax ID (RFC) | `rfcHash` |
| `encryptedCurp` | CURP ID | `curpHash` |
| `encryptedOwnerName` | Property owner | N/A (not searchable) |

### Key Management

**Encryption Key Requirements:**
- 64 hex characters (256 bits)
- Stored in environment variable `ENCRYPTION_KEY`
- Never committed to repository
- Rotated annually (recommended)

**Environment Setup:**

```bash
# Generate encryption key
openssl rand -hex 32

# Add to .env
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

---

## Consent Management

### Explicit Consent

Users must provide explicit consent before data collection.

**Implementation:**

```typescript
// Consent model
model Consent {
  id          String   @id @default(cuid())
  userId      String
  type        ConsentType
  granted     Boolean
  grantedAt   DateTime @default(now())
  revokedAt   DateTime?
  ipAddress   String?
  userAgent   String?
}

enum ConsentType {
  DATA_COLLECTION
  MARKETING
  ANALYTICS
  THIRD_PARTY_SHARING
}

// Require consent on registration
await prisma.consent.create({
  data: {
    userId,
    type: 'DATA_COLLECTION',
    granted: true,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }
});
```

### Consent Withdrawal

Users can withdraw consent at any time:

```typescript
// Withdraw consent
await prisma.consent.update({
  where: {
    userId_type: { userId, type: 'MARKETING' }
  },
  data: {
    granted: false,
    revokedAt: new Date()
  }
});

// Stop processing immediately
stopMarketingProcessing(userId);
```

---

## Data Breach Protocol

### Breach Notification

Data breaches must be reported within **72 hours** of discovery.

**Implementation:**

```typescript
// Breach model
model DataBreach {
  id              String   @id @default(cuid())
  type            BreachType
  severity        BreachSeverity
  affectedUsers   Int      @default(0)
  discoveredAt    DateTime @default(now())
  reportedAt      DateTime?
  resolvedAt      DateTime?
  description     String   @db.Text
  remediation     String   @db.Text
}

enum BreachType {
  UNAUTHORIZED_ACCESS
  DATA_EXFILTRATION
  RANSOMWARE
  INSIDER_THREAT
}

enum BreachSeverity {
  LOW      # < 100 users
  MEDIUM   # 100-1000 users
  HIGH     # 1000-10000 users
  CRITICAL # > 10000 users
}

// Breach reporting workflow
async function reportBreach(breach: BreachDetails) {
  // 1. Log breach
  const record = await prisma.dataBreach.create({
    data: {
      type: breach.type,
      severity: breach.severity,
      affectedUsers: breach.affectedUsers,
      description: breach.description
    }
  });

  // 2. Notify affected users
  for (const userId of breach.affectedUsers) {
    await notifyUser(userId, {
      type: 'DATA_BREACH',
      severity: breach.severity,
      description: breach.description
    });
  }

  // 3. Notify authorities (if severity >= MEDIUM)
  if (['MEDIUM', 'HIGH', 'CRITICAL'].includes(breach.severity)) {
    await notifyAuthorities(record);
  }

  // 4. Remediation
  await remediateBreach(record);
}
```

---

## Privacy Policy

### Required Elements

The privacy policy must include:

1. **Data Collection:** What data is collected and why
2. **Data Use:** How data is used
3. **Data Sharing:** Who data is shared with
4. **User Rights:** ARCO rights explanation
5. **Security Measures:** How data is protected
6. **Contact Information:** How to reach privacy officer

**Privacy Policy Location:**
- In-app: `/privacy`
- Web: `https://puertoaventuras.app/privacy`
- Email: `privacy@puertoaventuras.app`

---

## Audit Trail

All data access and modifications are logged:

```typescript
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      AuditAction
  resource    String
  resourceId  String?
  oldValue    Json?
  newValue    Json?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
}

enum AuditAction {
  DATA_ACCESSED
  DATA_CREATED
  DATA_UPDATED
  DATA_DELETED
  DATA_EXPORTED
  CONSENT_GRANTED
  CONSENT_REVOKED
}
```

**Audit Retention:** 5 years

---

## Data Subject Requests (DSR)

Users can submit DSRs via:

1. **In-App:** Settings → Privacy → Submit Request
2. **Email:** `privacy@puertoaventuras.app`
3. **Mail:** Puerto Aventuras, Privacy Office, Quintana Roo, Mexico

**Response Times:**

| Request Type | Response Time |
|-------------|---------------|
| Access | 20 business days |
| Rectification | 15 business days |
| Cancellation | 20 business days |
| Opposition | 15 business days |

---

## International Data Transfers

No international data transfers occur. All data is stored in Mexico-based servers.

---

## Third-Party Processors

All third parties must sign **Data Processing Agreements (DPA)**:

| Service | Data Processed | DPA Required |
|---------|---------------|--------------|
| Payment Gateway | Payment data only | Yes |
| Email Service | Email addresses | Yes |
| SMS Provider | Phone numbers | Yes |
| Analytics | Anonymized data only | Yes |

---

## Compliance Checklist

- [x] ARCO rights implemented
- [x] PII encryption (AES-256)
- [x] Consent management
- [x] Data breach protocol
- [x] Audit trail
- [x] Privacy policy
- [x] Data retention policy
- [x] Third-party DPAs
- [x] DSR processing
- [x] Local data storage

---

## References

- [LFPDPPP Official Text](https://www.dof.gob.mx/nota_detalle.php?codigo=5150631&fecha=05/07/2010)
- [INAI Guidelines](https://www.inai.org.mx/)
- [Privacy Policy](https://puertoaventuras.app/privacy)

---

*Last updated: 2026-03-01*
