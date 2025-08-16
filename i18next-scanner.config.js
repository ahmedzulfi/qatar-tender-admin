const fs = require('fs');
const path = require('path');

module.exports = {
  input: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    // Add other directories as needed
  ],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'i18next.t', 'i18n.t'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    lngs: ['en', 'ar'],
    ns: ['common'],
    defaultLng: 'en',
    defaultNs: 'common',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  transform: function customTransform(file, enc, done) {
    "use strict";
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    // Custom regex patterns to find English text
    const patterns = [
      // String literals in JSX
      />\s*([A-Za-z][^<>{}\n]*[A-Za-z])\s*</g,
      // String literals in quotes
      /['"`]([A-Za-z][^'"`\n]*[A-Za-z])['"`]/g,
      // Placeholder text
      /placeholder\s*=\s*['"`]([^'"`\n]+)['"`]/g,
      // Title attributes
      /title\s*=\s*['"`]([^'"`\n]+)['"`]/g,
      // Alt text
      /alt\s*=\s*['"`]([^'"`\n]+)['"`]/g,
      // Button text, labels etc
      /(?:label|text|content)\s*[:=]\s*['"`]([^'"`\n]+)['"`]/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();
        
        // Skip if it's likely a variable, component name, or code
        if (
          text.length > 2 && 
          !/^[A-Z_][A-Z0-9_]*$/.test(text) && // Skip constants
          !/^\w+$/.test(text) || text.includes(' ') && // Single words or phrases with spaces
          !text.includes('{{') && // Skip interpolated strings
          !text.includes('${') && // Skip template literals
          !/^\d+$/.test(text) && // Skip numbers
          !/^[a-z]+[A-Z]/.test(text) && // Skip camelCase
          !text.includes('()') && // Skip function calls
          !text.includes('www.') && // Skip URLs
          !text.includes('@') // Skip emails
        ) {
          const key = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
          
          parser.parseFuncFromString(
            `t('${key}', '${text}')`,
            { list: ['t'] },
            (key, options) => {
              parser.set(key, options.defaultValue || text);
            }
          );
          count++;
        }
      }
    });

    if (count > 0) {
      console.log(`Found ${count} translatable strings in ${file.relative}`);
    }

    done();
  }
};