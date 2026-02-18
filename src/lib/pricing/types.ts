export type PricingTier = "early_bird" | "standard" | "last_minute";

export interface PricingTierInfo {
  /** Which tier is currently active */
  tier: PricingTier;
  /** The flat price for this tier (used when gendered pricing is off) */
  price: number;
  /** Male price (when gendered pricing is on) */
  priceMale: number | null;
  /** Female price (when gendered pricing is on) */
  priceFemale: number | null;
  /** Whether gendered pricing is active for this tier */
  isGendered: boolean;
  /** Original standard price (for strikethrough display) */
  standardPrice: number;
  /** Original standard male price (for gendered strikethrough) */
  standardPriceMale: number | null;
  /** Original standard female price (for gendered strikethrough) */
  standardPriceFemale: number | null;
  /** Currency code e.g. 'GBP', 'ILS' */
  currency: string;
  /** Early bird: deadline. Last minute: activation time. */
  tierBoundary: Date | null;
  /** Translation key for the tier label */
  labelKey: string;
  /** Percentage saved compared to standard price */
  savingsPercent: number;
  /** VIP price (flat) */
  vipPrice: number | null;
  /** VIP male price (when gendered) */
  vipPriceMale: number | null;
  /** VIP female price (when gendered) */
  vipPriceFemale: number | null;
}

export interface EventPricingConfig {
  // Standard pricing
  price: number | null;
  price_male: number | null;
  price_female: number | null;
  enable_gendered_price: boolean;
  currency: string | null;

  // VIP pricing
  vip_price: number | null;
  vip_price_male: number | null;
  vip_price_female: number | null;

  // Early bird
  early_bird_enabled: boolean;
  early_bird_price: number | null;
  early_bird_price_male: number | null;
  early_bird_price_female: number | null;
  early_bird_deadline: string | null;

  // Last minute
  last_minute_enabled: boolean;
  last_minute_price: number | null;
  last_minute_price_male: number | null;
  last_minute_price_female: number | null;
  last_minute_activation: string | null;
  last_minute_days_before: number | null;
  last_minute_mode: string | null;

  // Event timing (needed for days_before calculation)
  event_date: string;
  start_time: string | null;
}
