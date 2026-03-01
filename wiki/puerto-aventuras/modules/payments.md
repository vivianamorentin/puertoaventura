# Payments Module

Digital wallet and transaction management.

---

## Overview

The Payments module provides a comprehensive digital wallet system for managing balances, loyalty points, and processing transactions across all services.

---

## Features

### Digital Wallet

Each user has a digital wallet with multiple balance types.

**Wallet Components:**

| Balance Type | Description | Usage |
|--------------|-------------|-------|
| **Cash Balance** | Real money loaded | All payments |
| **Promotional Balance** | Credits received | Cannot withdraw |
| **Loyalty Points** | Reward points | Redeem for services |

**Wallet Features:**
- Add funds via credit card, bank transfer
- View transaction history
- Transfer between users
- Automatic reload options
- Low balance alerts

---

### Loyalty Program

Earn and redeem loyalty points.

**Earning Points:**

| Activity | Points |
|----------|--------|
| $1 spent | 1 point |
| Marina reservation | 5 points per $1 |
| Golf tee time | 3 points per $1 |
| Restaurant order | 2 points per $1 |
| Referring new user | 500 points |

**Redeeming Points:**

| Redemption | Points | Value |
|------------|--------|-------|
| $1 discount | 100 points | $1.00 |
| Free marina day | 5,000 points | $50 |
| Free round of golf | 3,000 points | $120 |
| $10 restaurant credit | 800 points | $10 |

---

### Transaction Types

Multiple transaction types supported.

| Type | Description | Impact on Wallet |
|------|-------------|-----------------|
| **Credit** | Add funds to wallet | +Balance |
| **Debit** | Payment for service | -Balance |
| **Refund** | Return funds | +Balance |
| **Loyalty Earned** | Points earned | +Points |
| **Loyalty Redeemed** | Points used | -Points, +Balance |
| **Transfer** | Send to another user | -Balance sender, +Balance receiver |
| **Expiration** | Promo balance expired | -Promo Balance |

---

## Database Schema

### Wallet Model

```prisma
model Wallet {
  id                  String   @id @default(cuid())
  userId              String   @unique
  cashBalance         Decimal  @default(0) @db.Decimal(12, 2)
  promotionalBalance  Decimal  @default(0) @db.Decimal(12, 2)
  loyaltyPoints       Int      @default(0)
  promoExpiration     DateTime?
  autoReloadAmount    Decimal? @db.Decimal(10, 2)
  autoReloadThreshold Decimal? @db.Decimal(10, 2)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user                User     @relation(fields: [userId], references: [id])
  transactions        Transaction[]
  sentTransfers       Transfer[] @relation("TransferSender")
  receivedTransfers   Transfer[] @relation("TransferReceiver")

  @@index([userId])
}
```

### Transaction Model

```prisma
model Transaction {
  id              String          @id @default(cuid())
  walletId        String
  type            TransactionType
  amount          Decimal         @db.Decimal(12, 2)
  balanceBefore   Decimal         @db.Decimal(12, 2)
  balanceAfter    Decimal         @db.Decimal(12, 2)
  pointsBefore    Int?
  pointsAfter     Int?
  description     String
  metadata        Json?
  status          TransactionStatus @default(COMPLETED)
  createdAt       DateTime        @default(now())

  wallet          Wallet          @relation(fields: [walletId], references: [id])

  @@index([walletId])
  @@index([type])
  @@index([createdAt])
  @@index([status])
}

enum TransactionType {
  CREDIT
  DEBIT
  REFUND
  LOYALTY_EARNED
  LOYALTY_REDEEMED
  TRANSFER_SENT
  TRANSFER_RECEIVED
  PROMO_EXPIRED
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}
```

### Transfer Model

```prisma
model Transfer {
  id              String        @id @default(cuid())
  senderWalletId  String
  receiverWalletId String
  amount          Decimal       @db.Decimal(12, 2)
  message         String?       @db.Text
  status          TransferStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  completedAt     DateTime?

  senderWallet    Wallet        @relation("TransferSender", fields: [senderWalletId], references: [id])
  receiverWallet  Wallet        @relation("TransferReceiver", fields: [receiverWalletId], references: [id])

  @@index([senderWalletId])
  @@index([receiverWalletId])
  @@index([status])
}

enum TransferStatus {
  PENDING
  COMPLETED
  CANCELLED
  FAILED
}
```

### PaymentMethod Model

```prisma
model PaymentMethod {
  id              String          @id @default(cuid())
  userId          String
  type            PaymentMethodType
  provider        String          // 'stripe', 'paypal', etc.
  providerToken   String          @db.Text
  isDefault       Boolean         @default(false)
  last4           String?
  expiryMonth     Int?
  expiryYear      Int?
  isActive        Boolean         @default(true)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([userId])
  @@index([isDefault])
}

enum PaymentMethodType {
  CREDIT_CARD
  DEBIT_CARD
  BANK_ACCOUNT
}
```

---

## API Endpoints

### Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments/wallet` | Get wallet details |
| `GET` | `/api/payments/wallet/transactions` | Get transaction history |
| `POST` | `/api/payments/wallet/add-funds` | Add funds to wallet |
| `POST` | `/api/payments/wallet/redeem-points` | Redeem loyalty points |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/charge` | Process payment |
| `POST` | `/api/payments/refund` | Process refund |
| `GET` | `/api/payments/:id` | Get payment details |

### Transfers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/transfers` | Send money to user |
| `GET` | `/api/payments/transfers` | List transfers |
| `POST` | `/api/payments/transfers/:id/cancel` | Cancel transfer |

