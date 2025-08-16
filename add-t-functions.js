// add-t-functions.js
const fs = require('fs');
const path = require('path');

class TFunctionAdder {
  constructor(translationsPath = './locales/en') {
    // Load your existing translations to match against
    this.existingTranslations = this.loadTranslations(translationsPath);
    this.translationValues = Object.values(this.existingTranslations);
    this.changedFiles = [];
    this.addedTranslations = 0;
  }

  loadTranslations(translationsPath) {
    const translations = {};
    
    try {
      const files = fs.readdirSync(translationsPath);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const content = JSON.parse(fs.readFileSync(path.join(translationsPath, file), 'utf8'));
          Object.assign(translations, content);
        }
      });
      console.log(`📚 Loaded ${Object.keys(translations).length} existing translations`);
    } catch (error) {
      console.log(`⚠️  Could not load translations from ${translationsPath}`);
    }
    
    return translations;
  }

  // Find the translation key for a given text value
  findKeyForText(text) {
    // First try exact match
    for (const [key, value] of Object.entries(this.existingTranslations)) {
      if (value === text) return key;
    }
    
    // Try case-insensitive match
    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(this.existingTranslations)) {
      if (value.toLowerCase() === lowerText) return key;
    }
    
    // Try partial match (for cases where text might be slightly different)
    for (const [key, value] of Object.entries(this.existingTranslations)) {
      if (value.includes(text) || text.includes(value)) {
        if (Math.abs(value.length - text.length) <= 3) { // Allow small differences
          return key;
        }
      }
    }
    
    return null;
  }

  processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let hasUseTranslation = content.includes('useTranslation');
    let hasTranslationImport = content.includes("from '../lib/hooks/useTranslation'") || 
                               content.includes("from '../../lib/hooks/useTranslation'") ||
                               content.includes("from '@/lib/hooks/useTranslation'");

    // Skip if already heavily using translations
    const tCallCount = (content.match(/\bt\(/g) || []).length;
    if (tCallCount > 5) {
      console.log(`⏭️  Skipping ${path.relative(process.cwd(), filePath)} (already has ${tCallCount} t() calls)`);
      return;
    }

    console.log(`🔍 Processing: ${path.relative(process.cwd(), filePath)}`);

    // Define replacement patterns
    const replacements = [
      // JSX text content: >Hello World< becomes >{t('hello_world')}<
      {
        name: 'JSX Text Content',
        pattern: />(\s*)([A-Za-z][^<>{}]*[A-Za-z.]?)(\s*)</g,
        replacement: (match, space1, text, space2) => {
          const cleanText = text.trim();
          if (this.isTranslatableText(cleanText)) {
            const key = this.findKeyForText(cleanText);
            if (key) {
              modified = true;
              this.addedTranslations++;
              console.log(`  ✅ JSX: "${cleanText}" → t('${key}')`);
              return `>${space1}{t('${key}')}${space2}<`;
            }
          }
          return match;
        }
      },

      // String in quotes that matches our translations: "Hello" becomes {t('hello')}
      {
        name: 'Quoted Strings in JSX attributes',
        pattern: /(\w+\s*=\s*)["']([^"']+)["']/g,
        replacement: (match, attr, text) => {
          // Only replace certain attributes
          const attrName = attr.trim().replace(/\s*=\s*$/, '');
          const allowedAttrs = ['placeholder', 'title', 'alt', 'aria-label', 'aria-description'];
          
          if (allowedAttrs.includes(attrName) && this.isTranslatableText(text)) {
            const key = this.findKeyForText(text);
            if (key) {
              modified = true;
              this.addedTranslations++;
              console.log(`  ✅ Attr: ${attrName}="${text}" → ${attrName}={t('${key}')}`);
              return `${attr}{t('${key}')}`;
            }
          }
          return match;
        }
      },

      // Button text and similar: <button>Click Me</button>
      {
        name: 'Button Text',
        pattern: /(<(?:button|span|p|h[1-6]|div|label|li|td|th)\b[^>]*>)([^<>{}\n]+)(<\/)/g,
        replacement: (match, openTag, text, closeTag) => {
          const cleanText = text.trim();
          if (this.isTranslatableText(cleanText) && !openTag.includes('className=') || !cleanText.match(/^[a-z-]+$/)) {
            const key = this.findKeyForText(cleanText);
            if (key) {
              modified = true;
              this.addedTranslations++;
              console.log(`  ✅ Element: "${cleanText}" → t('${key}')`);
              return `${openTag}{t('${key}')}${closeTag}`;
            }
          }
          return match;
        }
      }
    ];

    // Apply all replacements
    let newContent = content;
    replacements.forEach(({ name, pattern, replacement }) => {
      const beforeCount = this.addedTranslations;
      newContent = newContent.replace(pattern, replacement);
      const added = this.addedTranslations - beforeCount;
      if (added > 0) {
        console.log(`  📝 ${name}: ${added} replacements`);
      }
    });

    // Add necessary imports and hooks if we made changes
    if (modified) {
      // Add useTranslation import if not present
      if (!hasTranslationImport) {
        // Determine the correct import path based on file location
        const relativePath = path.relative(path.dirname(filePath), './lib/hooks/useTranslation');
        const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
        
        // Find the last import and add ours after it
        const importRegex = /^(import.*?from.*?['"][^'"]*['"];?\s*\n)/gm;
        const matches = [...newContent.matchAll(importRegex)];
        
        if (matches.length > 0) {
          const lastImport = matches[matches.length - 1];
          const importStatement = `import { useTranslation } from '${importPath}';\n`;
          newContent = newContent.replace(lastImport[0], lastImport[0] + importStatement);
        } else {
          // No imports found, add at the top
          const importStatement = `import { useTranslation } from '${importPath}';\n\n`;
          newContent = importStatement + newContent;
        }
      }

      // Add useTranslation hook if not present
      if (!hasUseTranslation) {
        // Find function component declaration and add hook
        const patterns = [
          // export default function ComponentName
          /(export\s+default\s+function\s+\w+[^{]*\{)(\s*)/,
          // const ComponentName = () => {
          /(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)(\s*)/,
          // function ComponentName() {
          /(function\s+\w+[^{]*\{)(\s*)/
        ];

        for (const pattern of patterns) {
          if (pattern.test(newContent)) {
            const hookStatement = "  const { t } = useTranslation();\n";
            newContent = newContent.replace(pattern, `$1$2${hookStatement}$2`);
            break;
          }
        }
      }

      // Write the modified file
      fs.writeFileSync(filePath, newContent);
      this.changedFiles.push(filePath);
      console.log(`  💾 Saved changes to file\n`);
    } else {
      console.log(`  ⏭️  No changes needed\n`);
    }
  }

  isTranslatableText(text) {
    if (!text || text.length < 2 || text.length > 200) return false;
    
    // Skip if it looks like code/technical content
    const skipPatterns = [
      /^[A-Z_][A-Z0-9_]*$/, // CONSTANTS
      /^[a-z]+[A-Z]/, // camelCase variables
      /^\d+$/, // pure numbers  
      /^https?:\/\//, // URLs
      /^\//, // file paths
      /^\w+\(/, // function calls
      /^#[0-9a-fA-F]/, // hex colors
      /^rgb\(/, // CSS colors
      /^[a-z-]+$/, // CSS class names (kebab-case)
      /^\$\{/, // template literals
      /^{{/, // already interpolated
      /^\w+@\w+/, // email addresses
      /^[0-9.]+[a-z]+$/i, // measurements (10px, 2rem, etc)
    ];
    
    return !skipPatterns.some(pattern => pattern.test(text.trim()));
  }

  scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory ${dir} does not exist`);
      return;
    }

    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file.name)) {
          continue;
        }
        this.scanDirectory(fullPath);
      } else if (file.isFile()) {
        // Process TypeScript/JavaScript React files
        if (/\.(tsx?|jsx?)$/.test(file.name)) {
          this.processFile(fullPath);
        }
      }
    }
  }

  run(directories = ['./app', './components']) {
    console.log('🚀 Starting t() function injection...\n');
    console.log(`📂 Scanning directories: ${directories.join(', ')}`);
    console.log(`🔤 Using translations with ${Object.keys(this.existingTranslations).length} keys\n`);
    
    // Process each directory
    directories.forEach(dir => {
      console.log(`\n📁 Processing directory: ${dir}`);
      this.scanDirectory(dir);
    });
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`   Files modified: ${this.changedFiles.length}`);
    console.log(`   t() calls added: ${this.addedTranslations}`);
    console.log(`   Translation keys used: ${Object.keys(this.existingTranslations).length}`);
    
    if (this.changedFiles.length > 0) {
      console.log('\n📝 Modified files:');
      this.changedFiles.forEach(file => {
        console.log(`   - ${path.relative(process.cwd(), file)}`);
      });
    }
    
    console.log('\n✅ Done! Your code now uses t() functions for internationalization.');
    console.log('🧪 Test your app with language switching to make sure everything works!');
  }
}

// Configuration - adjust these paths for your project
const CONFIG = {
  translationsPath: './locales/en', // Path to your English translations
  scanDirectories: ['./app', './components'], // Directories to scan
  // Add more directories if needed: ['./app', './components', './lib', './pages']
};

// Run the script
console.log('🌐 T() Function Auto-Injector for Next.js');
console.log('==========================================\n');

const injector = new TFunctionAdder(CONFIG.translationsPath);
injector.run(CONFIG.scanDirectories);