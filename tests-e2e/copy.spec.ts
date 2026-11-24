// Every piece of copy from the spec, typed out here independently of
// src/copy.ts, must appear on the page word for word.
import { expect, test } from "@playwright/test";

const specCopy = [
  "ToyMatch Time & Value Calculator",
  "Is ToyMatch worth it for you?",
  "Estimate how much time you could save on birthday gift shopping and compare its value with the annual subscription.",
  "The starting values are planning estimates. Adjust them to match your experience.",
  "How many more gifts will you shop for?",
  "Count the occasions you expect to use ToyMatch during the next 12 months. Exclude your free introductory search.",
  "How long does shopping usually take per gift?",
  "Include research, comparing toys, choosing a retailer, and checkout. Count active time, not delivery time.",
  "How long do you expect shopping with ToyMatch to take?",
  "Include entering details, reviewing recommendations, comparing options, and retailer checkout.",
  "The 42.5-minute example assumes half of 45 research minutes are avoided, with five minutes of app effort added.",
  "What is one hour saved worth to you?",
  "Optional. Enter your personal value of time. This does not need to equal your hourly wage.",
  "Adjust costs",
  "Additional annual setup or management time",
  "Add time spent downloading, learning, or managing the subscription that is not already included above.",
  "Leave at 0 to exclude this cost from the estimate.",
  "Annual subscription cost",
  "ToyMatch's proposed annual price. Adjust this amount if applicable tax increases your cost.",
  "Reset example",
  "Estimated annual time saved",
  "Estimated value of your time saved",
  "Estimated net value",
  "Dollar estimates represent your personal value of time, not cash savings. Actual results may differ.",
  "How this is calculated",
  "Annual time saved in minutes",
  "Gift occasions × (Usual time per gift − ToyMatch time per gift) − Additional annual effort",
  "Annual time saved in hours",
  "Annual minutes saved ÷ 60",
  "Estimated time value",
  "Annual hours saved × Personal hourly value",
  "Estimated time value − Annual subscription cost",
  "Assumptions",
  "The free introductory search is excluded.",
  "Each counted occasion is assumed to use ToyMatch.",
  "App effort and retailer checkout are already included in the entered ToyMatch time.",
  "Toy purchase costs are assumed equal between methods.",
  "Confidence, gift suitability, and possible retailer discounts are not assigned dollar values.",
];

test("all spec copy appears word for word", async ({ page }) => {
  await page.goto("/");
  const text = ((await page.locator("body").textContent()) ?? "").replace(/\s+/g, " ");
  const missing = specCopy.filter((line) => !text.includes(line));
  expect(missing).toEqual([]);
  // Units are visible next to the fields
  for (const unit of ["gifts", "minutes", "$", "per hour"]) {
    expect(text).toContain(unit);
  }
});
