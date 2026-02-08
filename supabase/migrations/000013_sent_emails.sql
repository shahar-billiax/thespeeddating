create table sent_emails (
  id serial primary key,
  user_id uuid references profiles(id),
  email_address text not null,
  recipient_name text,
  template_key text,
  event_id integer references events(id),
  country_id integer not null references countries(id),
  subject text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  sendgrid_message_id text,
  date_added timestamptz not null default now(),
  date_scheduled timestamptz,
  date_sent timestamptz,
  is_read boolean not null default false,
  read_at timestamptz,
  link_clicked boolean not null default false,
  clicked_at timestamptz
);
