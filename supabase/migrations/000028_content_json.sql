-- Add content_json column for structured page data (pricing, FAQs, contact info, etc.)
-- Each page_type defines its own JSON shape validated at the application layer.

-- Add the nullable JSONB column
ALTER TABLE pages ADD COLUMN content_json jsonb;

-- Extend page_type CHECK constraint to include new types
ALTER TABLE pages DROP CONSTRAINT pages_page_type_check;
ALTER TABLE pages ADD CONSTRAINT pages_page_type_check
  CHECK (page_type IN ('standard', 'testimony', 'pricing', 'faq', 'contact'));

-- GIN index for JSONB queries
CREATE INDEX idx_pages_content_json ON pages USING gin (content_json) WHERE content_json IS NOT NULL;
