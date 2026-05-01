function classByTag(tag) {
  if (tag === 'ITM') return 'text-emerald-400';
  if (tag === 'OTM') return 'text-rose-400';
  return 'font-bold text-amber-300';
}

export default function OptionsTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-slate-900 p-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-left text-slate-400">
            <th className="p-2">Strike</th>
            <th className="p-2">CE LTP</th>
            <th className="p-2">CE Buy Margin</th>
            <th className="p-2">CE Sell Margin</th>
            <th className="p-2">PE LTP</th>
            <th className="p-2">PE Buy Margin</th>
            <th className="p-2">PE Sell Margin</th>
            <th className="p-2">Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.strike} className="border-b border-slate-800">
              <td className={`p-2 ${classByTag(row.tag)}`}>{row.strike}</td>
              <td className="p-2">{row.ce?.ltp?.toFixed(2) ?? '-'}</td>
              <td className="p-2">{row.ce?.buyMargin?.toLocaleString() ?? '-'}</td>
              <td className="p-2">{row.ce?.sellMargin?.toLocaleString() ?? '-'}</td>
              <td className="p-2">{row.pe?.ltp?.toFixed(2) ?? '-'}</td>
              <td className="p-2">{row.pe?.buyMargin?.toLocaleString() ?? '-'}</td>
              <td className="p-2">{row.pe?.sellMargin?.toLocaleString() ?? '-'}</td>
              <td className="p-2">
                {row.deliveryRisk ? (
                  <span className="rounded bg-amber-700 px-2 py-1 text-xs">Delivery margin risk</span>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
