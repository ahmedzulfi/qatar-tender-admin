import fs from "fs";
import path from "path";

const ROOT_DIR = path.resolve(process.cwd(), "app");
const COMPONENTS_DIR = path.resolve(process.cwd(), "components");
const OUTPUT_FILE = path.resolve(process.cwd(), "translations.json");

const translationRegex = /t\(["'`]([^"'`]+)["'`]\)/g;

const keys = new Set<string>();

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && /\.(tsx|ts|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      let match;
      while ((match = translationRegex.exec(content)) !== null) {
        keys.add(match[1]);
      }
    }
  }
}

console.log("Scanning for translation keys...");

scanDirectory(ROOT_DIR);
if (fs.existsSync(COMPONENTS_DIR)) scanDirectory(COMPONENTS_DIR);

const translations: Record<string, string> = {};
Array.from(keys)
  .sort()
  .forEach((key) => {
    translations[key] = "";
  });

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(translations, null, 2), "utf-8");

console.log(`✅ Extracted ${keys.size} translation keys.`);
console.log(`📁 Saved to ${OUTPUT_FILE}`);
