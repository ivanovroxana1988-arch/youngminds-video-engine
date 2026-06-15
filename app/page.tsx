import { brandPreset, renderPipeline, resultCards, tableColumns, templates, workflowSteps } from "@/lib/content";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow">MVP pentru conținut educațional local</div>
        <h1>YoungMinds Video Engine</h1>
        <p className="lede">
          Da: aplicația creează direct video-ul final. Tu îi dai tabelul, ea generează conținutul, asset-urile, voice-over-ul, subtitrările și randează MP4-ul vertical pentru download.
        </p>
        <div className="answer-box">
          <strong>Ce nu face în MVP:</strong> nu postează automat pe TikTok. Exportă MP4 + caption, iar publicarea rămâne manuală.
        </div>
        <div className="actions">
          <a className="primary" href="#upload">Încarcă tabel</a>
          <a className="secondary" href="#workflow">Vezi fluxul</a>
        </div>
      </section>

      <section id="upload" className="panel upload-panel">
        <div>
          <p className="section-kicker">Primul ecran</p>
          <h2>Generează batch</h2>
          <p>Versiunea 1 pornește simplu: CSV sau Excel, fără conectare Google Sheets live.</p>
        </div>
        <form className="generator-card">
          <label>
            Upload tabel
            <input type="file" accept=".csv,.xlsx,.xls" />
          </label>
          <label>
            Selectează brand
            <select defaultValue="YoungMinds">
              <option>YoungMinds</option>
            </select>
          </label>
          <label>
            Selectează template
            <select defaultValue="Activitate">
              {templates.map((template) => (
                <option key={template.name}>{template.name}</option>
              ))}
            </select>
          </label>
          <button type="button">Generează video-uri</button>
        </form>
      </section>

      <section className="grid-section">
        {templates.map((template) => (
          <article className="template-card" key={template.name}>
            <span>Template</span>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <small>{template.scenes}</small>
          </article>
        ))}
      </section>

      <section id="workflow" className="panel">
        <p className="section-kicker">Arhitectură simplificată</p>
        <h2>Din tabel în MP4 vertical</h2>
        <ol className="timeline">
          {workflowSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="panel render-panel">
        <div>
          <p className="section-kicker">Răspuns scurt</p>
          <h2>Aplicația generează MP4-ul, nu doar textele</h2>
          <p>
            Interfața este doar partea vizibilă. Randarea reală se face asincron într-un worker, ca să poată procesa mai multe rânduri fără să blocheze browserul.
          </p>
        </div>
        <div className="render-steps">
          {renderPipeline.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel brand-panel">
        <div>
          <p className="section-kicker">Brand preset</p>
          <h2>{brandPreset.brand}</h2>
          <p>{brandPreset.tone}</p>
          <div className="swatches">
            {brandPreset.colors.map((color) => (
              <span key={color}>{color}</span>
            ))}
          </div>
        </div>
        <ul>
          {brandPreset.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="panel results-panel">
        <div>
          <p className="section-kicker">Pagina de rezultate</p>
          <h2>Preview, download și status</h2>
        </div>
        <div className="result-card">
          <div className="phone-preview">Preview video</div>
          <div className="result-meta">
            {resultCards.map((item) => (
              <p key={item.label}><strong>{item.label}:</strong> {item.value}</p>
            ))}
            <div className="button-row">
              <button>Download MP4</button>
              <button>Copiază descriere TikTok</button>
              <button>Regenerare text</button>
              <button>Marchează ca postat</button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel columns-panel">
        <p className="section-kicker">Schema tabelului</p>
        <h2>Coloane recomandate</h2>
        <div className="columns">
          {tableColumns.map((column) => (
            <code key={column}>{column}</code>
          ))}
        </div>
      </section>
    </main>
  );
}
