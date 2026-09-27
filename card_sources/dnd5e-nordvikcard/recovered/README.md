# Recovered reference

The original nordvikcard source was lost on 2026-09-26. It had lived in a nested git repo that was never pushed. On 2026-09-27 `src/` and `hooks/` were rebuilt from the files below.

- `app.pretty.js` is the app portion (React stripped) of the last installed bundle, `packed/Resources/dnd5e-nordvikcard.js` at 7931a68, run through prettier. It's the reference the rebuild was checked against. A fresh build matches it declaration by declaration, apart from minifier naming, a react-icons patch version, and one inlined weight formatter.
- The card's CSS was exported from an installed copy in the backend DB (Resources table, `dnd5e_dnd5e-nordvikcard.css`). Commit 559ec00 has the byte-for-byte minified original. `src/App.css` is that same file run through prettier, and it builds to identical output.

Once the rebuilt card has been checked in the app, this folder can be deleted.
