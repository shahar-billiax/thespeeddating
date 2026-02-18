-- Migration 000045: Drop faith check constraint entirely
-- Migration 000044 replaced the constraint but existing profiles still have
-- legacy observance-level values ('orthodox', 'secular', etc.) that violate it.
-- The app validates faith values via Zod at the application layer, so the DB
-- constraint is redundant. Drop it and clear any stale legacy values.

alter table profiles
  drop constraint if exists profiles_faith_check;

-- Null out any faith values that are not in the current valid set
update profiles
set faith = null
where faith is not null
  and faith not in (
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
  );
