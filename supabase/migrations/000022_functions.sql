-- compute_matches: calculate match results for an event
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

  -- for each unique pair where both have submitted scores
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
