export default function FuturesTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-slate-900 p-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-left text-slate-400">
            <th className="p-2">Symbol</th>
            <th className="p-2">LTP</th>
            <th className="p-2">Margin</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol} className="border-b border-slate-800">
              <td className="p-2">{row.symbol}</td>
              <td className="p-2">{row.ltp?.toFixed(2) ?? '-'}</td>
              <td className="p-2">{row.marginUsed?.toLocaleString() ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
