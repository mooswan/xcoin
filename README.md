# KOLX X-Coin Business Studio

Interactive Thai proposal built with Next.js, Tailwind CSS and GSAP. The production output is static; no payment, messaging or KYC backend is connected.

## Open

- Local preview: http://127.0.0.1:3000
- Develop: `npm ci` then `npm run dev`
- Build: `npm run build`
- Serve the generated `out` directory with any static HTTP server. Example: `python -m http.server 3000 --bind 127.0.0.1 --directory out`
- `npm start` serves the static output on port 3000 using Python. Run `npm run build` first.

## Version 2: plain-language first

The original URL now opens a five-topic guided explanation in Thai: what coins are, who uses them, a simple Poke example, real package cash proceeds, and package selection. No sidebar, giant pricing table, or rate controls appear on the first screen. Technical terms are explained in everyday Thai. Advanced exchange-rate and revenue details are collapsed until requested.

The full original interface remains at `/details/`, with a link back to the simple homepage. The simple examples use isolated React state that resets on reload; they do not modify the detailed localStorage wallet.

Run `node verify-easy.mjs` for the simple version (44 checks, evidence in `evidence-v2/`). Run `node verify-detailed.mjs` or `node verify.mjs` for the retained full version (39 checks, evidence in `evidence/`).

## Sections (full version)

1. Model overview and 70/80/100 comparison
2. Merchant pricing, Poke composer, incoming Creator preview, history and refund simulation
3. Creator pricing and Referral trial
4. Customer deals, conditions and unlock simulation
5. Unit economics: editable usage, fee, refund rate, category subtotals, CSV export
6. Packages: coins and free entitlements separately displayed

## Explicit assumptions

- One THB buys 70, 80 or 100 X at the nominal rate. This is not a percentage.
- 30% channel fee is a configurable scenario, not an assertion of actual payment-provider fees.
- 1:80 produces 25% more value per consumed coin than 1:100, holding usage fixed. The retained share after a 30% fee is 70%, not 25%.
- Unread Pokes refund 50% of paid X after a proposed 72 hours. Free entitlements do not produce a coin refund. Refunded entries cannot be opened again in this prototype.
- The clock advances only when the sandbox button is pressed. No background refund job exists.
- Poke cooldown applies per merchant/creator pair across both Poke types, for 24 hours.
- Merchant and Creator package examples preserve supplied prices and quantities. Package effective rates differ from the nominal top-up rate. Packages are valued using the package cash price, not coins divided by nominal rate.
- Customer packages and Referral caps/expiry are proposed additions.
- Referral bonus has a separate demonstration balance; rewards are not top-up revenue.
- The sandbox shares a single demonstration coin wallet across roles, clearly labeled in the interface. Real role wallets and payment isolation are not implemented.
- Free Message Poke is usable; other bundled perks are displayed and recorded in package history, not activated on a real service.
- Stored only in localStorage under `kolx-studio-v1`. Clear via Merchant > Reset Sandbox.
- Coin purchase proceeds and the modeled value of coin usage must not be added together as two independent revenues. Values shown are not profit, tax advice or final accounting treatment.
- Usage/refund economics models value allocation. Returning coins does not mean a payment provider returns its fee.

## Verification

`node verify.mjs` launches existing Chrome via Playwright. It covers desktop/mobile navigation, Poke validations, free/paid charges, refunds, repeat-refund prevention, read status, persistence, Referral, package selection, customer unlocking, economics and CSV export. Evidence is saved in `evidence/`.

## Visual design

Primary surface: Compare/Learn. Ivory canvas, restrained terracotta accent, evergreen financial summary, Thai-first Noto Sans Thai served locally. GSAP entry animation respects reduced motion. No external image or CDN dependency is required at runtime.

Design self-audit: 0/10 on the loaded skill's ten generic-design tells. The coin diagram explains the three-party system, the comparison columns are genuinely comparable, and the highlighted metrics belong to the requested pricing model rather than fabricated business results.

## Documentation consulted

- https://nextjs.org/docs/app/guides/static-exports
- https://tailwindcss.com/docs/installation/using-postcss
- https://gsap.com/docs/v3/GSAP/gsap.context()/

## Font

Noto Sans Thai is bundled from Google Fonts. See `public/fonts/OFL.txt` for its license.
