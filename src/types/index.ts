// ============================================================
// Core Types for Marvel Watchlist
// ============================================================

export type ContentType =
  | 'movie'
  | 'series'
  | 'animated-series'
  | 'special'
  | 'short';

export type Tier =
  | 'mcu'
  | 'x-men'
  | 'spider-man'
  | 'legacy'
  | 'tv'
  | 'animation';

export type ReleaseStatus = 'released' | 'upcoming' | 'announced';

export type WatchStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'skipped';

export type StreamingProviderType =
  | 'subscription'
  | 'rental'
  | 'purchase'
  | 'rent'
  | 'buy'
  | 'free'
  | 'unknown';

export type DoomsdayCategory =
  | 'essential'
  | 'recommended'
  | 'optional'
  | 'multiverse-context'
  | null;

export type OrderMode = 'release' | 'chronology';

export type PresetId =
  | 'complete-mcu'
  | 'mcu-movies-only'
  | 'mcu-phase-1-3'
  | 'marvel-multiverse'
  | 'all-major'
  | 'complete-catalog'
  | 'doomsday-prep';

// ============================================================
// Streaming
// ============================================================

export interface StreamingProvider {
  name: string;
  type: StreamingProviderType;
  url: string;
  verified: boolean;
  lastVerified: string;
}

export interface StreamingRecord {
  productionId: string;
  region: string;
  providers: StreamingProvider[];
}

// ============================================================
// Catalog
// ============================================================

export interface Production {
  id: string;
  title: string;
  alternativeTitles: string[];
  contentType: ContentType;
  tier: Tier;
  franchise: string;
  continuity: string;
  continuityNote: string | null;
  releaseDate: string | null;
  releaseDateVerified: boolean;
  releaseRegion: string;
  synopsis: string;
  runtimeMinutes: number | null;
  posterUrl: string;
  trailerUrl: string;
  ageRating: string | null;
  parentSeriesId: string | null;
  seasonNumber: number | null;
  episodeCount: number | null;
  isUpcoming: boolean;
  releaseStatus: ReleaseStatus;
  streamingAvailability: StreamingRecord[];
  tmdbId: number | null;
  imdbId: string | null;
  doomsdayCategory: DoomsdayCategory;
  inclusionCategories: string[];
  lastVerified: string;
}

// ============================================================
// User Progress
// ============================================================

export interface TitleProgress {
  status: WatchStatus;
  updatedAt: string;
  notes: string;
}

export interface UserPreferences {
  region: string;
  activePreset: PresetId;
  orderMode: OrderMode;
  showSkipped: boolean;
  showUpcoming: boolean;
  dataSaver?: boolean;
}

export interface UserProgress {
  version: number;
  lastUpdated: string;
  userId: string;
  watchProgress: Record<string, TitleProgress>;
  preferences: UserPreferences;
}

// ============================================================
// Filters
// ============================================================

export interface ActiveFilters {
  tiers: Tier[];
  contentTypes: ContentType[];
  statuses: WatchStatus[];
  franchises: string[];
  decades: [number, number] | null;
  streamingPlatforms: string[];
  doomsdayOnly: boolean;
  upcomingOnly: boolean;
  searchQuery: string;
}

// ============================================================
// Presets
// ============================================================

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  includes: Tier[];
  contentTypeFilter?: ContentType[];
  doomsdayOnly?: boolean;
}

// ============================================================
// Doomsday
// ============================================================

export interface DoomsdayRecommendation {
  productionId: string;
  category: NonNullable<DoomsdayCategory>;
  reason: string;
  status: 'editorial' | 'official' | 'speculative';
}

export interface DoomsdayCastMember {
  actor: string;
  role: string;
  confirmed: boolean;
  note?: string;
}

export interface DoomsdayData {
  filmInfo: {
    title: string;
    releaseDate: string;
    directors: string[];
    villain: string;
    villainActor: string;
    confirmedRuntime: number;
    runtimeVerified: boolean;
    sources: string[];
    disclosureBanner: string;
  };
  confirmedCast: DoomsdayCastMember[];
  unconfirmedCast: DoomsdayCastMember[];
  recommendations: DoomsdayRecommendation[];
}

// ============================================================
// Enriched (computed) types
// ============================================================

export interface EnrichedProduction extends Production {
  watchStatus: WatchStatus;
  computedStreamingAvailability: StreamingRecord | null;
}
