import { describe, expect, it } from "vitest";
import { quoteShelter } from "./shelter-rules.js";

const config = { hourlyMoneyCost: 10_000_000n, nineHourGoldCost: 90n };

describe("quoteShelter", () => {
  it("charges non-VIP players money for up to six hours", () => {
    expect(quoteShelter(6, false, config)).toEqual({
      currency: "MONEY",
      cost: 60_000_000n,
      durationHours: 6
    });
  });

  it("charges non-VIP players gold for exactly nine hours", () => {
    expect(quoteShelter(9, false, config).currency).toBe("GOLD");
  });

  it("rejects seven and eight hours for non-VIP players", () => {
    expect(() => quoteShelter(8, false, config)).toThrow();
  });

  it("allows VIP players to pay money without the normal limit", () => {
    expect(quoteShelter(48, true, config).cost).toBe(480_000_000n);
  });
});
