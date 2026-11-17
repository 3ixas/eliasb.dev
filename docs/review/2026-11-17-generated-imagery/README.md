# Where generated images would take the site further

The review for [#484](https://github.com/3ixas/eliasb.dev/issues/484), 17 November 2026. Each part of the site is judged on one question: would a generated or edited raster image take it further than drawing it in code already does, without claiming anything that isn't true? Captures of each part as it stands are in `before/`; generated samples are in `samples/`, each with the prompt that made it.

## The short answer

One clear yes: **the 3D staff pass's materials**, the webbing and the hologram's foil (the card stock sample showed too little to earn its weight). The pass is the site's reference object (#448), and its webbing weave, hologram and card stock are drawn procedurally in `lanyard/strap.ts` and `lanyard/face.ts`. Real material textures are where generation is strongest and most honest: a texture claims nothing, and the pass would read as a made object at the size a visitor holds it. Everything else is a no or a not yet, mostly because a generated picture would claim something (a product, a person, a place) or because a vector drawing does the job better at its size.

## Verdict by part

| Part | Verdict | Why |
|---|---|---|
| The 3D pass's materials (#448) | **Yes** | The weave, foil and card stock are procedural canvases today. A photographic, tileable texture for each (webbing tinted per employer, foil, near-white stock) adds the detail a held, turned card shows close up. They feed the existing `map` and `normalMap` slots, so the scene's structure stays. Samples below. |
| Share cards (#469) | No: render the real pass | The card should carry the object, and the object exists: capture the site's own pass (its print, or a still from the 3D scene) rather than generate a likeness that would drift from it. |
| The favicon (#469) | Not yet | A favicon is a crisp mark at 16 to 32 px, which wants vector. Generation could explore concepts, but #469 already has two candidates; revisit only if neither lands. |
| The greeting's scenes (#467) | No | 30 px scenes with moving parts (the steam, the minute hand, the lamp's pool) need vector parts to animate; a raster at that size blurs and cannot move. |
| The 404's visitor pass (#470) | No | It is one of the site's passes, printed "Visitor"; it should come from the same pass component so it matches the others exactly. |
| Off the clock (#465) | No | Its imagery is real: the training photograph, the book cover, the film poster. A generated stand-in would claim something that isn't. |
| Where I'm headed (#459) | No | Each part's proof is data, drawn to scale. |
| Panels and surfaces (#476) | Not yet | A paper grain under the paper panels could add tooth, but #476's depth was approved as is; try it only if the panels read flat again, and only at a strength that keeps AA. |
| Case-study openings (#462 to #464) | No | The ticket's own line holds: the product picture is the real capture (#460), and a generated setting around it (a desk, a device) is decoration that models nothing. |
| Role story openings, the portrait | No | Real people and real employers are never generated. |

## The samples

Generated through Codex's ImageGen, as ekit routes image work (3ixas/ekit#40, #41), each saved and inspected before it counts.

Each is a 1254 px square from Codex's built-in ImageGen (17 November 2026), kept here as WebP. The `-tiled` file is the same square repeated 2 × 2, which is how the scene would use it: the test of a texture is its seam.

| Sample | Seen | Verdict |
|---|---|---|
| Webbing (`samples/webbing.webp`, `webbing-tiled.webp`) | A convincing polyester twill, with real thread and fibre detail and an even mid-grey that tints to any employer's colour. The twill runs on the diagonal rather than straight down the strap, and a horizontal seam shows where tiles meet. | **Yes, with work.** It beats the procedural weave on detail. The seam is the usual fix (offset by half and blend the join), and the twill's angle is a rotation in the texture's UVs. |
| Foil (`samples/foil.webp`, `foil-tiled.webp`) | A fine guilloche of interlaced waves under a soft diffraction rainbow: it reads as a security hologram. A vertical seam shows at the join. | **Yes, with work.** The same seam fix; at the hologram's size (a few millimetres on the card) the pattern repeats only once or twice, so the seam may never show. |
| Card stock (`samples/card-stock.webp`, `card-stock-tiled.webp`) | Seamless, near-white and almost featureless. | **No.** At the card's size it adds nothing a little procedural noise does not, for a texture's weight. |

The prompts, as Codex gave them to ImageGen:

- **Webbing:** "Create one square, at least 1024 × 1024, seamless repeatable PBR base-colour tile of neutral mid-grey woven polyester ID lanyard webbing. Use strictly monochrome grey with equal red, green and blue. Fill the frame edge to edge with a fine, regular, low-contrast polyester twill, with vertical warp threads, visible fine yarn fibres and a faint satin sheen. Orthographic overhead macro view under uniform diffuse, shadowless light. The square is one complete repeat cell with an integer number of weave repeats along each axis. Threads that exit the right or bottom edge continue at the same position and phase on the left or top edge, with no change to pitch, brightness or orientation at the wrap. No ribbon outline, border, folds, vignette, logos, text, people, brand marks, or watermarks."
- **Foil:** "Create one square, at least 1024 × 1024, seamless repeatable material texture of holographic security foil for a fictional staff ID card in three.js. Edge-to-edge straight overhead macro photograph under uniform soft lighting. Cover a silver base in a very fine, regular guilloche pattern of interlaced shallow waves and an even, subdued diffraction rainbow sheen. Use many small, identical repeats with an integer number of periods both horizontally and vertically. Compose as one periodic pattern tile: each fine line flows through the frame boundary and resumes at the corresponding position and angle on the opposite edge, and colour and illumination continue cleanly across each wrap. No large gradients or isolated highlights. No patch outline, symbols, logos, text, people, brand marks, or watermarks."
- **Card stock:** "Generate a single square 1024 × 1024 or larger seamless, tileable photographic macro material texture of a matte white laminated PVC staff ID card surface for three.js. View the surface straight overhead and fill the entire frame edge to edge. The surface is near-white and almost featureless, with very subtle, uniformly distributed fine grain. Use even, soft, shadowless light, with no directional shading or gradient. Match brightness and grain at opposing edges so the texture repeats cleanly on both axes. No card outline, edges, scratches, specks, logos, text, people, brand marks, or watermarks."

None of these has been tried in the scene yet: that is the next step, and the only real test.

## The next step

If Elias picks the pass's materials: a ticket under #455, after #448's follow-ups, to try each texture in the scene one at a time (the Hill Climb way): the webbing first, with its seam blended and its twill turned to run down the strap, judged on a real iPhone; then the foil. Its gates: the frame cost stays at today's (a median near 7 ms at 2×), the page's image weight stays within budget (each texture compressed and sized to what the card shows), and the textures are credited in `docs/content/IMAGE-CREDITS.md` as generated, with the tool and date.
