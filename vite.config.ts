import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const proxyMiddleware = (req: any, res: any, next: any) => {
  try {
    const urlObj = new URL(req.url || '', 'http://localhost');
    console.log(`[Proxy Middleware] Incoming request: method=${req.method} url=${req.url} pathname=${urlObj.pathname}`);
    
    if (urlObj.pathname === '/api-proxy') {
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl) {
        console.warn(`[Proxy Middleware] Missing target URL parameter in request.`);
        res.statusCode = 400;
        res.end('Missing target url');
        return;
      }

      console.log(`[Proxy Middleware] Forwarding request to: ${targetUrl}`);

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

      const executeForward = async (requestBody?: string) => {
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
            body: requestBody
          });

          const resBody = await response.text();
          console.log(`[Proxy Middleware] Target response: status=${response.status} length=${resBody.length}`);
          
          res.writeHead(response.status, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'Content-Type': response.headers.get('content-type') || 'application/json'
          });
          res.end(resBody);
        } catch (err: any) {
          console.error(`[Proxy Middleware] Fetch error:`, err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      };

      if (req.method === 'GET' || req.method === 'HEAD') {
        executeForward(undefined);
      } else {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', () => {
          executeForward(body || undefined);
        });
      }
      return;
    }
  } catch (e) {
    console.error(`[Proxy Middleware] URL parsing error:`, e);
  }
  next();
};

const proxyPlugin = () => ({
  name: 'llm-proxy-plugin',
  configureServer(server: any) {
    server.middlewares.use(proxyMiddleware);
  },
  configurePreviewServer(server: any) {
    server.middlewares.use(proxyMiddleware);
  }
});

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), proxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    }
  };
});
