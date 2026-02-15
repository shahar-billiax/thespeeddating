-- Post-Event Matching: questions system, draft scoring, submission deadlines

-- ─── New table: configurable per-person questions ────────────
create table event_match_questions (
  id serial primary key,
  event_id integer references events(id) on delete cascade,  -- NULL = global default
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice', 'yes_no', 'rating')),
  options jsonb,  -- For multiple_choice: ["Option A", "Option B", ...]
  is_required boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_match_questions_event on event_match_questions(event_id);
create index idx_match_questions_active on event_match_questions(is_active);

-- ─── New table: answers to per-person questions ──────────────
create table match_score_answers (
  id serial primary key,
  match_score_id integer not null references match_scores(id) on delete cascade,
  question_id integer not null references event_match_questions(id) on delete cascade,
  answer text,
  created_at timestamptz not null default now()
);

create index idx_match_answers_score on match_score_answers(match_score_id);
create index idx_match_answers_question on match_score_answers(question_id);

-- ─── Alter match_scores: add draft support ───────────────────
alter table match_scores
  add column if not exists is_draft boolean not null default true,
  add column if not exists submitted_by_user_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Mark all existing scores as finalized (not drafts)
update match_scores set is_draft = false where submitted_at is not null;

-- ─── Alter events: add deadline and lock ─────────────────────
alter table events
  add column if not exists match_submission_deadline timestamptz,
  add column if not exists match_submission_locked boolean not null default false;

-- ─── Update compute_matches to exclude draft scores ──────────
create or replace function compute_matches(p_event_id integer)
returns void
language plpgsql
security definer
as $$
declare
  rec record;
begin
  -- delete existing results for this event
  delete from match_results where event_id = p_event_id;

  -- for each unique pair where both have submitted final (non-draft) scores
  for rec in
    select
      a.scorer_id as user_a_id,
      b.scorer_id as user_b_id,
      a.choice as a_choice,
      b.choice as b_choice,
      jsonb_build_object(
        'email', a.share_email,
        'phone', a.share_phone,
        'whatsapp', a.share_whatsapp,
        'instagram', a.share_instagram,
        'facebook', a.share_facebook
      ) as a_shares,
      jsonb_build_object(
        'email', b.share_email,
        'phone', b.share_phone,
        'whatsapp', b.share_whatsapp,
        'instagram', b.share_instagram,
        'facebook', b.share_facebook
      ) as b_shares
    from match_scores a
    join match_scores b
      on a.event_id = b.event_id
      and a.scorer_id = b.scored_id
      and a.scored_id = b.scorer_id
    where a.event_id = p_event_id
      and a.scorer_id < b.scorer_id  -- ensure each pair only once
      and a.is_draft = false
      and b.is_draft = false
  loop
    insert into match_results (event_id, user_a_id, user_b_id, result_type, user_a_shares, user_b_shares)
    values (
      p_event_id,
      rec.user_a_id,
      rec.user_b_id,
      case
        when rec.a_choice = 'no' or rec.b_choice = 'no' then 'no_match'
        when rec.a_choice = 'date' and rec.b_choice = 'date' then 'mutual_date'
        else 'mutual_friend'
      end,
      rec.a_shares,
      rec.b_shares
    );
  end loop;
end;
$$;

-- ─── RLS for event_match_questions ───────────────────────────
alter table event_match_questions enable row level security;

-- Users can view active questions for events they attended or global defaults
create policy "Users can view questions for attended events"
  on event_match_questions for select
  using (
    is_active = true and (
      event_id is null  -- global defaults visible to all authenticated users
      or exists (
        select 1 from event_registrations
        where event_registrations.event_id = event_match_questions.event_id
          and event_registrations.user_id = auth.uid()
          and event_registrations.status in ('confirmed', 'attended')
      )
    )
  );

-- Admins full access
create policy "Admins full access to match questions"
  on event_match_questions for all
  using (is_admin());

-- ─── RLS for match_score_answers ─────────────────────────────
alter table match_score_answers enable row level security;

-- Users can insert their own answers
create policy "Users can insert own answers"
  on match_score_answers for insert
  with check (
    exists (
      select 1 from match_scores
      where match_scores.id = match_score_answers.match_score_id
        and match_scores.scorer_id = auth.uid()
    )
  );

-- Users can view their own answers
create policy "Users can view own answers"
  on match_score_answers for select
  using (
    exists (
      select 1 from match_scores
      where match_scores.id = match_score_answers.match_score_id
        and match_scores.scorer_id = auth.uid()
    )
  );

-- Users can update their own answers (for draft editing)
create policy "Users can update own answers"
  on match_score_answers for update
  using (
    exists (
      select 1 from match_scores
      where match_scores.id = match_score_answers.match_score_id
        and match_scores.scorer_id = auth.uid()
    )
  );

-- Users can delete their own answers (for re-saving)
create policy "Users can delete own answers"
  on match_score_answers for delete
  using (
    exists (
      select 1 from match_scores
      where match_scores.id = match_score_answers.match_score_id
        and match_scores.scorer_id = auth.uid()
    )
  );

-- Admins full access
create policy "Admins full access to match score answers"
  on match_score_answers for all
  using (is_admin());

-- ─── Seed global default questions ───────────────────────────
insert into event_match_questions (event_id, question_text, question_type, options, is_required, sort_order)
values
  (null, 'Would you like to see this person again?', 'yes_no', null, true, 1),
  (null, 'How would you rate your chemistry?', 'rating', null, true, 2);
