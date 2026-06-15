# YoungMinds Video Engine

MVP web app concept for generating TikTok-ready vertical MP4 batches from a CSV or Excel content table.

## Product direction

The app creates the final video file directly. The MVP keeps TikTok publishing manual, but the generation flow still produces a real MP4 for every selected table row.

The intended flow is:

1. Upload a CSV or Excel file.
2. Select the YoungMinds brand preset.
3. Select one of three MVP templates: Activity, Parent Problem, or Enrollment CTA.
4. Generate script, on-screen text, image prompts, captions, hashtags, subtitles, and video assets.
5. Render a vertical 1080×1920 MP4 and download it for manual posting.

The browser does not render the video by itself. It creates a `generate_video` job, then a backend worker generates text, images, voice-over, subtitles, and the final MP4.

## Recommended architecture

```text
CSV / Excel table
        ↓
Next.js app
        ↓
Supabase DB + Storage
        ↓
Job queue: generate_video
        ↓
OpenAI text + image prompts
        ↓
TTS provider
        ↓
Remotion / Creatomate / JSON2Video
        ↓
MP4 + TikTok caption
```

## MVP table columns

- `data_postarii`
- `tema`
- `obiectiv`
- `public_tinta`
- `hook`
- `script_voiceover`
- `text_pe_ecran`
- `prompt_imagine`
- `cta`
- `caption_tiktok`
- `hashtags`
- `status`
- `video_url`
- `thumbnail_url`

## Development

```bash
npm install
npm run build
npm run lint
```

The repository is dependency-free in this MVP scaffold so the checks can run in restricted environments. `npm run build` creates `dist/index.html` as a static preview artifact; the documented production stack remains Next.js + Supabase + Remotion/OpenAI for the full implementation.
