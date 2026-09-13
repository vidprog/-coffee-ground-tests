const { test, expect } = require("@playwright/test");

/** Цілісність контенту. Агент, що додає тест, мусить пройти ці перевірки. */

test("структура TESTS цілісна", async ({ page }) => {
  await page.goto("/");
  const problems = await page.evaluate(() => {
    const bad = [];
    TESTS.forEach((t) => {
      const keys = Object.keys(t.results);
      if (!t.id || !t.title || !t.icon) bad.push(`${t.id}: бракує обовʼязкового поля`);
      t.questions.forEach((q, i) => {
        if (q.options.length !== 4) bad.push(`${t.id} питання ${i + 1}: ${q.options.length} варіантів замість 4`);
        q.options.forEach((o) => {
          if (!keys.includes(o.r)) bad.push(`${t.id} питання ${i + 1}: невідомий ключ «${o.r}»`);
        });
      });
      keys.forEach((k) => {
        ["emoji", "title", "text", "advice", "traits"].forEach((f) => {
          if (!t.results[k][f]) bad.push(`${t.id}/${k}: бракує «${f}»`);
        });
      });
    });
    return bad;
  });
  expect(problems).toEqual([]);
});

test("кожен результат досяжний хоча б однією відповіддю", async ({ page }) => {
  await page.goto("/");
  const unreachable = await page.evaluate(() =>
    TESTS.flatMap((t) => {
      const used = new Set(t.questions.flatMap((q) => q.options.map((o) => o.r)));
      return Object.keys(t.results).filter((k) => !used.has(k)).map((k) => `${t.id}/${k}`);
    })
  );
  expect(unreachable).toEqual([]);
});
