# TheSpeedDatingUK - Old Database Schema

**Database:** TheSpeedDatingUK
**Generated:** 2026-02-08
**Source:** SQL Server restored backup

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Core Tables](#core-tables)
3. [Member-Related Tables](#member-related-tables)
4. [Event-Related Tables](#event-related-tables)
5. [System Tables](#system-tables)
6. [Localization Tables](#localization-tables)
7. [ASP.NET Membership Tables](#aspnet-membership-tables)
8. [Foreign Key Relationships](#foreign-key-relationships)
9. [Row Counts](#row-counts)
10. [Sample Data](#sample-data)

---

## Database Overview

**Total Tables:** 55
**Schemas:** dbo, SiteInfo
**Primary Application:** ASP.NET-based speed dating platform
**Total Records:** 7M+ across all tables

### Key Statistics
- **Total Emails Sent:** 6,677,232
- **Total Event Matches:** 96,103
- **Total Event Participations:** 24,153
- **Total Members:** 16,467
- **Total Events:** 1,866
- **Total Venues:** 145

---

## Core Tables

### Members
**Purpose:** Core member/user profile data
**Schema:** dbo
**Rows:** 16,467

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| MemberGuid | uniqueidentifier | NO | - | Primary key |
| DateAdded | smalldatetime | NO | getutcdate() | Registration date |
| FirstName | nvarchar(250) | NO | - | First name |
| MiddleName | nvarchar(250) | YES | - | Middle name |
| LastName | nvarchar(250) | NO | - | Last name |
| Email | nvarchar(250) | NO | - | Email address |
| DateOfBirth | datetime | NO | - | Birth date |
| Gender | tinyint | NO | - | Gender (1=Male, 2=Female) |
| CityId | int | YES | - | FK to Cities |
| Address1 | nvarchar(500) | YES | - | Address line 1 |
| Address2 | nvarchar(500) | YES | - | Address line 2 |
| MailCode | nvarchar(50) | YES | - | Postal/ZIP code |
| ScreenName | nvarchar(250) | YES | - | Display name |
| Phone | varchar(50) | YES | - | Phone number |
| WorkPhone | varchar(50) | YES | - | Work phone |
| MobilePhone | varchar(50) | YES | - | Mobile phone |
| RelationshipTag | tinyint | YES | - | Relationship status |
| ReligionTag | tinyint | YES | - | Religion |
| Status | tinyint | YES | - | Member status |
| Faith | tinyint | YES | - | Faith level |
| Profession | tinyint | YES | - | Profession type |
| WeightKg | int | YES | - | Weight in kg |
| HeightCm | int | YES | - | Height in cm |
| HeardAboutId | int | YES | - | How they heard about service |
| PromoterId | int | YES | - | Promoter/referrer ID |
| DontCall | bit | NO | 0 | Do not call flag |
| SubscribeToEmail | bit | NO | 0 | Email subscription |
| SubscribeToPhone | bit | NO | 1 | Phone subscription |
| Education | tinyint | YES | - | Education level |
| HasKids | tinyint | YES | - | Has children |
| SystemId | int | NO | - | System identifier |
| PrefferedLanguage | char(2) | NO | 'en' | Preferred language code |
| OldMemberId | uniqueidentifier | YES | - | Legacy member ID |
| IsBeforeZivoogim | bit | NO | 1 | Migration flag |
| IsOnSameCity | bit | NO | 1 | Same city flag |
| IsOnZivoogim | bit | NO | 1 | Platform flag |

### Events
**Purpose:** Speed dating event details
**Schema:** dbo
**Rows:** 1,866

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| Id | int | NO | - | Primary key |
| TimeStamp | smalldatetime | NO | - | Event date |
| StartTime | time | NO | - | Event start time |
| EndTime | time | NO | - | Event end time |
| VenueId | int | NO | - | FK to Venues |
| MaleFrom | int | NO | - | Male age range start |
| MaleTo | int | NO | - | Male age range end |
| FemaleFrom | int | YES | - | Female age range start |
| FemaleTo | int | YES | - | Female age range end |
| MalePrice | float | NO | - | Price for males |
| FemalePrice | float | YES | - | Price for females |
| EventType | tinyint | NO | - | Event type (1=standard) |
| MoreInfo | nvarchar(4000) | YES | - | Additional event information |
| Hostess1 | uniqueidentifier | YES | - | Host/hostess 1 member ID |
| Hostess2 | uniqueidentifier | YES | - | Host/hostess 2 member ID |
| LimitMale | int | NO | - | Male participant limit |
| LimitFemale | int | NO | - | Female participant limit |
| DressCode | varchar(50) | NO | - | Dress code description |
| PromotionTypeId | int | YES | - | FK to PromotionTypes |
| PromotionTypeValue | varchar(10) | YES | - | Promotion value |
| Active | bit | NO | - | Is event active |
| OldEventId | int | YES | - | Legacy event ID |

### Venues
**Purpose:** Event venue information
**Schema:** dbo
**Rows:** 145

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| Id | int | NO | - | Primary key |
| DateAdded | smalldatetime | NO | - | Date added |
| CityId | int | NO | - | FK to Cities |
| MapLink | varchar(1000) | NO | - | Map URL |
| Website | varchar(200) | NO | - | Venue website |
| Postcode | varchar(50) | YES | - | Postal code |
| Telephone | varchar(50) | NO | - | Phone number |
| Active | bit | NO | - | Is venue active |

---

## Member-Related Tables

### MembersEvents
**Purpose:** Tracks member participation in events (event bookings)
**Schema:** dbo
**Rows:** 24,153

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ParticipationId | int | NO | Primary key |
| MemberGuid | uniqueidentifier | NO | FK to Members |
| DateAdded | datetime | NO | Booking date |
| EventId | int | NO | FK to Events |
| PromotionCode | varchar(50) | YES | Promo code used |
| EventStatus | int | NO | Status (3=attended?) |
| PaymentStatus | int | NO | Payment status (1=paid?) |
| PaymentNo | int | YES | FK to MemberPayments |
| Notes | nvarchar(500) | YES | Admin notes |
| NotAttended | bit | NO | Did not attend flag |

### MemberPayments
**Purpose:** Payment transaction records
**Schema:** dbo
**Rows:** 23,438

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | int | NO | Primary key |
| TimeStamp | datetime | NO | Payment date/time |
| PaymentType | int | NO | Payment method type |
| Paid | float | NO | Amount paid |
| TicketNo | varchar(150) | NO | Transaction ticket number |
| AuthCode | varchar(150) | NO | Authorization code |

### MemberPictures
**Purpose:** Member profile photos
**Schema:** dbo
**Rows:** 7,953

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| MemberGuid | uniqueidentifier | NO | FK to Members |
| Order | int | NO | Display order |
| TimeStamp | smalldatetime | NO | Upload date |
| Filename | varchar(50) | NO | Image filename |
| Width | int | NO | Image width |
| Height | int | NO | Image height |

### MemberComments
**Purpose:** Admin notes/comments about members
**Schema:** dbo
**Rows:** 1,204

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| MemberId | uniqueidentifier | NO | FK to Members |
| DateTime | datetime | NO | Comment timestamp |
| Notes | nvarchar(1500) | NO | Comment text |

### VIPMembership
**Purpose:** VIP/premium membership tracking
**Schema:** dbo
**Rows:** 76

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| MemberGuild | uniqueidentifier | NO | FK to Members |
| TimeStamp | datetime | NO | Membership date |
| PaymentNo | int | YES | FK to MemberPayments |
| Status | int | NO | Membership status |

---

## Event-Related Tables

### EventMatches
**Purpose:** Records member matches/selections after events
**Schema:** dbo
**Rows:** 96,103

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | int | NO | Primary key |
| EventId | int | NO | FK to Events |
| TimeStamp | smalldatetime | NO | Match submission time |
| Active | bit | NO | Is match active |
| InitiatorId | uniqueidentifier | NO | Member who made selection |
| ObjectId | uniqueidentifier | NO | Member who was selected |
| Friend | bit | NO | Would like as friend |
| Date | bit | NO | Would like to date |
| RevealEmail | bit | NO | Allow email reveal |
| RelealPhone | bit | NO | Allow phone reveal (typo in original) |

---

## System Tables

### Emails
**Purpose:** Email queue and tracking system
**Schema:** dbo
**Rows:** 6,677,232

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| Id | int | NO | - | Primary key |
| RecipientId | uniqueidentifier | NO | - | FK to Members |
| RelatedEvent | int | YES | - | FK to Events |
| RelatedUser | uniqueidentifier | YES | - | Related user |
| Added | smalldatetime | NO | - | Added to queue |
| Schedule | smalldatetime | NO | - | Scheduled send time |
| Sent | smalldatetime | YES | - | Actually sent time |
| LastTry | smalldatetime | YES | - | Last delivery attempt |
| Retries | tinyint | YES | - | Retry count |
| EmailOpened | bit | NO | 0 | Email opened tracking |
| LinkClicked | bit | NO | 0 | Link clicked tracking |
| EmailType | int | NO | - | FK to EmailTypes |
| HTMLPage | varchar(250) | YES | - | Email template |
| Subject | nvarchar(250) | YES | - | Email subject |
| Status | tinyint | NO | 1 | Email status |

### PromotionCodes
**Purpose:** Discount/promotion codes
**Schema:** dbo
**Rows:** 60

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| PromotionCode | varchar(50) | NO | Primary key - code |
| PromotionCodeSecretId | varchar(50) | YES | Secret identifier |
| IsPercentage | bit | NO | Percentage vs fixed amount |
| Value | int | NO | Discount value |
| ValidFrom | date | NO | Valid from date |
| ValidUntil | date | NO | Valid until date |
| EventId | int | YES | Specific event (if any) |

### CrossAppTokens
**Purpose:** Cross-application authentication tokens
**Schema:** dbo
**Rows:** 14,055

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | int | NO | Primary key |
| App | char(3) | NO | Application code |
| UserId | uniqueidentifier | NO | FK to Members |
| Token | uniqueidentifier | NO | Auth token |
| Validity | smalldatetime | NO | Expiration time |
| OneTime | bit | NO | Single-use flag |

### APILog
**Purpose:** API call logging
**Schema:** dbo
**Rows:** 12,238

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ID | int | NO | Primary key |
| IsFromTSD | bit | NO | From TheSpeedDating |
| ErrorCode | int | YES | Error code if failed |
| MethodName | nvarchar(50) | NO | API method called |
| TransferredData | nvarchar(MAX) | YES | Request data |
| Response | nvarchar(MAX) | YES | Response data |
| CreationDate | datetime | NO | Call timestamp |

### HTMLPages
**Purpose:** CMS-like HTML page storage
**Schema:** dbo
**Rows:** 71

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | int | NO | Primary key |
| Page Name | nvarchar(50) | NO | Page identifier |
| Context | varchar(10) | NO | Context/language |

### SystemParams
**Purpose:** System configuration parameters
**Schema:** dbo
**Rows:** 65

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | int | NO | Primary key |
| Country | char(2) | YES | Country code (if specific) |
| Module | char(3) | NO | Module identifier |
| ParamName | varchar(50) | NO | Parameter name |
| ParamValue | varchar(500) | NO | Parameter value |

### Galleries / GalleriesPictures
**Purpose:** Photo galleries for events/venues
**Schema:** dbo
**Rows:** 32 galleries, 418 pictures

**Galleries:**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | int | NO | Primary key |
| Name | nvarchar(250) | NO | Gallery name |
| Title | nvarchar(250) | NO | Gallery title |
| CreationDate | smalldatetime | NO | Created date |

**GalleriesPictures:**
| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | int | NO | Primary key |
| GelleryId | int | NO | FK to Galleries (typo in original) |
| TimeStamp | smalldatetime | NO | Upload date |
| Filename | varchar(50) | NO | Image filename |

---

## Localization Tables

All in **SiteInfo** schema - support for multi-country, multi-language platform.

### Country
**Purpose:** Country master data
**Rows:** 4

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CountryTag | char(2) | NO | Primary key (ISO code) |
| NameEN | varchar(100) | NO | English name |
| IsActive | bit | NO | Is active |
| CurrencyTag | char(3) | NO | Currency code |
| Vat | money | NO | VAT/tax rate |
| PreferredLanguage | char(2) | NO | Default language |
| TimeZoneId | varchar(500) | NO | Timezone identifier |

### Country_Locale
**Purpose:** Country names in different languages
**Rows:** 16

| Column | Type | Description |
|--------|------|-------------|
| CountryTag | char(2) | FK to Country |
| LanguageTag | char(2) | FK to Languages |
| CountryName | nvarchar(50) | Localized country name |

### Areas
**Purpose:** Geographic areas/regions
**Rows:** 10

| Column | Type | Description |
|--------|------|-------------|
| Id | int | Primary key |
| Name | varchar(100) | Area name |
| CountryTag | char(2) | FK to Country |

### Cities
**Purpose:** City master data
**Rows:** 25

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CityId | int | NO | Primary key |
| NameEN | varchar(100) | NO | English name |
| IsActive | bit | NO | Is active |
| AreaId | int | NO | FK to Areas |
| Latitude | float | YES | GPS latitude |
| Longitude | float | YES | GPS longitude |
| TimeZoneId | varchar(500) | NO | Timezone identifier |

### Cities_Locale
**Purpose:** City names in different languages
**Rows:** 58

| Column | Type | Description |
|--------|------|-------------|
| CityId | int | FK to Cities |
| LanguageTag | char(2) | FK to Languages |
| CityName | nvarchar(50) | Localized city name |

### Languages
**Purpose:** Supported languages
**Rows:** 5

| Column | Type | Description |
|--------|------|-------------|
| LanguageTag | char(2) | Primary key (ISO code) |
| NameEN | varchar(50) | English name |
| NameLocale | nvarchar(50) | Native name |
| Culture | varchar(10) | Culture code |
| IsActive | bit | Is active |

### Strings_Locale
**Purpose:** Localized UI strings (main translation table)
**Rows:** 1,596

| Column | Type | Description |
|--------|------|-------------|
| StringHash | int | FK to StringsEN |
| LanguageTag | char(2) | FK to Languages |
| StringLocale | nvarchar(3500) | Translated text |

### StringsEN
**Purpose:** English source strings for translation
**Rows:** 409

| Column | Type | Description |
|--------|------|-------------|
| StringHash | int | Primary key (hash of string) |
| StringEN | varchar(500) | English source text |

### Venues_Locale
**Purpose:** Venue names and descriptions in different languages
**Rows:** 580

| Column | Type | Description |
|--------|------|-------------|
| (Composite key with venue and language) | - | Localized venue data |

### EmailSubjects
**Purpose:** Email subject lines by language
**Rows:** 80

| Column | Type | Description |
|--------|------|-------------|
| EmailTypeId | int | FK to EmailTypes |
| LanguageTag | char(2) | FK to Languages |
| Subject | nvarchar(150) | Localized subject |

### EmailTypes
**Purpose:** Email template types
**Rows:** 21

| Column | Type | Description |
|--------|------|-------------|
| Id | int | Primary key |
| Name | varchar(50) | Template name |
| Live | bit | Is live/production |
| Active | bit | Is active |
| AutoApprove | bit | Auto-approve sending |

### Currency_Locale
**Purpose:** Currency names and symbols by language
**Rows:** 0 (empty)

| Column | Type | Description |
|--------|------|-------------|
| CurrencyTag | char(3) | Currency code |
| LanguageTag | char(2) | Language code |
| CurrencyName | nvarchar(20) | Currency name |
| CurrencyNamePlural | nvarchar(20) | Plural form |
| CurrencySign | nvarchar(5) | Currency symbol |

### TimeZones
**Purpose:** Timezone definitions
**Rows:** 107

| Column | Type | Description |
|--------|------|-------------|
| Id | varchar(500) | Primary key |
| TimeZoneName | varchar(500) | Display name |
| Offset | varchar(500) | UTC offset |
| DaylightSaving | bit | Has DST |

### LookupTable
**Purpose:** General lookup/dropdown values
**Rows:** 108

| Column | Type | Description |
|--------|------|-------------|
| LookupName | varchar(15) | Lookup category |
| Order | int | Display order |
| Value | varchar(50) | Lookup value |

### PromotionTypes
**Purpose:** Types of promotions
**Rows:** 6

| Column | Type | Description |
|--------|------|-------------|
| Id | int | Primary key |
| Name | varchar(50) | Type name |

### CountryLanguage
**Purpose:** Languages available per country
**Rows:** 0 (empty)

### IPLocations
**Purpose:** IP geolocation data
**Rows:** 0 (empty)

| Column | Type | Description |
|--------|------|-------------|
| IPFrom | bigint | IP range start |
| IPTo | bigint | IP range end |
| CountryTag | char(2) | Country code |
| CountryName | varchar(50) | Country name |

---

## ASP.NET Membership Tables

Standard ASP.NET 2.0 membership provider tables (schema: dbo).

### aspnet_Applications
**Rows:** 1

| Column | Type | Description |
|--------|------|-------------|
| ApplicationId | uniqueidentifier | Primary key |
| ApplicationName | nvarchar(256) | App name |
| LoweredApplicationName | nvarchar(256) | Lowercase for lookups |
| Description | nvarchar(256) | Description |

### aspnet_Users
**Rows:** 16,471

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ApplicationId | uniqueidentifier | NO | FK to Applications |
| UserId | uniqueidentifier | NO | Primary key |
| UserName | nvarchar(256) | NO | Username |
| LoweredUserName | nvarchar(256) | NO | Lowercase username |
| MobileAlias | nvarchar(16) | YES | Mobile alias |
| IsAnonymous | bit | NO | Is anonymous user |
| LastActivityDate | datetime | NO | Last activity |

### aspnet_Membership
**Rows:** 16,471

| Column | Type | Description |
|--------|------|-------------|
| ApplicationId | uniqueidentifier | FK to Applications |
| UserId | uniqueidentifier | FK to Users |
| Password | nvarchar(128) | Hashed password |
| PasswordFormat | int | Hash format (0=clear, 1=hashed, 2=encrypted) |
| PasswordSalt | nvarchar(128) | Salt value |
| Email | nvarchar(256) | Email address |
| LoweredEmail | nvarchar(256) | Lowercase email |
| PasswordQuestion | nvarchar(256) | Security question |
| PasswordAnswer | nvarchar(128) | Security answer |
| IsApproved | bit | Is approved |
| IsLockedOut | bit | Is locked out |
| CreateDate | datetime | Account creation |
| LastLoginDate | datetime | Last login |
| LastPasswordChangedDate | datetime | Password change date |
| LastLockoutDate | datetime | Lockout date |
| FailedPasswordAttemptCount | int | Failed attempts |
| FailedPasswordAttemptWindowStart | datetime | Failed attempt window |
| Comment | ntext | Admin comment |

### aspnet_Roles
**Rows:** 3

| Column | Type | Description |
|--------|------|-------------|
| ApplicationId | uniqueidentifier | FK to Applications |
| RoleId | uniqueidentifier | Primary key |
| RoleName | nvarchar(256) | Role name |
| LoweredRoleName | nvarchar(256) | Lowercase role name |
| Description | nvarchar(256) | Description |

### aspnet_UsersInRoles
**Rows:** 11

| Column | Type | Description |
|--------|------|-------------|
| UserId | uniqueidentifier | FK to Users |
| RoleId | uniqueidentifier | FK to Roles |

### Other ASP.NET Tables (Empty/Minimal Data)

- **aspnet_Profile** (0 rows) - User profile storage
- **aspnet_Paths** (0 rows) - Page path tracking
- **aspnet_PersonalizationAllUsers** (0 rows) - Page personalization
- **aspnet_PersonalizationPerUser** (0 rows) - User page personalization
- **aspnet_WebEvent_Events** (0 rows) - Health monitoring events
- **aspnet_SchemaVersions** (6 rows) - Schema version tracking

---

## Foreign Key Relationships

### Core Relationships

**Events → Venues**
- `FK_Events_Venues`: Events.VenueId → Venues.Id

**Events → PromotionTypes**
- `FK_Events_PromotionTypes`: Events.PromotionTypeId → PromotionTypes.Id

**MembersEvents → Members**
- `FK_MembersEvents_Members`: MembersEvents.MemberGuid → Members.MemberGuid

**MembersEvents → Events**
- `FK_MembersEvents_Events`: MembersEvents.EventId → Events.Id

**MembersEvents → MemberPayments**
- `FK_MembersEvents_MemberPayments`: MembersEvents.PaymentNo → MemberPayments.Id

**EventMatches → Events**
- `FK_EventMatches_Events`: EventMatches.EventId → Events.Id

**EventMatches → Members**
- `FK_EventMatches_Members_Initiator`: EventMatches.InitiatorId → Members.MemberGuid
- `FK_EventMatches_Members_Object`: EventMatches.ObjectId → Members.MemberGuid

**MemberPictures → Members**
- `FK_MemberPictures_Members`: MemberPictures.MemberGuid → Members.MemberGuid

**MemberComments → Members**
- `FK_MemberComments_Members`: MemberComments.MemberId → Members.MemberGuid

**VIPMembership → Members**
- `FK_VIPMembership_Members`: VIPMembership.MemberGuild → Members.MemberGuid

**VIPMembership → MemberPayments**
- `FK_VIPMembership_MemberPayments`: VIPMembership.PaymentNo → MemberPayments.Id

### Geographic Relationships

**Members → Cities**
- `FK_Members_Cities`: Members.CityId → Cities.CityId

**Venues → Cities**
- `FK_Venues_Cities`: Venues.CityId → Cities.CityId

**Cities → Areas**
- `FK_Cities_Areas`: Cities.AreaId → Areas.Id

**Areas → Country**
- `FK_Areas_Country`: Areas.CountryTag → Country.CountryTag

### Localization Relationships

**Cities_Locale → Cities**
- `FK_Cities_Locale_Cities`: Cities_Locale.CityId → Cities.CityId

**Cities_Locale → Languages**
- `FK_Cities_Locale_Languages`: Cities_Locale.LanguageTag → Languages.LanguageTag

**Country_Locale → Country**
- `FK_Country_Locale_Country`: Country_Locale.CountryTag → Country.CountryTag

**Country_Locale → Languages**
- `FK_Country_Locale_Languages`: Country_Locale.LanguageTag → Languages.LanguageTag

**Strings_Locale → StringsEN**
- `FK_Strings_Locale_StringsEN`: Strings_Locale.StringHash → StringsEN.StringHash

**Strings_Locale → Languages**
- `FK_Strings_Locale_Languages`: Strings_Locale.LanguageTag → Languages.LanguageTag

**EmailSubjects → EmailTypes**
- `FK_EmailSubjects_EmailTypes`: EmailSubjects.EmailTypeId → EmailTypes.Id

**EmailSubjects → Languages**
- `FK_EmailSubjects_Languages`: EmailSubjects.LanguageTag → Languages.LanguageTag

### Email System

**Emails → Members**
- `FK_Emails_Members`: Emails.RecipientId → Members.MemberGuid

**Emails → Events**
- `FK_Emails_Events`: Emails.RelatedEvent → Events.Id

**Emails → EmailTypes**
- `FK_Emails_EmailTypes`: Emails.EmailType → EmailTypes.Id

### ASP.NET Membership

**aspnet_Users → aspnet_Applications**
- `FK_aspnet_Users_Applications`: aspnet_Users.ApplicationId → aspnet_Applications.ApplicationId

**aspnet_Membership → aspnet_Users**
- `FK_aspnet_Membership_Users`: aspnet_Membership.UserId → aspnet_Users.UserId

**aspnet_Membership → aspnet_Applications**
- `FK_aspnet_Membership_Applications`: aspnet_Membership.ApplicationId → aspnet_Applications.ApplicationId

**aspnet_Roles → aspnet_Applications**
- `FK_aspnet_Roles_Applications`: aspnet_Roles.ApplicationId → aspnet_Applications.ApplicationId

**aspnet_UsersInRoles → aspnet_Users**
- `FK_aspnet_UsersInRoles_Users`: aspnet_UsersInRoles.UserId → aspnet_Users.UserId

**aspnet_UsersInRoles → aspnet_Roles**
- `FK_aspnet_UsersInRoles_Roles`: aspnet_UsersInRoles.RoleId → aspnet_Roles.RoleId

---

## Row Counts

### High-Volume Tables (>10,000 rows)
| Table | Rows | Description |
|-------|------|-------------|
| Emails | 6,677,232 | Email queue/history |
| EventMatches | 96,103 | Match selections |
| EmailBck | 89,954 | Email backup |
| MembersEvents | 24,153 | Event participations |
| MemberPayments | 23,438 | Payment transactions |
| aspnet_Membership | 16,471 | ASP.NET membership |
| aspnet_Users | 16,471 | ASP.NET users |
| Members | 16,467 | Member profiles |
| CrossAppTokens | 14,055 | Auth tokens |
| APILog | 12,238 | API call logs |
| Convert_Members | 10,205 | Member migration data |

### Medium-Volume Tables (1,000-10,000 rows)
| Table | Rows | Description |
|-------|------|-------------|
| MemberPictures | 7,953 | Profile photos |
| Events | 1,866 | Speed dating events |
| Strings_Locale | 1,596 | UI translations |
| StringsBackupAll | 1,316 | Translation backup |
| MemberComments | 1,204 | Admin comments |

### Low-Volume Tables (<1,000 rows)
| Table | Rows | Description |
|-------|------|-------------|
| Convert_Events | 672 | Event migration |
| MembersTemp | 607 | Temp member data |
| Venues_Locale | 580 | Venue translations |
| GalleriesPictures | 418 | Gallery images |
| StringsEN | 409 | English strings |
| ToImport | 197 | Import queue |
| Venues_Pictures | 189 | Venue photos |
| Venues | 145 | Venues |
| LookupTable | 108 | Lookup values |
| TimeZones | 107 | Timezone data |
| EmailSubjects | 80 | Email subjects |
| VIPMembership | 76 | VIP members |
| HTMLPages | 71 | CMS pages |
| SystemParams | 65 | System config |
| PromotionCodes | 60 | Promo codes |
| Cities_Locale | 58 | City translations |
| Convert_Venues | 52 | Venue migration |
| StringsBackup | 34 | Translation backup |
| Galleries | 32 | Photo galleries |
| Cities | 25 | Cities |
| EmailTypes | 21 | Email templates |
| Country_Locale | 16 | Country translations |
| aspnet_UsersInRoles | 11 | Role assignments |
| Areas | 10 | Geographic areas |
| aspnet_SchemaVersions | 6 | Schema versions |
| PromotionTypes | 6 | Promotion types |
| Languages | 5 | Languages |
| Country | 4 | Countries |
| aspnet_Roles | 3 | User roles |
| aspnet_Applications | 1 | Application entry |

### Empty Tables (0 rows)
- aspnet_Paths
- aspnet_PersonalizationAllUsers
- aspnet_PersonalizationPerUser
- aspnet_WebEvent_Events
- CountryLanguage
- Currency_Locale
- sysdiagrams
- aspnet_Profile
- IPLocations

---

## Sample Data

### Events Table (First 5 Rows)

```
Id | TimeStamp  | StartTime | EndTime  | VenueId | MaleFrom | MaleTo | MalePrice | EventType | Active | OldEventId
---|------------|-----------|----------|---------|----------|--------|-----------|-----------|--------|------------
1  | 2009-05-31 | 20:00:00  | 22:00:00 | 1       | 28       | 38     | 35.0      | 1         | 1      | 16
2  | 2009-06-11 | 20:00:00  | 22:00:00 | 1       | 22       | 35     | 35.0      | 1         | 1      | 17
3  | 2009-06-14 | 20:00:00  | 22:00:00 | 1       | 32       | 45     | 35.0      | 1         | 1      | 18
4  | 2009-06-28 | 20:00:00  | 22:00:00 | 1       | 28       | 38     | 35.0      | 1         | 1      | 19
5  | 2009-07-12 | 20:00:00  | 22:00:00 | 1       | 32       | 45     | 35.0      | 1         | 1      | 20
```

**Notes:**
- Events date back to 2009
- Standard event type is 1
- Typical male age ranges: 22-45
- Standard pricing around £35
- Female ranges/pricing often NULL (may be inherited or same as male)

### Members Table (First 5 Rows)

```
MemberGuid                           | DateAdded  | FirstName | Email                            | DateOfBirth | Gender | PrefferedLanguage
-------------------------------------|------------|-----------|----------------------------------|-------------|--------|------------------
E75EEA17-55CE-40DF-9093-00035E430D80 | 2011-08-05 | Abraham   | abrahamezekiel@hotmail.co.uk     | 1960-01-01  | 1      | gb
0048AA23-AD0A-42E1-9BAA-0004D0D5F893 | 2011-12-11 | יובל      | yuvalron4444@gmail.com           | 1982-12-18  | 1      | he
BA2BEDAD-0AE7-408B-9259-0005EB4FFC4F | 2011-08-23 | Steven    | stesil@me.com                    | 1967-01-01  | 1      | he
05245C88-43E9-4789-8312-0006A8BA2032 | 2011-08-05 | martin42  | martin_shields@blueyonder.co.uk  | 1976-01-01  | 1      | gb
20161040-496E-4C38-87D4-00077EC1B12F | 2012-08-17 | Dave      | misterdave006@gmail.com          | 1987-01-01  | 1      | en
```

**Notes:**
- Multi-language support (gb, he, en)
- Gender: 1 = Male, 2 = Female
- Hebrew names indicate Israeli market
- Registration dates from 2011-2012

### EventMatches Table (First 5 Rows)

```
Id | EventId | TimeStamp  | Active | InitiatorId                      | ObjectId                         | Friend | Date | RevealEmail
---|---------|------------|--------|----------------------------------|----------------------------------|--------|------|-------------
1  | 1       | 2009-06-09 | 1      | CE9E38CE-467D-4F56-8246-...     | 52006793-AC0B-4DBD-9016-...     | 1      | 0    | 1
2  | 1       | 2009-06-09 | 1      | CE9E38CE-467D-4F56-8246-...     | CADE6A4B-694D-4732-90EC-...     | 1      | 0    | 1
3  | 1       | 2009-06-09 | 1      | CE9E38CE-467D-4F56-8246-...     | E85B81A3-BBA1-4CC9-BB68-...     | 0      | 0    | 1
4  | 1       | 2009-06-09 | 1      | CE9E38CE-467D-4F56-8246-...     | 4354EAF3-7CA8-4F0A-984B-...     | 1      | 0    | 1
5  | 1       | 2009-06-09 | 1      | CE9E38CE-467D-4F56-8246-...     | 4A0953A4-DA87-4D23-AEEF-...     | 0      | 0    | 1
```

**Notes:**
- One member (InitiatorId) makes multiple selections
- Friend=1: wants to be friends
- Date=1: wants to date
- RevealEmail=1: allow email sharing
- Matches submitted after event (2 days after in this case)

### MembersEvents Table (First 5 Rows)

```
ParticipationId | MemberGuid                       | DateAdded  | EventId | EventStatus | PaymentStatus | NotAttended
----------------|----------------------------------|------------|---------|-------------|---------------|-------------
1               | CE9E38CE-467D-4F56-8246-...     | 2011-04-23 | 1       | 3           | 1             | 1
2               | 667E9C23-C22D-4EFA-8FDE-...     | 2011-04-23 | 1       | 3           | 1             | 1
3               | FF8AD021-5C71-4731-B497-...     | 2011-04-23 | 1       | 3           | 1             | 1
4               | 52006793-AC0B-4DBD-9016-...     | 2011-04-23 | 1       | 3           | 1             | 1
5               | CADE6A4B-694D-4732-90EC-...     | 2011-04-23 | 1       | 3           | 1             | 1
```

**Notes:**
- EventStatus=3: appears to be "attended" or "completed"
- PaymentStatus=1: appears to be "paid"
- NotAttended=1: did not attend (contradicts EventStatus?)
- Data may have been backfilled (DateAdded much later than event)

---

## Stored Procedures and Functions

**Total:** 64 procedures/functions

### ASP.NET Membership Procedures (54)
Standard ASP.NET 2.0 membership provider stored procedures:
- `aspnet_Membership_*` (19 procedures) - User membership operations
- `aspnet_Roles_*` (4 procedures) - Role management
- `aspnet_Users_*` (3 procedures) - User operations
- `aspnet_UsersInRoles_*` (6 procedures) - Role assignment
- `aspnet_Profile_*` (4 procedures) - User profile operations
- `aspnet_Personalization*` (9 procedures) - Page personalization
- `aspnet_WebEvent_*` (1 procedure) - Health monitoring
- `aspnet_Applications_*` (1 procedure) - Application management
- `aspnet_Paths_*` (1 procedure) - Path tracking
- Various utility procedures (6)

### Custom Procedures (10)
- `sp_BackupDatabase` - Database backup utility
- `sp_alterdiagram` - Diagram management
- `sp_creatediagram` - Create database diagrams
- `sp_dropdiagram` - Drop database diagrams
- `sp_helpdiagramdefinition` - Get diagram definition
- `sp_helpdiagrams` - List diagrams
- `sp_renamediagram` - Rename diagram
- `sp_upgraddiagrams` - Upgrade diagrams
- `fn_diagramobjects` - Function for diagram objects

---

## Key Indexes

### Primary Key Indexes (Clustered)
All tables have clustered primary key indexes on their primary key columns.

### Notable Secondary Indexes

**Members:**
- Index on Email (for login lookups)
- Index on DateAdded (for registration queries)
- Index on CityId (for location filtering)

**Events:**
- Index on TimeStamp (for event date filtering)
- Index on VenueId (for venue queries)
- Index on Active (for active event queries)

**MembersEvents:**
- Index on MemberGuid (for member event history)
- Index on EventId (for event participant lists)
- Index on DateAdded (for booking date queries)

**EventMatches:**
- Index on EventId (for event match queries)
- Index on InitiatorId (for member match history)
- Index on ObjectId (for received matches)

**Emails:**
- Index on RecipientId (for member email history)
- Index on Schedule (for email queue processing)
- Index on Sent (for sent email queries)
- Index on EmailType (for email type filtering)

---

## Database Insights

### Architecture Patterns

1. **Multi-Country Platform**: Extensive localization support for multiple countries and languages
2. **ASP.NET 2.0**: Uses classic ASP.NET membership provider
3. **Soft Deletes**: Uses "Active" flags rather than hard deletes
4. **Legacy Migration**: Multiple "Convert_*" and "Old*Id" columns indicate data migration
5. **Email Queue**: Sophisticated email system with scheduling, retry logic, and tracking

### Data Quality Notes

1. **Inconsistent Naming**: Some typos in original schema (e.g., "RelealPhone", "GelleryId", "MemberGuild")
2. **Nullable Issues**: Some foreign keys allow NULL that probably shouldn't
3. **Backup Tables**: Multiple backup tables (EmailBck, StringsBackup, etc.) indicate evolving schema
4. **Empty Tables**: Several tables defined but never populated

### Business Logic Observations

1. **Gender-Specific Pricing**: Events can have different prices for males/females
2. **Age Range Filtering**: Events targeted to specific age ranges
3. **Two-Way Matching**: EventMatches tracks who selected whom with Friend/Date flags
4. **Payment Tracking**: Separate payment records linked to bookings
5. **VIP System**: Premium membership with separate tracking
6. **Promotion Codes**: Discount system with date-based validity
7. **Cross-App Auth**: Token-based authentication for mobile/sister apps
8. **Multi-Language**: Full i18n support for strings, emails, and content

### Scale and Performance

- **Heavy Email Usage**: 6.7M+ emails indicate active email marketing
- **High Match Activity**: 96K+ matches show good engagement
- **Multi-Year Data**: Data spans 2009-2012+
- **Active Members**: 16K+ members, 24K+ event participations
- **Event Frequency**: 1,866 events = ~1-2 events per day over period

---

## Migration Considerations for New System

### Critical Data to Preserve

1. **Member Profiles** (Members + MemberPictures + aspnet_Membership)
2. **Event History** (Events + MembersEvents + EventMatches)
3. **Venue Information** (Venues + Venues_Locale)
4. **Payment Records** (MemberPayments - for financial audit)
5. **Localization Data** (All Strings_Locale, Cities_Locale, etc.)

### Data That May Need Transformation

1. **ASP.NET Membership** → Modern auth system (bcrypt/Argon2)
2. **GUIDs** → Consider modern ID strategy (UUIDs, ULIDs, or integers)
3. **Lookup Tables** → Move to enums or reference data
4. **Email Queue** → Consider modern email service (SendGrid, etc.)

### Data That Can Likely Be Archived

1. **Email History** (6.7M records - archive old emails)
2. **API Logs** (historical data)
3. **Convert_* Tables** (migration artifacts)
4. **Backup Tables** (EmailBck, StringsBackup, etc.)
5. **ASP.NET Unused Tables** (Profile, Personalization, WebEvents)

### Schema Improvements for New System

1. Fix column name typos
2. Add proper NOT NULL constraints
3. Add CHECK constraints for enums
4. Add created_at/updated_at timestamps
5. Consider JSONB for flexible attributes
6. Add proper foreign key cascades
7. Normalize lookup values to reference tables
8. Add database-level audit logging

---

**End of Schema Documentation**
