# INFINYTHARQ

One universe. Endless identities. Pure HTML, CSS and vanilla JavaScript; no build step, server or database.

## Run
Open `index.html`, or push the four files to a GitHub repo and enable **Settings > Pages**.

## How the infinite universe works
- Profile **N** is computed from its ID string alone (hashed into a seeded random generator). Nothing is stored, so profiles never run out and any ID always gives the same profile.
- IDs are decimal **strings**, incremented with exact digit arithmetic. `Number`, `parseInt` and `parseFloat` are never used for IDs, so there is no length limit and no truncation.
- 360 profiles render at load. A background loop (small time slices) keeps two 300-profile batches ready, and appends one whenever the user is within ~4 screens of the end. Three triggers run in parallel: IntersectionObserver, a scroll listener and a timer. Appending below the viewport never moves the scroll position, and nothing scrolls automatically.
- Memory: chunks far from the screen are emptied but keep their exact height through CSS (fixed card height and column counts), and are regenerated when you scroll back. Very old chunks (200+ batches behind you) are removed with an exact scroll compensation so the page height stays bounded.

## Search
- Digits (or `#digits`): exact ID lookup, any length. The profile is generated directly, even if it is billions of screens away.
- Text: partial names, handles, keywords, origins, traits. Matches stream in by scanning IDs upward from 1 and continue as you scroll the results.

Names combine millions of syllable and surname combinations; the ID and handle are what guarantee uniqueness.

## Files
`index.html`, `style.css`, `script.js`, `README.md`
