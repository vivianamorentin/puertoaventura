/**
 * Discovery Package - Type Definitions
 *
 * Type definitions for the Discovery module including places,
 * gamification, and monetization features.
 */

import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Numeric type that accepts both JavaScript numbers and Prisma Decimals
 */
export type PrismaNumeric = number | Decimal;

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Check-in visibility levels
 */
export enum CheckInVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

/**
 * Badge rarity levels affecting display priority
 */
export enum BadgeRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * Badge unlock requirement types
 */
export enum BadgeRequirement {
  FIRST_CHECK_IN = 'FIRST_CHECK_IN',
  CHECK_INS_10 = 'CHECK_INS_10',
  CHECK_INS_50 = 'CHECK_INS_50',
  CHECK_INS_100 = 'CHECK_INS_100',
  REVIEWS_5 = 'REVIEWS_5',
  REVIEWS_20 = 'REVIEWS_20',
  STREAK_7 = 'STREAK_7',
  STREAK_30 = 'STREAK_30',
  PLACES_DISCOVERED_20 = 'PLACES_DISCOVERED_20',
  EXPLORE_ALL_CATEGORIES = 'EXPLORE_ALL_CATEGORIES',
}

/**
 * Challenge types
 */
export enum ChallengeType {
  CHECK_IN_AT_PLACES = 'CHECK_IN_AT_PLACES',
  EXPLORE_CATEGORY = 'EXPLORE_CATEGORY',
  BRING_FRIENDS = 'BRING_FRIENDS',
  WEEKLY_WARRIOR = 'WEEKLY_WARRIOR',
  REVIEW_MASTER = 'REVIEW_MASTER',
}

/**
 * Leaderboard time periods
 */
export enum LeaderboardPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
}

/**
 * Membership tiers for businesses
 */
export enum MembershipTier {
  BASIC = 'BASIC',         // $29/mes - 1 lugar promovido
  PROFESSIONAL = 'PROFESSIONAL', // $79/mes - 5 lugares, 2 anuncios
  PREMIUM = 'PREMIUM',     // $199/mes - 15 lugares, 10 anuncios
  ENTERPRISE = 'ENTERPRISE', // Custom - ilimitado
}

/**
 * Billing cycle options
 */
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
}

/**
 * Membership status
 */
export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Advertisement types
 */
export enum AdType {
  SPONSORED_LISTING = 'SPONSORED_LISTING', // Top de resultados
  FEATURED_PLACE = 'FEATURED_PLACE',       // Pin destacado en mapa
  BANNER_AD = 'BANNER_AD',                 // Banner en app
  PROMOTED_PIN = 'PROMOTED_PIN',           // Marcador más grande
}

/**
 * Advertisement status
 */
export enum AdStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED',
}

// ============================================================================
// PLACE TYPES
// ============================================================================

/**
 * Place creation input
 */
export interface CreatePlaceInput {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address: string;
  building?: string;
  floor?: string;
  categoryId: string;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  imageUrl?: string;
  images?: string;
  verified?: boolean;
}

/**
 * Place update input
 */
export interface UpdatePlaceInput {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  building?: string;
  floor?: string;
  categoryId?: string;
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: string;
  imageUrl?: string;
  images?: string;
  verified?: boolean;
  active?: boolean;
  promotedUntil?: Date;
  featuredPriority?: number;
}

/**
 * Place filters for search
 */
export interface PlaceFilters {
  categoryId?: string;
  active?: boolean;
  verified?: boolean;
  promoted?: boolean;
  minRating?: number;
  searchQuery?: string;
  radiusMeters?: number;
  latitude?: number;
  longitude?: number;
  limit?: number;
  offset?: number;
}

/**
 * Place with distance from user
 */
export interface PlaceWithDistance {
  id: string;
  name: string;
  description: string | null;
  latitude: PrismaNumeric;
  longitude: PrismaNumeric;
  address: string;
  building: string | null;
  floor: string | null;
  categoryId: string;
  category: PlaceCategoryData;
  phone: string | null;
  website: string | null;
  email: string | null;
  openingHours: string | null;
  imageUrl: string | null;
  images: string | null;
  verified: boolean;
  active: boolean;
  promotedUntil: Date | null;
  featuredPriority: number;
  totalCheckIns: number;
  totalReviews: number;
  averageRating: PrismaNumeric | null;
  createdAt: Date;
  updatedAt: Date;
  distance?: number; // in meters
}

/**
 * Minimal place data for lists
 */
export interface PlaceSummary {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  categoryId: string;
  category: PlaceCategoryData;
  imageUrl: string | null;
  verified: boolean;
  totalCheckIns: number;
  totalReviews: number;
  averageRating: number | null;
}

/**
 * Place category data
 */
export interface PlaceCategoryData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  displayOrder: number;
  visible: boolean;
}

/**
 * Category creation input
 */
export interface CreateCategoryInput {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  displayOrder?: number;
  visible?: boolean;
}

/**
 * Category update input
 */
export interface UpdateCategoryInput {
  displayName?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  displayOrder?: number;
  visible?: boolean;
}

/**
 * Hierarchical category tree node
 */
export interface CategoryTreeNode extends PlaceCategoryData {
  children: CategoryTreeNode[];
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

/**
 * Review creation input
 */
export interface CreateReviewInput {
  placeId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
  images?: string;
}

/**
 * Review update input
 */
export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
  images?: string;
}

/**
 * Review with user and place data
 */
export interface ReviewWithDetails {
  id: string;
  placeId: string;
  userId: string;
  rating: number;
  title: string | null;
  content: string;
  images: string | null;
  flagged: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  place: {
    id: string;
    name: string;
  };
}

// ============================================================================
// CHECK-IN TYPES
// ============================================================================

