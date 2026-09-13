# Докази

Сюди агенти кладуть скріншоти, на які посилаються коментарі в тікетах і PR.

Іменування: `<мітка>-<екран>[-mobile].png`, де мітка — `before-12`, `after-12`, `feature-12`
(число — номер тікета).

Генерується командою:

```bash
node scripts/evidence.mjs after-12 --test flower
node scripts/evidence.mjs feature-12 --mobile
```

Файли комітяться в гілку PR — інакше raw-посилання в коментарі не працюватиме.
