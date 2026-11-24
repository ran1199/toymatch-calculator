// Records demo/toymatch-demo.webm: a slow, watchable walk through the calculator.
// It also checks the key numbers on screen, so the video doubles as proof.
import { expect, test, type Locator, type Page } from "@playwright/test";
import path from "node:path";

const WIDTH = 1280;
const HEIGHT = 800;
const STEP_PAUSE = 2000; // pause after each step so the change can be seen
const KEY_DELAY = 80; // per-key typing delay
const MINUS = "−";
const OUTPUT = path.join(import.meta.dirname, "toymatch-demo.webm");

// A soft dot that follows the mouse. Recorded videos don't show the real
// pointer, so this lets viewers see what is being hovered and clicked.
// (Only injected during recording; it is not part of the app.)
const fakeCursor = () => {
  window.addEventListener("DOMContentLoaded", () => {
    const dot = document.createElement("div");
    dot.setAttribute("aria-hidden", "true");
    Object.assign(dot.style, {
      position: "fixed", left: "0", top: "0", width: "18px", height: "18px",
      margin: "-9px 0 0 -9px", borderRadius: "50%", pointerEvents: "none",
      background: "rgba(26, 31, 36, 0.35)", border: "2px solid rgba(255,255,255,0.9)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.3)", zIndex: "99999",
      transform: "translate(-100px, -100px)", transition: "width .1s, height .1s",
    });
    document.body.appendChild(dot);
    window.addEventListener("mousemove", (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  });
};

/** Smoothly scroll an element into the middle of the screen. */
async function scrollTo(page: Page, target: Locator) {
  await target.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await page.waitForTimeout(700);
}

/** Glide the mouse to an element (so the hover is visible) and rest briefly. */
async function hover(page: Page, target: Locator) {
  await scrollTo(page, target);
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
  await page.waitForTimeout(500);
}

/** Hover, focus, select the whole value (so it's clearly replaced), then type. */
async function replaceValue(page: Page, input: Locator, text: string) {
  await hover(page, input);
  await input.click();
  await input.selectText();
  await page.waitForTimeout(600);
  if (text === "") {
    await input.press("Backspace");
  } else {
    await input.pressSequentially(text, { delay: KEY_DELAY });
  }
}

test("record ToyMatch demo", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    recordVideo: { dir: path.join(import.meta.dirname, ".recording"), size: { width: WIDTH, height: HEIGHT } },
  });
  await context.addInitScript(fakeCursor);
  const page = await context.newPage();

  const field = (label: string) => page.getByLabel(label, { exact: true });
  const net = page.getByTestId("net-value");
  const message = page.getByTestId("net-message");

  // 1. Open the calculator and pause on the default $19.18 net value.
  await page.goto("http://localhost:4173/");
  await page.mouse.move(640, 300);
  await expect(net).toHaveText("$19.18");
  await page.waitForTimeout(STEP_PAUSE + 500);
  await hover(page, net);
  await page.waitForTimeout(STEP_PAUSE);

  // 2. Change gift occasions from 5 to 1: net becomes −$4.16, negative message.
  await replaceValue(page, field("How many more gifts will you shop for?"), "1");
  await expect(net).toHaveText(`${MINUS}$4.16`);
  await expect(message).toHaveText(
    "Based on your inputs, the estimated time value does not cover the annual subscription cost.",
  );
  await page.waitForTimeout(STEP_PAUSE);

  // 3a. ToyMatch time 42.5 → 30: net +$0.01, positive message.
  const toyMatch = field("How long do you expect shopping with ToyMatch to take?");
  await replaceValue(page, toyMatch, "30");
  await expect(net).toHaveText("$0.01");
  await expect(message).toHaveText(
    "Based on your inputs, the estimated time value exceeds the annual subscription cost.",
  );
  await page.waitForTimeout(STEP_PAUSE);

  // 3b. ToyMatch time → 70: the card switches to "Estimated extra time required".
  await replaceValue(page, toyMatch, "70");
  await expect(page.getByTestId("time-label")).toHaveText("Estimated extra time required");
  await expect(page.getByTestId("time-value")).toHaveText("About 10 minutes");
  await expect(net).toHaveText(`${MINUS}$13.32`);
  await page.waitForTimeout(STEP_PAUSE);

  // 4. Clear the hourly value: time-only result with the prompt.
  await replaceValue(page, field("What is one hour saved worth to you?"), "");
  await expect(page.getByTestId("add-hourly-prompt")).toBeVisible();
  await expect(page.getByTestId("net")).toHaveCount(0);
  await expect(page.getByTestId("incomplete-message")).toHaveCount(0);
  await page.waitForTimeout(STEP_PAUSE);

  // 5. Reset example: defaults and $19.18 come back.
  const reset = page.getByRole("button", { name: "Reset example" });
  await hover(page, reset);
  await reset.click();
  await expect(net).toHaveText("$19.18");
  await expect(field("How many more gifts will you shop for?")).toHaveValue("5");
  await page.waitForTimeout(STEP_PAUSE);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.mouse.move(640, 300, { steps: 20 });
  await page.waitForTimeout(STEP_PAUSE + 500);

  // Save the video
  const video = page.video()!;
  await context.close();
  await video.saveAs(OUTPUT);
  await video.delete();
});
