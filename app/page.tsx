import Link from "next/link";
import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";

export default function HomePage() {
  return (
    <main className="shell hero">
      <p className="eyebrow">YoungMinds Content Studio</p>
      <h1>Transformă ideile YoungMinds în postări Instagram gata de publicat.</h1>
      <p className="lead">
        Generator dedicat pentru {YOUNGMINDS_BRAND.descriptor}: carusele, postări, Reel scripts, imagini DALL-E 3 și publicare directă pe Instagram Business.
      </p>
      <div className="activity-row">
        {YOUNGMINDS_BRAND.activities.map((activity) => (
          <span className="activity-chip" key={activity.name}>{activity.name}</span>
        ))}
      </div>
      <div className="actions">
        <Link className="primary" href="/content-engine">Deschide content studio</Link>
        <a className="button secondary" href={YOUNGMINDS_BRAND.website} target="_blank" rel="noreferrer">
          Vezi site-ul YoungMinds
        </a>
      </div>
    </main>
  );
}
