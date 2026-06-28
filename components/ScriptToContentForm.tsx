"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { VisualAssetExporter } from "@/components/VisualAssetExporter";
import { MetaTokenStatus } from "@/components/MetaTokenStatus";
import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { ContentPlan, GeneratedPost, TemplateType } from "@/types/content";

const QUICK_IDEAS = [
  "Campanie de înscrieri pentru programul de vară YoungMinds, cu joacă, prietenii și activități educative.",
  "Postare despre robotică: construim, testăm și învățăm prin joacă.",
  "Postare despre atelier creativ: copiii creează ceva frumos cu mâinile lor.",
  "Postare despre afterschool ca loc sigur, cald și curios."
];

const TEMPLATE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: "photo_hero", label: "Poză mare + text" },
  { value: "photo_split", label: "Text + poză" },
  { value: "carousel_education", label: "Carusel educațional" },
  { value: "text_card", label: "Card text" }
];

const brand = `${YOUNGMINDS_BRAND.name} - ${YOUNGMINDS_BRAND.descriptor}`;

export function ScriptToContentForm() {
  const [script, setScript] = useState("");
  const [audience, setAudience] = useState<string>(YOUNGMINDS_BRAND.audience);
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [postImages, setPostImages] = useState<Record<number, string>>({});
  const [templateOverrides, setTemplateOverrides] = useState<Record<number, TemplateType>>({});
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});

  async function requestImage(post: GeneratedPost, index: number) {
    const response = await fetch("/api/meta/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visualBrief: post.visualBrief,
        brand: YOUNGMINDS_BRAND.name,
        postIndex: index,
        post: {
          title: post.title,
          hook: post.hook,
          imageType: post.imageType ?? "mixed",
          photoTheme: post.photoTheme,
          photoRequired: true,
          templateType: templateOverrides[index] ?? post.templateType ?? "photo_hero",
          stylePreset: post.stylePreset ?? "overlay_photo",
          designNotes: post.designNotes
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Generarea imaginii a eșuat.");
    return data.imageUrl as string | undefined;
  }

  async function generateImageForPost(post: GeneratedPost, index: number) {
    setGeneratingImages((prev) => ({ ...prev, [index]: true }));
    try {
      const imageUrl = await requestImage(post, index);
      if (imageUrl) setPostImages((prev) => ({ ...prev, [index]: imageUrl }));
      return { ok: true, imageUrl };
    } catch (err: any) {
      return { ok: false, error: err.message ?? "Generarea imaginii a eșuat." };
    } finally {
      setGeneratingImages((prev) => ({ ...prev, [index]: false }));
    }
  }

  async function generateImagesForPlan(posts: GeneratedPost[]) {
    setActionResult("Generez automat imaginile pentru fiecare postare...");
    const results = await Promise.all(posts.map((post, index) => generateImageForPost(post, index)));
    const success = results.filter((result) => result.ok).length;
    const errors = results
      .map((result, index) => (!result.ok && result.error ? `Postarea ${index + 1}: ${result.error}` : null))
      .filter(Boolean) as string[];

    if (success === posts.length) {
      setActionResult(`Campanie completă generată: ${posts.length} postări și ${success} imagini.`);
    } else if (success > 0) {
      setActionResult(`Campanie generată parțial: ${posts.length} postări și ${success} imagini.`);
      setError(errors.join(" | "));
    } else {
      setActionResult("Textele au fost generate, dar imaginile AI nu au mers.");
      setError(errors.join(" | ") || "Generarea imaginilor a eșuat fără mesaj clar.");
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setActionResult("Generez campania completă...");
    setPlan(null);
    setPostImages({});
    setTemplateOverrides({});

    try {
      const response = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          brand,
          audience,
          goal: YOUNGMINDS_BRAND.defaultGoal,
          language: "Romanian",
          count: 4
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Generarea a eșuat.");
      const generatedPlan = data.plan as ContentPlan;
      setPlan(generatedPlan);
      await generateImagesForPlan(generatedPlan.posts);
    } catch (err: any) {
      setError(err.message ?? "Generarea a eșuat.");
    } finally {
      setLoading(false);
    }
  }

  async function publishNow(post: GeneratedPost, index: number) {
    setLoading(true);
    setError(null);
    setActionResult(null);

    const response = await fetch("/api/meta/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post, brand: YOUNGMINDS_BRAND.name, imageUrl: postImages[index] || undefined })
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
        imageUrls: plan.posts.map((_, index) => postImages[index] || ""),
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

  function updateTemplate(index: number, value: TemplateType) {
    setTemplateOverrides((prev) => ({ ...prev, [index]: value }));
  }

  return (
    <main className="shell">
      <section className="brand-hero card">
        <div className="brand-copy">
          <p className="eyebrow">YoungMinds Autopilot</p>
          <h1>Scrii ideea. Primești postările gata.</h1>
          <p className="lead">
            Aplicația generează automat textul, imaginea, layoutul și preview-ul final în stil YoungMinds.
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
            <label>Brand</label>
            <div className="brand-lock">{YOUNGMINDS_BRAND.name} · {YOUNGMINDS_BRAND.descriptor}</div>
          </div>
        </div>

        <label htmlFor="script">Idee / script / campanie</label>
        <textarea
          id="script"
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder="Exemplu: campanie de înscrieri pentru programul de vară YoungMinds, cu joacă, prietenii, ateliere creative și activități educative."
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
            {loading ? "Generez campania completă..." : "Generează campanie completă"}
          </button>
          <button className="button secondary" onClick={scheduleAll} disabled={loading || !plan}>
            Programează pe Instagram
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {actionResult && <p style={{ color: "#065f46", fontWeight: 700 }}>{actionResult}</p>}
      </section>

      {plan && (
        <section className="card" style={{ marginTop: 24 }}>
          <p className="eyebrow">Campanie generată</p>
          <h2>Postări gata de verificat</h2>
          <p>{plan.sourceSummary}</p>

          {plan.posts.map((post, index) => {
            const selectedImageUrl = postImages[index];
            const selectedTemplate = templateOverrides[index] ?? post.templateType ?? "photo_hero";
            const imageIsLoading = Boolean(generatingImages[index]);

            return (
              <article key={`${post.title}-${index}`} className="post-card">
                <div className="post-topline">
                  <span className="badge">{post.format}</span>
                  <span className="meta-chip">{post.stylePreset ?? "overlay_photo"}</span>
                  <span className={selectedImageUrl ? "meta-chip" : "meta-chip warning"}>
                    {selectedImageUrl ? "imagine generată" : imageIsLoading ? "imagine în lucru" : "imagine lipsă"}
                  </span>
                </div>

                <h3>{index + 1}. {post.title}</h3>
                <p><strong>Hook:</strong> {post.hook}</p>
                <pre>{post.caption}</pre>
                <p><strong>CTA:</strong> {post.cta}</p>
                <p>{post.hashtags.join(" ")}</p>

                <div className="actions compact">
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => void generateImageForPost(post, index)}
                    disabled={imageIsLoading}
                  >
                    {imageIsLoading ? "Generez imaginea..." : selectedImageUrl ? "Regenerează imaginea" : "Generează imaginea"}
                  </button>
                  <button className="button" onClick={() => publishNow(post, index)} disabled={loading}>
                    Publică acum pe Instagram
                  </button>
                </div>

                {selectedImageUrl ? (
                  <img src={selectedImageUrl} alt={`Imagine generată pentru postarea ${index + 1}`} className="selected-photo-preview" />
                ) : null}

                <details style={{ marginTop: 16 }}>
                  <summary>Opțiuni avansate</summary>
                  <div className="design-panel">
                    <label htmlFor={`template-${index}`}>Template</label>
                    <select
                      id={`template-${index}`}
                      value={selectedTemplate}
                      onChange={(event) => updateTemplate(index, event.target.value as TemplateType)}
                    >
                      {TEMPLATE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </details>

                {selectedImageUrl ? (
                  <VisualAssetExporter post={post} postIndex={index} photoUrl={selectedImageUrl} templateType={selectedTemplate} />
                ) : null}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
