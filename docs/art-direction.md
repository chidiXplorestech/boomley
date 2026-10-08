# Boomley — Signals from everyday life

## DesignContext and locks
Task: rebuild the one-page product-company hub. Audience: curious people with recurring problems, future product users, potential collaborators. Action: send a signal. Preserve founders and portrait identity, private 0001 identifier, genuine business scope, functional forms, existing git history. Dark editorial, restrained electric blue, red postbox are approved. No fictitious proof.

## Two directions
A. Signal Observatory: optical objects, inspection marks, a fine blue thread, dark photographic space. Communicates noticing and investigating. Risk: sterile if photography overwhelms people.
B. Correspondence Workbench: paper, red enamel, stamps, personal notes. Communicates human participation. Risk: nostalgia overpowering technology.
Recommendation: A governs the opening and process; B resolves the story at Signal Mail. One shared material palette, directional light, fine blue line, intentional editorial type. The journey turns observation into human correspondence.

## Composition state
Desktop 1440 canvas, 6% side margins, 12-column grid; mobile 390, 22px margins. Hero title upper left, optical image centre-right with decisive overlap; plain company description and two actions below title. Primary anchor: optical instrument/blue thread. Secondary: headline. Hero footprint ~820px. Alternate dark cinematic frame, split editorial manifesto, product specimen, process illustration, paired portraits, blue invitation, paper-and-red post office. Avoid equal-weight cards.
Typography: existing DM Sans 400–500 and Instrument Serif, licensed via Google Fonts, pending verification of premium font references. Light type contrast; no gratuitous tracking or heavy headline weight.

## Craft state
Photography: 70–85mm product optics, f/8, high-left large softbox, subtle cool rim, 6:1 shadow contrast. Real brushed aluminium, optical glass, enamel and uncoated paper. Restrained imperfections. Near-black #0b0c0e, paper #efebe1, cobalt #2855ff, enamel #a92e27. Preserve supplied skin colour/texture without filtering.

## Asset plan
| Asset | Meaning and placement | Production | Crop / layers | Delivery / loading |
|---|---|---|---|---|
| Optical signal hero | Notice one meaningful thread in noise | Built-in image generation, original editorial object photograph | Wide, text-safe left; mobile crops instrument at right | WebP/AVIF responsive; eager; descriptive alt |
| Red postbox | Human destination for a signal | Built-in image generation, original enamel object photograph | Portrait, front-facing slot; animated letter remains independent DOM panels | WebP; lazy; decorative scene image with readable DOM labels |
| Process signal | Observations become one investigated question | Original SVG/HTML diagram and animated tracing line | Responsive native vector, real labels | Inline, no raster text |
| 0001 specimen | Work protected while developing | HTML/SVG physical folder composition, exact 0001 label | Layered paper and blue vellum, no fake software UI | Native graphics, semantic product text |
| Founders | Real people behind the work | Existing approved photographs, no face edits | Square, mobile-safe; opposite slow movement | Existing WebP, lazy, identity alt |
| Mail panels | Physical folding and enclosing | Independent HTML planes, GSAP timeline | Three paper panels, envelope back/front/flap, seal | Semantic form separate; reduced-motion fallback |

## Production order
Generate and inspect hero/postbox imagery → assemble hero and mail keyframes in browser → complete page → test mobile and submission states → deploy. Decorative ASCII interprets the blue thread rather than repeating a wallpaper. All animation is progressive enhancement; server confirmation controls posted state.
