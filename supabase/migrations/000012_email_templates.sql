create table email_templates (
  id serial primary key,
  template_key text not null,
  language_code char(2) not null,
  country_id integer not null references countries(id),
  subject text not null,
  body_html text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (template_key, language_code, country_id)
);
