import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 30;

const API = "https://omni-client-api.prod.ap-northeast-1.variational.io/metadata/stats";

async function getMarket(ticker) {
  const response = await fetch(API, { next: { revalidate: 30 } });
  if (!response.ok) throw new Error("Variational API request failed");
  const stats = await response.json();
  return (stats.listings || []).find((m) => String(m.ticker).toLowerCase() === decodeURIComponent(ticker).toLowerCase());
}

const money = (value, compact = false) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 2 : n < 10 ? 4 : 2 }).format(n);
};

export default async function MarketPage({ params }) {
  let market;
  try { market = await getMarket(params.ticker); } catch {
    return <main className="shell"><Link className="backLink" href="/">← Back to markets</Link><section className="hero"><div><p className="eyebrow">VARIATIONAL OMNI</p><h1>Market data unavailable</h1><p className="muted">Please try again shortly.</p></div></section></main>;
  }
  if (!market) notFound();

  const longOi = Number(market.open_interest?.long_open_interest || 0);
  const shortOi = Number(market.open_interest?.short_open_interest || 0);
  const totalOi = longOi + shortOi;
  const funding = Number(market.funding_rate || 0) * 100;

  return (
    <main className="shell">
      <Link className="backLink" href="/">← Back to markets</Link>
      <section className="detailHero">
        <div><p className="eyebrow">MARKET DETAIL · READ-ONLY</p><h1>{market.ticker}</h1><p className="muted">{market.name}</p></div>
        <span className="live">● LIVE DATA</span>
      </section>
      <section className="detailPrice"><span>MARK PRICE</span><strong>{money(market.mark_price)}</strong></section>
      <section className="metrics detailMetrics">
        <article><span>24H VOLUME</span><strong>{money(market.volume_24h, true)}</strong></article>
        <article><span>TOTAL OI</span><strong>{money(totalOi, true)}</strong></article>
        <article><span>FUNDING</span><strong>{funding.toFixed(4)}%</strong></article>
        <article><span>SPREAD</span><strong>{Number(market.base_spread_bps || 0).toFixed(2)} bps</strong></article>
      </section>
      <section className="panel detailPanel">
        <div className="panelHead"><div><p className="eyebrow">POSITIONING</p><h2>Open interest breakdown</h2></div></div>
        <div className="positionGrid">
          <article><span>LONG OPEN INTEREST</span><strong>{money(longOi, true)}</strong><small>{totalOi ? ((longOi / totalOi) * 100).toFixed(1) : "0.0"}% of OI</small></article>
          <article><span>SHORT OPEN INTEREST</span><strong>{money(shortOi, true)}</strong><small>{totalOi ? ((shortOi / totalOi) * 100).toFixed(1) : "0.0"}% of OI</small></article>
        </div>
      </section>
      <p className="detailNote">Snapshot from Variational Omni public market data. This page is informational and does not execute trades.</p>
      <footer>Public read-only data · No wallet connection · Refreshes every 30 seconds</footer>
    </main>
  );
}
