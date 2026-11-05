import { build } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

function attribute(tag, name) {
  const match = tag.match(new RegExp('\\b' + name + '\\s*=\\s*(["\\\'])([\\s\\S]*?)\\1', 'i'));
  return match?.[2];
}

async function assetText(url, expectedExtension) {
  if (!url || /^(?:[a-z]+:|\/\/|\/)/i.test(url)) throw new Error(`Expected a relative built asset, received: ${url}`);
  const clean = decodeURIComponent(url.split(/[?#]/, 1)[0]).replace(/^\.\//, '');
  if (!clean.startsWith('assets/')) throw new Error(`Unexpected asset location: ${url}`);
  const file = resolve(dist, clean);
  const within = relative(dist, file);
  if (within.startsWith('..') || isAbsolute(within) || extname(file) !== expectedExtension) {
    throw new Error(`Refusing an asset outside dist or with the wrong type: ${url}`);
  }
  return readFile(file, 'utf8');
}

function verifyStandalone(html, javascript) {
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) throw new Error('An external script remains in the standalone HTML.');
  if (/<link\b[^>]*\brel\s*=\s*(["'])stylesheet\1/i.test(html)) throw new Error('An external stylesheet remains in the standalone HTML.');
  if (/\bimport\s*\(/.test(javascript)) throw new Error('The build contains dynamic imports; keep this scene in one JavaScript bundle.');
  if (/(?:^|[;\n])\s*import\s+(?:[^'";\n]*?\bfrom\s*)?(['"])(?![./]|data:)[^'"]+\1/m.test(javascript)) {
    throw new Error('A bare module import remains in the standalone JavaScript.');
  }
  if (/<script\b[^>]*\b(?:src|href)\s*=\s*['"]https?:/i.test(html)) throw new Error('A CDN script remains in the standalone HTML.');
}

await build({ root });
let html = await readFile(resolve(dist, 'index.html'), 'utf8');
html = html.replace(/<(?:script|link)\b[^>]*>/gi, tag =>
  tag.replace(/\s+crossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, ''));
const moduleTags = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)]
  .map(match => match[0])
  .filter(tag => attribute(tag, 'type') === 'module');
if (moduleTags.length !== 1) throw new Error(`Expected exactly one Vite module script, found ${moduleTags.length}.`);
const moduleTag = moduleTags[0];
const javascript = await assetText(attribute(moduleTag, 'src'), '.js');
const escapedJavascript = javascript.replace(/<\/script/gi, '<\\/script');
html = html.replace(moduleTag, () => `<script type="module">\n${escapedJavascript}\n</script>`);

const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]);
for (const tag of links) {
  if ((attribute(tag, 'rel') || '').toLowerCase() !== 'stylesheet') continue;
  const css = await assetText(attribute(tag, 'href'), '.css');
  html = html.replace(tag, () => `<style>\n${css.replace(/<\/style/gi, '<\\/style')}\n</style>`);
}
verifyStandalone(html, javascript);

const license = await readFile(resolve(root, 'LICENSE'), 'utf8');
const notices = await readFile(resolve(root, 'THIRD_PARTY_NOTICES.md'), 'utf8');
const licenses = `Project license\n\n${license.trim()}\n\nThird-party notices\n\n${notices.trim()}`;
if (licenses.includes('-->')) throw new Error('The license text contains an HTML comment terminator.');
html = `${html.trimEnd()}\n\n<!--\n${licenses}\n-->\n`;

await mkdir(resolve(root, 'docs'), { recursive: true });
const offline = resolve(root, '雨夜中式庭院.html');
await writeFile(offline, html, 'utf8');
await writeFile(resolve(root, 'docs', 'index.html'), html, 'utf8');
console.log(`Offline HTML: ${offline}`);
console.log(`GitHub Pages entry: ${resolve(root, 'docs', 'index.html')}`);
console.log(`Standalone size: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KiB; no external scripts or stylesheets.`);
