create table vip_subscriptions (
  id serial primary key,
  user_id uuid not null references profiles(id),
  plan_type text not null check (plan_type in ('1_month', '3_month', '6_month', '12_month')),
  price_per_month numeric(10,2) not null,
  currency char(3) not null,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);
