export function getSortedExpiries(rows, underlying, segment) {
  const filtered = rows.filter((row) => row.underlying === underlying && row.segment === segment);
  const uniq = [...new Set(filtered.map((row) => row.expiry))];
  return uniq.sort((a, b) => new Date(a) - new Date(b));
}

export function mapFutureExpiry(expiries, mode) {
  const map = { near: 0, next: 1, far: 2 };
  return expiries[map[mode]] || expiries[0] || null;
}

export function findSpot(masterRows, underlying) {
  const spot = masterRows.find((row) => row.underlying === underlying && row.instrumentType === 'SPOT');
  return spot?.symbol || underlying;
}

export function nearestStrike(strikes, spotPrice) {
  return strikes.reduce((closest, current) => {
    return Math.abs(current - spotPrice) < Math.abs(closest - spotPrice) ? current : closest;
  }, strikes[0]);
}

export function buildOptionWindow(strikes, atm, n) {
  const idx = strikes.indexOf(atm);
  const start = Math.max(0, idx - n);
  const end = Math.min(strikes.length - 1, idx + n);
  return strikes.slice(start, end + 1);
}

export function classifyMoneyness(strike, atm) {
  if (strike === atm) return 'ATM';
  return strike < atm ? 'ITM' : 'OTM';
}

export function isDeliveryRisk(isITM, expiryIso) {
  if (!isITM || !expiryIso) return false;
  const now = new Date();
  const expiry = new Date(expiryIso);
  const diffMs = expiry - now;
  return diffMs <= 24 * 60 * 60 * 1000;
}
