# Boomley redesign research

Retrieved 7 October 2026. This is a content/documentation review using web retrieval, not a browser motion or performance audit. Visual decisions below are recommendations, unless explicitly attributed to a source. No conversion uplift is inferred from appearance. Reference sites' own results and testimonials are their claims, not independently verified evidence.

## Eight reference studies

| Reference | Grounded observations | Application to Boomley | Limitation / risk to test |
| --- | --- | --- | --- |
| [Norma](https://nor.ma/) | Opening explains an NFC steel disc and app blocking in one sentence; purchase and features links precede a three-step mechanism, product imagery, use cases, comparisons, and FAQs. | Explain the company next to the expressive headline. Make the postbox a legible physical metaphor; show what sending a message accomplishes. | Motion and visual layout not tested. Do not borrow ecommerce urgency, their statistics, or logos for an early product company. |
| [MONOLOG](https://bymonolog.com/) | Explicit founder-led B2B positioning, personal founder story/headshot, project photographs, case links, process/services, and intro-call CTA. Principles prioritise outcomes, people, and intentional craft. | Founder portraits and actual point of view are stronger trust material than invented social proof. Use editorial scale and varied media to support a specific story. | Extracted content accessible; choreography not tested. MONOLOG sells services; Boomley must remain a product company. |
| [Framer gallery](https://www.framer.com/community/gallery/) and [accessibility guidance](https://www.framer.com/help/accessibility/) | The gallery represents live projects; documentation covers semantic structure, tab order, contrast, alt text and reduced motion. | Judge the finished site as an actual usable experience. Give the opening a skip control and all major motion a static equivalent. | Gallery presence is not evidence of conversion or a licence to reuse a site's artwork. Individual showcased layouts not visually inspected here. |
| [Webflow principles](https://webflow.com/blog/good-website-design) | Purpose, clarity, consistency, imagery, hierarchy, contrast, scale and accessibility are treated as connected decisions. | One palette, type hierarchy, material language and lighting direction across hero, portraits, workbench and mail scene. Design the assets and composition together. | These are foundational recommendations, not measurable promises that a dark theme will sell more. |
| [One Page Love conversion guide](https://onepagelove.com/conversions) | Starts with audience, problem, solution and desired action; recommends only persuasive relevant content plus mobile, loading and form checks. | Primary CTA: Signal Mail. Secondary CTA: follow 0001. Use ordinary language beside poetic copy; explain what happens after submission. | Do not add pricing, testimonials or FAQs merely because other landing pages contain them. |
| [Z Perinatal](https://zperinatal.com/) | Web retrieval failed. The user identifies it as a clarity reference. | Retain it in the client reference list; no new claims about its fonts, colours, layout or motion. | Needs an accessible screenshot or actual browser visit before visual analysis. |
| [Awwwards mobile guidance](https://www.awwwards.com/mobile-excellence-guidelines.pdf) | Official checklist includes visible CTAs, readable type, appropriately sized controls, useful form errors, responsive sizing and performance. | Evaluate the postcard and postbox on touch devices, not only in a wide desktop composition. | Historical checklist contains older metrics; use current Core Web Vitals instead. The MONOLOG project and evaluation URLs were not accessible, so no scoring or award claim is inferred from them. |
| [Codrops: shape-aware ASCII](https://tympanus.net/codrops/2026/09/04/beyond-the-luminance-ramp-a-shape-aware-ascii-renderer-in-three-js/) | Tutorial describes a 3D mark rendered as glyphs chosen by shape, not brightness alone, and links to a working source project. | Characters should reveal the contours of something meaningful: observation becoming a signal. A restrained bounded scene is more specific than a full-page random character field. | Article/code review only; demo interaction and GPU cost not tested. Do not copy the Codrops logo. |

## Creative recommendation

**Signals from everyday life.** Combine a physical world of paper, enamel, metal and natural light with precise digital annotations. This relates the company story to its core action: noticing a problem and telling the founders about it.

The hierarchy should be intelligible without motion. Hero: memorable object/scene + plain statement that Boomley is a two-person product company. Workbench: a carefully framed 0001 object/reveal, with no invented interface. People: supplied portraits and credible roles. Mail: a letter visibly folds along panels, closes into an envelope, seals, and enters a red postbox only once delivery is accepted.

Two territories considered: (A) a tactile correspondence/workbench world; (B) an abstract digital observatory. Recommend A because it offers physical depth and a distinctive human interaction. Use B only for the restrained ASCII interpretation layer. This is an authored recommendation, not an observed rule from references.

Do not spend all visual effort on a hero: give each section a recognisable composition. Real imagery, deliberate crops, stronger foreground/background relationships and variation in section rhythm should carry the page. A new background colour is not a redesign.

## Tools and implementation research

| Project | Verified status / licence | Decision |
| --- | --- | --- |
| [GSAP](https://github.com/greensock/GSAP), [official licence](https://gsap.com/community/standard-license/) | Public source repository; standard no-charge licence permits commercial website use and includes restrictions concerning competing visual animation builders. **Not an MIT licence.** Official docs expose responsive `matchMedia` and sequencing tools. | Appropriate for the coordinated folding, sealing and posting sequence. Keep the current installed version unless a concrete need requires upgrading. |
| [Three.js](https://github.com/mrdoob/three.js) | Repository identifies MIT licence and includes WebGL/WebGPU renderers plus CSS3D/SVG addons. | Optional; use only if real spatial interaction adds value beyond a lightweight rendered asset and CSS layers. |
| [Lenis](https://github.com/darkroomengineering/lenis) | MIT; maintained docs include integration and limitations. | Not necessary for this one-page task. Preserve native scrolling unless testing establishes a reason to change it. |
| [ASCII Logo](https://github.com/edoardolunardi/ascii-logo) | MIT, linked by the Codrops tutorial; vanilla custom element, Three.js, WebGL2, GLSL, Vite. Small experiment rather than a general production component. | Study shape coherence, separate pass architecture, and fallback needs. Prefer an original lighter implementation unless this complexity is justified. |
| [Codrops repositories](https://github.com/codrops) | Current listing includes Astro/GSAP `interlude` and `ElasticGridScroll`; specific repositories have their own licences and asset conditions. | Use for focused technical reference, not as a replacement for art direction. No code or bundled artwork copied in this research. |

Repository pages and official documentation were accessible on the retrieval date. This is not a security audit or a claim that every demo is supported as a production library. Inspect the exact version and licence of anything actually adopted.

## Typeface availability

- **Caer:** verified in [hvnter's own font catalogue](https://hvnter.net/products/fonts) and [Studio 2am's product page](https://studio2am.co/products/caer-typefce). Paid font, not a freely reusable web asset. [Studio 2am's licence guidance](https://help.studio2am.co/articles/licenses) distinguishes desktop logo/static-art use from embedding live fonts under a webfont licence. No purchase or download performed; ownership of a suitable licence is unverified.
- **Bootzy TM:** verified as a Type Mania face in the [6TM store](https://shop.6tm-magazine.com/products/bootzy-tm) and [Supply Family listing](https://supply.family/shop/bootzy-tm-2/). The listing distinguishes desktop from webfont use. Do not assume an OTF/TTF commercial desktop purchase permits `@font-face`; use supplied licensed files or confirm webfont rights with the seller.
- Implementation can proceed with the existing legitimately available type pairing, labelled as an alternative rather than falsely named Caer or Bootzy. Do not retrieve unofficial copies or imitate a proprietary font file.

## Trust and practical verification

Strong visual craft may help communicate care, but conversion must be tested with visitors. Boomley's credible material today is the founders, their point of view, an honest 0001 status and a working submission experience.

For Signal Mail, acceptance by the endpoint, storage in a dashboard, and forwarding to an email inbox are separate states. Verify the configured destination and report any unconfigured email notification. On failure, preserve the message and make retry understandable. A successful animation must never stand in for confirmed server acceptance.

The final acceptance check should inspect keyboard navigation, reduced motion, mobile controls, actual screenshots, and the animation in motion. Browser sign-in restrictions must be reported as limits, not silently counted as a passed visual review.