### Payment Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments/methods` | List payment methods |
| `POST` | `/api/payments/methods` | Add payment method |
| `PUT` | `/api/payments/methods/:id/default` | Set default method |
| `DELETE` | `/api/payments/methods/:id` | Remove payment method |

---

## Payment Flow

### Adding Funds

```typescript
async function addFunds(userId: string, amount: Decimal, paymentMethodId: string) {
  // 1. Validate payment method
  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      userId,
      isActive: true
    }
  });

  if (!paymentMethod) {
    throw new Error('Invalid payment method');
  }

  // 2. Process with payment provider
  const charge = await stripeService.charge(
    paymentMethod.providerToken,
    amount
  );

  if (!charge.success) {
    throw new Error('Payment failed');
  }

  // 3. Update wallet
  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  const updated = await prisma.wallet.update({
    where: { userId },
    data: {
      cashBalance: { increment: amount }
    }
  });

  // 4. Record transaction
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: 'CREDIT',
      amount,
      balanceBefore: wallet.cashBalance,
      balanceAfter: updated.cashBalance,
      description: 'Funds added via card ending in ' + paymentMethod.last4,
      status: 'COMPLETED'
    }
  });

  // 5. Award loyalty points (1 point per $1)
  await awardLoyaltyPoints(userId, Number(amount) * 1);

  return updated;
}
```

### Processing Payment

```typescript
async function processPayment(userId: string, amount: Decimal, description: string) {
  // 1. Get wallet
  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // 2. Check sufficient funds (cash + promo)
  const totalBalance = wallet.cashBalance.plus(wallet.promotionalBalance);
  if (totalBalance.lessThan(amount)) {
    throw new Error('Insufficient funds');
  }

  // 3. Determine balance deduction order
  let cashDeduction = amount;
  let promoDeduction = new Decimal(0);

  if (wallet.promotionalBalance.gt(0)) {
    if (wallet.promotionalBalance.greaterThanOrEqualTo(amount)) {
      promoDeduction = amount;
      cashDeduction = new Decimal(0);
    } else {
      promoDeduction = wallet.promotionalBalance;
      cashDeduction = amount.minus(wallet.promotionalBalance);
    }
  }

  // 4. Update wallet
  const updated = await prisma.wallet.update({
    where: { userId },
    data: {
      cashBalance: { decrement: cashDeduction },
      promotionalBalance: { decrement: promoDeduction }
    }
  });

  // 5. Record transaction
  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: 'DEBIT',
      amount,
      balanceBefore: wallet.cashBalance,
      balanceAfter: updated.cashBalance,
      description,
      status: 'COMPLETED'
    }
  });

  // 6. Award loyalty points
  await awardLoyaltyPoints(userId, Number(amount) * 2); // 2 points per $1

  return { wallet: updated, cashDeduction, promoDeduction };
}
```

---

## Loyalty Points System

### Awarding Points

```typescript
async function awardLoyaltyPoints(userId: string, points: number) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  const updated = await prisma.wallet.update({
    where: { userId },
    data: {
      loyaltyPoints: { increment: points }
    }
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: 'LOYALTY_EARNED',
      amount: points,
      balanceBefore: wallet.loyaltyPoints,
      balanceAfter: updated.loyaltyPoints,
      description: `Earned ${points} loyalty points`,
      pointsBefore: wallet.loyaltyPoints,
      pointsAfter: updated.loyaltyPoints,
      status: 'COMPLETED'
    }
  });

  return updated;
}
```

### Redeeming Points

```typescript
async function redeemLoyaltyPoints(userId: string, points: number) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  });

  if (wallet.loyaltyPoints < points) {
    throw new Error('Insufficient loyalty points');
  }

  // Redemption rate: 100 points = $1
  const creditAmount = new Decimal(points).div(100);

  const updated = await prisma.wallet.update({
    where: { userId },
    data: {
      loyaltyPoints: { decrement: points },
      promotionalBalance: { increment: creditAmount }
    }
  });

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: 'LOYALTY_REDEEMED',
      amount: creditAmount,
      balanceBefore: wallet.promotionalBalance,
      balanceAfter: updated.promotionalBalance,
      description: `Redeemed ${points} points for $${creditAmount}`,
      pointsBefore: wallet.loyaltyPoints,
      pointsAfter: updated.loyaltyPoints,
      status: 'COMPLETED'
    }
  });

  return updated;
}
```

---

## Security & Compliance

### PCI DSS Compliance

- All card data tokenized via payment provider
- No card data stored in database
- Provider tokens only stored
- PCI-compliant payment flows

### Financial Controls

- All transactions immutable
- Audit trail for every transaction
- Reconciliation processes
- Fraud detection alerts

### LFPDPPP Compliance

- Transaction history accessible (ARCO rights)
- Data export capability
- Data retention policies
- Secure deletion process

---

## Future Enhancements

- [ ] Recurring payments
- [ ] Scheduled transfers
- [ ] Multi-currency support
- [ ] Payment request feature
- [ ] Split payments
- [ ] Transaction categories and budgets
- [ ] Monthly statements
- [ ] Integration with local banking

---

*Last updated: 2026-03-01*
