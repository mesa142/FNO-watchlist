import { definedgeRequest, fail, ok } from './_client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return fail(new Error('Method not allowed'), 405);
  }

  try {
    const { symbols = [] } = JSON.parse(event.body || '{}');
    if (!symbols.length) return ok({ quotes: {} });

    const payload = await definedgeRequest('/quotes', {
      method: 'POST',
      body: { symbols },
      cacheKey: `quotes:${symbols.sort().join(',')}`,
      ttlMs: 1500,
    });

    const quotes = payload.quotes || payload.data || {};
    return ok({ quotes });
  } catch (error) {
    return fail(error);
  }
}
