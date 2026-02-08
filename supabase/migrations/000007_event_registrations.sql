create table event_registrations (
  id serial primary key,
  event_id integer not null references events(id),
  user_id uuid not null references profiles(id),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'waitlisted')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  amount numeric(10,2),
  paid_amount numeric(10,2),
  currency char(3),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  promotion_code_id integer,
  ticket_quantity integer not null default 1,
  guest_details jsonb,
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);
