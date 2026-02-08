# TheSpeedDating.co.uk Admin Interface Documentation

## Overview
This document provides a comprehensive overview of the admin interface for TheSpeedDating.co.uk website, accessed via `/Admin/TheSpeed.aspx`.

**Login Credentials Used:**
- Email: michal@thespeeddating.us
- Password: MagicM2019M!

**Access URL:** https://www.thespeeddating.co.uk/Admin/TheSpeed.aspx

---

## Admin Navigation Menu

The admin interface has the following main sections:

1. Home
2. Events
3. Venues
4. Tags
5. HTML Pages
6. Galleries
7. Members
8. Hostesses
9. Emails Sent
10. EmailsToSend

---

## 1. Home Dashboard
**URL:** `/Admin/TheSpeed.aspx`
**Screenshot:** `01-admin-home.png`

### Features:
- System status timestamps displayed:
  - Last Sent: Email sending timestamp
  - Last Offline Round: Batch processing timestamp
  - Last Live Round: Real-time processing timestamp
  - Last Create: Last creation operation timestamp
- Country selector (dropdown at top-right)
- Client Home link (returns to public site)
- Sign Out functionality

---

## 2. Events Management
**URL:** `/Admin/EventsList.aspx`
**Screenshots:** `02-events-list.png`, `03-event-editor.png`

### Events List Page Features:
- **Add new event** button
- **Promotion Codes** link (separate feature)
- Country filter dropdown (France, UK, Israel, United States)
- Search functionality
- Sortable table with columns:
  - Edit (link to event editor)
  - Participants (count)
  - Booked (count)
  - Other (count)
  - City
  - Venue
  - Age Group (M: min-max | F: min-max)
  - Date
  - Time
- "List" link for each event (printable participant list)
- Pagination controls

### Event Editor Page Features:
**URL:** `/Admin/EventsEditor.aspx?eventid=[ID]`

Event configuration fields:
- **Country:** Text field
- **City:** Text field
- **Venue:** Dropdown selection from venue database
- **Event Date:** Date picker
- **StartTime:** Hour and minute dropdowns
- **EndTime:** Hour and minute dropdowns
- **Enable Male/Female Age Selection:** Checkbox for separate age ranges
- **Age Range:** From/To dropdowns (18-79)
- **Enable Male/Female Price Selection:** Checkbox
- **Price:** Numeric field
- **Special Offer:** Dropdown options:
  - Three4Two
  - Buy1Get1Free
  - BringAFriend
  - DiscountPercentage
  - DiscountNominal
  - EarlyBird
  - None
- **Special Offer Value:** Text field
- **Event Type:** Dropdown:
  - Jewish – General
  - Jewish – Secular
  - Jewish – Traditional
  - Jewish – Divorcees
  - Jewish – Single parents
  - Jewish – Conservative
  - Jewish – Modern Orthodox
  - Israeli
  - Party
- **More Info:** Large text area
- **Limit Male:** Numeric field
- **Limit Female:** Numeric field
- **Dress Code:** Text field
- **Save** button
- **Cancel Event** link

### Event Members Section:
- Registered counts (Males/Females)
- **Printable Version** link
- Separate tables for Males and Females with columns:
  - Edit (member-event relationship)
  - Matches (view match results)
  - Name (link to profile)
  - Date Registered
  - Email
  - Phone
  - Age
  - Event Status (e.g., Canceled, Confirmed)
  - Payment Status (e.g., In Progress, Paid)
  - Amount/Paid Amount

---

## 3. Venues Management
**URL:** `/Admin/VenuesList.aspx`
**Screenshot:** `04-venues-list.png`

### Features:
- **Add new venue** button
- Country filter dropdown
- Search functionality
- Display options (10/25/50/100 entries per page)
- Venue list table with columns:
  - Venue name (clickable to edit)
  - Venue city
  - Activation State (true/false)
- Pagination (showing X to Y of Z entries)

