"use client";

import { useState } from "react";
import { VisualAssetExporter } from "@/components/VisualAssetExporter";
import { ContentPlan } from "@/types/content";

export function ScriptToContentForm() {
  const [script, setScript] = useState("");
  const [brand, setBrand] = useState("YoungMinds / Lucindra");
  const [audience, setAudience] = useState("oameni interesați de educație, AI, proiecte și dezvoltare personală lucidă");
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleResult, setScheduleResult] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setScheduleResult(null);
    setPlan(null);

    const response = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script,
        brand,
        audience,
        goal: "transformă scriptul într-o săptămână de postări Instagram clare, utile și publicabile",
        language: "Romanian",
        count: 7
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "A picat generarea. Tehnologia și-a luat pauză de filosofie.");
      return;
    }

    setPlan(data.plan);
  }

  async function schedule() {
    if (!plan) return;
    setLoading(true);
    setError(null);
    setScheduleResult(null);

    const tomorrowAt9 = new Date();
    tomorrowAt9.setDate(tomorrowAt9.getDate() + 1);
    tomorrowAt9.setHours(9, 0, 0, 0);

    const response = await fetch("/api/content/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDateIso: tomorrowAt9.toISOString(),
        daysBetweenPosts: 1,
        posts: plan.posts
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Nu s-a putut programa în Postiz.");
      return;
    }

    setScheduleResult(`Trimis în Postiz: ${data.results?.length ?? plan.posts.length} postări.`);
  }

  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">MVP</p>
        <h1>Script → Instagram Content Engine</h1>
        <p className="lead">
          Pui scriptul. Primești postări, carusele, hooks, captions, asset-uri vizuale și programare prin Postiz. Pentru că aparent un text nu poate trăi liniștit fără să devină șapte formate de conținut.
        </p>

        <div className="grid">
          <div>
            <label htmlFor="brand">Brand / context</label>
            <input id="brand" value={brand} onChange={(event) => setBrand(event.target.value)} />
          </div>
          <div>
            <label htmlFor="audience">Audiență</label>
            <input id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} />
          </div>
        </div>

        <label htmlFor="script">Script</label>
        <textarea
          id="script"
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder="Lipește aici transcriptul, articolul, ideea lungă sau scriptul video."
        />

        <div className="actions">
          <button className="button" onClick={generate} disabled={loading || script.length < 50}>
            {loading ? "Lucrează..." : "Generează postările"}
          </button>
          <button className="button secondary" onClick={schedule} disabled={loading || !plan}>
            Trimite în Postiz
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {scheduleResult && <p>{scheduleResult}</p>}
      </section>

      {plan && (
        <section className="card" style={{ marginTop: 24 }}>
          <p className="eyebrow">Plan generat</p>
          <h2>Rezumat</h2>
          <p>{plan.sourceSummary}</p>
          <p>
            <strong>Piloni:</strong> {plan.contentPillars.join(" · ")}
          </p>

          {plan.posts.map((post, index) => (
            <article key={`${post.title}-${index}`} className="post-card">
              <span className="badge">{post.format}</span>
              <h3>{index + 1}. {post.title}</h3>
              <p><strong>Hook:</strong> {post.hook}</p>
              <pre>{post.caption}</pre>
              <p><strong>Vizual:</strong> {post.visualBrief}</p>

              {post.carouselSlides?.length ? (
                <details>
                  <summary>Slide-uri carusel</summary>
                  <ol>
                    {post.carouselSlides.map((slide, slideIndex) => (
                      <li key={`${slide.title}-${slideIndex}`}>
                        <strong>{slide.title}</strong>: {slide.body}
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}

              {post.reelScript?.scenes?.length ? (
                <details>
                  <summary>Script Reel</summary>
                  <ol>
                    {post.reelScript.scenes.map((scene, sceneIndex) => (
                      <li key={`${scene.visual}-${sceneIndex}`}>
                        <strong>Vizual:</strong> {scene.visual}<br />
                        <strong>VO:</strong> {scene.voiceover}<br />
                        <strong>Text:</strong> {scene.onScreenText}
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}

              <p><strong>CTA:</strong> {post.cta}</p>
              <p>{post.hashtags.join(" ")}</p>

              <VisualAssetExporter post={post} postIndex={index} brand={brand} />
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
