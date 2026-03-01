/**
 * Database Package - TDD Test Suite
 *
 * Test-Driven Development: RED phase
 * These tests define the expected behavior of Prisma schema and database operations
 * for Puerto Aventuras Super-App
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  PrismaClient,
  UserRole,
  PropertyType,
  VehicleType,
  VisitorStatus,
  WalletStatus,
  TransactionType,
  TransactionStatus,
  SlipSize,
  SlipStatus,
  BoatStatus,
  MarinaReservationStatus,
  FacilityType,
  FacilityStatus,
  ReservationStatus,
  RestaurantStatus,
  OrderStatus,
  OrderType,
} from './prisma';

describe('Prisma Client Initialization', () => {
  it('should create Prisma client instance', () => {
    const prisma = new PrismaClient();
    expect(prisma).toBeDefined();
    expect(prisma.user).toBeDefined();
    expect(prisma.property).toBeDefined();
    expect(prisma.vehicle).toBeDefined();
  });

  it('should connect to database', async () => {
    const prisma = new PrismaClient();
    await expect(prisma.$connect()).resolves.not.toThrow();
    await prisma.$disconnect();
  });
});

describe('User Model', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.user.deleteMany({});
  });

  it('should create user with required fields', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hash123',
        firstName: 'Juan',
        lastName: 'Perez',
        role: UserRole.RESIDENT,
      },
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.firstName).toBe('Juan');
    expect(user.role).toBe(UserRole.RESIDENT);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('should enforce unique email constraint', async () => {
    await prisma.user.create({
      data: {
        email: 'duplicate@example.com',
        passwordHash: 'hash123',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        role: UserRole.RESIDENT,
      },
    });

    await expect(
      prisma.user.create({
        data: {
          email: 'duplicate@example.com',
          passwordHash: 'hash456',
          firstName: 'Jose',
          lastName: 'Lopez',
          role: UserRole.RESIDENT,
        },
      })
    ).rejects.toThrow('Unique constraint');
  });

  it('should store encrypted PII fields', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'encrypted@example.com',
        passwordHash: 'hash123',
        firstName: 'Carlos',
        lastName: 'Sanchez',
        role: UserRole.RESIDENT,
        encryptedPhone: 'encrypted_phone_data',
        encryptedRfc: 'encrypted_rfc_data', // Mexican tax ID
      },
    });

    expect(user.encryptedPhone).toBe('encrypted_phone_data');
    expect(user.encryptedRfc).toBe('encrypted_rfc_data');
  });

  it('should handle user properties relationship', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'property@example.com',
        passwordHash: 'hash123',
        firstName: 'Ana',
        lastName: 'Martinez',
        role: UserRole.RESIDENT,
        properties: {
          create: [
            {
              type: PropertyType.VILLA,
              address: '123 Puerto Aventuras',
              encryptedOwnerName: 'encrypted_name',
            },
          ],
        },
      },
    });

    const userWithProperties = await prisma.user.findUnique({
      where: { id: user.id },
      include: { properties: true },
    });

    expect(userWithProperties?.properties).toHaveLength(1);
    expect(userWithProperties?.properties[0].type).toBe(PropertyType.VILLA);
  });
});

describe('Property Model', () => {
  let prisma: PrismaClient;
  let testUserId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const user = await prisma.user.create({
      data: {
        email: 'property-user@example.com',
        passwordHash: 'hash123',
        firstName: 'Luis',
        lastName: 'Rodriguez',
        role: UserRole.RESIDENT,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.property.deleteMany({});
  });

  it('should create property with required fields', async () => {
    const property = await prisma.property.create({
      data: {
        userId: testUserId,
        type: PropertyType.CONDO,
        address: '456 Marina Drive',
        encryptedOwnerName: 'encrypted_owner',
      },
    });

    expect(property).toBeDefined();
    expect(property.id).toBeDefined();
    expect(property.type).toBe(PropertyType.CONDO);
    expect(property.address).toBe('456 Marina Drive');
  });

  it('should handle property vehicles relationship', async () => {
    const property = await prisma.property.create({
      data: {
        userId: testUserId,
        type: PropertyType.VILLA,
        address: '789 Ocean View',
        encryptedOwnerName: 'encrypted_owner',
        vehicles: {
          create: [
            {
              licensePlate: 'ABC-123-4',
              type: VehicleType.CAR,
              brand: 'Toyota',
              model: 'Hilux',
              color: 'Blanco',
            },
          ],
        },
      },
    });

    const propertyWithVehicles = await prisma.property.findUnique({
      where: { id: property.id },
      include: { vehicles: true },
    });

    expect(propertyWithVehicles?.vehicles).toHaveLength(1);
    expect(propertyWithVehicles?.vehicles[0].licensePlate).toBe('ABC-123-4');
  });
});

describe('Vehicle Model', () => {
  let prisma: PrismaClient;
  let testPropertyId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const user = await prisma.user.create({
      data: {
        email: 'vehicle-user@example.com',
        passwordHash: 'hash123',
        firstName: 'Pedro',
        lastName: 'Garcia',
        role: UserRole.RESIDENT,
        properties: {
          create: {
            type: PropertyType.VILLA,
            address: 'Test Address',
            encryptedOwnerName: 'encrypted_owner',
          },
        },
      },
    });
    testPropertyId = user.properties[0].id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create vehicle with LPR data', async () => {
    const vehicle = await prisma.vehicle.create({
      data: {
        propertyId: testPropertyId,
        licensePlate: 'XYZ-987-6',
        type: VehicleType.SUV,
        brand: 'Nissan',
        model: 'Pathfinder',
        color: 'Negro',
        lprConfidence: 0.95,
      },
    });

    expect(vehicle).toBeDefined();
    expect(vehicle.licensePlate).toBe('XYZ-987-6');
    expect(vehicle.lprConfidence).toBe(0.95);
  });
});

describe('Visitor Model', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create visitor with QR code', async () => {
    const visitor = await prisma.visitor.create({
      data: {
        name: 'Roberto Diaz',
        encryptedPhone: 'encrypted_phone',
        hostName: 'Juan Perez',
        visitPurpose: 'Business',
        status: VisitorStatus.PENDING,
        qrCode: 'qr_data_base64',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    expect(visitor).toBeDefined();
    expect(visitor.qrCode).toBe('qr_data_base64');
    expect(visitor.status).toBe(VisitorStatus.PENDING);
  });

  it('should enforce QR code expiration', async () => {
    const pastDate = new Date(Date.now() - 3600000); // 1 hour ago

    await prisma.visitor.create({
      data: {
        name: 'Expired Visitor',
        encryptedPhone: 'encrypted_phone',
        hostName: 'Host',
        visitPurpose: 'Visit',
        status: VisitorStatus.ACTIVE,
        qrCode: 'expired_qr',
        validFrom: pastDate,
        validUntil: pastDate,
      },
    });

    const activeVisitors = await prisma.visitor.findMany({
      where: {
        status: VisitorStatus.ACTIVE,
        validUntil: { gte: new Date() },
      },
    });

    expect(activeVisitors).toHaveLength(0);
  });
});

describe('Wallet Model', () => {
  let prisma: PrismaClient;
  let testUserId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    const user = await prisma.user.create({
      data: {
        email: 'wallet-user@example.com',
        passwordHash: 'hash123',
        firstName: 'Diego',
        lastName: 'Torres',
        role: UserRole.RESIDENT,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create wallet with zero balance', async () => {
    const wallet = await prisma.wallet.create({
      data: {
        userId: testUserId,
        balance: 0,
        status: WalletStatus.ACTIVE,
      },
    });

    expect(wallet).toBeDefined();
    expect(wallet.balance).toBe(0);
    expect(wallet.status).toBe(WalletStatus.ACTIVE);
  });

  it('should handle wallet transactions', async () => {
    const wallet = await prisma.wallet.create({
      data: {
        userId: testUserId,
        balance: 1000,
        status: WalletStatus.ACTIVE,
        transactions: {
          create: {
            type: TransactionType.CREDIT,
            amount: 1000,
            description: 'Initial deposit',
            status: TransactionStatus.COMPLETED,
          },
        },
      },
    });

    const walletWithTransactions = await prisma.wallet.findUnique({
      where: { id: wallet.id },
      include: { transactions: true },
    });

    expect(walletWithTransactions?.transactions).toHaveLength(1);
    expect(walletWithTransactions?.transactions[0].amount).toBe(1000);
  });
});

describe('Marina Models', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create slip with inventory data', async () => {
    const slip = await prisma.slip.create({
      data: {
        number: 'A-001',
        size: SlipSize.LARGE_40FT,
        length: 12.5, // meters
        width: 4.5,
        depth: 2.5,
        status: SlipStatus.AVAILABLE,
        dailyRate: 150, // USD
        hasWater: true,
        hasElectricity: true,
        hasPumpOut: true,
      },
    });

    expect(slip).toBeDefined();
    expect(slip.number).toBe('A-001');
    expect(slip.size).toBe(SlipSize.LARGE_40FT);
    expect(slip.hasWater).toBe(true);
  });

  it('should create boat with registration', async () => {
    const boat = await prisma.boat.create({
      data: {
        name: 'La Perla',
        registrationNumber: 'PA-123-456',
        length: 12.0,
        beam: 4.2,
        draft: 1.8,
        status: BoatStatus.ACTIVE,
        encryptedOwnerName: 'encrypted_owner',
      },
    });

    expect(boat).toBeDefined();
    expect(boat.registrationNumber).toBe('PA-123-456');
  });

  it('should handle marina reservations', async () => {
    const slip = await prisma.slip.create({
      data: {
        number: 'B-002',
        size: SlipSize.MEDIUM_30FT,
        length: 10.0,
        width: 3.5,
        depth: 2.0,
        status: SlipStatus.AVAILABLE,
        dailyRate: 100,
        hasWater: true,
        hasElectricity: true,
        hasPumpOut: false,
      },
    });

    const boat = await prisma.boat.create({
      data: {
        name: 'El Azul',
        registrationNumber: 'PA-789-012',
        length: 10.0,
        beam: 3.5,
        draft: 1.5,
        status: BoatStatus.ACTIVE,
        encryptedOwnerName: 'encrypted_owner',
      },
    });

    const reservation = await prisma.marinaReservation.create({
      data: {
        slipId: slip.id,
        boatId: boat.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
        status: MarinaReservationStatus.CONFIRMED,
        totalAmount: 700, // 7 days * $100
      },
    });

    expect(reservation).toBeDefined();
    expect(reservation.totalAmount).toBe(700);
  });
});

describe('Golf & Sports Models', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create golf facility', async () => {
    const facility = await prisma.facility.create({
      data: {
        name: 'Golf Course - Hole 1',
        type: FacilityType.GOLF_TEE,
        status: FacilityStatus.ACTIVE,
        capacity: 4,
        hourlyRate: 50,
      },
    });

    expect(facility).toBeDefined();
    expect(facility.type).toBe(FacilityType.GOLF_TEE);
  });

  it('should handle facility reservations', async () => {
    const facility = await prisma.facility.create({
      data: {
        name: 'Tennis Court 1',
        type: FacilityType.TENNIS_COURT,
        status: FacilityStatus.ACTIVE,
        capacity: 4,
        hourlyRate: 30,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: 'golf-user@example.com',
        passwordHash: 'hash123',
        firstName: 'Rafael',
        lastName: 'Moreno',
        role: UserRole.RESIDENT,
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        facilityId: facility.id,
        userId: user.id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // 1 hour
        status: ReservationStatus.CONFIRMED,
        participants: 2,
      },
    });

    expect(reservation).toBeDefined();
    expect(reservation.participants).toBe(2);
  });
});

describe('Marketplace Models', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create restaurant with delivery settings', async () => {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'La Langosta Roja',
        description: 'Fine seafood dining',
        status: RestaurantStatus.OPEN,
        deliveryEnabled: true,
        deliveryFee: 5.0,
        minDeliveryAmount: 20.0,
        commissionRate: 0.15, // 15%
      },
    });

    expect(restaurant).toBeDefined();
    expect(restaurant.deliveryEnabled).toBe(true);
    expect(restaurant.commissionRate).toBe(0.15);
  });

  it('should handle restaurant orders with delivery tracking', async () => {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'El Pirata',
        description: 'Caribbean cuisine',
        status: RestaurantStatus.OPEN,
        deliveryEnabled: true,
        deliveryFee: 3.0,
        minDeliveryAmount: 15.0,
        commissionRate: 0.12,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: 'marketplace-user@example.com',
        passwordHash: 'hash123',
        firstName: 'Fernando',
        lastName: 'Castillo',
        role: UserRole.RESIDENT,
        wallet: {
          create: {
            balance: 500,
            status: WalletStatus.ACTIVE,
          },
        },
      },
    });

    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        userId: user.id,
        type: OrderType.DELIVERY,
        status: OrderStatus.PREPARING,
        subtotal: 50.0,
        deliveryFee: 3.0,
        commission: 6.0, // 12% of $50
        total: 59.0,
        deliveryAddress: '123 Puerto Aventuras',
      },
    });

    expect(order).toBeDefined();
    expect(order.type).toBe(OrderType.DELIVERY);
    expect(order.total).toBe(59.0);
  });
});

describe('Database Constraints and Indexes', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should enforce unique license plate constraint', async () => {
    await prisma.user.create({
      data: {
        email: 'license-test1@example.com',
        passwordHash: 'hash123',
        firstName: 'User1',
        lastName: 'Test',
        role: UserRole.RESIDENT,
        properties: {
          create: [
            {
              type: PropertyType.VILLA,
              address: 'Address 1',
              encryptedOwnerName: 'encrypted',
              vehicles: {
                create: {
                  licensePlate: 'SAME-PLATE',
                  type: VehicleType.CAR,
                  brand: 'Brand1',
                  model: 'Model1',
                  color: 'Color1',
                },
              },
            },
          ],
        },
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'license-test2@example.com',
        passwordHash: 'hash123',
        firstName: 'User2',
        lastName: 'Test',
        role: UserRole.RESIDENT,
        properties: {
          create: [
            {
              type: PropertyType.VILLA,
              address: 'Address 2',
              encryptedOwnerName: 'encrypted',
            },
          ],
        },
      },
    });

    await expect(
      prisma.vehicle.create({
        data: {
          propertyId: user2.properties[0].id,
          licensePlate: 'SAME-PLATE', // Duplicate!
          type: VehicleType.CAR,
          brand: 'Brand2',
          model: 'Model2',
          color: 'Color2',
        },
      })
    ).rejects.toThrow('Unique constraint');
  });

  it('should enforce unique slip number constraint', async () => {
    await prisma.slip.create({
      data: {
        number: 'DUPLICATE-001',
        size: SlipSize.SMALL_20FT,
        length: 6.5,
        width: 2.5,
        depth: 1.5,
        status: SlipStatus.AVAILABLE,
        dailyRate: 50,
        hasWater: false,
        hasElectricity: false,
        hasPumpOut: false,
      },
    });

    await expect(
      prisma.slip.create({
        data: {
          number: 'DUPLICATE-001', // Duplicate!
          size: SlipSize.MEDIUM_30FT,
          length: 9.5,
          width: 3.5,
          depth: 2.0,
          status: SlipStatus.AVAILABLE,
          dailyRate: 80,
          hasWater: true,
          hasElectricity: true,
          hasPumpOut: false,
        },
      })
    ).rejects.toThrow('Unique constraint');
  });
});

describe('LFPDPPP Compliance', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should store PII in encrypted fields', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'pii-test@example.com',
        passwordHash: 'hash123',
        firstName: 'Encrypted',
        lastName: 'User',
        role: UserRole.RESIDENT,
        encryptedPhone: 'encrypted: +52-984-123-4567',
        encryptedRfc: 'encrypted: ABCJ800101ABC',
        encryptedCurp: 'encrypted: ABCJ800101HDFRNN09',
      },
    });

    expect(user.encryptedPhone).toContain('encrypted:');
    expect(user.encryptedRfc).toContain('encrypted:');
    expect(user.encryptedCurp).toContain('encrypted:');
  });

  it('should support ARCO rights (delete)', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'arco-delete@example.com',
        passwordHash: 'hash123',
        firstName: 'Delete',
        lastName: 'Me',
        role: UserRole.RESIDENT,
      },
    });

    // ARCO: Cancellation (Delete) right
    await prisma.user.delete({
      where: { id: user.id },
    });

    const deletedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(deletedUser).toBeNull();
  });
});