### Venue Details:
The system manages multiple venues across different countries including:
- Manhattan locations: Bamboo 52, Bar Luna, BB&R, Copia NYC, Diablo Royale, Flute Bar, Fresh Salt, Highland Park, Katra Lounge, Kazbar Lounge, etc.

---

## 4. Tags Management
**URL:** `/Admin/Tags.aspx?showall=true`
**Screenshots:** `05-tags.png`, `05-tags-snapshot.md`

### Features:
- Multi-language support for all system strings
- Columns for each language:
  - String (identifier)
  - EnglishUS
  - French
  - EnglishUK
  - Hebrew
- Edit link for each tag
- Comprehensive translation management covering:
  - Email templates
  - Form labels
  - System messages
  - UI elements
  - Event types
  - Navigation items

### Tag Categories Include:
- Membership types (1 month, 3 month, 6 month, 12 month)
- Email templates (password reset, bookings, match results, newsletters)
- Form fields (Address, Age, Accounting, etc.)
- Admin features
- User interface strings
- Event-related text

---

## 5. HTML Pages (Email Templates)
**URL:** `/Admin/AddEditPage.aspx`
**Screenshot:** `06-html-pages.png`

### Features:
- **Pages context dropdown:** Email / www
- **Pages Language dropdown:** en / fr / gb / he
- **Add new page** link
- **Existing pages** section with links to edit each template
- **Delete Page** functionality

### Email Templates Available:
- BuyATicket
- BuyATicketParty
- EmailBookingToInvites
- ForgotPassword
- JoinTheSite
- LastSpaces (general, females, males)
- Man_LastSpaces
- Man_NewsLetter
- ManuallyAddUser
- MatchDetected
- MatchResultWeekAfter (multiple variations)
- NewsLetter (multiple variations)
- OneDayAfterEvent
- OnEventNight
- Page_Header / Page_NLFooter / Page_NLHeader
- PaymentFailedOrPending
- RequestToFillTheirProfile
- TellAFriendEmail
- TestMail
- TryBookingWithoutPayment
- TwoDaysAfterEventNoSubmit
- TwoDaysBeforeEvent
- VipConfirmation
- VipWasChosen
- Virtualevents
- WaitingList

---

## 6. Galleries Management
**URL:** `/Admin/Galleries.aspx`
**Screenshot:** `07-galleries.png`

### Features:
- **Add new gallery** link
- **Current gallery dropdown:** Select from existing galleries
- **All Images** display area showing thumbnail grid

### Gallery Categories:
- Gallery1, Gallery2
- PageContent
- HomepageTop
- Country-specific galleries (UK, MainImages_US, MainImages_IL, MainImages_FR, MainImages_GB)
- Success page
- Photos from events (US)
- Venues (NY, Tel Aviv, UK, Paris, Haifa, Jerusalem, Netania)
- Email templates
- From the media
- NewsLetter (IL, UK, US, FR)
- Jewish Matches / Zivoogim
- Workshop
- Active date / alive
- Virtual events

---

## 7. Members Management
**URL:** `/Admin/Members.aspx`
**Screenshot:** `08-members.png`

### Features:
- **Add new user** button
- Comprehensive filtering system:
  - **Gender:** Both / Male / Female
  - **Country:** France / United Kingdom / Israel / United States
  - **City:** Location-specific dropdown (e.g., Manhattan, New Jersey, All)
  - **Age Range:** From/To dropdowns (18-79)
  - **Subscribed (Phone):** All / Yes / No
  - **Subscribed (NL - Newsletter):** All / Yes / No
  - **Register in the last X Months:** Text field
  - **Been to event in the last X Months:** Text field
  - **Personal Status:** Single / Divorced / Widowed / Separated / All
  - **Religious:** Secular / Conservative / Orthodox / Traditional / Reform / Liberal / Modern Orthodox / Atheist / All
  - **Update Results** button
- **Number of results:** 20 / 50
- **Search for:** Text field
- **Show/Hide Images:** Checkbox
- **With comments:** Checkbox filter
- **Never been to event:** Checkbox filter

