# Phase 4: Match System

## Goal
Post-event binary matching with contact sharing. The core feature of the platform.

## User Flow

### My Matches Page (`/matches`)
- Lists all events the user has attended (past events where they were confirmed + attended)
- Each event shows status:
  - **"Submit your choices"** - scoring not yet submitted
  - **"Waiting for results"** - submitted, but results not released yet
  - **"View your matches!"** - results available
- Sorted by most recent event first

### Score Submission (`/matches/[eventId]/score`)
- Only available:
  - After event date has passed
  - When match_submission_open = true on the event
  - When user hasn't already submitted for this event
- Shows list of opposite-gender participants (or same-gender based on sexual_preference)
- For each participant:
  - First name only (privacy)
  - Three choice buttons: **Date** / **Friend** / **No**
  - If Date or Friend selected, show contact sharing checkboxes:
    - Share my email
    - Share my phone
    - Share my WhatsApp
    - Share my Instagram
    - Share my Facebook
  - Default sharing based on user's privacy_preferences profile setting
- "Submit All" button at bottom
- Confirmation dialog before final submission
- Cannot change after submission (one-shot)

### Match Computation
Triggered automatically when a user submits scores. Also manually triggerable by admin.

**Algorithm:**
```
For the submitter's scores, check if the other person has also submitted:
  If both submitted:
    A_choice = submitter's choice for other person
    B_choice = other person's choice for submitter

    If A_choice == 'no' OR B_choice == 'no':
      result = no_match
    Elif A_choice == 'date' AND B_choice == 'date':
      result = mutual_date
    Else:
      result = mutual_friend  (date+friend, friend+date, friend+friend)

    Store in match_results with shared contact info from both sides
```

Contact sharing in match_results:
- user_a_shares: only the channels user A opted into (email, phone, whatsapp, instagram, facebook)
- user_b_shares: only the channels user B opted into
- Actual contact values pulled from profiles at display time (not stored in results)

### Match Results (`/matches/[eventId]/results`)
- Available when match_results_released = true on the event
- Shows two sections:
  1. **Date Matches** - mutual_date results
  2. **Friend Matches** - mutual_friend results
- Each match shows:
  - Person's first name
  - Shared contact details (only what was mutually agreed)
  - Match type badge (Date / Friend)
- "No matches yet" state if all were no_match
- Message: "X people haven't submitted their choices yet" (if some pending)

### VIP Bonus
- VIP members see an additional section: **"People who chose you"**
- Shows first names of people who selected Date or Friend for them
- Does NOT show the other person's shared contact info (only that they were interested)
- Encouragement to attend more events

## Admin Controls

### Per-event Match Management (`/admin/events/[id]/matches`)
- Toggle match_submission_open (open/close scoring window)
- Toggle match_results_released (release/hold results)
- View all scores in a matrix:
  - Rows = participants, Columns = participants
  - Cells show: Date/Friend/No/Not submitted
- View computed match results
- Override individual matches (admin can change result type)
- Manual "Compute Matches" button (re-runs computation)
- Manual "Release Results" button (sends result emails to all participants)

### Automated Triggers
- Day after event: email all participants prompting to submit scores
- 3 days after event: reminder email to those who haven't submitted
- 7 days after event (or on manual release): result emails sent

## Edge Cases
- User attended but partner list is empty (cancelled event, etc.) → show message
- User submits for some but not all participants → must submit for ALL before saving
- Event with very few participants → still works, just fewer options
- Same-gender matching → based on sexual_preference field, show appropriate participants
