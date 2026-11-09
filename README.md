# 나의 하트비트! 💖

Mobile-first Korean preference-test experience for a two-condition rarity-information study. It includes consent, six light preference choices, randomized A/B copy for the same evaluation artwork, four 1–5 ratings, a playful result, and a final debrief.

## Run

Open `index.html` in a modern browser or host the repository as a static site. No build step or external service is required. Google Fonts are optional; the page falls back to system fonts.

## Current data behavior and research deployment caveat

Responses and the condition assignment are stored in the participant's browser (`localStorage` / `sessionStorage`); the page does **not** transmit data to a server. The `?admin` page summarizes and exports CSV data available in that same browser only. It is not authenticated, and local browser storage cannot aggregate participants across devices. The client balances the next assignment against locally stored A/B counts, which is approximately 50:50 on one device, not a centralized randomized allocation.

Before collecting real research data, configure a secure backend/database for anonymous response submissions and server-side randomized assignment, add authenticated operator access, and have the consent/deception/debrief procedure reviewed under the applicable research ethics process. Avoid treating this static demo's admin page as a protected research dashboard.

## Stored CSV fields

`id`, `completed_at`, `condition` (A=rarity claim, B=common claim), six `preference_*` values (0/1 choice index), and four `rating_*` values (1–5).
