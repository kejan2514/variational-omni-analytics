"use client";

import { useMemo, useState } from "react";

const money = (value, compact = false) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : n < 10 ? 4 : 2,
  }).format(n);
};

const oi = (m) => Number(m.open_interest?.long_open_interest || 0) + Number(m.open_interest?.short_open_interest || 0);

export default function MarketExplorer({ markets }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("volume");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return markets
      .filter((m) => !q || String(m.ticker || "").toLowerCase().includes(q) || String(m.name || "").toLowerCase().includes(q))
      .sort((a, b) => sort === "funding"
        ? Math.abs(Number(b.funding_rate || 0)) - Math.abs(Number(a.funding_rate || 0))
        : sort === "oi" ? oi(b) - oi(a)
        : Number(b.volume_24h || 0) - Number(a.volume_24h || 0));
  }, [markets, query, sort]);

  return (
    <>
      <div className="explorerControls">
        <input aria-label="Search markets" placeholder="Search BTC, ETH, SOL..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="sortButtons">
          <button className={sort === "volume" ? "active" : ""} onClick={() => setSort("volume")}>Volume</button>
          <button className={sort === "oi" ? "active" : ""} onClick={() => setSort("oi")}>Open Interest</button>
          <button className={sort === "funding" ? "active" : ""} onClick={() => setSort("funding")}>Funding</button>
        </div>
        <span>{rows.length} markets</span>
      </div>
      <div className="tableWrap">
        <table>
          <thead><tr><th>Market</th><th>Mark price</th><th>24h volume</th><th>Long OI</th><th>Short OI</th><th>Funding</th><th>Spread</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.ticker}>
                <td><b>{m.ticker}</b><small>{m.name}</small></td>
                <td>{money(m.mark_price)}</td><td>{money(m.volume_24h, true)}</td>
                <td>{money(m.open_interest?.long_open_interest, true)}</td>
                <td>{money(m.open_interest?.short_open_interest, true)}</td>
                <td>{(Number(m.funding_rate || 0) * 100).toFixed(4)}%</td>
                <td>{Number(m.base_spread_bps || 0).toFixed(2)} bps</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="emptyState">No matching markets.</p>}
      </div>
    </>
  );
}
