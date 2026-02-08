# Legacy vs New Schema Comparison

## Summary

The new schema covers all core business functionality. There are some legacy fields we deliberately dropped, some that need client verification, and a few gaps to address.

---

## 1. GAPS TO FIX (missing from new schema, data exists)

### profiles: Missing `faith` column
- Legacy: `Faith` (tinyint) - 2,213 members have a value (13%)
- Values: Secular, Conservative, Orthodox, Traditional, Reform, Liberal, Modern Orthodox, Atheist
- **This is important for a Jewish dating platform** - users should be able to filter by observance level
- **Recommendation:** Add `faith text` column with CHECK constraint

### profiles: Missing `height_cm` column
- Legacy: `HeightCm` - 2,392 members have a value (15%)
- Common on dating profiles
- **Recommendation:** Add `height_cm integer` column

### profiles: Missing `address` fields
- Legacy: `Address1`, `Address2`, `MailCode` - 13,680 members have addresses (83%)
- Used for mailing/logistics
- **Ask client:** Do they still need postal addresses, or is city-level enough?

### event_registrations: Missing `notes` and `not_attended` fields
- Legacy: `Notes` (admin notes on a booking) and `NotAttended` (attendance flag)
- Useful for admin operations
- **Recommendation:** Add `admin_notes text` and `attended boolean default null`

### No equivalent for `MemberPayments` table (23,438 rows)
- Legacy had a separate payments table (amount, payment type, auth code, ticket number)
- New schema has payment fields inline on `event_registrations` and `vip_subscriptions`
- **For migration:** We'd need a `legacy_payments` archive table or map to the inline fields
- **Ask client:** Do they need historical payment records accessible in the new system?

### No equivalent for `HTMLPages` table (71 rows)
- Legacy CMS pages (About Us, Terms, Privacy, FAQs, etc.)
- New system has `blog_posts` but no generic CMS table
- **Ask client:** Should static pages (about, terms, privacy, FAQs) be editable via admin, or hardcoded?

### No equivalent for `SystemParams` table (65 rows)
- Key/value config (e.g., SendGrid keys, feature flags, per-country settings)
- **Ask client:** Review which params are still needed - most will be env vars, but some may need a settings table

---

## 2. CLIENT DECISION NEEDED (possibly obsolete)

### profiles: `MiddleName`
- 14,234 members have one (86%) - but this is unusual for a dating site
- **Ask client:** Was middle name ever displayed? Keep or drop?

### profiles: `ScreenName`
- 8,103 members have one (49%)
- **Ask client:** Did users have display names? The new system uses first_name. Keep or drop?

### profiles: `WorkPhone`, `MobilePhone` (separate from `Phone`)
- 12,644 members have work phone
- Legacy had 3 phone fields, new has 1
- **Ask client:** Is one phone field enough?

### Legacy countries: FR (France) and US
- Legacy has 4 countries, new has 2 (GB, IL)
- **Ask client:** Were France and US ever active? Should we add them?

### `Areas` table (regions grouping cities)
- Legacy: Country → Area → City (e.g., "Greater London" area)
- New: Country → City (no intermediate level)
- **Ask client:** Were areas used for anything user-facing? If just grouping, cities alone may suffice

### Localized venue/city names
- Legacy had `Venues_Locale` (580 rows) and `Cities_Locale` (58 rows) for multilingual names
- New schema stores only one name per venue/city (no locale support on entity names)
- **Ask client:** Do venue names need Hebrew translations? (e.g., "The Ivy" stays English, but "מלון דן" might need both)

---

## 3. DELIBERATELY DROPPED (no data or obsolete)

