// scripts/extract-i18n.js
// Usage:
//   node scripts/extract-i18n.js --src "src/**/*.{ts,tsx,js,jsx}" --out "public/locales/en/common.json"
// Options:
//   --src   glob for files to scan (default: "src/**/*.{ts,tsx,js,jsx}")
//   --out   path to output JSON (default: "public/locales/en/common.json")
//   --fill  "empty" (default) | "same"  (if "same", fills values with key text)

import fsExtra from "fs-extra";
const { readFile, pathExists, readJson, mkdirp, writeJson } = fsExtra;

import {glob} from "glob";
import path from "path";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import minimist from "minimist";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = minimist(process.argv.slice(2));
const srcGlob = argv.src || "src/**/*.{ts,tsx,js,jsx}";
const outFile = argv.out || "public/locales/en/common.json";
const fillMode = argv.fill || "empty";

function parseFile(content, filename) {
  try {
    return parser.parse(content, {
      sourceType: "unambiguous",
      plugins: [
        "typescript",
        "jsx",
        "classProperties",
        "decorators-legacy",
        "optionalChaining",
        "nullishCoalescingOperator",
        "dynamicImport",
      ],
      allowAwaitOutsideFunction: true,
    });
  } catch (err) {
    console.warn(`⚠️  Parse failed for ${filename} — skipping. (${err.message})`);
    return null;
  }
}

function collectKeysFromAST(ast) {
  const keys = new Set();
  traverse.default(ast, {
    CallExpression(path) {
      const callee = path.node.callee;

      const isT =
        (callee.type === "Identifier" && callee.name === "t") ||
        (callee.type === "MemberExpression" &&
          ((callee.property &&
            callee.property.type === "Identifier" &&
            callee.property.name === "t") ||
            (callee.property &&
              callee.property.type === "StringLiteral" &&
              callee.property.value === "t")));

      if (!isT) return;

      const args = path.node.arguments;
      if (!args || args.length === 0) return;

      const first = args[0];

      if (first.type === "StringLiteral" || first.type === "Literal") {
        keys.add(first.value);
      } else if (first.type === "TemplateLiteral" && first.quasis.length === 1) {
        keys.add(first.quasis[0].value.cooked);
      }
    },
  });
  return Array.from(keys);
}

(async function main() {
  console.log(`Scanning files: ${srcGlob}`);

  // ✅ FIX: glob is CommonJS, use glob.sync directly
  const files = glob.sync(srcGlob, {
    nodir: true,
    ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  });

  if (!files.length) {
    console.error("No files found by glob. Adjust --src.");
    process.exit(1);
  }

  const allKeys = new Set();
  for (const f of files) {
    const content = await readFile(f, "utf8");
    const ast = parseFile(content, f);
    if (!ast) continue;
    const keys = collectKeysFromAST(ast);
    keys.forEach((k) => allKeys.add(k));
  }

  const sortedKeys = Array.from(allKeys).sort();

  let existing = {};
  if (await pathExists(outFile)) {
    try {
      existing = await readJson(outFile);
    } catch (e) {
      console.warn(`Could not parse existing ${outFile}, continuing with empty object.`);
    }
  } else {
    await mkdirp(path.dirname(outFile));
  }

  const merged = { ...existing };
  for (const k of sortedKeys) {
    if (!(k in merged)) {
      merged[k] = fillMode === "same" ? k : "";
    }
  }

  await writeJson(outFile, merged, { spaces: 2 });

  console.log(`✔ Extracted ${sortedKeys.length} keys.`);
  console.log(`Output written to: ${outFile}`);
  process.exit(0);
})();
