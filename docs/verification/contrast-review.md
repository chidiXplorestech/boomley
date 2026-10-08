# Boomley contrast and browser review

Reviewed the blue workbench build with Playwright Chromium at 390, 768, 1366 and 1920 px. Screenshots captured and tablet/desktop inspected. All four widths: no horizontal overflow, no broken images after triggering lazy loading, no page JavaScript exceptions, wordmark reads boomley. Mocked form failure preserved the draft; mocked acceptance displayed receipt. These are not live Netlify delivery tests.

## Changes
- Corrected Boomley name and footer accessible label.
- Deep blue directional background grade; visible grain and dust layers; warm white text.
- Larger body copy and labels; self-hosted DM Sans variable and Instrument Serif with OFL licence files.
- Corrected three Lighthouse contrast failures in mail labels and postbox caption.
- Fixed tablet overflow with two-column folder layout and stacked product section.
- Converted the supplied grid PNG to WebP.

## Lighthouse mobile lab result
Production build served locally over HTTP; simulated mobile throttling. Performance 84, Accessibility 100, Best Practices 100, SEO 100. Color contrast audit passed. LCP 4.4s, CLS 0.005, TBT 0ms. Previous run: performance 74, accessibility 96, best practices 96, LCP 6.5s. Local static server does not represent Netlify compression/cache behaviour. No field Core Web Vitals measured. LCP remains above 2.5s target.

Netlify preview is team protected. Live delivery/email forwarding remains unverified. Scores are from the build before the final footer accessible-name-only correction.

## Reproduce
Install playwright and lighthouse outside production dependencies. Install Chromium, serve dist on port 4180 after npm run build, and run tests/browser-audit.cjs. Optional PLAYWRIGHT_PACKAGE, CHROME_PATH and AUDIT_URL select local installations/target. Lighthouse: lighthouse http://127.0.0.1:4180 --output=html --output=json. Full local reports and screenshots accompany this review in docs/verification/browser.
