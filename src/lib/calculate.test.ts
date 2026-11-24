// Acceptance tests from the spec. Expected wording is written out here on
// purpose (not imported from copy.ts) so a typo in the app's copy fails a test.

import { describe, expect, it } from "vitest";
import {
  calculate,
  formatDuration,
  formatMoney,
  getDisplayEstimate,
  type CalculatorInputs,
} from "./calculate";
import { defaultRawValues, getResultsView, parseField, fieldRules, type RawValues } from "./validate";

const POSITIVE =
  "Based on your inputs, the estimated time value exceeds the annual subscription cost.";
const ZERO = "Based on your inputs, the estimated time value equals the annual subscription cost.";
const NEGATIVE =
  "Based on your inputs, the estimated time value does not cover the annual subscription cost.";

/** Inputs in the spec table's order: gifts, usual, ToyMatch, $/hr, extra min, sub. */
function inputs(
  giftOccasions: number,
  usualMinutes: number,
  toyMatchMinutes: number,
  hourlyValue: number | null,
  additionalAnnualMinutes: number,
  subscriptionCost: number,
): CalculatorInputs {
  return {
    giftOccasions,
    usualMinutes,
    toyMatchMinutes,
    hourlyValue,
    additionalAnnualMinutes,
    subscriptionCost,
  };
}

describe("spec table", () => {
  it("Defaults", () => {
    const e = getDisplayEstimate(inputs(5, 60, 42.5, 20, 0, 9.99));
    expect(e.timeLabel).toBe("Estimated annual time saved");
    expect(e.timeText).toBe("About 1 hour 28 minutes");
    expect(e.timeValueText).toBe("$29.17");
    expect(e.subscriptionText).toBe("$9.99");
    expect(e.netValueText).toBe("$19.18");
    expect(e.netState).toBe("positive");
    expect(e.message).toBe(POSITIVE);
  });

  it("One gift", () => {
    const e = getDisplayEstimate(inputs(1, 60, 42.5, 20, 0, 9.99));
    expect(e.timeText).toBe("About 18 minutes");
    expect(e.timeValueText).toBe("$5.83");
    expect(e.netValueText).toBe("−$4.16");
    expect(e.message).toBe(NEGATIVE);
  });

  it("ToyMatch slower", () => {
    const e = getDisplayEstimate(inputs(5, 60, 70, 20, 0, 9.99));
    expect(e.isExtraTime).toBe(true);
    expect(e.timeLabel).toBe("Estimated extra time required");
    expect(e.timeText).toBe("About 50 minutes");
    expect(e.timeValueText).toBe("−$16.67");
    expect(e.netValueText).toBe("−$26.66");
    expect(e.message).toBe(NEGATIVE);
  });

  it("Break-even", () => {
    const e = getDisplayEstimate(inputs(1, 60, 30, 19.98, 0, 9.99));
    expect(e.timeText).toBe("About 30 minutes");
    expect(e.timeValueText).toBe("$9.99");
    expect(e.netValueText).toBe("$0.00");
    expect(e.netState).toBe("zero");
    expect(e.message).toBe(ZERO);
  });

  it("Extra setup time", () => {
    const e = getDisplayEstimate(inputs(5, 60, 42.5, 20, 30, 9.99));
    expect(e.timeText).toBe("About 58 minutes");
    expect(e.timeValueText).toBe("$19.17");
    expect(e.netValueText).toBe("$9.18");
    expect(e.message).toBe(POSITIVE);
  });

  it("Zero gifts", () => {
    const e = getDisplayEstimate(inputs(0, 60, 42.5, 20, 0, 9.99));
    expect(e.timeLabel).toBe("Estimated annual time saved");
    expect(e.timeText).toBe("0 minutes");
    expect(e.timeValueText).toBe("$0.00");
    expect(e.netValueText).toBe("−$9.99");
    expect(e.message).toBe(NEGATIVE);
  });

  it("Blank hourly", () => {
    const view = getResultsView({ ...defaultRawValues, hourlyValue: "" });
    expect(view.status).toBe("ready");
    expect(view.errors).toEqual({}); // blank hourly value is not an error
    if (view.status !== "ready") return;
    const e = view.estimate;
    expect(e.timeText).toBe("About 1 hour 28 minutes");
    expect(e.subscriptionText).toBe("$9.99");
    expect(e.hasHourlyValue).toBe(false);
    expect(e.timeValueText).toBeNull();
    expect(e.netValueText).toBeNull();
    expect(e.message).toBeNull();
  });
});

