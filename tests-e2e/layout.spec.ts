// Layout at phone and laptop widths, with screenshots saved to screenshots/.
import { expect, test } from "@playwright/test";

const noHorizontalScroll = () =>
  document.documentElement.scrollWidth <= document.documentElement.clientWidth;

test("375px: inputs stacked above results", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  expect(await page.evaluate(noHorizontalScroll)).toBe(true);

  const inputs = (await page.locator("form.inputs").boundingBox())!;
  const results = (await page.locator(".results").boundingBox())!;
  expect(results.y).toBeGreaterThanOrEqual(inputs.y + inputs.height);

  // Body text is at least 16px
  const size = await page.locator(".field__help").first().evaluate((el) => getComputedStyle(el).fontSize);
  expect(parseFloat(size)).toBeGreaterThanOrEqual(16);

  await page.screenshot({ path: "screenshots/mobile-375.png", fullPage: true });
});

test("1280px: inputs left, results right and sticky", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  expect(await page.evaluate(noHorizontalScroll)).toBe(true);

  const inputs = (await page.locator("form.inputs").boundingBox())!;
  const results = (await page.locator(".results").boundingBox())!;
  expect(results.x).toBeGreaterThan(inputs.x + inputs.width - 1);

  await page.screenshot({ path: "screenshots/desktop-1280.png" });

  // While scrolling through every input (Adjust costs open), the net value
  // card stays fully on screen: the results column is sticky.
  await page.getByTestId("adjust-costs").locator("summary").click();
  for (const input of await page.locator("form.inputs input").all()) {
    await input.scrollIntoViewIfNeeded();
    const inputBox = (await input.boundingBox())!;
    expect(inputBox.y).toBeGreaterThanOrEqual(0);
    const net = (await page.getByTestId("net").boundingBox())!;
    expect(net.y).toBeGreaterThanOrEqual(0);
    expect(net.y + net.height).toBeLessThanOrEqual(800);
  }
  await page.screenshot({ path: "screenshots/desktop-1280-scrolled.png" });
});

test("touch targets are at least 44px tall", async ({ page }) => {
  await page.goto("/");
  for (const summary of await page.locator("summary").all()) await summary.click();
  const targets = page.locator("input, button, summary");
  const count = await targets.count();
  for (let i = 0; i < count; i++) {
    const box = (await targets.nth(i).boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
