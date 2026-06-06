import { createServer } from 'node:http';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4000);
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
const DB_PATH = process.env.DB_PATH || join(__dirname, 'data', 'db.json');
const DEFAULT_CONTENT_PATH = join(__dirname, 'data', 'defaultContent.json');
const defaultContent = JSON.parse(readFileSync(DEFAULT_CONTENT_PATH, 'utf8'));
const emptyDatabase = { content: null, enquiries: [] };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readDatabase() {
  if (!existsSync(DB_PATH)) return clone(emptyDatabase);
  try {
    return { ...clone(emptyDatabase), ...JSON.parse(readFileSync(DB_PATH, 'utf8')) };
  } catch (error) {
    console.error('Unable to read database file:', error);
    return clone(emptyDatabase);
  }
}

function writeDatabase(database) {
  writeFileSync(DB_PATH, `${JSON.stringify(database, null, 2)}\n`);
}

function getContent() {
  const database = readDatabase();
  return { ...clone(defaultContent), ...(database.content || {}) };
}

function send(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-passcode',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    ...headers,
  });
  if (payload === null) return response.end();
  if (typeof payload === 'string') return response.end(payload);
  return response.end(JSON.stringify(payload));
}

function sendJson(response, status, payload) {
  send(response, status, payload, { 'Content-Type': 'application/json' });
}

function isAdmin(request, url) {
  return request.headers['x-admin-passcode'] === ADMIN_PASSCODE || url.searchParams.get('passcode') === ADMIN_PASSCODE;
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const { method } = request;

  if (method === 'OPTIONS') return send(response, 204, null);
  if (url.pathname === '/api/health' && method === 'GET') {
    return sendJson(response, 200, { ok: true, service: 'DL SSR INFOTECH Node.js API' });
  }
  if (url.pathname === '/api/content' && method === 'GET') return sendJson(response, 200, getContent());
  if (url.pathname === '/api/content' && method === 'PUT') {
    if (!isAdmin(request, url)) return sendJson(response, 401, { message: 'Invalid admin passcode.' });
    const database = readDatabase();
    database.content = { ...getContent(), ...(await readBody(request)) };
    writeDatabase(database);
    return sendJson(response, 200, database.content);
  }
  if (url.pathname === '/api/content/reset' && method === 'POST') {
    if (!isAdmin(request, url)) return sendJson(response, 401, { message: 'Invalid admin passcode.' });
    const database = readDatabase();
    database.content = null;
    writeDatabase(database);
    return sendJson(response, 200, getContent());
  }
  if (url.pathname === '/api/enquiries' && method === 'GET') {
    if (!isAdmin(request, url)) return sendJson(response, 401, { message: 'Invalid admin passcode.' });
    return sendJson(response, 200, readDatabase().enquiries);
  }
  if (url.pathname === '/api/enquiries' && method === 'POST') {
    const database = readDatabase();
    const body = await readBody(request);
    const enquiry = {
      id: `ENQ-${Date.now()}`,
      source: body.source || 'Website form',
      page: body.page || 'DL SSR INFOTECH',
      fields: body.fields || {},
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    database.enquiries.unshift(enquiry);
    writeDatabase(database);
    return sendJson(response, 201, enquiry);
  }
  if (url.pathname === '/api/enquiries' && method === 'DELETE') {
    if (!isAdmin(request, url)) return sendJson(response, 401, { message: 'Invalid admin passcode.' });
    const database = readDatabase();
    database.enquiries = [];
    writeDatabase(database);
    return send(response, 204, null);
  }
  if (url.pathname === '/api/enquiries/export.csv' && method === 'GET') {
    if (!isAdmin(request, url)) return sendJson(response, 401, { message: 'Invalid admin passcode.' });
    const rows = [['ID', 'Date', 'Source', 'Status', 'Fields']].concat(
      readDatabase().enquiries.map((item) => [
        item.id,
        item.createdAt,
        item.source,
        item.status,
        Object.entries(item.fields || {}).map(([key, value]) => `${key}: ${value}`).join(' | '),
      ]),
    );
    return send(response, 200, rows.map((row) => row.map(csvCell).join(',')).join('\n'), {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="dlssr-enquiries.csv"',
    });
  }

  const enquiryMatch = url.pathname.match(/^\/api\/enquiries\/([^/]+)$/);
  if (enquiryMatch && method === 'PATCH') {
    if (!isAdmin(request, url)) return sendJson(response, 401, { message: 'Invalid admin passcode.' });
    const database = readDatabase();
    const enquiry = database.enquiries.find((item) => item.id === enquiryMatch[1]);
    if (!enquiry) return sendJson(response, 404, { message: 'Enquiry not found.' });
    enquiry.status = (await readBody(request)).status || enquiry.status;
    writeDatabase(database);
    return sendJson(response, 200, enquiry);
  }
  if (enquiryMatch && method === 'DELETE') {
    if (!isAdmin(request, url)) return sendJson(response, 401, { message: 'Invalid admin passcode.' });
    const database = readDatabase();
    database.enquiries = database.enquiries.filter((item) => item.id !== enquiryMatch[1]);
    writeDatabase(database);
    return send(response, 204, null);
  }

  return sendJson(response, 404, { message: 'API route not found.' });
}

createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error(error);
    sendJson(response, 500, { message: 'Internal server error.' });
  });
}).listen(PORT, () => {
  console.log(`DL SSR INFOTECH Node.js API running on http://localhost:${PORT}`);
});
