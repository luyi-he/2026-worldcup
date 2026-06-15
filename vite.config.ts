import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const proxyMiddleware = (req: any, res: any, next: any) => {
  try {
    const urlObj = new URL(req.url || '', 'http://localhost');
    if (urlObj.pathname === '/api-proxy') {
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl) {
        res.statusCode = 400;
        res.end('Missing target url');
        return;
      }

      // Handle preflight OPTIONS request
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*'
        });
        res.end();
        return;
      }

      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        try {
          const headers: Record<string, string> = {};
          for (const [key, val] of Object.entries(req.headers)) {
            if (['host', 'origin', 'referer', 'connection', 'accept-encoding'].includes(key.toLowerCase())) {
              continue;
            }
            if (typeof val === 'string') {
              headers[key] = val;
            } else if (Array.isArray(val)) {
              headers[key] = val.join(', ');
            }
          }

          const response = await fetch(targetUrl, {
            method: req.method,
            headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
          });

          const resBody = await response.text();
          res.writeHead(response.status, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'Content-Type': response.headers.get('content-type') || 'application/json'
          });
          res.end(resBody);
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  next();
};

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      configureServer: (server) => {
        server.middlewares.use(proxyMiddleware);
      }
    },
    preview: {
      configurePreviewServer: (server) => {
        server.middlewares.use(proxyMiddleware);
      }
    } as any
  };
});
