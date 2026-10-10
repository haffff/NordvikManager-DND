// Writes data/srd-5.1/ and data/srd-5.2/ from the SRD extract.
//
//   pnpm srd          (extract: tmp-data-to-process/ -> tmp-data-to-process/_srd/)
//   pnpm srd:build    (this: tmp-data-to-process/_srd/ -> data/srd-5.x/)
import fs from "node:fs";
import path from "node:path";
import { buildEdition } from "./buildData.mjs";

const srdDir = path.resolve(process.argv[2] ?? "tmp-data-to-process/_srd");
const dataDir = path.resolve(process.argv[3] ?? "data");

const read = (rel, key) => {
  const file = path.join(srdDir, rel);
  if (!fs.existsSync(file)) throw new Error(`${file} is missing; run "pnpm srd" first.`);
  return JSON.parse(fs.readFileSync(file, "utf8"))[key] ?? [];
};

const srd = {
  items: read("items.json", "item"),
  baseItems: read("items-base.json", "baseitem"),
  spells: [...read("spells/spells-phb.json", "spell"), ...read("spells/spells-xphb.json", "spell")],
  feats: read("feats.json", "feat"),
  languages: read("languages.json", "language"),
};

for (const edition of ["5.1", "5.2"]) {
  const dir = path.join(dataDir, `srd-${edition}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(buildEdition(edition, srd))) {
    fs.writeFileSync(path.join(dir, name), JSON.stringify(content, null, 2) + "\n");
    const [key] = Object.keys(content).filter((k) => k !== "_meta");
    console.log(`srd-${edition}/${name}: ${content[key].length} ${key}`);
  }
}
