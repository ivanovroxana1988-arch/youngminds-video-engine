"use client";

import { useState } from "react";
import { VisualAssetExporter } from "@/components/VisualAssetExporter";
import { MetaTokenStatus } from "@/components/MetaTokenStatus";
import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { ContentPlan, GeneratedPost } from "@/types/content";

const QUICK_IDEAS = [
  "Promovează robotica pentru copiii care iubesc construcțiile și experimentele.",
  "Explică părinților de ce STEM-ul ajută copilul să gândească logic prin joacă.",
  "Creează o campanie despre afterschool ca spațiu sigur, cald și curios.",
  "Fă o serie despre activitățile YoungMinds: pian, tae-kwon do, robotică, limbi străine și yoga."
];

const brand = `${YOUNGMINDS_BRAND.name} - ${YOUNGMINDS_BRAND.descriptor}`;

export function ScriptToContentForm() {
  const [script, setScript] = useState("");
  const [audience, setAudience] = useState(YOUNGMINDS_BRAND.audience);
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [postImages, setPostImages] = useState<Record<number, string>>({});
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});

  async function generate() {
    setLoading(true);
    setError(null);
    setActionResult(null);
    setPlan(null);
    setPostImages({});

    const response = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script,
        brand,
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

  async function generateImageForPost(post: GeneratedPost, index: number) {
    setGeneratingImages((prev) => ({ ...prev, [index]: true }));

    const response = await fetch("/api/meta/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visualBrief: post.visualBrief, brand: YOUNGMINDS_BRAND.name, postIndex: index })
    });

    const data = await response.json();
    setGeneratingImages((prev) => ({ ...prev, [index]: false }));

    if (response.ok && data.imageUrl) {
      setPostImages((prev) => ({ ...prev, [index]: data.imageUrl }));
    }
  }

  async function publishNow(post: GeneratedPost) {
    if (!plan) return;
    setLoading(true);
    setError(null);
    setActionResult(null);

    const response = await fetch("/api/meta/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post, brand: YOUNGMINDS_BRAND.name })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Publicarea a eșuat.");
      return;
    }

    setActionResult(`Postare publicată pe Instagram! ID: ${data.postId}`);
  }

  async function scheduleAll() {
    if (!plan) return;
    setLoading(true);
    setError(null);
    setActionResult(null);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(9, 0, 0, 0);

    const response = await fetch("/api/meta/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        posts: plan.posts,
        brand: YOUNGMINDS_BRAND.name,
        startDateIso: startDate.toISOString(),
        daysBetweenPosts: 1
      })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Programarea a eșuat.");
      return;
    }

    setActionResult(`Programate ${data.scheduled} postări pe Instagram, începând de mâine la ora 09:00.`);
  }

  return (
    <main className="shell">
      <section className="brand-hero card">
        <div className="brand-copy">
          <p className="eyebrow">YoungMinds Content Studio</p>
          <h1>Postări Instagram pentru afterschool și locul de joacă.</h1>
          <p className="lead">
            Scrii o idee despre activitățile YoungMinds. Primești postări, carusele, Reel scripts și imagini generate cu DALL-E 3 în universul nostru: albastru cosmic, accente galbene, stele, joacă și învățare.
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
        <MetaTokenStatus />

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
          <button className="button secondary" onClick={scheduleAll} disabled={loading || !plan}>
            Programează săptămâna pe Instagram
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {actionResult && <p style={{ color: "#065f46", fontWeight: 500 }}>{actionResult}</p>}
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

              {postImages[index] ? (
                <img
                  src={postImages[index]}
                  alt={`Imagine generată pentru postarea ${index + 1}`}
                  style={{ width: "100%", maxWidth: 400, borderRadius: 8, marginBottom: 12 }}
                />
              ) : (
                <button
                  className="button secondary"
                  style={{ marginBottom: 12 }}
                  onClick={() => generateImageForPost(post, index)}
                  disabled={generatingImages[index]}
                >
                  {generatingImages[index] ? "Generez imaginea..." : "Generează imagine DALL-E 3"}
                </button>
              )}

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

              <div className="actions" style={{ marginTop: 12 }}>
                <button
                  className="button"
                  onClick={() => publishNow(post)}
                  disabled={loading}
                >
                  Publică acum pe Instagram
                </button>
              </div>

              <VisualAssetExporter post={post} postIndex={index} />
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
