"""Keep the app's original CSS cascade while reducing stylesheet requests.
Run after editing a source listed in app/style-bundles.json; --check detects stale bundles.
"""
from pathlib import Path
import hashlib, html as html_module, json, re, sys
from urllib.parse import urljoin
ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'app/style-bundles.json').read_text())
index = ROOT / 'app/index.html'
html = index.read_text()
check = '--check' in sys.argv
stale = []
for group in manifest:
    parts = ['@charset "UTF-8";\n']
    for source in group['sources']:
        css = (ROOT / source).read_text()
        css = re.sub(r'@charset\s+"[^"]+";', '', css, flags=re.I)
        def rebase(match):
            value = match.group(2)
            if value.startswith(('data:', '/', '#')) or re.match(r'^[a-z]+:', value, re.I):
                return match.group(0)
            return 'url(' + match.group(1) + urljoin('/' + source, value) + match.group(1) + ')'
        css = re.sub(r'url\(\s*([\'\"]?)(.*?)(\1)\s*\)', rebase, css, flags=re.S)
        parts.append('\n/* Source: ' + source + ' */\n' + css + '\n')
    content = ''.join(parts).rstrip() + '\n'
    target = ROOT / group['output']
    digest = hashlib.sha256(content.encode()).hexdigest()[:12]
    href = target.name + '?v=' + digest
    pattern = r'<link rel="stylesheet" data-style-bundle="' + group['id'] + r'"[^>]*>'
    source_urls = ['/' + source + '?v=' + hashlib.sha256((ROOT / source).read_bytes()).hexdigest()[:12] for source in group['sources']]
    source_attr = html_module.escape(json.dumps(source_urls, separators=(',', ':')), quote=True)
    tag = '<link rel="stylesheet" data-style-bundle="' + group['id'] + '" href="' + href + '" data-source-styles="' + source_attr + '">'
    updated, count = re.subn(pattern, lambda m: tag, html)
    if count != 1: raise SystemExit('Missing bundle link: ' + group['id'])
    if not target.exists() or target.read_text() != content or updated != html:
        stale.append(group['id'])
    if not check: target.write_text(content)
    html = updated
if check and stale: raise SystemExit('Stale CSS bundles: ' + ', '.join(stale))
if not check: index.write_text(html)
print('CSS bundles verified' if check else 'CSS bundles rebuilt')
