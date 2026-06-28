create table if not exists public.content_scripts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  script text not null,
  brand text,
  audience text,
  goal text,
  language text default 'Romanian',
  generated_plan jsonb
);

create table if not exists public.scheduled_social_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  content_script_id uuid references public.content_scripts(id) on delete set null,
  platform text not null default 'instagram',
  format text not null,
  title text,
  hook text,
  caption text,
  visual_brief text,
  cta text,
  hashtags text[] default '{}',
  image_url text,
  meta_creation_id text,
  meta_post_id text,
  scheduled_at timestamptz,
  status text not null default 'draft',
  raw_payload jsonb
);

-- Bucket for DALL-E generated images (create via Supabase Dashboard or CLI)
-- supabase storage create post-images --public

create index if not exists idx_content_scripts_created_at on public.content_scripts(created_at desc);
create index if not exists idx_scheduled_social_posts_scheduled_at on public.scheduled_social_posts(scheduled_at desc);
create index if not exists idx_scheduled_social_posts_status on public.scheduled_social_posts(status);
