const { test, expect } = require("@playwright/test");

/**
 * Відповідає на всі питання по черзі.
 * Між питаннями app.js тримає блокування ~320мс, тому просто клацати підряд не можна —
 * чекаємо, поки зміниться лічильник питання.
 */
async function answerAll(page, total = 5) {
  for (let i = 0; i < total; i++) {
    await expect(page.locator("#q-index")).toContainText(`Питання ${i + 1} з ${total}`);
    await page.locator(".option").first().click();
  }
  await expect(page.locator("#screen-result")).toBeVisible();
}

/** Базовий прохід: головна → тест → результат. Ламається — значить зламано все. */

test("на головній показані всі тести", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator(".test-card");
  await expect(cards).toHaveCount(4);
  await expect(page.locator("h1")).toContainText("кавовій гущі");
});

test("повний прохід тесту доводить до результату", async ({ page }) => {
  await page.goto("/");
  await page.locator(".test-card").first().click();

  await expect(page.locator("#screen-quiz")).toBeVisible();

  await answerAll(page);
  await expect(page.locator("#result-title")).not.toBeEmpty();
  await expect(page.locator("#result-advice")).not.toBeEmpty();
  await expect(page.locator(".trait")).not.toHaveCount(0);
});

test("кнопка повернення веде на головну", async ({ page }) => {
  await page.goto("/");
  await page.locator(".test-card").first().click();
  await page.locator(".back-btn").click();
  await expect(page.locator("#screen-home")).toBeVisible();
});

test("немає горизонтального скролу на телефоні", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(overflow).toBe(false);
});

test("сторінка не кидає помилок у консоль", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await page.locator(".test-card").first().click();
  await answerAll(page);
  expect(errors).toEqual([]);
});
