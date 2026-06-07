export type ShelterPayment = "MONEY" | "GOLD";

export interface ShelterQuote {
  currency: ShelterPayment;
  cost: bigint;
  durationHours: number;
}

export interface ShelterRuleConfig {
  hourlyMoneyCost: bigint;
  nineHourGoldCost: bigint;
}

export function quoteShelter(
  durationHours: number,
  isVip: boolean,
  config: ShelterRuleConfig
): ShelterQuote {
  if (!Number.isInteger(durationHours) || durationHours < 1) {
    throw new Error("Süre en az 1 tam saat olmalıdır.");
  }

  if (durationHours > 720) {
    throw new Error("Tek kiralama en fazla 720 saat olabilir.");
  }

  if (isVip) {
    return {
      currency: "MONEY",
      cost: config.hourlyMoneyCost * BigInt(durationHours),
      durationHours
    };
  }

  if (durationHours <= 6) {
    return {
      currency: "MONEY",
      cost: config.hourlyMoneyCost * BigInt(durationHours),
      durationHours
    };
  }

  if (durationHours === 9) {
    return {
      currency: "GOLD",
      cost: config.nineHourGoldCost,
      durationHours
    };
  }

  throw new Error("VIP olmayan oyuncular 1-6 saat para ile veya tam 9 saat altın ile kiralayabilir.");
}
