-- Add cover image support to venues and events
-- Stores the storage path in the media bucket

alter table venues add column cover_image text;
alter table events add column cover_image text;
