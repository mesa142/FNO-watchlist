import { definedgeRequest, fail, ok } from './_client.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return fail(new Error('Method not allowed'), 405);
  }

  try {
    const { symbol, exchange = 'NSEFO', side = 'BUY', product = 'NRML', qty = 1, price = 0 } = JSON.parse(event.body || '{}');
    if (!symbol) return fail(new Error('symbol is required'), 400);

    const body = {
      exchange,
      product,
      orders: [
        {
          symbol,
          side,
          quantity: Number(qty),
          price: Number(price),
        },
      ],
    };

    const payload = await definedgeRequest('/margin', {
      method: 'POST',
      body,
      cacheKey: `margin:${symbol}:${side}:${qty}:${product}:${exchange}`,
      ttlMs: 1500,
    });

    const marginUsed =
      payload?.marginUsed ??
      payload?.totalMargin ??
      payload?.data?.marginUsed ??
      payload?.data?.totalMargin ??
      0;

    return ok({ marginUsed, raw: payload });
  } catch (error) {
    return fail(error);
  }
}
