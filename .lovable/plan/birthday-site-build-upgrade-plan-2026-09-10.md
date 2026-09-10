# Birthday site — build & upgrade plan

The uploaded file is already a complete, working 32-page birthday experience (password `rarespeciwomen`, replay/archive password `mnbvcxz`). Rather than rebuild it from scratch and risk losing details, I'll bring it into the project as-is and then do the five upgrades you asked for.

## 1. Get it live

- The uploaded page weighs 17 MB, almost all of it three songs and four photos pasted directly into the file. I'll pull those out and host them properly, which shrinks the page itself to roughly 200 KB.
- The experience becomes the app's home page, so opening the link goes straight to the password screen.
- Page title, description and social preview text get real wording instead of the placeholder.

## 2. Replay mode covers all 32 pages

The archive sidebar is generated from the live page list, so it already lists 32 entries. I'll go through it end to end and fix what looks broken there: pages that render empty because their content is only built on interaction, thumbnails with missing or wrong labels, and the little icon list that is currently one item short of the page count.

## 3. Cleaner, more modern light and dark palettes

Both themes get a refreshed set of colours: softer, warmer neutrals, one confident accent family instead of five competing brights, gentler shadows, and proper contrast for text in both modes. Colours are already centralised at the top of the file, so every card, chip and button follows automatically.

## 4. Faster loading

- Songs and photos load only when their page is reached, not up front.
- Photos get width/height and lazy loading so nothing jumps while it loads.
- The animated background starfield is generated at a lighter density and pauses when the page is in the background.
- Heavy blur effects are trimmed on small screens.

## 5. Smoother animations

Page transitions, panels and hovers move to consistent easing and durations, animate only position and opacity, and fully respect the "reduce motion" setting.

## 6. Friendlier wording

I'll rewrite the robotic prompts — "Incorrect password.", "ARCHIVE · VIEW ONLY · NO CAMERA", "JUMP HERE ↗", "Try again", terminal-style all-caps labels — into warm, natural lines, while keeping the intentional jokes (the fake "wrong password" gag on the entry screen, the in-jokes in the notes) exactly as they are.

## Technical notes

- `public/experience/` holds the extracted audio and images; the page markup lives in the repo as an editable HTML file and is mounted at `/` full-screen with camera/mic/autoplay permissions passed through, so all existing inline scripts keep working untouched.
- No backend, database or accounts needed — the passwords stay client-side exactly as they are today, which is fine for a private link but not real security.
