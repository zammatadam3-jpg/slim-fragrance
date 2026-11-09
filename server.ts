import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_CATALOG_ITEMS } from './src/data/fragrances.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Memory cache of catalog
let currentCatalog: any[] = [];

// Helper: load catalog from disk or initialize defaults
function loadCatalog(): any[] {
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const content = fs.readFileSync(CATALOG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading catalog file:', err);
  }
  // Fallback to initial house collection
  saveCatalog(ALL_CATALOG_ITEMS);
  return ALL_CATALOG_ITEMS;
}

// Helper: save catalog to disk
function saveCatalog(items: any[]) {
  try {
    currentCatalog = items;
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing catalog file:', err);
  }
}

// Initialize catalog in memory
currentCatalog = loadCatalog();

async function startServer() {
  const app = express();

  // JSON Body Parser with 50mb limit for catalog payloads & uploaded images
  app.use(express.json({ limit: '50mb' }));

  // CORS Headers for API
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // REST API Routes
  // 1. GET /api/catalog
  app.get('/api/catalog', (_req, res) => {
    res.json({ success: true, items: currentCatalog });
  });

  // 2. POST /api/catalog (Add or update item)
  app.post('/api/catalog', (req, res) => {
    const { item, items } = req.body;
    if (Array.isArray(items)) {
      saveCatalog(items);
      res.json({ success: true, items: currentCatalog });
      return;
    }
    if (item && item.id && item.name) {
      const exists = currentCatalog.some((i) => i.id === item.id);
      let updated: any[];
      if (exists) {
        updated = currentCatalog.map((i) => (i.id === item.id ? item : i));
      } else {
        updated = [item, ...currentCatalog];
      }
      saveCatalog(updated);
      res.json({ success: true, items: currentCatalog });
      return;
    }
    res.status(400).json({ success: false, error: 'Invalid product item format' });
  });

  // 3. DELETE /api/catalog/:id
  app.delete('/api/catalog/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing product ID' });
      return;
    }
    const updated = currentCatalog.filter((i) => i.id !== id);
    saveCatalog(updated);
    res.json({ success: true, items: currentCatalog });
  });

  // 4. POST /api/catalog/import (Replace entire catalog)
  app.post('/api/catalog/import', (req, res) => {
    const { items } = req.body;
    if (Array.isArray(items) && items.length > 0) {
      saveCatalog(items);
      res.json({ success: true, items: currentCatalog });
      return;
    }
    res.status(400).json({ success: false, error: 'Invalid backup file format' });
  });

  // 5. POST /api/catalog/reset
  app.post('/api/catalog/reset', (_req, res) => {
    saveCatalog(ALL_CATALOG_ITEMS);
    res.json({ success: true, items: currentCatalog });
  });

  // Vite Integration for Dev Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        next();
        return;
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SALIM FRAGRANCE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
