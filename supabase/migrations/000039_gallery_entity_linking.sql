-- Organize gallery images into entity folders within a gallery.
-- A "venues" gallery has images grouped by venue_id.
-- An "events" gallery has images grouped by event_id.
-- This keeps one gallery per category+country, with folders inside.

-- Add entity references to gallery_images (the folder concept)
ALTER TABLE gallery_images ADD COLUMN venue_id integer REFERENCES venues(id) ON DELETE SET NULL;
ALTER TABLE gallery_images ADD COLUMN event_id integer REFERENCES events(id) ON DELETE SET NULL;

-- Expand gallery categories
ALTER TABLE galleries DROP CONSTRAINT galleries_category_check;
ALTER TABLE galleries ADD CONSTRAINT galleries_category_check
  CHECK (category IN ('events', 'venues', 'homepage', 'success_stories', 'general'));

-- Indexes for filtering images by entity
CREATE INDEX idx_gallery_images_venue ON gallery_images(venue_id) WHERE venue_id IS NOT NULL;
CREATE INDEX idx_gallery_images_event ON gallery_images(event_id) WHERE event_id IS NOT NULL;
