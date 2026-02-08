-- Fix gaps found during legacy schema comparison

-- profiles: add faith (observance level) - 2,213 legacy members have this
alter table profiles add column faith text check (faith in (
  'secular', 'conservative', 'orthodox', 'traditional', 'reform', 'liberal', 'modern_orthodox', 'atheist'
));

-- profiles: add height
alter table profiles add column height_cm integer;

-- event_registrations: add admin notes and attendance tracking
alter table event_registrations add column admin_notes text;
alter table event_registrations add column attended boolean;

-- events: add missing event type 'jewish_secular' from legacy
alter table events drop constraint events_event_type_check;
alter table events add constraint events_event_type_check check (event_type in (
  'jewish_general', 'jewish_secular', 'jewish_traditional', 'jewish_divorcees', 'jewish_single_parents',
  'jewish_conservative', 'jewish_modern_orthodox', 'israeli', 'party', 'singles', 'virtual'
));

-- events: add 'last_minute' to special_offer (was in legacy PromotionTypes but missing from check)
-- already present in the check constraint, no change needed

-- match_scores: add active flag (legacy had soft-delete on matches)
alter table match_scores add column is_active boolean not null default true;