| Legacy Field/Table | Reason |
|---|---|
| `Members.ReligionTag` | NULL for all 16,467 members - never used |
| `Members.HeardAboutId` | NULL for all members - never used |
| `Members.PromoterId` | NULL for all members - never used |
| `Members.WeightKg` | NULL for all members - never used |
| `Members.OldMemberId` | Legacy migration artifact |
| `Members.IsBeforeZivoogim/IsOnSameCity/IsOnZivoogim` | Platform migration flags |
| `Members.SystemId` | Internal system ID |
| `CrossAppTokens` (14,055 rows) | Replaced by Supabase auth |
| `APILog` (12,238 rows) | Historical logs, archive |
| `Convert_*` tables | Migration artifacts |
| `MembersTemp` (607 rows) | Temp data |
| `EmailBck` (89,954 rows) | Email backup table |
| `StringsBackup*` | Translation backups |
| `ToImport` (197 rows) | Import queue |
| `aspnet_*` tables | Replaced by Supabase auth |
| `TimeZones` (107 rows) | Using standard IANA timezone strings |
| `IPLocations` (0 rows) | Empty, never used |
| `CountryLanguage` (0 rows) | Empty, never used |
| `Currency_Locale` (0 rows) | Empty, never used |
| `sysdiagrams` | SQL Server internal |
| `PromotionCodes.PromotionCodeSecretId` | Unclear purpose, likely unused |

---

## 4. STRUCTURAL CHANGES (working differently)

| Legacy | New | Notes |
|---|---|---|
| `MemberPictures` (multiple per user) | `profiles.avatar_url` (single) | Downgrade: users could have multiple photos |
| `MemberComments` (timestamped list) | `profiles.admin_comments` (single text) | Loses comment history |
| `EventMatches.Friend` + `.Date` (2 booleans) | `match_scores.choice` (enum: date/friend/no) | Cleaner, equivalent |
| `Events.Hostess1/Hostess2` (2 FKs) | `event_hosts` table | Better: unlimited hosts |
| `PromotionTypes` (separate table) | `events.special_offer` (enum) | Simpler, equivalent |
| `LookupTable` (generic lookups) | CHECK constraints on columns | Stricter validation |
| `Venues_Locale` (per-language) | Single `venues.name` | Loses multilingual venue names |
| `Members.PrefferedLanguage` | Determined by country/cookie | Different approach |

---

## 5. NEW IN OUR SCHEMA (not in legacy)

| New Table/Column | Purpose |
|---|---|
| `profiles.sexual_preference` | men/women/both |
| `profiles.bio`, `interests` | Richer profile |
| `profiles.whatsapp/instagram/facebook` | Social media sharing |
| `profiles.privacy_preferences` | GDPR-friendly sharing controls |
| `match_scores.share_whatsapp/instagram/facebook` | Per-match social sharing |
| `match_results` table | Computed match results (legacy computed on-the-fly) |
| `events.vip_price` | VIP discount pricing |
| `events.match_submission_open/match_results_released` | Match workflow control |
| `email_templates` | Templated emails (legacy used HTMLPages) |
| `blog_posts` | Blog functionality |
| `matchmaking_profiles/packages` | Matchmaking service |
| `galleries/gallery_images` | Photo galleries |

---

## 6. ENUM MAPPING REFERENCE

For future data migration, here are the legacy int→text mappings:

**EventType:** 1→jewish_general, 2→(secular - not in new!), 3→jewish_traditional, 4→jewish_divorcees, 5→jewish_single_parents, 6→jewish_conservative, 7→jewish_modern_orthodox, 8→israeli, 99→party

**BookingStatus:** 1→confirmed, 2→cancelled, 3→confirmed(attended), 4→waitlisted, 5→(started payment - no equivalent)

**PaymentStatus:** 1→pending, 2→paid, 3→failed, 4→refunded, 5→(pay at night - no equivalent)

**Status (relationship):** 1→single, 2→divorced, 3→widowed, 4→separated

**Faith:** 1→secular, 2→conservative, 3→orthodox, 4→traditional, 5→reform, 6→liberal, 7→modern_orthodox, 8→atheist

**Note:** Legacy `EventType=2` (Jewish Secular) has no equivalent in new schema. Need to add or map to `jewish_general`.
