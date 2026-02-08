# Questions for Client Review

We compared the legacy database (55 tables, ~7M rows) against the new schema. Most data maps cleanly. Below are questions where we need your input before proceeding.

---

## 1. Member Profile Fields

### a) Postal Address
The old system stored full addresses (Address1, Address2, Postcode) for 83% of members. The new system only stores city.

**Do you still need postal addresses?** If yes, we'll add address fields. If city-level location is enough, we'll skip them.

### b) Middle Name
86% of legacy members have a middle name stored. The new system doesn't have this field.

**Was middle name ever displayed anywhere? Do you want to keep it?**

### c) Screen Name / Display Name
49% of legacy members had a screen name. The new system uses first name only.

**Were screen names shown to other members (e.g., during matching)? Do you want display names?**

### d) Multiple Phone Numbers
The old system had Phone, WorkPhone, and MobilePhone. The new system has one phone field.

**Is one phone number enough, or do you need to keep work/mobile separately?**

### e) Multiple Profile Photos
The old system allowed multiple photos per member (7,953 photos stored). The new system supports one avatar.

**Do you want members to upload multiple photos, or is one profile picture enough?**

---

## 2. Countries

The old database had 4 countries: **GB, IL, FR (France), US**.
The new system currently has 2: **GB, IL**.

**Were France and US ever actively used? Should we include them?**

---

## 3. Geographic Areas / Regions

The old system grouped cities into areas/regions (e.g., "Greater London"). The new system goes directly from country to city.

**Were areas shown to users or used for filtering? Or are cities alone sufficient?**

---

## 4. Multilingual Venue & City Names

The old system stored venue names and city names in multiple languages (580 venue translations, 58 city translations). The new system stores one name per venue/city.

**Do venue and city names need Hebrew translations?** For example, "The Ivy" probably stays in English, but Israeli venues might need both Hebrew and English names.

---

## 5. CMS / Static Pages

The old system had 71 HTML pages stored in the database (About Us, Terms, FAQs, etc.) that could be edited by admins.

**Should static pages (About, Terms, Privacy, FAQs, Safety) be editable by admins through the admin panel?** If yes, we'll add a CMS pages table. If not, we'll hardcode them.

---

## 6. Historical Payment Records

The old system has 23,438 payment records in a separate table (amount, payment type, auth codes).

The new system tracks payments inline on event bookings (Stripe IDs, amounts). There's no standalone payments table.

**Do you need old payment records accessible in the new system?** Options:
- (a) Archive them separately (not in the app, but preserved in a database)
- (b) Import into the new system with a read-only legacy payments view
- (c) Don't migrate payment history

---

## 7. Admin Comments on Members

The old system allowed multiple timestamped admin comments per member (1,204 comments). The new system has a single admin_comments text field per profile.

**Do you need a history of admin comments (who said what, when)? Or is a single notes field enough?**

---

## 8. "Pay at Night" Payment Status

The old system had a "PayAtNight" payment status (pay cash at the event). The new system supports: pending, paid, failed, refunded.

**Is "pay at the door" still something you offer? If yes, we'll add it as a payment status.**

---

## No Action Needed (Already Handled)

These items were identified as gaps and have already been fixed:

- **Faith/observance level** on profiles (Secular, Conservative, Orthodox, etc.) - added
- **Height** on profiles - added
- **Attendance tracking** on event bookings (attended yes/no + admin notes) - added
- **"Jewish Secular" event type** - added
- **Soft-delete on match scores** - added

---

*Please review each question and let us know your preference. We can proceed with Phase 2 (public pages) in parallel - these decisions mainly affect data migration and admin features.*
