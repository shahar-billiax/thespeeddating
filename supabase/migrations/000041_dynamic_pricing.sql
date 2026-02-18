-- Dynamic event pricing: Early Bird and Last Minute tiers

-- Early Bird pricing columns on events
alter table events
  add column if not exists early_bird_enabled boolean not null default false,
  add column if not exists early_bird_price numeric(10,2),
  add column if not exists early_bird_deadline timestamptz;

-- Last Minute pricing columns on events
alter table events
  add column if not exists last_minute_enabled boolean not null default false,
  add column if not exists last_minute_price numeric(10,2),
  add column if not exists last_minute_activation timestamptz,
  add column if not exists last_minute_days_before integer,
  add column if not exists last_minute_mode text
    check (last_minute_mode in ('date', 'days_before'))
    default 'date';

-- Record which pricing tier was applied at checkout
alter table event_registrations
  add column if not exists pricing_tier text
    check (pricing_tier in ('standard', 'early_bird', 'last_minute', 'vip', 'promo'))
    default 'standard';

-- Partial indexes for active pricing lookups
create index if not exists idx_events_early_bird
  on events(early_bird_enabled, early_bird_deadline)
  where early_bird_enabled = true;

create index if not exists idx_events_last_minute
  on events(last_minute_enabled, last_minute_activation)
  where last_minute_enabled = true;
