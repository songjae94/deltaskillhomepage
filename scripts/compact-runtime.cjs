// Only remove whitespace and non-license comments. Preserve identifiers and
// disable compressor rewrites in the legacy classic scripts.
const { readFileSync } = require('node:fs');
const { minify } = require('terser');

async function main() {
  const files = JSON.parse(readFileSync(0, 'utf8'));
  const compiled = {};
  for (const filename of files) {
    const source = readFileSync(filename, 'utf8');
    compiled[filename] = filename.endsWith('.min.js') ? source : (await minify(source, {
      compress: false,
      mangle: false,
      format: { comments: /^!|@license|@preserve|SPDX-License-Identifier|copyright/i }
    })).code;
  }
  process.stdout.write(JSON.stringify(compiled));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
