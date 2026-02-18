import type { EventPricingConfig, PricingTierInfo } from "./types";

/**
 * Determines the currently active pricing tier for an event.
 *
 * Timeline: early_bird → standard → last_minute → event starts
 *
 * @param event - The event's pricing configuration fields
 * @param now - Current time (pass explicitly for testability)
 */
export function getActivePricingTier(
  event: EventPricingConfig,
  now: Date = new Date()
): PricingTierInfo {
  const standardPrice = event.price ?? 0;
  const currency = event.currency ?? "GBP";
  const gendered = event.enable_gendered_price;
  const standardPriceMale = gendered ? (event.price_male ?? null) : null;
  const standardPriceFemale = gendered ? (event.price_female ?? null) : null;

  // VIP pricing (passed through on every tier)
  const vipPrice = event.vip_price ?? null;
  const vipPriceMale = gendered ? (event.vip_price_male ?? null) : null;
  const vipPriceFemale = gendered ? (event.vip_price_female ?? null) : null;

  // Check early bird (chronologically first)
  const hasEarlyBirdPrice = event.early_bird_price != null ||
    (gendered && event.early_bird_price_male != null && event.early_bird_price_female != null);
  if (
    event.early_bird_enabled &&
    hasEarlyBirdPrice &&
    event.early_bird_deadline
  ) {
    const deadline = new Date(event.early_bird_deadline);
    if (now < deadline) {
      const tierPriceMale = gendered ? (event.early_bird_price_male ?? null) : null;
      const tierPriceFemale = gendered ? (event.early_bird_price_female ?? null) : null;
      const hasGenderedTier = gendered && tierPriceMale != null && tierPriceFemale != null;

      return {
        tier: "early_bird",
        price: event.early_bird_price ?? 0,
        priceMale: tierPriceMale,
        priceFemale: tierPriceFemale,
        isGendered: hasGenderedTier,
        standardPrice,
        standardPriceMale,
        standardPriceFemale,
        currency,
        tierBoundary: deadline,
        labelKey: "events.pricing_early_bird",
        savingsPercent: hasGenderedTier
          ? calcGenderedSavings(standardPriceMale, standardPriceFemale, tierPriceMale, tierPriceFemale)
          : calcSavings(standardPrice, event.early_bird_price ?? 0),
        vipPrice,
        vipPriceMale,
        vipPriceFemale,
      };
    }
  }

  // Resolve last minute activation time
  const lastMinuteActivation = resolveLastMinuteActivation(event);

  // Check last minute
  const hasLastMinutePrice = event.last_minute_price != null ||
    (gendered && event.last_minute_price_male != null && event.last_minute_price_female != null);
  if (
    event.last_minute_enabled &&
    hasLastMinutePrice &&
    lastMinuteActivation &&
    now >= lastMinuteActivation
  ) {
    const tierPriceMale = gendered ? (event.last_minute_price_male ?? null) : null;
    const tierPriceFemale = gendered ? (event.last_minute_price_female ?? null) : null;
    const hasGenderedTier = gendered && tierPriceMale != null && tierPriceFemale != null;

    return {
      tier: "last_minute",
      price: event.last_minute_price ?? 0,
      priceMale: tierPriceMale,
      priceFemale: tierPriceFemale,
      isGendered: hasGenderedTier,
      standardPrice,
      standardPriceMale,
      standardPriceFemale,
      currency,
      tierBoundary: lastMinuteActivation,
      labelKey: "events.pricing_last_minute",
      savingsPercent: hasGenderedTier
        ? calcGenderedSavings(standardPriceMale, standardPriceFemale, tierPriceMale, tierPriceFemale)
        : calcSavings(standardPrice, event.last_minute_price ?? 0),
      vipPrice,
      vipPriceMale,
      vipPriceFemale,
    };
  }

  // Standard pricing
  const hasGenderedStandard = gendered && standardPriceMale != null && standardPriceFemale != null;

  return {
    tier: "standard",
    price: standardPrice,
    priceMale: standardPriceMale,
    priceFemale: standardPriceFemale,
    isGendered: hasGenderedStandard,
    standardPrice,
    standardPriceMale,
    standardPriceFemale,
    currency,
    tierBoundary: null,
    labelKey: "events.pricing_standard",
    savingsPercent: 0,
    vipPrice,
    vipPriceMale,
    vipPriceFemale,
  };
}

function resolveLastMinuteActivation(
  event: EventPricingConfig
): Date | null {
  if (!event.last_minute_enabled) return null;

  if (
    event.last_minute_mode === "days_before" &&
    event.last_minute_days_before != null
  ) {
    const eventStart = new Date(
      `${event.event_date}T${event.start_time || "00:00"}`
    );
    return new Date(
      eventStart.getTime() - event.last_minute_days_before * 24 * 60 * 60 * 1000
    );
  }

  if (event.last_minute_activation) {
    return new Date(event.last_minute_activation);
  }

  return null;
}

function calcSavings(standard: number, discounted: number): number {
  if (standard <= 0 || discounted >= standard) return 0;
  return Math.round(((standard - discounted) / standard) * 100);
}

/** Average savings across male + female prices */
function calcGenderedSavings(
  stdMale: number | null,
  stdFemale: number | null,
  discMale: number | null,
  discFemale: number | null
): number {
  const savM = stdMale && discMale ? calcSavings(stdMale, discMale) : 0;
  const savF = stdFemale && discFemale ? calcSavings(stdFemale, discFemale) : 0;
  if (savM && savF) return Math.round((savM + savF) / 2);
  return savM || savF;
}
