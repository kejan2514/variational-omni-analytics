export const revalidate = 30;

const API = "https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats";

async function getStats() {
  const response = await fetch(API, { next: { revalidate: 30 } });
  if (!response.ok) throw new Error("Variational API request failed");
  return response.json();
}

const money = (value, compact = false) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : number < 10 ? 4 : 2,
  }).format(number);
};

const number = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value || 0));

export default async function Home() {
  let stats;
  try {
    stats = await getStats();
  } catch {
    return (
      <main className="shell">
        <section className="hero">
          <p className="eyebrow">VARIATIONAL OMNI</p>
          <h1>Analytics dashboard</h1>
          <p className="muted">Market data is temporarily unavailable. Please refresh shortly.</p>
        </section>
      </main>
    );
  }

  const listings = [...(stats.listings || [])]
    .sort((a, b) => Number(b.volume_24h || 0) - Number(a.volume_24h || 0))
    .slice(0, 100);

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">VARIATIONAL OMNI · READ-ONLY</p>
          <h1>Market analytics, without the noise.</h1>
          <p className="muted">Live public market statistics from Variational Omni. Community-built and not affiliated with Variational.</p>
        </div>
        <span className="live">● LIVE DATA</span>
      </section>

      <section className="metrics">
        <article><span>24H VOLUME</span><strong>{money(stats.total_volume_24h, true)}</strong></article>
        <article><span>TVL</span><strong>{money(stats.tvl, true)}</strong></article>
        <article><span>OPEN INTEREST</span><strong>{money(stats.open_interest, true)}</strong></article>
        <article><span>MARKETS</span><strong>{number(stats.num_markets)}</strong></article>
      </section>

      <section className="panel">
        <div className="panelHead">
          <div><p className="eyebrow">MARKETS</p><h2>Top markets by 24h volume</h2></div>
          <span>{listings.length} markets · ranked by volume</span>
        </div>
        <div className="marketTools"><span>Market explorer</span><span>Top 100 · live public data</span></div>
        <div className="tableWrap">
          <table>
            <thead><tr><th>Market</th><th>Mark price</th><th>24h volume</th><th>Long OI</th><th>Short OI</th><th>Funding</th><th>Spread</th></tr></thead>
            <tbody>
              {listings.map((market) => (
                <tr key={market.ticker}>
                  <td><b>{market.ticker}</b><small>{market.name}</small></td>
                  <td>{money(market.mark_price)}</td>
                  <td>{money(market.volume_24h, true)}</td>
                  <td>{money(market.open_interest?.long_open_interest, true)}</td>
                  <td>{money(market.open_interest?.short_open_interest, true)}</td>
                  <td>{(Number(market.funding_rate || 0) * 100).toFixed(4)}%</td>
                  <td>{Number(market.base_spread_bps || 0).toFixed(2)} bps</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer>Public read-only data · No wallet connection · No automated trading · Refreshes every 30 seconds</footer>
    </main>
  );
}
