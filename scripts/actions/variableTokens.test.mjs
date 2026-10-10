// The backend reads %v:… only with a field path (VariablePathResolver:
// %v:name.field% or %v:name[0]%); a plain variable is %name%. A %v:name% without a
// path is left in the text as it is: an If condition then fails with
// "Missing operand before 'Mod' operator", and a property gets the literal text.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const actionsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../addon_files/Actions");

test("every %v: variable in the addon's actions has a field path", () => {
  for (const file of fs.readdirSync(actionsDir).filter((f) => f.endsWith(".json"))) {
    const text = fs.readFileSync(path.join(actionsDir, file), "utf8");
    for (const token of text.match(/%v:[^%"]*%/g) ?? []) {
      assert.match(token, /^%v:\w+((?:\.\w+|\[\d+\])+)%$/, `${file}: ${token} needs a path, or use %name% for a plain variable`);
    }
  }
});
