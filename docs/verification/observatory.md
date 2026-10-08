# Observatory rebuild verification

## Implemented
- Original generated optical hero and red enamel postbox; responsive WebP variants total approximately 324 KB across all five files, with the browser selecting a variant.
- Rebuilt editorial page, research folder labelled 0001, observation/process graphic, supplied portraits, opposing profile motion, blue community invitation and paper letter form.
- GSAP three-panel fold, envelope flap and seal, flight and slot insertion; reduced motion and Keep browsing option.
- Server acceptance gates the posted receipt. Failure retains fields. Duplicate submissions blocked. Netlify form name and schema confirmed through connector.
- Native POST fallback, privacy information page, thank-you route, per-route canonical URLs.

## Passed checks
- `npm run build`: three static routes generated.
- `node tests/signal-mail.cjs`: six mocked network/state regression cases. Success/failure in animated and reduced modes, and success/failure after hiding the animation. Asserts serialization occurs before fields are disabled, duplicate submit blocked, no early receipt, draft preservation and no posting flight on failure.
- Generated images inspected directly during generation; founders preserved without image changes.

## Limits
- Browser opening of local preview stalled and was aborted. No browser screenshots or animation recording obtained. Responsive styling is implemented but not visually verified in this pass.
- No measured Core Web Vitals or browser accessibility audit. No claim of a production performance score.
- No live test message sent in this pass. Netlify registration confirms form setup, not end-to-end receipt of a new message.
- Submissions are configured for the Netlify Forms dashboard. Email notification recipients and forwarding are not verified or newly configured.
- Supplied premium font licences were not available. Existing DM Sans and Instrument Serif pairing retained as the declared alternative.

## Asset provenance and generation
Built-in image generation used for both originals. Original files remain in the workspace generated_images directory. Project-ready files are in public/media/observatory.
Hero prompt: original wide editorial product photograph of a brushed aluminium optical magnifier revealing a cobalt thread among tangled graphite threads, dark workbench, right-weighted composition with left text space, macro studio lighting, no text/UI/logos or glowing spheres.
Postbox prompt: original front-facing photographic red enamel pillar postbox, blank ivory collection plate, black slot in upper third, cast-iron texture and studio shadows against charcoal, no Royal Mail identity or lettering. Live labels and animated letter are separate DOM layers.

## Remaining review
Inspect desktop and mobile preview visually, record the interaction, and verify a real submission in the Netlify dashboard before treating visual QA and live delivery verification as complete.
