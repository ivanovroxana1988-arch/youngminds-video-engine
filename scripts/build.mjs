import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");
const page = readFileSync("app/page.tsx", "utf8");
const content = readFileSync("lib/content.ts", "utf8");

for (const [file, body] of [["app/page.tsx", page], ["lib/content.ts", content]]) {
  if (!body.includes("MP4")) {
    throw new Error(`${file} must describe MP4 generation.`);
  }
}

mkdirSync("dist", { recursive: true });
writeFileSync(
  "dist/index.html",
  `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>YoungMinds Video Engine</title>
  <meta name="description" content="Generate TikTok-ready MP4 batches from CSV or Excel rows." />
  <style>${css}</style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">MVP pentru conținut educațional local</div>
      <h1>YoungMinds Video Engine</h1>
      <p class="lede">Da: aplicația creează direct video-ul final. Tu îi dai tabelul, ea generează conținutul, asset-urile, voice-over-ul, subtitrările și randează MP4-ul vertical pentru download.</p>
      <div class="answer-box"><strong>Ce nu face în MVP:</strong> nu postează automat pe TikTok. Exportă MP4 + caption, iar publicarea rămâne manuală.</div>
      <div class="actions"><a class="primary" href="#upload">Încarcă tabel</a><a class="secondary" href="#workflow">Vezi fluxul</a></div>
    </section>
    <section id="upload" class="panel upload-panel">
      <div><p class="section-kicker">Primul ecran</p><h2>Generează batch</h2><p>Versiunea 1 pornește simplu: CSV sau Excel, fără conectare Google Sheets live.</p></div>
      <form class="generator-card"><label>Upload tabel<input type="file" accept=".csv,.xlsx,.xls" /></label><label>Selectează brand<select><option>YoungMinds</option></select></label><label>Selectează template<select><option>Activitate</option><option>Problemă părinte</option><option>Înscrieri / CTA</option></select></label><button type="button">Generează video-uri</button></form>
    </section>
    <section id="workflow" class="panel"><p class="section-kicker">Arhitectură simplificată</p><h2>Din tabel în MP4 vertical</h2><ol class="timeline"><li>Încarci CSV sau Excel cu postările planificate.</li><li>AI completează conținutul lipsă.</li><li>Workerul randează MP4-ul final.</li><li>Descarci MP4-ul și postezi manual pe TikTok.</li></ol></section>
  </main>
</body>
</html>`,
);

console.log("Built dist/index.html");
