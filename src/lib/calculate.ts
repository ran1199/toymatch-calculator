// Pure calculation and display-formatting logic for the calculator.
// Everything is calculated at full precision; rounding happens only in the
// format* helpers, right before a value is shown.

import { copy } from "../copy";

export interface CalculatorInputs {
  giftOccasions: number;
  usualMinutes: number;
  toyMatchMinutes: number;
  /** Personal value of one hour, in dollars. `null` when the field is blank. */
  hourlyValue: number | null;
  additionalAnnualMinutes: number;
  subscriptionCost: number;
}

export interface CalculatorResult {
  annualMinutesSaved: number;
  annualHoursSaved: number;
  /** `null` when no hourly value was entered. */
  timeValue: number | null;
  /** `null` when no hourly value was entered. */
  netValue: number | null;
}

/** The four formulas from the spec. Negative results are kept as-is. */
export function calculate(inputs: CalculatorInputs): CalculatorResult {
  const annualMinutesSaved =
    inputs.giftOccasions * (inputs.usualMinutes - inputs.toyMatchMinutes) -
    inputs.additionalAnnualMinutes;
  const annualHoursSaved = annualMinutesSaved / 60;

  if (inputs.hourlyValue === null) {
    return { annualMinutesSaved, annualHoursSaved, timeValue: null, netValue: null };
  }

  const timeValue = annualHoursSaved * inputs.hourlyValue;
  const netValue = timeValue - inputs.subscriptionCost;
  return { annualMinutesSaved, annualHoursSaved, timeValue, netValue };
}

// ---------------------------------------------------------------------------
// Rounding helpers
// ---------------------------------------------------------------------------

/**
 * Rounds a non-negative number to the nearest whole number, halves rounding up.
 * `toPrecision(12)` first removes tiny floating-point noise (for example
 * 100.49999999999999 becomes 100.5) so values that are mathematically exact
 * halves round the way a person would expect.
 */
function roundHalfUp(value: number): number {
  return Math.round(Number(value.toPrecision(12)));
}

/** Rounds to whole cents, keeping the sign. Never returns -0. */
export function toCents(dollars: number): number {
  const cents = roundHalfUp(Math.abs(dollars) * 100);
  return cents === 0 ? 0 : Math.sign(dollars) * cents;
}

/** Rounds to whole minutes, keeping the sign. Never returns -0. */
export function toWholeMinutes(minutes: number): number {
  const rounded = roundHalfUp(Math.abs(minutes));
  return rounded === 0 ? 0 : Math.sign(minutes) * rounded;
}

// ---------------------------------------------------------------------------
// Display formatting
// ---------------------------------------------------------------------------

/** The true minus sign (U+2212), as used in the spec, e.g. "−$16.67". */
export const MINUS = "−";

/** "$29.17", "−$16.67", "$1,234.50". Negative zero shows as "$0.00". */
export function formatMoney(dollars: number): string {
  const cents = toCents(dollars);
  const amount = (Math.abs(cents) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cents < 0 ? MINUS : ""}$${amount}`;
}

function plural(count: number, singular: string, pluralWord: string): string {
  return `${count} ${count === 1 ? singular : pluralWord}`;
}

/**
 * Formats a length of time (the sign is ignored), rounded to the nearest
 * whole minute: "About 1 hour 28 minutes", "About 18 minutes",
 * "About 2 hours", or "0 minutes" when it rounds to zero.
 */
export function formatDuration(minutes: number): string {
  const total = Math.abs(toWholeMinutes(minutes));
  if (total === 0) return "0 minutes";

  const hours = Math.floor(total / 60);
  const mins = total % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(plural(hours, "hour", "hours"));
  if (mins > 0) parts.push(plural(mins, "minute", "minutes"));
  return `About ${parts.join(" ")}`;
}

export type NetState = "positive" | "zero" | "negative";

/** Based on the net value as displayed, so the message always matches the number. */
export function getNetState(netValue: number): NetState {
  const cents = toCents(netValue);
  if (cents > 0) return "positive";
  if (cents < 0) return "negative";
  return "zero";
}

const netMessages: Record<NetState, string> = {
  positive: copy.results.messagePositive,
  zero: copy.results.messageZero,
  negative: copy.results.messageNegative,
};

// ---------------------------------------------------------------------------
// Everything the results area needs, ready to show
// ---------------------------------------------------------------------------

export interface DisplayEstimate {
  /** True when ToyMatch takes longer (by at least one rounded minute). */
  isExtraTime: boolean;
  timeLabel: string;
  timeText: string;
  subscriptionText: string;
  /** False when the hourly value is blank: value, net and message are hidden. */
  hasHourlyValue: boolean;
  timeValueText: string | null;
  netValueText: string | null;
  netState: NetState | null;
  message: string | null;
}

export function getDisplayEstimate(inputs: CalculatorInputs): DisplayEstimate {
  const result = calculate(inputs);

  // Only call it "extra time" when the shown amount is at least 1 minute,
  // so the card never reads "Estimated extra time required: 0 minutes".
  const isExtraTime = toWholeMinutes(result.annualMinutesSaved) < 0;

  const base = {
    isExtraTime,
    timeLabel: isExtraTime ? copy.results.extraTimeLabel : copy.results.timeSavedLabel,
    timeText: formatDuration(result.annualMinutesSaved),
    subscriptionText: formatMoney(inputs.subscriptionCost),
  };

  if (result.timeValue === null || result.netValue === null) {
    return {
      ...base,
      hasHourlyValue: false,
      timeValueText: null,
      netValueText: null,
      netState: null,
      message: null,
    };
  }

  const netState = getNetState(result.netValue);
  return {
    ...base,
    hasHourlyValue: true,
    timeValueText: formatMoney(result.timeValue),
    netValueText: formatMoney(result.netValue),
    netState,
    message: netMessages[netState],
  };
}
