-- Countries
insert into countries (code, name, currency, domain, default_locale) values
  ('gb', 'United Kingdom', 'GBP', 'thespeeddating.co.uk', 'en'),
  ('il', 'Israel', 'ILS', 'thespeeddating.co.il', 'he');

-- Cities
insert into cities (country_id, name, timezone) values
  ((select id from countries where code = 'gb'), 'London', 'Europe/London'),
  ((select id from countries where code = 'gb'), 'Manchester', 'Europe/London'),
  ((select id from countries where code = 'gb'), 'Leeds', 'Europe/London'),
  ((select id from countries where code = 'gb'), 'Birmingham', 'Europe/London'),
  ((select id from countries where code = 'il'), 'Tel Aviv', 'Asia/Jerusalem'),
  ((select id from countries where code = 'il'), 'Jerusalem', 'Asia/Jerusalem'),
  ((select id from countries where code = 'il'), 'Haifa', 'Asia/Jerusalem'),
  ((select id from countries where code = 'il'), 'Netanya', 'Asia/Jerusalem');

-- Email templates (UK)
insert into email_templates (template_key, language_code, country_id, subject, body_html) values
  ('booking_confirmation', 'en', (select id from countries where code = 'gb'),
   'Booking Confirmation - {{event_name}}',
   '<h1>Booking Confirmed!</h1><p>Hi {{first_name}},</p><p>Your booking for {{event_name}} on {{event_date}} has been confirmed.</p>'),
  ('match_results', 'en', (select id from countries where code = 'gb'),
   'Your Match Results Are Ready!',
   '<h1>Match Results</h1><p>Hi {{first_name}},</p><p>Your match results for {{event_name}} are now available. Log in to see who you matched with!</p>'),
  ('password_reset', 'en', (select id from countries where code = 'gb'),
   'Reset Your Password',
   '<h1>Password Reset</h1><p>Hi {{first_name}},</p><p>Click the link below to reset your password.</p>');

-- Email templates (Israel)
insert into email_templates (template_key, language_code, country_id, subject, body_html) values
  ('booking_confirmation', 'he', (select id from countries where code = 'il'),
   'אישור הזמנה - {{event_name}}',
   '<h1>ההזמנה אושרה!</h1><p>שלום {{first_name}},</p><p>ההזמנה שלך ל-{{event_name}} בתאריך {{event_date}} אושרה.</p>'),
  ('match_results', 'he', (select id from countries where code = 'il'),
   'תוצאות ההתאמה שלך מוכנות!',
   '<h1>תוצאות התאמה</h1><p>שלום {{first_name}},</p><p>תוצאות ההתאמה שלך ל-{{event_name}} זמינות כעת. התחבר/י כדי לראות עם מי הותאמת!</p>');

-- UI Translations (English)
insert into translations (string_key, language_code, value) values
  ('nav.home', 'en', 'Home'),
  ('nav.events', 'en', 'Events'),
  ('nav.about', 'en', 'About Us'),
  ('nav.contact', 'en', 'Contact'),
  ('nav.login', 'en', 'Log In'),
  ('nav.register', 'en', 'Register'),
  ('nav.logout', 'en', 'Log Out'),
  ('nav.my_account', 'en', 'My Account'),
  ('nav.vip', 'en', 'VIP Membership'),
  ('nav.matchmaking', 'en', 'Matchmaking'),
  ('nav.blog', 'en', 'Blog'),
  ('footer.copyright', 'en', '© {{year}} The Speed Dating. All rights reserved.'),
  ('auth.email', 'en', 'Email'),
  ('auth.password', 'en', 'Password'),
  ('auth.login_title', 'en', 'Welcome Back'),
  ('auth.register_title', 'en', 'Create Account'),
  ('auth.forgot_password', 'en', 'Forgot Password?'),
  ('auth.reset_password', 'en', 'Reset Password'),
  ('country.gb', 'en', 'United Kingdom'),
  ('country.il', 'en', 'Israel');

-- UI Translations (Hebrew)
insert into translations (string_key, language_code, value) values
  ('nav.home', 'he', 'דף הבית'),
  ('nav.events', 'he', 'אירועים'),
  ('nav.about', 'he', 'אודות'),
  ('nav.contact', 'he', 'צור קשר'),
  ('nav.login', 'he', 'התחברות'),
  ('nav.register', 'he', 'הרשמה'),
  ('nav.logout', 'he', 'התנתקות'),
  ('nav.my_account', 'he', 'החשבון שלי'),
  ('nav.vip', 'he', 'מנוי VIP'),
  ('nav.matchmaking', 'he', 'שידוכים'),
  ('nav.blog', 'he', 'בלוג'),
  ('footer.copyright', 'he', '© {{year}} The Speed Dating. כל הזכויות שמורות.'),
  ('auth.email', 'he', 'אימייל'),
  ('auth.password', 'he', 'סיסמה'),
  ('auth.login_title', 'he', 'ברוכים השבים'),
  ('auth.register_title', 'he', 'יצירת חשבון'),
  ('auth.forgot_password', 'he', 'שכחת סיסמה?'),
  ('auth.reset_password', 'he', 'איפוס סיסמה'),
  ('country.gb', 'he', 'בריטניה'),
  ('country.il', 'he', 'ישראל');
