-- Create storage bucket for media files (public read access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Media files metadata table
CREATE TABLE IF NOT EXISTS media_files (
  id serial PRIMARY KEY,
  filename text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_size integer,
  mime_type text,
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
