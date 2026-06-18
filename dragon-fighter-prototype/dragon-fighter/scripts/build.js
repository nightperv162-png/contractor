import { mkdir, cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { CONFIG } from '../src/config.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { createLayout } from '../src/ui/layout.js';

const outputFolder = CONFIG.diagnostics.buildOutputFolder;
const sourceFolders = CONFIG.diagnostics.buildSourceFolders;

createInitialGameState(CONFIG);
createLayout(CONFIG);

await rm(outputFolder, { recursive: true, force: true });
await mkdir(outputFolder, { recursive: true });
await cp('index.html', join(outputFolder, 'index.html'));

for (const folder of sourceFolders) {
  await cp(folder, join(outputFolder, folder), { recursive: true });
}

console.log(`${CONFIG.logging.prefix} build complete: ${outputFolder}`);
