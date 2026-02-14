-- Add updated_at column to media_files for cache busting after edits
ALTER TABLE media_files
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_media_files_updated_at ON media_files;
CREATE TRIGGER trg_media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();
