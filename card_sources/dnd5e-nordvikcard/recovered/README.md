# Recovered reference

The original nordvikcard source was lost on 2026-09-26. It had lived in a nested git repo that was never pushed.

- `app.pretty.js`: the app portion (with React stripped) of the last installed bundle, `packed/Resources/dnd5e-nordvikcard.js` at 7931a68, run through prettier. It's the reference for the rebuilt `src/`.
- `../src/App.css`: the card's CSS, exported byte for byte from an installed copy in the backend DB (Resources table, `dnd5e_dnd5e-nordvikcard.css`).
