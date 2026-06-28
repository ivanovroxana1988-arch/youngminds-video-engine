"use client";

import { useState } from "react";
import { VisualAssetExporter } from "@/components/VisualAssetExporter";
import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { ContentPlan } from "@/types/content";

const QUICK_IDEAS = [
  "Promovează robotica pentru copiii care iubesc construcțiile și experimentele.",
  "Explică părinților de ce STEM-ul ajută copilul să gândească logic prin joacă.",
  "Creează o campanie despre afterschool ca spațiu sigur, cald și curios.",
  "Fă o serie despre activitățile YoungMinds: pian, tae-kwon do, robotică, limbi străine și yoga."
];

export function ScriptToContentForm() {
  const [script, setScript] = useState("");
  const [audience, setAudience] = useState(YOUNGMINDS_BRAND.audience);
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
        brand: `${YOUNGMINDS_BRAND.name} - ${YOUNGMINDS_BRAND.descriptor}`,
        audience,
        goal: YOUNGMINDS_BRAND.defaultGoal,
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
      <section className="brand-hero card">
        <div className="brand-copy">
          <p className="eyebrow">YoungMinds Content Studio</p>
          <h1>Postări Instagram pentru afterschool și locul de joacă.</h1>
          <p className="lead">
            Scrii o idee despre activitățile YoungMinds. Primești postări, carusele, Reel scripts și asset-uri vizuale în universul nostru: albastru cosmic, accente galbene, stele, joacă și învățare. Nu încă o unealtă generică, slavă internetului.
          </p>
          <div className="activity-row">
            {YOUNGMINDS_BRAND.activities.map((activity) => (
              <span className="activity-chip" key={activity.name}>{activity.name}</span>
            ))}
          </div>
        </div>
        <div className="brand-orbit" aria-hidden="true">
          <img className="brand-logo-card" src="/brand/youngminds-logo.svg" alt="" />
          <div className="spark spark-one">✦</div>
          <div className="spark spark-two">✧</div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <div className="grid">
          <div>
            <label htmlFor="audience">Audiență</label>
            <input id="audience" value={audience} onChange={(event) => setAudience(event.target.value)} />
          </div>
          <div>
            <label>Brand fix</label>
            <div className="brand-lock">{YOUNGMINDS_BRAND.name} · {YOUNGMINDS_BRAND.descriptor}</div>
          </div>
        </div>

        <label htmlFor="script">Idee / script / campanie</label>
        <textarea
          id="script"
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder={YOUNGMINDS_BRAND.defaultScript}
        />

        <div className="quick-ideas">
          {QUICK_IDEAS.map((idea) => (
            <button className="idea-chip" key={idea} type="button" onClick={() => setScript(idea)}>
              {idea}
            </button>
          ))}
        </div>

        <div className="actions">
          <button className="button" onClick={generate} disabled={loading || script.length < 20}>
            {loading ? "Lucrează..." : "Generează postările YoungMinds"}
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

              <VisualAssetExporter post={post} postIndex={index} />
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
