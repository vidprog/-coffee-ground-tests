const { test, expect } = require("@playwright/test");

/**
 * Відповідає на всі питання по черзі, тримаючи фокус на клавіатурній навігації
 * (як зробив би користувач клавіатури), а не мишею.
 */
async function answerAllKeyboard(page, total = 5) {
  for (let i = 0; i < total; i++) {
    await expect(page.locator("#q-index")).toContainText(`Питання ${i + 1} з ${total}`);
    await page.locator(".option").first().focus();
    await page.locator(".option").first().click();
  }
  await expect(page.locator("#screen-result")).toBeVisible();
}

test("після завершення тесту фокус не губиться на <body>", async ({ page }) => {
  await page.goto("/");
  await page.locator(".test-card").first().click();
  await expect(page.locator("#screen-quiz")).toBeVisible();

  await answerAllKeyboard(page);

  const activeTag = await page.evaluate(() => document.activeElement.tagName);
  expect(activeTag).not.toBe("BODY");
});
