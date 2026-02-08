create table match_results (
  id serial primary key,
  event_id integer not null references events(id),
  user_a_id uuid not null references profiles(id),
  user_b_id uuid not null references profiles(id),
  result_type text not null check (result_type in ('mutual_date', 'mutual_friend', 'no_match')),
  user_a_shares jsonb default '{}',
  user_b_shares jsonb default '{}',
  computed_at timestamptz not null default now(),
  unique (event_id, user_a_id, user_b_id)
);
