import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { CONFIG } from '../src/config.js';

const { port, host, fallbackFile, contentTypes, notFoundMessage } = CONFIG.diagnostics.devServer;

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  const requestedPath = url.pathname === CONFIG.diagnostics.devServer.rootPath
    ? fallbackFile
    : url.pathname.slice(CONFIG.math.firstContentIndex);
  const safePath = normalize(requestedPath).replace(
    CONFIG.diagnostics.devServer.unsafePathPattern,
    CONFIG.diagnostics.devServer.emptyPath
  );
  const filePath = join(process.cwd(), safePath);

  try {
    const data = await readFile(filePath);
    response.writeHead(CONFIG.diagnostics.devServer.httpOk, {
      'Content-Type': contentTypes[extname(filePath)] ?? contentTypes.default
    });
    response.end(data);
  } catch {
    response.writeHead(CONFIG.diagnostics.devServer.httpNotFound, {
      'Content-Type': contentTypes.default
    });
    response.end(notFoundMessage);
  }
});

server.listen(port, host, () => {
  console.log(`${CONFIG.logging.prefix} dev server running at http://${host}:${port}`);
});
