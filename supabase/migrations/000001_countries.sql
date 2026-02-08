create table countries (
  id serial primary key,
  code char(2) unique not null,
  name text not null,
  currency char(3) not null,
  domain text not null,
  default_locale char(2) not null default 'en',
  is_active boolean not null default true
);
