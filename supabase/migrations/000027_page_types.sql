-- Add page_type column to pages table
-- Allows different page types with different editing experiences
-- 'standard' = regular CMS page with rich text content
-- 'testimony' = page that manages testimonies/success stories

ALTER TABLE pages
ADD COLUMN page_type text NOT NULL DEFAULT 'standard'
CHECK (page_type IN ('standard', 'testimony'));

-- Update any existing success-stories pages to testimony type
UPDATE pages SET page_type = 'testimony' WHERE page_key = 'success-stories';

-- Index for filtering by page type
CREATE INDEX idx_pages_type ON pages (page_type);
