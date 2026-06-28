"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { buildVisualAssets, VisualAsset } from "@/lib/creative/svg-assets";
import { GeneratedPost, TemplateType } from "@/types/content";

type VisualAssetExporterProps = {
  post: GeneratedPost;
  postIndex: number;
  photoUrl?: string;
  templateType?: TemplateType;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resolvePhotoUrl(photoUrl?: string) {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith("http")) return photoUrl;
  if (typeof window === "undefined") return photoUrl;
  return new URL(photoUrl, window.location.origin).toString();
}

async function svgToPngBlob(asset: VisualAsset) {
  const svgBlob = new Blob([asset.svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context is not available.");

    context.fillStyle = "#26336F";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Could not export PNG. Dacă ai folosit o poză externă, încearcă o poză din /public/photos sau un URL cu CORS permis."));
        else resolve(blob);
      }, "image/png", 0.95);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function VisualAssetExporter({ post, postIndex, photoUrl, templateType }: VisualAssetExporterProps) {
  const [status, setStatus] = useState<string | null>(null);
  const resolvedPhotoUrl = useMemo(() => resolvePhotoUrl(photoUrl), [photoUrl]);
  const assets = useMemo(
    () => buildVisualAssets(post, postIndex, { photoUrl: resolvedPhotoUrl, templateType }),
    [post, postIndex, resolvedPhotoUrl, templateType]
  );

  async function downloadPng(asset: VisualAsset) {
    try {
      setStatus(`Export ${asset.label}...`);
      const blob = await svgToPngBlob(asset);
      downloadBlob(blob, asset.filename);
      setStatus("PNG exportat.");
    } catch (error: any) {
      setStatus(error.message ?? "Nu am putut exporta PNG-ul.");
    }
  }

  async function downloadAllPng() {
    try {
      setStatus(`Export ${assets.length} asset-uri...`);
      for (const asset of assets) {
        const blob = await svgToPngBlob(asset);
        downloadBlob(blob, asset.filename);
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      setStatus("Toate PNG-urile au fost exportate.");
    } catch (error: any) {
      setStatus(error.message ?? "Nu am putut exporta toate PNG-urile.");
    }
  }

  function downloadSvg(asset: VisualAsset) {
    downloadBlob(new Blob([asset.svg], { type: "image/svg+xml;charset=utf-8" }), asset.filename.replace(/\.png$/, ".svg"));
  }

  return (
    <section className="asset-box">
      <div className="asset-header">
        <div>
          <p className="eyebrow">Postări create</p>
          <h4>Preview YoungMinds 1080 × 1350</h4>
        </div>
        <button className="button secondary" type="button" onClick={downloadAllPng}>
          Descarcă toate PNG
        </button>
      </div>

      <div className="asset-grid">
        {assets.map((asset) => (
          <article className="asset-card" key={asset.filename}>
            <img src={asset.dataUrl} alt={asset.label} className="asset-preview" />
            <div className="asset-actions">
              <span>{asset.label}</span>
              <button className="button secondary" type="button" onClick={() => downloadPng(asset)}>
                PNG
              </button>
              <button className="button secondary" type="button" onClick={() => downloadSvg(asset)}>
                SVG
              </button>
            </div>
          </article>
        ))}
      </div>

      {status && <p className="asset-status">{status}</p>}
    </section>
  );
}
