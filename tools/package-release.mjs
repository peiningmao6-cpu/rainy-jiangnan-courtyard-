import { readFile, writeFile, readdir, mkdir, lstat } from 'node:fs/promises';
import { dirname, resolve, join, relative, isAbsolute, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootFiles = [
  '.gitignore', 'index.html', 'package.json', 'pnpm-lock.yaml',
  'pnpm-workspace.yaml', 'vite.config.js', 'README.md', '使用说明.txt',
  'LICENSE', 'THIRD_PARTY_NOTICES.md', '雨夜中式庭院.html'
];
const sourceDirectories = ['src', 'tools', 'docs', 'previews'];
const excluded = new Set(['node_modules', 'dist', '.git', 'release', '.pnpm-store', '.DS_Store', 'Thumbs.db', 'Desktop.ini']);
const byteOrder = (a, b) => a < b ? -1 : a > b ? 1 : 0;

const crcTable = Array.from({ length: 256 }, (_, value) => {
  for (let i = 0; i < 8; i++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function dosTimestamp() {
  const epoch = process.env.SOURCE_DATE_EPOCH;
  const date = epoch === undefined ? new Date('2026-11-04T00:00:00Z') : new Date(Number(epoch) * 1000);
  if (!Number.isFinite(date.valueOf())) throw new Error('SOURCE_DATE_EPOCH must be a valid Unix timestamp.');
  const year = Math.max(1980, Math.min(2107, date.getUTCFullYear()));
  return {
    date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
    time: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2)
  };
}

/** A deterministic ZIP32 archive, using UTF-8 names and raw DEFLATE only. */
export function createZip(entries) {
  if (entries.length > 65535) throw new Error('Too many files for a ZIP32 archive.');
  const stamp = dosTimestamp(), localParts = [], centralParts = [];
  let offset = 0;
  const names = new Set();
  for (const entry of [...entries].sort((a, b) => byteOrder(a.path, b.path))) {
    const name = entry.path.replaceAll('\\', '/');
    if (!name || name.startsWith('/') || name.split('/').some(p => p === '..' || p === '' || p.includes(':')) || names.has(name)) {
      throw new Error(`Unsafe or duplicate archive path: ${name}`);
    }
    names.add(name);
    const filename = Buffer.from(name, 'utf8'), data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data);
    const compressed = deflateRawSync(data, { level: 9 }), checksum = crc32(data);
    if (filename.length > 65535 || data.length > 0xffffffff || compressed.length > 0xffffffff || offset > 0xffffffff) throw new Error('Archive exceeds ZIP32 limits.');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
    local.writeUInt16LE(stamp.time, 10); local.writeUInt16LE(stamp.date, 12);
    local.writeUInt32LE(checksum, 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(filename.length, 26); local.writeUInt16LE(0, 28);
    localParts.push(local, filename, compressed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(0x0314, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10);
    central.writeUInt16LE(stamp.time, 12); central.writeUInt16LE(stamp.date, 14);
    central.writeUInt32LE(checksum, 16); central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(filename.length, 28); central.writeUInt16LE(0, 30); central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34); central.writeUInt16LE(0, 36);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); central.writeUInt32LE(offset, 42);
    centralParts.push(central, filename);
    offset += local.length + filename.length + compressed.length;
  }
  const central = Buffer.concat(centralParts);
  if (offset > 0xffffffff || central.length > 0xffffffff) throw new Error('Archive exceeds ZIP32 limits.');
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, central, end]);
}

async function requirePlainFile(file) {
  const stat = await lstat(file);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Expected a regular source file: ${file}`);
}
async function directoryExists(directory) {
  try {
    const stat = await lstat(directory);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Expected a plain directory: ${directory}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
async function collectDirectory(directory, files) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => byteOrder(a.name, b.name))) {
    if (excluded.has(entry.name)) continue;
    const file = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing to package a symbolic link: ${file}`);
    if (entry.isDirectory()) await collectDirectory(file, files);
    else if (entry.isFile()) files.push(file);
    else throw new Error(`Unsupported source entry: ${file}`);
  }
}
async function validateOutput(directory, files, directories, current = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const name = current ? `${current}/${entry.name}` : entry.name;
    const file = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Output contains a symbolic link; left untouched: ${name}`);
    if (entry.isDirectory()) {
      if (!directories.has(name)) throw new Error(`Output contains an unknown directory; left untouched: ${name}`);
      await validateOutput(file, files, directories, name);
    } else if (!entry.isFile() || !files.has(name)) {
      throw new Error(`Output contains an unknown file; left untouched: ${name}`);
    }
  }
}

export async function packageRelease() {
  const sourceFiles = rootFiles.map(file => resolve(root, file));
  for (const file of sourceFiles) await requirePlainFile(file);
  for (const name of sourceDirectories) {
    const directory = resolve(root, name);
    if (await directoryExists(directory)) await collectDirectory(directory, sourceFiles);
    else if (name !== 'previews') throw new Error(`Missing source directory: ${name}; run the build first.`);
  }
  const entries = [];
  for (const file of sourceFiles) {
    const path = relative(root, file).replaceAll('\\', '/');
    if (path.startsWith('../') || isAbsolute(path)) throw new Error(`Source escaped the project: ${file}`);
    entries.push({ path, data: await readFile(file) });
  }
  entries.sort((a, b) => byteOrder(a.path, b.path));
  const allowedFiles = new Set(entries.map(entry => entry.path)), allowedDirectories = new Set();
  for (const { path } of entries) {
    let directory = posix.dirname(path);
    while (directory !== '.') { allowedDirectories.add(directory); directory = posix.dirname(directory); }
  }
  const release = resolve(root, 'release');
  const output = resolve(release, 'GitHub上传文件-rainy-jiangnan-courtyard');
  if (!await directoryExists(release)) await mkdir(release);
  if (await directoryExists(output)) await validateOutput(output, allowedFiles, allowedDirectories);
  else await mkdir(output);
  const zipPath = resolve(release, 'rainy-jiangnan-courtyard-github.zip');
  try {
    const stat = await lstat(zipPath);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('The archive output is not a regular file; left untouched.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const archive = createZip(entries);
  for (const entry of entries) {
    const destination = resolve(output, entry.path);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, entry.data);
  }
  await writeFile(zipPath, archive);
  console.log(`GitHub upload folder: ${output}`);
  console.log(`Release ZIP: ${zipPath}`);
  console.log(`${entries.length} files; ${(archive.length / 1024).toFixed(1)} KiB. Dependencies, build caches and Git history are excluded.`);
  return { output, zipPath, fileCount: entries.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await packageRelease();
}