describe("demo video values", () => {
  it("1 gift, ToyMatch 30 minutes: net +$0.01, positive", () => {
    const e = getDisplayEstimate(inputs(1, 60, 30, 20, 0, 9.99));
    expect(e.netValueText).toBe("$0.01");
    expect(e.message).toBe(POSITIVE);
  });

  it("1 gift, ToyMatch 70 minutes: extra time", () => {
    const e = getDisplayEstimate(inputs(1, 60, 70, 20, 0, 9.99));
    expect(e.timeLabel).toBe("Estimated extra time required");
    expect(e.timeText).toBe("About 10 minutes");
    expect(e.netValueText).toBe("−$13.32");
  });
});

describe("calculations keep full precision and negatives", () => {
  it("does not round before display", () => {
    const r = calculate(inputs(5, 60, 42.5, 20, 0, 9.99));
    expect(r.annualMinutesSaved).toBe(87.5);
    expect(r.annualHoursSaved).toBeCloseTo(1.458333333, 8);
    expect(r.timeValue).toBeCloseTo(29.16666667, 7);
    expect(r.netValue).toBeCloseTo(19.17666667, 7);
  });

  it("keeps negative minutes and time value", () => {
    const r = calculate(inputs(5, 60, 70, 20, 0, 9.99));
    expect(r.annualMinutesSaved).toBe(-50);
    expect(r.timeValue).toBeCloseTo(-16.6667, 4);
  });
});

describe("formatting", () => {
  it("formats durations with singular and plural", () => {
    expect(formatDuration(60)).toBe("About 1 hour");
    expect(formatDuration(120)).toBe("About 2 hours");
    expect(formatDuration(1)).toBe("About 1 minute");
    expect(formatDuration(61)).toBe("About 1 hour 1 minute");
    expect(formatDuration(125)).toBe("About 2 hours 5 minutes");
    expect(formatDuration(0.4)).toBe("0 minutes");
    expect(formatDuration(-50)).toBe("About 50 minutes");
  });

  it("formats money with a true minus sign and no negative zero", () => {
    expect(formatMoney(29.166666)).toBe("$29.17");
    expect(formatMoney(-16.666666)).toBe("−$16.67");
    expect(formatMoney(-0.001)).toBe("$0.00");
    expect(formatMoney(1234.5)).toBe("$1,234.50");
  });

  it("a tiny negative difference does not show the extra-time label", () => {
    const e = getDisplayEstimate(inputs(1, 60, 60.2, 20, 0, 9.99));
    expect(e.timeLabel).toBe("Estimated annual time saved");
    expect(e.timeText).toBe("0 minutes");
  });
});

describe("validation", () => {
  const fields = Object.keys(defaultRawValues) as (keyof RawValues)[];

  it.each(fields)("−1 in %s shows “Enter 0 or more.”", (field) => {
    const view = getResultsView({ ...defaultRawValues, [field]: "-1" });
    expect(view.errors[field]).toBe("Enter 0 or more.");
    expect(view.status).toBe("incomplete");
  });

  it("2.5 gifts shows “Enter a whole number.”", () => {
    const view = getResultsView({ ...defaultRawValues, giftOccasions: "2.5" });
    expect(view.errors.giftOccasions).toBe("Enter a whole number.");
    expect(view.status).toBe("incomplete");
  });

  it.each(fields.filter((f) => f !== "hourlyValue"))(
    "empty required field %s shows the complete-the-fields message",
    (field) => {
      const view = getResultsView({ ...defaultRawValues, [field]: "" });
      expect(view.status).toBe("incomplete");
      expect(view.errors[field]).toBeTruthy();
      if (view.status === "incomplete") {
        expect(view.message).toBe("Complete the highlighted fields to see your estimate.");
      }
    },
  );

  it("allows 0 everywhere", () => {
    const allZero = Object.fromEntries(fields.map((f) => [f, "0"])) as RawValues;
    expect(getResultsView(allZero).status).toBe("ready");
  });

  it("allows ToyMatch time to exceed usual time", () => {
    expect(getResultsView({ ...defaultRawValues, toyMatchMinutes: "90" }).errors).toEqual({});
  });

  it("allows decimals in time and money fields", () => {
    expect(parseField("42.5", fieldRules.toyMatchMinutes)).toEqual({ value: 42.5, error: null });
    expect(parseField(".5", fieldRules.subscriptionCost)).toEqual({ value: 0.5, error: null });
  });

  it("rejects text that is not a number", () => {
    expect(parseField("abc", fieldRules.usualMinutes).error).toBe("Enter a number.");
    expect(parseField("abc", fieldRules.giftOccasions).error).toBe("Enter a whole number.");
  });

  it("defaults are all valid", () => {
    expect(getResultsView(defaultRawValues).status).toBe("ready");
  });
});
