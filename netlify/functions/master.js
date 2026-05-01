import { definedgeRequest, fail, ok } from './_client.js';

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    return headers.reduce((acc, key, idx) => {
      acc[key] = values[idx];
      return acc;
    }, {});
  });
}

async function fetchMasterFile() {
  const url = process.env.MASTER_FILE_URL;
  if (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Master file request failed: ${res.status}`);
    const text = await res.text();
    return parseCsv(text).map((r) => ({
      symbol: r.symbol,
      underlying: r.underlying,
      segment: r.segment,
      expiry: r.expiry,
      strike: r.strike,
      optionType: r.optionType,
      instrumentType: r.instrumentType,
    }));
  }

  const apiData = await definedgeRequest('/master', { cacheKey: 'master', ttlMs: 60_000 });
  return apiData.rows || apiData.data || [];
}

export async function handler() {
  try {
    const rows = await fetchMasterFile();
    return ok({ rows });
  } catch (error) {
    return fail(error);
  }
}
