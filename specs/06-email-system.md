# Phase 6: Email System

## Goal
SendGrid-powered transactional and marketing emails with admin-managed templates and automated triggers.

## Email Templates

### Template List (admin-managed, each with EN + HE versions)
| Key | Trigger | Variables |
|-----|---------|-----------|
| registration_confirmation | On user registration | first_name, login_url |
| booking_confirmation | On ticket purchase | first_name, event_date, event_time, venue_name, venue_address, ticket_count, amount_paid, event_url, calendar_ics_url |
| event_reminder_2days | 2 days before event | first_name, event_date, event_time, venue_name, venue_address, transport_info, dress_code |
| event_reminder_today | Day of event | first_name, event_time, venue_name, venue_address |
| submit_choices_prompt | Day after event | first_name, event_date, match_url |
| submit_choices_reminder | 3 days after event if not submitted | first_name, event_date, match_url |
| match_results | On results release | first_name, event_date, results_url, match_count |
| vip_confirmation | On VIP subscription | first_name, plan_name, expiry_date |
| vip_chosen_notification | When VIP member gets selected | first_name, event_date |
| waitlist_notification | When spot opens | first_name, event_date, venue_name, booking_url, expires_at |
| last_spaces_male | Admin-triggered for male spots | first_name, event_date, venue_name, spots_remaining, event_url |
| last_spaces_female | Admin-triggered for female spots | first_name, event_date, venue_name, spots_remaining, event_url |
| event_cancellation | On admin event cancel | first_name, event_date, venue_name, refund_info |
| password_reset | Via Supabase Auth | first_name, reset_url |
| newsletter | Manual admin send | first_name, content (HTML block) |

### Template System
- Templates stored in `email_templates` table
- HTML with `{{variable}}` placeholders
- Admin edits via HTML code editor with live preview
- Each template has EN + HE version per country
- Rendering: simple string replacement of `{{variable}}` with actual values

### Calendar Invites
- Generate .ics file for booking confirmation
- Include: event date/time, venue name + address, event URL
- Attach to booking confirmation email
- Also available as download on success page and in My Events

## Automated Triggers

### Immediate (fired in server actions)
- registration_confirmation → on successful registration
- booking_confirmation → on successful payment (Stripe webhook)
- vip_confirmation → on VIP subscription activation
- event_cancellation → on admin cancel action
- waitlist_notification → on cancellation that frees a spot

### Scheduled (Vercel cron job, runs daily at 8am)
```
For each upcoming event:
  If event_date - 2 days == today:
    Queue event_reminder_2days for all confirmed participants
  If event_date == today:
    Queue event_reminder_today for all confirmed participants

For each past event:
  If event_date + 1 day == today:
    Queue submit_choices_prompt for all confirmed participants
  If event_date + 3 days == today:
    Queue submit_choices_reminder for participants who haven't submitted
  If event_date + 7 days == today AND match_results_released == false:
    (Optionally auto-release, or just notify admin)
```

### Email Queue Processing
- Emails with status=queued and date_scheduled <= now get processed
- Vercel cron picks up and sends via SendGrid API
- Update status to sent/failed
- Store sendgrid_message_id for tracking

## SendGrid Integration

### Setup
- SendGrid API key in environment variables
- Sender domain verified (thespeeddating.co.uk, thespeeddating.co.il)
- Sender email: noreply@thespeeddating.co.uk / noreply@thespeeddating.co.il

### Sending
- Use SendGrid Mail API (not SMTP)
- Single send for transactional emails
- Batch send for bulk (newsletter, last-spaces)
- Respect unsubscribe preferences (subscribed_email on profile)

### Webhooks (`/api/webhooks/sendgrid`)
- Track: delivered, open, click, bounce, spam_report
- Update sent_emails table: is_read, read_at, link_clicked, clicked_at
- On bounce: flag email address, notify admin

## Admin Email Features

### Send Email
- Select template from dropdown
- Select recipients:
  - Individual member (search by name/email)
  - All members in a city
  - All confirmed participants of an event
  - Custom filter (use member filters)
- Preview rendered email with sample data
- Schedule send or send immediately
- Track in sent_emails table

### Email Dashboard
- Sent count by template type (last 30 days)
- Open rate, click rate
- Failed/bounced emails
- Unsubscribe count
