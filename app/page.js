import MarketExplorer from "../components/MarketExplorer";

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

  const listings = [...(stats.listings || [])];
  const byVolume = [...listings].sort((a, b) => Number(b.volume_24h || 0) - Number(a.volume_24h || 0));
  const byFunding = [...listings].sort((a, b) => Math.abs(Number(b.funding_rate || 0)) - Math.abs(Number(a.funding_rate || 0)));
  const byOi = [...listings].sort((a, b) => {
    const aOi = Number(a.open_interest?.long_open_interest || 0) + Number(a.open_interest?.short_open_interest || 0);
    const bOi = Number(b.open_interest?.long_open_interest || 0) + Number(b.open_interest?.short_open_interest || 0);
    return bOi - aOi;
  });
  const topVolume = byVolume[0];
  const topFunding = byFunding[0];
  const topOi = byOi[0];

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

      <section className="leaders">
        <article><span>VOLUME LEADER</span><strong>{topVolume?.ticker || "—"}</strong><small>{topVolume ? money(topVolume.volume_24h, true) : "—"}</small></article>
        <article><span>OI LEADER</span><strong>{topOi?.ticker || "—"}</strong><small>{topOi ? money(Number(topOi.open_interest?.long_open_interest || 0) + Number(topOi.open_interest?.short_open_interest || 0), true) : "—"}</small></article>
        <article><span>FUNDING WATCH</span><strong>{topFunding?.ticker || "—"}</strong><small>{topFunding ? (Number(topFunding.funding_rate || 0) * 100).toFixed(4) + "%" : "—"}</small></article>
      </section>

      <section className="panel">
        <div className="panelHead">
          <div><p className="eyebrow">MARKETS</p><h2>Top markets by 24h volume</h2></div>
          <span>{listings.length} markets available</span>
        </div>
        <div className="marketTools"><span>Market explorer</span><span>Search · sort · live public data</span></div>
        <MarketExplorer markets={listings} />
      </section>

      <footer>Public read-only data · No wallet connection · No automated trading · Refreshes every 30 seconds</footer>
    </main>
  );
}
