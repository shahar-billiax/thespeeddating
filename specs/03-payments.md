# Phase 3: Payments & Ticketing

## Goal
Full Stripe integration for event tickets, VIP subscriptions, refunds, and promo codes.

## Event Ticket Purchase

### Flow
1. User clicks "Book Now" on event detail page
2. If not logged in → redirect to login → back to event
3. Ticket form appears:
   - Quantity selector (1-4 tickets)
   - For quantity > 1: guest name + email fields for each additional ticket
   - Promo code input with "Apply" button
   - Price breakdown: base price × quantity - discount = total
4. "Pay Now" → creates Stripe Checkout Session (mode: payment)
5. Stripe handles card input
6. On success → redirect to `/checkout/success?session_id=xxx`
7. Success page shows:
   - Confirmation message
   - Event details summary
   - Calendar invite download (.ics file)
   - "View My Events" link
8. Confirmation email sent via SendGrid

### Pricing Logic
- Base price from event (can be gendered: price_male/price_female)
- VIP members get vip_price if set
- Special offers applied:
  - **three_for_two**: Buy 3 tickets, pay for 2
  - **buy_one_get_one_free**: Buy 2 tickets, pay for 1
  - **bring_a_friend**: 2nd ticket free/discounted
  - **discount_percentage**: X% off (value = percentage)
  - **discount_nominal**: Fixed amount off (value = amount)
  - **early_bird**: Discount available until X date (use valid_until on promo)
  - **last_minute**: Discount available from X date
  - **bundle**: Custom bundle pricing
- Promo code discount applied on top of special offers (or instead of, configurable)

### Promo Code Validation (server-side)
```
1. Check code exists and is_active
2. Check valid_from <= today <= valid_until
3. Check times_used < max_uses (if max_uses set)
4. Check event_id matches (if event-specific)
5. Check country_id matches
6. Return discount amount
```

### Capacity & Waitlist
- Check male/female counts against limit_male/limit_female before allowing purchase
- If at capacity for user's gender → show "Join Waitlist" button instead
- Waitlist creates a registration with status=waitlisted, payment_status=pending
- When a cancellation occurs:
  1. Update cancelled registration status
  2. Find first waitlisted person for same gender
  3. Send them notification email with booking link
  4. Link is valid for 48 hours, then next person gets notified

## VIP Subscriptions

### Tiers
| Plan | UK Price | Israel Price |
|------|----------|-------------|
| 1 month | £X/mo | ₪X/mo |
| 3 months | £X/mo | ₪X/mo |
| 6 months | £X/mo | ₪X/mo |
| 12 months | £X/mo | ₪X/mo |

Prices are admin-configurable (store in SystemParams or a vip_plans table).

### VIP Benefits
1. Discounted event tickets (vip_price field on events)
2. See who chose you in match results (even without mutual match)
3. Matchmaking service discount
4. Priority booking / early access to events (future)

### Subscription Flow
1. User selects plan on /vip page
2. → Stripe Checkout (mode: subscription)
3. Stripe creates Customer + Subscription
4. On success → activate VIP, store stripe_subscription_id + stripe_customer_id
5. Show "Manage Subscription" link → Stripe Customer Portal

### Auto-renewal
- Stripe handles recurring billing
- Webhooks update vip_subscriptions status

## Stripe Webhooks (`/api/webhooks/stripe`)

### Events to Handle
| Webhook Event | Action |
|---------------|--------|
| checkout.session.completed | Mark registration as paid OR activate VIP subscription |
| invoice.paid | Renew VIP period (update current_period_end) |
| customer.subscription.updated | Handle plan changes, status updates |
| customer.subscription.deleted | Expire VIP membership |
| charge.refunded | Update payment_status to refunded |

### Webhook Security
- Verify Stripe signature using webhook secret
- Idempotency: check if already processed (by stripe event ID)

## Admin Refunds
- Admin can issue full or partial refund from event participants page
- Calls Stripe Refund API
- Updates event_registration.payment_status to refunded
- Opens spot for waitlisted person

## Admin Manual Payment
- Admin can mark a registration as "paid" manually (for cash/bank transfer)
- Sets payment_status=paid, paid_amount=X without Stripe
