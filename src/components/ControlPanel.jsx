export default function ControlPanel({
  underlyings,
  segment,
  setSegment,
  underlying,
  setUnderlying,
  futuresExpiryMode,
  setFuturesExpiryMode,
  optionExpiry,
  setOptionExpiry,
  optionExpiries,
  strikeCount,
  setStrikeCount,
}) {
  return (
    <div className="grid gap-4 rounded-xl bg-slate-900 p-4 shadow-lg lg:grid-cols-6">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Underlying</span>
        <select className="rounded bg-slate-800 p-2" value={underlying} onChange={(e) => setUnderlying(e.target.value)}>
          {underlyings.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">Segment</span>
        <select className="rounded bg-slate-800 p-2" value={segment} onChange={(e) => setSegment(e.target.value)}>
          <option value="FUTURES">Futures</option>
          <option value="OPTIONS">Options</option>
        </select>
      </label>

      {segment === 'FUTURES' ? (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Futures Expiry Bucket</span>
          <select
            className="rounded bg-slate-800 p-2"
            value={futuresExpiryMode}
            onChange={(e) => setFuturesExpiryMode(e.target.value)}
          >
            <option value="near">Near Month</option>
            <option value="next">Next Month</option>
            <option value="far">Far Month</option>
          </select>
        </label>
      ) : (
        <>
          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="text-xs text-slate-400">Option Expiry</span>
            <select className="rounded bg-slate-800 p-2" value={optionExpiry} onChange={(e) => setOptionExpiry(e.target.value)}>
              {optionExpiries.map((expiry) => (
                <option key={expiry} value={expiry}>{expiry}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Strikes N (ITM + OTM)</span>
            <input
              className="rounded bg-slate-800 p-2"
              value={strikeCount}
              min={1}
              max={20}
              type="number"
              onChange={(e) => setStrikeCount(Number(e.target.value))}
            />
          </label>
        </>
      )}
    </div>
  );
}
