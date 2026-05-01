const BASE_URL = process.env.DEFINEDGE_BASE_URL || 'https://api.definedgesecurities.com';
const API_KEY = process.env.DEFINEDGE_API_KEY;

const cache = new Map();

function getCache(key, ttlMs = 1500) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > ttlMs) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function setCache(key, value) {
  cache.set(key, { ts: Date.now(), value });
}

export async function definedgeRequest(path, { method = 'GET', body, cacheKey, ttlMs = 1500 } = {}) {
  if (!API_KEY) {
    throw new Error('DEFINEDGE_API_KEY missing on server');
  }

  if (cacheKey) {
    const hit = getCache(cacheKey, ttlMs);
    if (hit) return hit;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'x-api-key': API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Definedge API ${response.status}: ${text}`);
  }

  const json = await response.json();
  if (cacheKey) setCache(cacheKey, json);
  return json;
}

export function ok(payload) {
  return {
    statusCode: 200,
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  };
}

export function fail(error, statusCode = 500) {
  return {
    statusCode,
    body: JSON.stringify({ error: error.message || 'Unexpected error' }),
    headers: { 'Content-Type': 'application/json' },
  };
}