### Members Table Columns:
- Add To Event (link)
- Gender
- First name (Edit - link to profile editor)
- Last name
- Age
- Email
- Phone
- Add Comments (link)

### Total Members: 904 (in US database shown in screenshot)

---

## 8. Hostesses Management
**URL:** `/Admin/Hostesses.aspx`
**Screenshot:** `09-hostesses.png`

### Features:
- Email input field for adding hostesses
- **HostessPlus** checkbox option
- **Add As Hostesses** button
- **Remove As Hostesses** button
- **Current hostesses** list showing:
  - Email addresses
  - Full names

### Current Hostesses (UK branch shown):
- Catherine Jones
- Joelle Goldring
- Katie Price

---

## 9. Emails Sent
**URL:** `/Admin/SentEmails.aspx`
**Screenshot:** `10-emails-sent.png`

### Features:
- **Send Email** link (manual email sending)
- **ALL** filter link
- **Email Type dropdown:** Filter by email template type
  - JoinTheSite, BuyATicket, TwoDaysBeforeEvent, MatchResultWeekAfter, ForgotPassword, etc.
  - Manual
  - ALL
- **Date Range filters:**
  - Date From (date picker)
  - Date To (date picker)
- **All/Read only dropdown:** Filter by read status
- **City dropdown:** Filter by city/location
- **Update results** button
- Search functionality

### Sent Emails Table Columns:
- Recipient Name
- Recipient Email
- Email Type
- Date Added
- Date Scheduled
- Date Sent
- Read (tracking)
- Link Clicked (tracking)

---

## 10. Emails To Send
**URL:** `/Admin/EmailsToSend.aspx`
**Screenshot:** `11-emails-to-send.png`

### Features:
- **Send Email** link
- **ALL** filter
- **Email Type dropdown:** Same options as Emails Sent
- **Date Range filters:** From/To
- Queue management for scheduled emails

### To Be Sent Table Columns:
- Recipient Name
- Recipient Email
- Email Type
- Date Added
- Date Scheduled
- Status

---

## 11. Promotion Codes
**URL:** `/Admin/PromotionCodes.aspx`
**Screenshot:** `12-promotion-codes.png`

### Features:
- **Show Old** checkbox (display expired codes)
- **Add new code** form with fields:
  - **Promotion Code:** Text field
  - **Is Percentage:** Checkbox
  - **Value:** Numeric field
  - **Valid From:** Date picker
  - **Valid Until:** Date picker
  - **Valid for event:** Dropdown
    - All Events
    - Specific event selection
  - **Add** button

---

## Data Entities Managed

### 1. Events
- Event metadata (country, city, venue, date, time)
- Age restrictions (male/female specific)
- Pricing and special offers
- Event types and categories
- Participant limits
- Dress code requirements
- Participant registrations with payment tracking

### 2. Venues
- Venue name and location
- City/country association
- Activation status

### 3. Members (Users)
- Personal information (name, age, gender)
- Contact details (email, phone)
- Preferences and profile data
- Event participation history
- Payment history
- Subscription status (phone/newsletter)
- Personal status (single, divorced, etc.)
- Religious affiliation
- Comments/notes

### 4. Email Communications
- Email templates (multi-language)
- Sent emails tracking (read/click tracking)
- Scheduled emails queue
- Manual email sending capability

### 5. Translations/Tags
- Multi-language string management
- System-wide text content
- Email template content

### 6. Galleries/Media
- Image galleries by category
- Event photos
- Venue photos
- Marketing materials

### 7. Hostesses
- Event hosts/coordinators
- Contact information
- Special privileges (HostessPlus)

### 8. Promotion Codes
- Discount codes
- Percentage or fixed amount
- Validity periods
- Event-specific or universal

---

## Key Administrative Capabilities

