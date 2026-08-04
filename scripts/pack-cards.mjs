#!/usr/bin/env node
// Equivalent of pack.ps1, invoked via `pnpm run pack` from this repo.
import archiver from 'archiver';
import { execSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cardsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packedDir = path.join(cardsRoot, 'packed');
const resourcesDir = path.join(packedDir, 'Resources');
const addonFilesDir = path.join(cardsRoot, 'addon_files');
const cardSourcesRoot = path.join(cardsRoot, 'card_sources');
const zipPath = path.join(cardsRoot, 'packed.zip');

const microFrontends = [
    'dnd5e-itemcard',
    'dnd5e-itemcreator',
    'dnd5e-monstercard',
    'dnd5e-nordvikcard',
    'dnd5e-template_settings',
];

const run = (command, cwd) => execSync(command, { cwd, stdio: 'inherit' });

// 1. create packed folder and seed it with addon_files
mkdirSync(packedDir, { recursive: true });
cpSync(addonFilesDir, packedDir, { recursive: true });

// 2. build every microfrontend
for (const microFrontend of microFrontends) {
    console.log(`Building ${microFrontend}...`);
    const dir = path.join(cardSourcesRoot, microFrontend);
    run('pnpm install', dir);
    run('pnpm run build', dir);
}

// 3. extract js bundle for each microfrontend into packed/Resources
mkdirSync(resourcesDir, { recursive: true });
for (const microFrontend of microFrontends) {
    console.log(`Packing ${microFrontend}...`);
    const assetsDir = path.join(cardSourcesRoot, microFrontend, 'dist', 'assets');
    const jsFile = existsSync(assetsDir)
        ? readdirSync(assetsDir).find((name) => name.endsWith('.js'))
        : undefined;

    if (jsFile) {
        cpSync(path.join(assetsDir, jsFile), path.join(resourcesDir, `${microFrontend}.js`));
    } else {
        console.warn(`No JS file found for ${microFrontend}`);
    }
}

// 4. zip the packed folder into packed.zip
rmSync(zipPath, { force: true });
await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(packedDir, false);
    archive.finalize();
});

console.log('Cards packed successfully.');
