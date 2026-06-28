"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { VisualAssetExporter } from "@/components/VisualAssetExporter";
import { MetaTokenStatus } from "@/components/MetaTokenStatus";
import { YOUNGMINDS_BRAND } from "@/lib/brand/youngminds";
import { suggestPhotoForPost, YOUNGMINDS_PHOTO_LIBRARY } from "@/lib/media/photo-library";
import { ContentPlan, GeneratedPost, TemplateType } from "@/types/content";

const QUICK_IDEAS = [
  "Promovează robotica pentru copiii care iubesc construcțiile și experimentele.",
  "Explică părinților de ce STEM-ul ajută copilul să gândească logic prin joacă.",
  "Creează o campanie despre afterschool ca spațiu sigur, cald și curios.",
  "Fă o serie despre activitățile YoungMinds: pian, tae-kwon do, robotică, limbi străine și yoga."
];

const TEMPLATE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: "photo_split", label: "Foto + text split" },
  { value: "photo_hero", label: "Foto mare + text" },
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
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [templateOverrides, setTemplateOverrides] = useState<Record<number, TemplateType>>({});
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  const [autoGenerateVisuals, setAutoGenerateVisuals] = useState(true);

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
          imageType: post.imageType,
          photoTheme: post.photoTheme,
          photoRequired: post.photoRequired,
          templateType: templateOverrides[index] ?? post.templateType
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Generarea imaginii a eșuat.");
    }

    return data.imageUrl as string | undefined;
  }

  async function generateImageForPost(post: GeneratedPost, index: number, options?: { silent?: boolean }) {
    setGeneratingImages((prev) => ({ ...prev, [index]: true }));
    if (!options?.silent) setError(null);

    try {
      const imageUrl = await requestImage(post, index);
      if (imageUrl) {
        setPostImages((prev) => ({ ...prev, [index]: imageUrl }));
      }
      return imageUrl;
    } catch (err: any) {
      if (!options?.silent) {
        setError(err.message ?? "Generarea imaginii a eșuat.");
      }
      return undefined;
    } finally {
      setGeneratingImages((prev) => ({ ...prev, [index]: false }));
    }
  }

  async function generateImagesForPlan(posts: GeneratedPost[]) {
    let success = 0;

    for (let index = 0; index < posts.length; index++) {
      const imageUrl = await generateImageForPost(posts[index], index, { silent: true });
      if (imageUrl) success += 1;
    }

    if (success > 0) {
      setActionResult(`Plan generat. ${success}/${posts.length} imagini au fost generate automat.`);
    } else {
      setActionResult("Plan generat. Imaginile nu au fost generate automat, dar le poți regenera manual.");
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setActionResult(null);
    setPlan(null);
    setPostImages({});
    setPhotoUrls({});
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
      if (!response.ok) {
        throw new Error(data.error ?? "A picat generarea. Tehnologia și-a luat pauză de filosofie.");
      }

      const generatedPlan = data.plan as ContentPlan;
      setPlan(generatedPlan);

      if (autoGenerateVisuals) {
        setActionResult("Plan generat. Generez automat imaginile...");
        await generateImagesForPlan(generatedPlan.posts);
      } else {
        setActionResult("Plan generat. Activează generarea imaginilor când ai nevoie.");
      }
    } catch (err: any) {
      setError(err.message ?? "Generarea a eșuat.");
    } finally {
      setLoading(false);
    }
  }

  async function publishNow(post: GeneratedPost, index: number) {
    if (!plan) return;
    setLoading(true);
    setError(null);
    setActionResult(null);

    const imageUrl = photoUrls[index] || postImages[index] || undefined;
    const response = await fetch("/api/meta/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post, brand: YOUNGMINDS_BRAND.name, imageUrl })
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
        imageUrls: plan.posts.map((_, index) => photoUrls[index] || postImages[index] || ""),
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

  function updatePhotoUrl(index: number, value: string) {
    setPhotoUrls((prev) => ({ ...prev, [index]: value }));
  }

  function updateTemplate(index: number, value: TemplateType) {
    setTemplateOverrides((prev) => ({ ...prev, [index]: value }));
  }

  return (
    <main className="shell">
      <section className="brand-hero card">
        <div className="brand-copy">
          <p className="eyebrow">YoungMinds Content Studio</p>
          <h1>Postări Instagram pentru afterschool și locul de joacă.</h1>
          <p className="lead">
            Scrii o idee despre activitățile YoungMinds. Primești postări, carusele, Reel scripts, imagini generice create automat și template-uri vizuale cu text așezat corect. Adică un pas mai aproape de automatizare reală, nu doar de muncă mutată dintr-un loc în altul.
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

        <div className="photo-library-note">
          <strong>Mod automat:</strong> aplicația poate genera singură imagini generice, brand-aligned, pentru fiecare postare. Pozele reale rămân opționale. Dacă vrei, poți folosi și URL-uri proprii sau sugestiile locale: {YOUNGMINDS_PHOTO_LIBRARY.map((photo) => photo.label).join(" · ")}.
        </div>

        <label className="toggle-row" htmlFor="auto-generate-visuals">
          <input
            id="auto-generate-visuals"
            type="checkbox"
            checked={autoGenerateVisuals}
            onChange={(event) => setAutoGenerateVisuals(event.target.checked)}
          />
          <span>Generează automat imaginile pentru toate postările</span>
        </label>

        <div className="actions">
          <button className="button" onClick={generate} disabled={loading || script.length < 20}>
            {loading ? "Lucrează..." : "Generează postări calibrate"}
          </button>
          <button className="button secondary" onClick={scheduleAll} disabled={loading || !plan}>
            Programează săptămâna pe Instagram
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {actionResult && <p style={{ color: "#065f46", fontWeight: 700 }}>{actionResult}</p>}
      </section>

      {plan && (
        <section className="card" style={{ marginTop: 24 }}>
          <p className="eyebrow">Plan generat</p>
          <h2>Rezumat</h2>
          <p>{plan.sourceSummary}</p>
          <p>
            <strong>Piloni:</strong> {plan.contentPillars.join(" · ")}
          </p>

          {plan.posts.map((post, index) => {
            const suggestedPhoto = suggestPhotoForPost(post);
            const selectedPhotoUrl = photoUrls[index] || postImages[index];
            const selectedTemplate = templateOverrides[index] ?? post.templateType ?? "photo_split";

            return (
              <article key={`${post.title}-${index}`} className="post-card">
                <div className="post-topline">
                  <span className="badge">{post.format}</span>
                  <span className="meta-chip">{selectedTemplate}</span>
                  <span className="meta-chip">{post.imageType ?? "mixed"}</span>
                  {post.photoRequired ? <span className="meta-chip warning">vizual foto recomandat</span> : null}
                </div>

                <h3>{index + 1}. {post.title}</h3>
                <p><strong>Hook:</strong> {post.hook}</p>
                <pre>{post.caption}</pre>
                <p><strong>Vizual:</strong> {post.visualBrief}</p>

                <section className="design-panel">
                  <div className="grid">
                    <div>
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
                    <div>
                      <label htmlFor={`photo-${index}`}>Poză opțională / URL imagine</label>
                      <input
                        id={`photo-${index}`}
                        value={photoUrls[index] ?? ""}
                        onChange={(event) => updatePhotoUrl(index, event.target.value)}
                        placeholder={post.photoTheme ? `/photos/${post.photoTheme}.jpg` : "/photos/robotica-01.jpg"}
                      />
                    </div>
                  </div>

                  <p className="photo-hint">
                    <strong>Temă foto:</strong> {post.photoTheme ?? "nespecificată"}. {post.designNotes ? <><strong> Design:</strong> {post.designNotes}</> : null}
                  </p>

                  <div className="actions compact">
                    {suggestedPhoto ? (
                      <button className="button secondary" type="button" onClick={() => updatePhotoUrl(index, suggestedPhoto.url)}>
                        Folosește sugestia locală: {suggestedPhoto.label}
                      </button>
                    ) : null}
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => generateImageForPost(post, index)}
                      disabled={generatingImages[index]}
                    >
                      {generatingImages[index] ? "Generez imaginea..." : postImages[index] ? "Regenerează imagine AI" : "Generează imagine AI"}
                    </button>
                  </div>

                  {selectedPhotoUrl ? (
                    <img
                      src={selectedPhotoUrl}
                      alt={`Imagine pentru postarea ${index + 1}`}
                      className="selected-photo-preview"
                    />
                  ) : null}
                </section>

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
                    onClick={() => publishNow(post, index)}
                    disabled={loading}
                  >
                    Publică acum pe Instagram
                  </button>
                </div>

                <VisualAssetExporter
                  post={post}
                  postIndex={index}
                  photoUrl={selectedPhotoUrl}
                  templateType={selectedTemplate}
                />
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
