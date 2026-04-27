import { useEffect, useMemo, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import FuturesTable from './components/FuturesTable';
import OptionsTable from './components/OptionsTable';
import { useDebounce } from './hooks/useDebounce';
import { apiGet, apiPost } from './lib/api';
import {
  buildOptionWindow,
  classifyMoneyness,
  findSpot,
  getSortedExpiries,
  isDeliveryRisk,
  mapFutureExpiry,
  nearestStrike,
} from './lib/fno';

const POLL_MS = 2500;

export default function App() {
  const [masterRows, setMasterRows] = useState([]);
  const [segment, setSegment] = useState('FUTURES');
  const [underlying, setUnderlying] = useState('NIFTY');
  const [futuresExpiryMode, setFuturesExpiryMode] = useState('near');
  const [optionExpiry, setOptionExpiry] = useState('');
  const [strikeCount, setStrikeCount] = useState(3);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const debouncedStrikeCount = useDebounce(strikeCount, 300);

  useEffect(() => {
    apiGet('master')
      .then((data) => {
        setMasterRows(data.rows || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const underlyings = useMemo(
    () => [...new Set(masterRows.filter((r) => r.segment !== 'SPOT').map((r) => r.underlying))],
    [masterRows],
  );

  useEffect(() => {
    if (underlyings.length && !underlyings.includes(underlying)) {
      setUnderlying(underlyings[0]);
    }
  }, [underlyings, underlying]);

  const optionExpiries = useMemo(() => getSortedExpiries(masterRows, underlying, 'OPTIONS'), [masterRows, underlying]);

  useEffect(() => {
    if (segment === 'OPTIONS') {
      setOptionExpiry((prev) => (optionExpiries.includes(prev) ? prev : optionExpiries[0] || ''));
    }
  }, [segment, optionExpiries]);

  useEffect(() => {
    if (!masterRows.length || !underlying) return;

    let cancel = false;

    const run = async () => {
      try {
        if (segment === 'FUTURES') {
          const expiries = getSortedExpiries(masterRows, underlying, 'FUTURES');
          const selectedExpiry = mapFutureExpiry(expiries, futuresExpiryMode);
          const futRows = masterRows.filter(
            (r) => r.segment === 'FUTURES' && r.underlying === underlying && r.expiry === selectedExpiry,
          );

          const symbols = futRows.map((r) => r.symbol);
          const quoteData = await apiPost('quotes', { symbols });
          const marginData = await Promise.all(
            futRows.map((r) => apiPost('margin', { symbol: r.symbol, exchange: 'NSEFO', side: 'BUY', product: 'NRML', qty: 1 })),
          );

          if (cancel) return;
          setRows(
            futRows.map((r, idx) => ({
              symbol: r.symbol,
              ltp: quoteData.quotes?.[r.symbol]?.ltp,
              marginUsed: marginData[idx].marginUsed,
            })),
          );
        } else {
          const optionRows = masterRows.filter(
            (r) => r.segment === 'OPTIONS' && r.underlying === underlying && r.expiry === optionExpiry,
          );
          const strikes = [...new Set(optionRows.map((r) => Number(r.strike)))].sort((a, b) => a - b);
          const spotSymbol = findSpot(masterRows, underlying);
          const spotQuote = await apiPost('quotes', { symbols: [spotSymbol] });
          const spot = spotQuote.quotes?.[spotSymbol]?.ltp;
          if (!spot || !strikes.length) return;

          const atm = nearestStrike(strikes, spot);
          const windowStrikes = buildOptionWindow(strikes, atm, debouncedStrikeCount);

          const strikesRows = await Promise.all(
            windowStrikes.map(async (strike) => {
              const ce = optionRows.find((r) => Number(r.strike) === strike && r.optionType === 'CE');
              const pe = optionRows.find((r) => Number(r.strike) === strike && r.optionType === 'PE');

              const symbols = [ce?.symbol, pe?.symbol].filter(Boolean);
              const quotes = symbols.length ? await apiPost('quotes', { symbols }) : { quotes: {} };

              const [ceBuy, ceSell, peBuy, peSell] = await Promise.all([
                ce ? apiPost('margin', { symbol: ce.symbol, exchange: 'NSEFO', side: 'BUY', product: 'NRML', qty: 1 }) : null,
                ce ? apiPost('margin', { symbol: ce.symbol, exchange: 'NSEFO', side: 'SELL', product: 'NRML', qty: 1 }) : null,
                pe ? apiPost('margin', { symbol: pe.symbol, exchange: 'NSEFO', side: 'BUY', product: 'NRML', qty: 1 }) : null,
                pe ? apiPost('margin', { symbol: pe.symbol, exchange: 'NSEFO', side: 'SELL', product: 'NRML', qty: 1 }) : null,
              ]);

              const tag = classifyMoneyness(strike, atm);
              return {
                strike,
                tag,
                deliveryRisk: isDeliveryRisk(tag === 'ITM', optionExpiry),
                ce: ce
                  ? {
                      ltp: quotes.quotes?.[ce.symbol]?.ltp,
                      buyMargin: ceBuy?.marginUsed,
                      sellMargin: ceSell?.marginUsed,
                    }
                  : null,
                pe: pe
                  ? {
                      ltp: quotes.quotes?.[pe.symbol]?.ltp,
                      buyMargin: peBuy?.marginUsed,
                      sellMargin: peSell?.marginUsed,
                    }
                  : null,
              };
            }),
          );

          if (cancel) return;
          setRows(strikesRows);
        }
        setError('');
      } catch (err) {
        if (!cancel) setError(err.message);
      }
    };

    run();
    const interval = setInterval(run, POLL_MS);
    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }, [masterRows, underlying, segment, futuresExpiryMode, optionExpiry, debouncedStrikeCount]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-4 lg:p-8">
      <h1 className="text-2xl font-semibold">F&O Watchlist with Live Margin</h1>
      <ControlPanel
        underlyings={underlyings}
        segment={segment}
        setSegment={setSegment}
        underlying={underlying}
        setUnderlying={setUnderlying}
        futuresExpiryMode={futuresExpiryMode}
        setFuturesExpiryMode={setFuturesExpiryMode}
        optionExpiry={optionExpiry}
        setOptionExpiry={setOptionExpiry}
        optionExpiries={optionExpiries}
        strikeCount={strikeCount}
        setStrikeCount={setStrikeCount}
      />

      {error ? <p className="rounded bg-rose-900 p-3 text-sm">{error}</p> : null}

      {segment === 'FUTURES' ? <FuturesTable rows={rows} /> : <OptionsTable rows={rows} />}
    </main>
  );
}