### Event Management
- Create and configure speed dating events
- Set age ranges, pricing, special offers
- Manage venues and locations
- Track participant registrations
- View and manage event attendees
- Generate printable participant lists
- Cancel events

### User Management
- Add/edit member profiles
- Advanced filtering and searching
- Track event participation history
- Manage subscriptions
- Add administrative comments
- View payment history
- Add members to specific events

### Communication System
- Multi-language email template management
- Automated email scheduling (triggered by events)
- Manual email sending
- Email tracking (opens and clicks)
- Newsletter management
- Template variables for personalization

### Content Management
- Multi-language translation system
- Gallery/image management
- Email template editing (HTML)
- Dynamic content pages

### Marketing & Promotions
- Promotion code creation
- Special offer management (per event or global)
- Various discount types supported

### Multi-Location Support
- Country/branch selection (France, UK, Israel, US)
- City-specific filtering
- Venue management per location

### Analytics & Tracking
- Email open/click tracking
- Event participation metrics
- Member registration tracking
- Payment status monitoring

---

## Technical Observations

### Architecture
- ASP.NET WebForms application (.aspx pages)
- Multi-country/branch support with shared admin interface
- Country selector switches context/data
- Uses DataTables or similar for sortable/searchable tables

### Database Structure
Implied tables:
- Events
- Venues
- Members/Users
- EventMembers (junction table)
- Emails (sent and queued)
- EmailTemplates/HTMLPages
- Tags/Translations
- Galleries
- PromotionCodes
- Hostesses

### Features
- Role-based access (admin login required)
- Session management with auto-logout
- Date pickers for date fields
- Dropdown selections for constrained values
- Multi-language support (English US/UK, French, Hebrew)
- Email automation with scheduling
- Payment tracking integration
- Match detection and notification system

---

## Workflow Examples

### Creating a New Event
1. Navigate to Events > Add new event
2. Configure event details (venue, date, time, ages, pricing)
3. Set participant limits
4. Add special offers if needed
5. Save event
6. Event becomes available for user registration
7. Monitor registrations via event editor
8. System sends automated emails (reminders, confirmations, etc.)

### Managing Event Communications
1. System automatically queues emails based on triggers:
   - TwoDaysBeforeEvent
   - OnEventNight
   - OneDayAfterEvent
   - MatchResultWeekAfter
2. Admin can view queued emails in EmailsToSend
3. After sending, emails appear in Emails Sent with tracking
4. Admin can send manual emails via Send Email function

### Member Lifecycle
1. User registers (JoinTheSite email sent)
2. User books event (BuyATicket email sent)
3. Payment processed (tracked in admin)
4. Reminder emails sent automatically
5. Event occurs
6. Match submission requested
7. Match results calculated and sent
8. Follow-up emails for feedback

---

## Security Considerations

- Admin area requires authentication
- Country/branch-specific data segregation
- Sign out functionality provided
- No password reset visible in screenshots (would be in user profile)

---

## Screenshots Index

1. `01-admin-home.png` - Admin dashboard/home page
2. `02-events-list.png` - Events listing with filters
3. `03-event-editor.png` - Detailed event editing interface
4. `04-venues-list.png` - Venues management
5. `05-tags.png` - Multi-language translation tags
6. `06-html-pages.png` - Email template management
7. `07-galleries.png` - Image gallery management
8. `08-members.png` - Member database with filtering
9. `09-hostesses.png` - Hostess management
10. `10-emails-sent.png` - Sent emails tracking
11. `11-emails-to-send.png` - Scheduled emails queue
12. `12-promotion-codes.png` - Promotion code management

---

## Summary

The admin interface is a comprehensive system for managing a multi-country speed dating business. It handles:
- Event creation and management
- Venue coordination
- Member database with detailed filtering
- Automated and manual email communications
- Multi-language content management
- Payment and booking tracking
- Marketing promotions
- Media/gallery management
- Event host coordination

The system is designed to support multiple countries/branches with shared infrastructure but separate data contexts, allowing centralized management of a distributed business model.
