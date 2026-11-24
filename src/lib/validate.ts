// Turns the raw text typed into each field into a number or an error message.
// The UI keeps the raw strings in state, so people can clear and retype freely.

import { copy } from "../copy";
import { getDisplayEstimate, type CalculatorInputs, type DisplayEstimate } from "./calculate";

export type FieldId = keyof CalculatorInputs;

export interface FieldRule {
  /** "whole" = whole numbers only (gift occasions); "decimal" = decimals allowed. */
  kind: "whole" | "decimal";
  required: boolean;
  /** Fields inside the collapsible "Adjust costs" section. */
  inAdjustCosts: boolean;
}

export const fieldRules: Record<FieldId, FieldRule> = {
  giftOccasions: { kind: "whole", required: true, inAdjustCosts: false },
  usualMinutes: { kind: "decimal", required: true, inAdjustCosts: false },
  toyMatchMinutes: { kind: "decimal", required: true, inAdjustCosts: false },
  hourlyValue: { kind: "decimal", required: false, inAdjustCosts: false },
  additionalAnnualMinutes: { kind: "decimal", required: true, inAdjustCosts: true },
  subscriptionCost: { kind: "decimal", required: true, inAdjustCosts: true },
};

/** Field order, matching the page. */
export const fieldOrder: FieldId[] = [
  "giftOccasions",
  "usualMinutes",
  "toyMatchMinutes",
  "hourlyValue",
  "additionalAnnualMinutes",
  "subscriptionCost",
];

export type RawValues = Record<FieldId, string>;

/** The example starting values ("Reset example" restores these). */
export const defaultRawValues: RawValues = {
  giftOccasions: "5",
  usualMinutes: "60",
  toyMatchMinutes: "42.5",
  hourlyValue: "20",
  additionalAnnualMinutes: "0",
  subscriptionCost: "9.99",
};

export interface ParsedField {
  value: number | null;
  error: string | null;
}

// An optional minus sign, then digits with an optional decimal part ("12", "12.", "12.5", ".5").
const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;

export function parseField(raw: string, rule: FieldRule): ParsedField {
  // Accept the typographic minus (−) as well as the keyboard hyphen.
  const text = raw.trim().replace(/−/g, "-");

  if (text === "") {
    return rule.required
      ? { value: null, error: copy.errors.required }
      : { value: null, error: null }; // a blank optional field is not an error
  }

  const notNumberError =
    rule.kind === "whole" ? copy.errors.notWholeNumber : copy.errors.notNumber;

  if (!NUMBER_PATTERN.test(text)) return { value: null, error: notNumberError };

  const value = Number(text);
  if (!Number.isFinite(value)) return { value: null, error: notNumberError };
  if (value < 0) return { value: null, error: copy.errors.negative };
  if (rule.kind === "whole" && !Number.isInteger(value)) {
    return { value: null, error: copy.errors.notWholeNumber };
  }

  return { value: value === 0 ? 0 : value, error: null }; // turn "-0" into 0
}

export interface ValidationResult {
  errors: Partial<Record<FieldId, string>>;
  /** Present only when every field is valid. */
  inputs: CalculatorInputs | null;
}

export function validateAll(raw: RawValues): ValidationResult {
  const errors: Partial<Record<FieldId, string>> = {};
  const values: Partial<Record<FieldId, number | null>> = {};

  for (const id of fieldOrder) {
    const parsed = parseField(raw[id], fieldRules[id]);
    values[id] = parsed.value;
    if (parsed.error) errors[id] = parsed.error;
  }

  if (Object.keys(errors).length > 0) return { errors, inputs: null };

  return {
    errors,
    inputs: {
      giftOccasions: values.giftOccasions as number,
      usualMinutes: values.usualMinutes as number,
      toyMatchMinutes: values.toyMatchMinutes as number,
      hourlyValue: values.hourlyValue ?? null,
      additionalAnnualMinutes: values.additionalAnnualMinutes as number,
      subscriptionCost: values.subscriptionCost as number,
    },
  };
}

// ---------------------------------------------------------------------------
// From typed text straight to what the results area shows
// ---------------------------------------------------------------------------

export type ResultsView =
  | { status: "incomplete"; message: string; errors: Partial<Record<FieldId, string>> }
  | { status: "ready"; estimate: DisplayEstimate; errors: Partial<Record<FieldId, string>> };

export function getResultsView(raw: RawValues): ResultsView {
  const { errors, inputs } = validateAll(raw);
  if (!inputs) return { status: "incomplete", message: copy.results.incomplete, errors };
  return { status: "ready", estimate: getDisplayEstimate(inputs), errors };
}
