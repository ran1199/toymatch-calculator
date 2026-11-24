import { expect, test, type Page } from "@playwright/test";

const MINUS = "−";

const field = (page: Page, label: string) => page.getByLabel(label, { exact: true });
const GIFTS = "How many more gifts will you shop for?";
const USUAL = "How long does shopping usually take per gift?";
const TOYMATCH = "How long do you expect shopping with ToyMatch to take?";
const HOURLY = "What is one hour saved worth to you?";
const EXTRA = "Additional annual setup or management time";
const SUB = "Annual subscription cost";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("defaults show the values from the Defaults row", async ({ page }) => {
  await expect(page.getByTestId("time-label")).toHaveText("Estimated annual time saved");
  await expect(page.getByTestId("time-value")).toHaveText("About 1 hour 28 minutes");
  await expect(page.getByTestId("worth-value")).toHaveText("$29.17");
  await expect(page.getByTestId("subscription-value")).toHaveText("$9.99");
  await expect(page.getByTestId("net-value")).toHaveText("$19.18");
  await expect(page.getByTestId("net-message")).toHaveText(
    "Based on your inputs, the estimated time value exceeds the annual subscription cost.",
  );
  // No Calculate button exists
  await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0);
  // Results are in a polite live region
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  // Both expandable sections start collapsed
  await expect(page.getByTestId("adjust-costs")).not.toHaveAttribute("open");
  await expect(page.locator("details.how")).not.toHaveAttribute("open");
});

test("results update while typing: negative, zero, positive and extra time", async ({ page }) => {
  await field(page, GIFTS).fill("1");
  await expect(page.getByTestId("net-value")).toHaveText(`${MINUS}$4.16`);
  await expect(page.getByTestId("net-message")).toHaveAttribute("data-state", "negative");
  await expect(page.getByTestId("net-message")).toHaveText(
    "Based on your inputs, the estimated time value does not cover the annual subscription cost.",
  );

  await field(page, TOYMATCH).fill("30");
  await field(page, HOURLY).fill("19.98");
  await expect(page.getByTestId("net-value")).toHaveText("$0.00");
  await expect(page.getByTestId("net-message")).toHaveText(
    "Based on your inputs, the estimated time value equals the annual subscription cost.",
  );

  await field(page, TOYMATCH).fill("70");
  await expect(page.getByTestId("time-label")).toHaveText("Estimated extra time required");
  await expect(page.getByTestId("time-value")).toHaveText("About 10 minutes");
});

test("blank hourly value hides value, net and message without an error", async ({ page }) => {
  await field(page, HOURLY).fill("");
  await expect(page.getByTestId("time-value")).toHaveText("About 1 hour 28 minutes");
  await expect(page.getByTestId("subscription-value")).toHaveText("$9.99");
  await expect(page.getByTestId("worth-value")).toHaveCount(0);
  await expect(page.getByTestId("net")).toHaveCount(0);
  await expect(page.getByTestId("net-message")).toHaveCount(0);
  await expect(page.getByTestId("add-hourly-prompt")).toHaveText(
    "Add what an hour is worth to you to compare your time savings with the subscription cost.",
  );
  await expect(page.getByTestId("incomplete-message")).toHaveCount(0);
  await expect(field(page, HOURLY)).not.toHaveAttribute("aria-invalid");
});

test("invalid and empty fields are highlighted and replace the results", async ({ page }) => {
  await field(page, GIFTS).fill("2.5");
  await expect(page.getByText("Enter a whole number.")).toBeVisible();
  await expect(field(page, GIFTS)).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByTestId("incomplete-message")).toHaveText(
    "Complete the highlighted fields to see your estimate.",
  );
  await expect(page.getByTestId("net")).toHaveCount(0); // no stale numbers

  await field(page, GIFTS).fill("5");
  await field(page, USUAL).fill("");
  await expect(page.getByTestId("incomplete-message")).toBeVisible();
  // The error is linked to the field for screen readers
  const describedBy = await field(page, USUAL).getAttribute("aria-describedby");
  expect(describedBy).toContain("usualMinutes-error");

  await field(page, USUAL).fill("-1");
  await expect(page.getByText("Enter 0 or more.")).toBeVisible();
});

test("an error inside the collapsed Adjust costs section opens it", async ({ page }) => {
  const adjust = page.getByTestId("adjust-costs");
  await adjust.locator("summary").click();
  await field(page, SUB).fill("-1");
  await expect(page.getByText("Enter 0 or more.")).toBeVisible();

  // Trying to collapse the section while it holds an error keeps it open
  await adjust.locator("summary").click();
  await expect(adjust).toHaveAttribute("open");
  await expect(field(page, SUB)).toBeVisible();
  await expect(page.getByTestId("incomplete-message")).toBeVisible();
});

test("Reset example restores every default and clears errors", async ({ page }) => {
  await page.getByTestId("adjust-costs").locator("summary").click();
  await field(page, GIFTS).fill("2.5");
  await field(page, USUAL).fill("");
  await field(page, TOYMATCH).fill("70");
  await field(page, HOURLY).fill("");
  await field(page, EXTRA).fill("-3");
  await field(page, SUB).fill("12");

  await page.getByRole("button", { name: "Reset example" }).click();

  await expect(field(page, GIFTS)).toHaveValue("5");
  await expect(field(page, USUAL)).toHaveValue("60");
  await expect(field(page, TOYMATCH)).toHaveValue("42.5");
  await expect(field(page, HOURLY)).toHaveValue("20");
  await expect(field(page, EXTRA)).toHaveValue("0");
  await expect(field(page, SUB)).toHaveValue("9.99");
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  await expect(page.getByTestId("net-value")).toHaveText("$19.18");
});

test("nothing is stored and no requests leave the app", async ({ page, baseURL }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await field(page, GIFTS).fill("3");
  await field(page, HOURLY).fill("");
  await page.getByRole("button", { name: "Reset example" }).click();
  await page.waitForLoadState("networkidle");

  const outside = requests.filter((url) => !url.startsWith(baseURL!));
  expect(outside).toEqual([]);

  const storage = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookie: document.cookie,
    databases: (await indexedDB.databases()).length,
  }));
  expect(storage).toEqual({ local: 0, session: 0, cookie: "", databases: 0 });
});

test("inputs meet the spec: text inputs with the right keyboard", async ({ page }) => {
  await expect(field(page, GIFTS)).toHaveAttribute("type", "text");
  await expect(field(page, GIFTS)).toHaveAttribute("inputmode", "numeric");
  for (const label of [USUAL, TOYMATCH, HOURLY, EXTRA, SUB]) {
    await expect(field(page, label)).toHaveAttribute("inputmode", "decimal");
  }
});
