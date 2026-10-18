# Brag Plan: Wayfind

## Nine-question rubric
1. App: a Bible web app for feeling-based Scripture discovery, reading and Fellowship.
2. Most impressive supported capability: move from a feeling to a Bible passage, then bring Scripture into an approachable conversation; Kinyarwanda reading is a distinctive local strength.
3. Visual hook: a real cream-and-amber Bible screen beside large serif “A verse for what you feel.”
4. Actual UI: feeling search/result, Kinyarwanda reader and the Fellowship + attachment menu/verse preview.
5. Shortest satisfying cut: 20 seconds. One hook, a readable search action/result, a reading moment, a sharing moment and a clear URL.
6. Tone: app-store, interpreted as warm editorial faith/community rather than corporate spectacle.
7. Audio: restrained warm music and sparse interface accents. No narration, dramatic trailer impacts or emotional pressure.
8. Share caption: “A verse for what you feel. A place to share what you’re reading. Meet Wayfind: app.wayfind.workers.dev.”
9. User flow: choose Feel → enter “anxious” → see Scripture; open Bible → choose KIN; open Fellowship → + → choose a verse. No public message is posted for capture.

## Angle and format
“Find a verse. Share the encouragement.” English, vertical 1080×1920, 30 fps, exactly 20 seconds. Visual identity comes from the app, not a new SaaS identity. Keep product screens large enough to recognize; headlines carry the message rather than requiring a whole passage to be read in seconds.

## Storyboard
| Time | Scene | On-screen copy and evidence | Interaction/audio |
| --- | --- | --- | --- |
| 0–3 | Hook | “A verse for what you feel.” Wayfind mark and actual feeling-entry UI | Fast entrance, then a full readable hold; quiet music begins |
| 3–8 | Find | “Start with how you feel.” Real feeling-entry screenshot changes to the actual “anxious” result | A visible tap accent connects entry to result; one light UI sound |
| 8–12.5 | Read | “Read in Kinyarwanda.” Actual KIN reader | Reader settles fully in frame; restrained lateral entrance |
| 12.5–17 | Share | “Share the encouragement.” Actual + menu then an attached verse draft | Action-matched accent on the menu/verse change; never simulate a public send |
| 17–20 | Invite | “Wayfind.” “Read. Share. Grow together.” app.wayfind.workers.dev | Calm logo lockup, long readable URL hold, audio fades |

## Readability, motion and sound
Large dark text on cream. Headlines enter within roughly 0.4 seconds; lines hold at least 0.3 seconds per word. No flashes, pointless statistics or copied WhatsApp branding. Gentle card depth, serif headline reveals, deliberate product-frame transitions. Music RMS may subtly alter an existing warm background wash, not the text size. Optional cue locks come from the selected track's actual metadata; readability overrides a cue.

## Grounding and privacy
Read index.html, README, app palette, FeelScreen, ReaderScreen, FellowshipScreen and ChatRoom. Real screens come from https://app.wayfind.workers.dev. Campaign captures use a new anonymous browser profile. No fake reviews, real conversations, account codes or paid features are shown. Phone framing illustrates the PWA; it is not proof of a native app-store listing.

## Delivery gates
Hyperframes check must pass with contrast auditing enabled. Inspect settled frames for every scene. Render a high-quality MP4. Select the strongest settled frame for brag.jpg and bake it into frame zero without changing duration or audio timing. Deliver share-copy.txt separately from caption variants. GitHub standard public runners only; no billed Actions artifacts or hosted rendering API.
