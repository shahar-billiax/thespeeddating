create table match_scores (
  id serial primary key,
  event_id integer not null references events(id),
  scorer_id uuid not null references profiles(id),
  scored_id uuid not null references profiles(id),
  choice text not null check (choice in ('date', 'friend', 'no')),
  share_email boolean not null default false,
  share_phone boolean not null default false,
  share_whatsapp boolean not null default false,
  share_instagram boolean not null default false,
  share_facebook boolean not null default false,
  submitted_at timestamptz not null default now(),
  unique (event_id, scorer_id, scored_id)
);
