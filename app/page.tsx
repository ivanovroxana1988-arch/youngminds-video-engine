import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell hero">
      <p className="eyebrow">YoungMinds Video Engine</p>
      <h1>Dintr-un script lung faci o săptămână de conținut Instagram.</h1>
      <p className="lead">
        MVP pentru generare de postări, carusele, captions, CTA-uri și trimitere către Postiz pentru programare.
      </p>
      <Link className="primary" href="/content-engine">Deschide content engine</Link>
    </main>
  );
}
