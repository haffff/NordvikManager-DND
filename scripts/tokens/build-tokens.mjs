// Writes addon_files/Resources/token_character.json and token_monster.json
// (pnpm tokens:build). See buildTokens.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildToken } from "./buildTokens.mjs";

const resources = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../addon_files/Resources");
const base = JSON.parse(fs.readFileSync(path.join(resources, "token_character.json"), "utf8"));

for (const kind of ["character", "monster"]) {
  const token = buildToken(base, kind);
  fs.writeFileSync(path.join(resources, `token_${kind}.json`), JSON.stringify(token, null, 2) + "\n");
  console.log(`token_${kind}.json: ${token.additions.length} parts, ${token.assignableIcons.length} assignable icons`);
}
