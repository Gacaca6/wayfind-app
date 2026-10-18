# Wayfind English launch campaign

Public product: https://app.wayfind.workers.dev

Production runs on standard public-repository GitHub Actions runners. No hosted rendering service or paid generation API is used. Outputs are committed to this dedicated campaign branch instead of GitHub Actions artifact storage. No app credentials, customer conversations or Cloudflare tokens are required.

`capture.mjs` walks the real deployed PWA using Playwright. Goldie's normal native capture stage is replaced with browser screenshots and its documented capture-manifest format. `goldie frame` produces the graphics using Goldie's renderer and bundled Pixel artwork. These are campaign illustrations of the PWA, not native store-submission evidence.

Video follows the Brag workflow: specific app story, readable hook, real product screens, 15–25 seconds, music/SFX, Hyperframes checks, a deliberately selected poster baked into frame zero, and canonical share copy. Voiceover is off.

Pinned tools: Goldie 0.5.0; Hyperframes 0.8.171; Playwright 1.56.1; GSAP 3.14.2. Brag reference commit: 069432cac935ed1895859df201c31436c07fb74e. Goldie source inspected: 699578cefe908141433489125599d12a29a9f8db.