/**
 * Check-in creation input
 */
export interface CreateCheckInInput {
  placeId: string;
  userId: string;
  verifiedLatitude?: number;
  verifiedLongitude?: number;
  accuracy?: number;
  message?: string;
  photos?: string;
  visibility?: CheckInVisibility;
}

/**
 * Check-in with user and place data
 */
export interface CheckInWithDetails {
  id: string;
  placeId: string;
  userId: string;
  verifiedLatitude: number | null;
  verifiedLongitude: number | null;
  accuracy: number | null;
  message: string | null;
  photos: string | null;
  visibility: CheckInVisibility;
  pointsEarned: number;
  badgeUnlocked: string | null;
  likes: number;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  place: {
    id: string;
    name: string;
    address: string;
  };
}

/**
 * GPS verification result
 */
export interface GPSVerificationResult {
  verified: boolean;
  distanceMeters: number;
  withinThreshold: boolean;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

/**
 * User gamification profile
 */
export interface UserGamificationProfile {
  id: string;
  userId: string;
  totalPoints: number;
  currentLevel: number;
  pointsToNext: number;
  totalCheckIns: number;
  totalReviews: number;
  placesDiscovered: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Badge data
 */
export interface BadgeData {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string | null;
  rarity: BadgeRarity;
  requirementType: BadgeRequirement;
  requirementValue: number;
  pointsReward: number;
  exclusiveAccess: boolean;
  createdAt: Date;
}

/**
 * User badge with progress
 */
export interface UserBadgeWithDetails {
  id: string;
  userId: string;
  badgeId: string;
  gamificationId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt: Date | null;
  createdAt: Date;
  badge: BadgeData;
}

/**
 * Badge eligibility result
 */
export interface BadgeEligibilityResult {
  eligible: boolean;
  currentProgress: number;
  requiredValue: number;
  remaining: number;
}

/**
 * Points calculation result
 */
export interface PointsCalculationResult {
  pointsEarned: number;
  totalPoints: number;
  levelUp: boolean;
  newLevel?: number;
  badgesUnlocked: string[];
}

/**
 * Level calculation result
 */
export interface LevelInfo {
  level: number;
  title: string;
  currentPoints: number;
  pointsToNext: number;
  progress: number; // 0-100
}

/**
 * Challenge data
 */
export interface ChallengeData {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  startDate: Date;
  endDate: Date;
  pointsReward: number;
  badgeReward: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  active: boolean;
  createdAt: Date;
}

/**
 * Challenge creation input
 */
export interface CreateChallengeInput {
  name: string;
  description: string;
  type: ChallengeType;
  startDate: Date;
  endDate: Date;
  pointsReward: number;
  badgeReward?: string;
  maxParticipants?: number;
  placeIds?: string[];
}

/**
 * Challenge progress
 */
export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  progress: number;
  completed: boolean;
  completedAt: Date | null;
  challenge: ChallengeData;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
}

/**
 * Leaderboard data
 */
export interface LeaderboardData {
  id: string;
  period: LeaderboardPeriod;
  startDate: Date;
  endDate: Date | null;
  rankings: LeaderboardEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MONETIZATION TYPES
// ============================================================================

/**
 * Business membership data
 */
export interface BusinessMembershipData {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  tier: MembershipTier;
  billingCycle: BillingCycle;
  price: PrismaNumeric;
  status: MembershipStatus;
  startDate: Date;
  endDate: Date | null;
  promotedPlacesCount: number;
  adsAllowedCount: number;
  analyticsAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Membership creation input
 */
export interface CreateMembershipInput {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  tier: MembershipTier;
  billingCycle: BillingCycle;
  price: number;
  startDate: Date;
  endDate?: Date;
}

/**
 * Membership limits based on tier
 */
export interface MembershipLimits {
  promotedPlaces: number;
  adsAllowed: number;
  analyticsAccess: boolean;
}

/**
 * Place advertisement data
 */
export interface PlaceAdData {
  id: string;
  placeId: string;
  membershipId: string | null;
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string | null;
  adType: AdType;
  priority: number;
  dailyBudget: number | null;
  startDate: Date;
  endDate: Date | null;
  impressions: number;
  clicks: number;
  conversions: number;
  status: AdStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ad creation input
 */
export interface CreateAdInput {
  placeId: string;
  membershipId?: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  adType: AdType;
  priority?: number;
  dailyBudget?: number;
  startDate: Date;
  endDate?: Date;
}

/**
 * Ad update input
 */
export interface UpdateAdInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  priority?: number;
  dailyBudget?: number;
  endDate?: Date;
  status?: AdStatus;
}

/**
 * Ad metrics
 */
export interface AdMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  cpa: number; // Cost per action/conversion
  spend: number;
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

/**
 * Search options
 */
export interface SearchOptions {
  query?: string;
  categoryId?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  minRating?: number;
  verified?: boolean;
  promoted?: boolean;
  sortBy?: SearchSortBy;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Sort options for search
 */
export enum SearchSortBy {
  DISTANCE = 'distance',
  RATING = 'rating',
  NAME = 'name',
  CHECK_INS = 'checkIns',
  REVIEWS = 'reviews',
  PROMOTED = 'promoted',
}

/**
 * Search results with pagination
 */
export interface SearchResults {
  places: PlaceWithDistance[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Discovery error class
 */
export class DiscoveryError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'DiscoveryError';
    if (code !== undefined) {
      this.code = code;
    }
  }
}

/**
 * Gamification error class
 */
export class GamificationError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'GamificationError';
    if (code !== undefined) {
      this.code = code;
    }
  }
}

/**
 * Monetization error class
 */
export class MonetizationError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'MonetizationError';
    if (code !== undefined) {
      this.code = code;
    }
  }
}
