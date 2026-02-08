create table matchmaking_profiles (
  id serial primary key,
  user_id uuid not null references profiles(id),
  questionnaire_data jsonb default '{}',
  package_type text,
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'active', 'expired')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
