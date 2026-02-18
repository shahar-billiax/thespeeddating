-- Migration 000044: Fix faith column check constraint
-- The original constraint (from 000024) allowed only legacy observance-level values.
-- The app now stores full religion strings matching the UI dropdowns.

alter table profiles
  drop constraint if exists profiles_faith_check;

alter table profiles
  add constraint profiles_faith_check check (
    faith in (
      'Jewish - Orthodox',
      'Jewish - Conservative',
      'Jewish - Reform',
      'Jewish - Traditional',
      'Jewish - Secular',
      'Christian',
      'Muslim',
      'Buddhist',
      'Hindu',
      'Spiritual',
      'Not religious',
      'Other'
    )
  );
