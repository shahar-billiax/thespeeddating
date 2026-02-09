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
  ('country.il', 'en', 'Israel'),
  ('nav.matches', 'en', 'My Matches'),
  ('events.free', 'en', 'Free');

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
  ('country.il', 'he', 'ישראל'),
  ('nav.matches', 'he', 'ההתאמות שלי'),
  ('events.free', 'he', 'חינם'),
  ('home.hero_title', 'en', 'Find Your Match at Our Next Event'),
  ('home.hero_subtitle', 'en', 'Join Jewish singles at our speed dating events across the UK and Israel'),
  ('home.browse_events', 'en', 'Browse Events'),
  ('home.how_it_works', 'en', 'How It Works'),
  ('home.upcoming_title', 'en', 'Upcoming Events'),
  ('home.no_events', 'en', 'No upcoming events. Check back soon!'),
  ('home.see_all_events', 'en', 'See All Events'),
  ('home.view_event', 'en', 'View Event'),
  ('home.step1_title', 'en', 'Register'),
  ('home.step1_desc', 'en', 'Create your account and choose an event that suits you'),
  ('home.step2_title', 'en', 'Attend'),
  ('home.step2_desc', 'en', 'Meet singles at our professionally organized events'),
  ('home.step3_title', 'en', 'Match'),
  ('home.step3_desc', 'en', 'Get your results and connect with mutual matches'),
  ('home.testimonials_title', 'en', 'Our Success Stories'),
  ('home.testimonial1_quote', 'en', 'I met my partner at a London event last year. We''re getting married next month!'),
  ('home.testimonial1_name', 'en', 'Sarah & David'),
  ('home.testimonial2_quote', 'en', 'The atmosphere was relaxed and fun. I made great connections and met someone special.'),
  ('home.testimonial2_name', 'en', 'Rachel M.'),
  ('home.testimonial3_quote', 'en', 'Professional, well-organized, and genuinely effective. Highly recommend!'),
  ('home.testimonial3_name', 'en', 'Michael L.'),
  ('home.cta_title', 'en', 'Ready to meet someone special?'),
  ('home.cta_button', 'en', 'Sign Up Today'),
  ('home.hero_title', 'he', 'מצאו את ההתאמה שלכם באירוע הבא'),
  ('home.hero_subtitle', 'he', 'הצטרפו לרווקים יהודים באירועי היכרויות מהירות בבריטניה ובישראל'),
  ('home.browse_events', 'he', 'עיינו באירועים'),
  ('home.how_it_works', 'he', 'איך זה עובד'),
  ('home.upcoming_title', 'he', 'אירועים קרובים'),
  ('home.no_events', 'he', 'אין אירועים קרובים. בדקו שוב בקרוב!'),
  ('home.see_all_events', 'he', 'כל האירועים'),
  ('home.view_event', 'he', 'צפו באירוע'),
  ('home.step1_title', 'he', 'הרשמה'),
  ('home.step1_desc', 'he', 'צרו חשבון ובחרו אירוע שמתאים לכם'),
  ('home.step2_title', 'he', 'השתתפות'),
  ('home.step2_desc', 'he', 'פגשו רווקים באירועים המאורגנים שלנו'),
  ('home.step3_title', 'he', 'התאמה'),
  ('home.step3_desc', 'he', 'קבלו את התוצאות והתחברו להתאמות הדדיות'),
  ('home.testimonials_title', 'he', 'סיפורי הצלחה'),
  ('home.testimonial1_quote', 'he', 'פגשתי את בן/בת הזוג שלי באירוע בלונדון בשנה שעברה. אנחנו מתחתנים בחודש הבא!'),
  ('home.testimonial1_name', 'he', 'שרה ודוד'),
  ('home.testimonial2_quote', 'he', 'האווירה הייתה נינוחה ומהנה. יצרתי קשרים נהדרים ופגשתי מישהו מיוחד.'),
  ('home.testimonial2_name', 'he', 'רחל מ.'),
  ('home.testimonial3_quote', 'he', 'מקצועי, מאורגן היטב, ויעיל באמת. ממליצה בחום!'),
  ('home.testimonial3_name', 'he', 'מיכאל ל.'),
  ('home.cta_title', 'he', 'מוכנים לפגוש מישהו מיוחד?'),
  ('home.cta_button', 'he', 'הירשמו היום'),
  ('profile.title', 'en', 'My Profile'),
  ('profile.basic_info', 'en', 'Basic Information'),
  ('profile.about_me', 'en', 'About Me'),
  ('profile.location', 'en', 'Location'),
  ('profile.contact', 'en', 'Contact & Social'),
  ('profile.preferences', 'en', 'Preferences'),
  ('profile.save', 'en', 'Save Changes'),
  ('profile.saved', 'en', 'Profile saved successfully'),
  ('profile.change_password', 'en', 'Change Password'),
  ('profile.new_password', 'en', 'New Password'),
  ('profile.confirm_password', 'en', 'Confirm Password'),
  ('profile.password_updated', 'en', 'Password updated successfully'),
  ('my_events.title', 'en', 'My Events'),
  ('my_events.upcoming', 'en', 'Upcoming'),
  ('my_events.past', 'en', 'Past'),
  ('my_events.no_upcoming', 'en', 'No upcoming events'),
  ('my_events.no_past', 'en', 'No past events'),
  ('my_events.submit_choices', 'en', 'Submit Your Choices'),
  ('my_events.view_results', 'en', 'View Results'),
  ('my_events.results_pending', 'en', 'Results pending'),
  ('my_events.confirmed', 'en', 'Confirmed'),
  ('my_events.waitlisted', 'en', 'Waitlisted'),
  ('profile.title', 'he', 'הפרופיל שלי'),
  ('profile.basic_info', 'he', 'מידע בסיסי'),
  ('profile.about_me', 'he', 'אודותיי'),
  ('profile.location', 'he', 'מיקום'),
  ('profile.contact', 'he', 'יצירת קשר ורשתות חברתיות'),
  ('profile.preferences', 'he', 'העדפות'),
  ('profile.save', 'he', 'שמור שינויים'),
  ('profile.saved', 'he', 'הפרופיל נשמר בהצלחה'),
  ('profile.change_password', 'he', 'שינוי סיסמה'),
  ('profile.new_password', 'he', 'סיסמה חדשה'),
  ('profile.confirm_password', 'he', 'אישור סיסמה'),
  ('profile.password_updated', 'he', 'הסיסמה עודכנה בהצלחה'),
  ('my_events.title', 'he', 'האירועים שלי'),
  ('my_events.upcoming', 'he', 'קרובים'),
  ('my_events.past', 'he', 'עברו'),
  ('my_events.no_upcoming', 'he', 'אין אירועים קרובים'),
  ('my_events.no_past', 'he', 'אין אירועים שעברו'),
  ('my_events.submit_choices', 'he', 'שלח את הבחירות שלך'),
  ('my_events.view_results', 'he', 'צפה בתוצאות'),
  ('my_events.results_pending', 'he', 'ממתין לתוצאות'),
  ('my_events.confirmed', 'he', 'מאושר'),
  ('my_events.waitlisted', 'he', 'ברשימת המתנה');

-- Events page translations (English)
insert into translations (string_key, language_code, value) values
  ('events.title', 'en', 'Upcoming Events'),
  ('events.no_events', 'en', 'No events found'),
  ('events.filter_city', 'en', 'Filter by city'),
  ('events.filter_type', 'en', 'Filter by type'),
  ('events.all_cities', 'en', 'All Cities'),
  ('events.all_types', 'en', 'All Types'),
  ('events.clear_filters', 'en', 'Clear Filters'),
  ('events.spots_remaining', 'en', 'spots left'),
  ('events.age_range', 'en', 'Age Range'),
  ('events.price_from', 'en', 'From'),
  ('events.men', 'en', 'Men'),
  ('events.women', 'en', 'Women'),
  ('events.book_now', 'en', 'Book Now'),
  ('events.join_waitlist', 'en', 'Join Waitlist'),
  ('events.date_time', 'en', 'Date & Time'),
  ('events.pricing', 'en', 'Pricing'),
  ('events.standard_price', 'en', 'Standard Price'),
  ('events.vip_price', 'en', 'VIP Price'),
  ('events.venue', 'en', 'Venue'),
  ('events.transport', 'en', 'How to Get There'),
  ('events.view_map', 'en', 'View on Map'),
  ('events.about_event', 'en', 'About This Event'),
  ('events.dress_code', 'en', 'Dress Code'),
  ('events.cancelled', 'en', 'Cancelled'),
  ('events.unlimited', 'en', 'Unlimited'),
  ('events.not_found', 'en', 'Event Not Found'),
  ('events.type.jewish_general', 'en', 'Jewish General'),
  ('events.type.jewish_secular', 'en', 'Jewish Secular'),
  ('events.type.jewish_traditional', 'en', 'Jewish Traditional'),
  ('events.type.jewish_divorcees', 'en', 'Jewish Divorcees'),
  ('events.type.jewish_single_parents', 'en', 'Single Parents'),
  ('events.type.jewish_conservative', 'en', 'Jewish Conservative'),
  ('events.type.jewish_modern_orthodox', 'en', 'Modern Orthodox'),
  ('events.type.israeli', 'en', 'Israeli'),
  ('events.type.party', 'en', 'Singles Party'),
  ('events.type.singles', 'en', 'Singles Mixer'),
  ('events.type.virtual', 'en', 'Virtual Event');

-- Events page translations (Hebrew)
insert into translations (string_key, language_code, value) values
  ('events.title', 'he', 'אירועים קרובים'),
  ('events.no_events', 'he', 'לא נמצאו אירועים'),
  ('events.filter_city', 'he', 'סינון לפי עיר'),
  ('events.filter_type', 'he', 'סינון לפי סוג'),
  ('events.all_cities', 'he', 'כל הערים'),
  ('events.all_types', 'he', 'כל הסוגים'),
  ('events.clear_filters', 'he', 'נקה סינונים'),
  ('events.spots_remaining', 'he', 'מקומות נותרו'),
  ('events.age_range', 'he', 'טווח גילאים'),
  ('events.price_from', 'he', 'החל מ'),
  ('events.men', 'he', 'גברים'),
  ('events.women', 'he', 'נשים'),
  ('events.book_now', 'he', 'הזמן עכשיו'),
  ('events.join_waitlist', 'he', 'הצטרף לרשימת המתנה'),
  ('events.date_time', 'he', 'תאריך ושעה'),
  ('events.pricing', 'he', 'תמחור'),
  ('events.standard_price', 'he', 'מחיר רגיל'),
  ('events.vip_price', 'he', 'מחיר VIP'),
  ('events.venue', 'he', 'מקום'),
  ('events.transport', 'he', 'איך להגיע'),
  ('events.view_map', 'he', 'הצג במפה'),
  ('events.about_event', 'he', 'אודות האירוע'),
  ('events.dress_code', 'he', 'קוד לבוש'),
  ('events.cancelled', 'he', 'בוטל'),
  ('events.unlimited', 'he', 'ללא הגבלה'),
  ('events.not_found', 'he', 'האירוע לא נמצא'),
  ('events.type.jewish_general', 'he', 'יהודי כללי'),
  ('events.type.jewish_secular', 'he', 'יהודי חילוני'),
  ('events.type.jewish_traditional', 'he', 'יהודי מסורתי'),
  ('events.type.jewish_divorcees', 'he', 'גרושים יהודים'),
  ('events.type.jewish_single_parents', 'he', 'הורים יחידניים'),
  ('events.type.jewish_conservative', 'he', 'יהודי קונסרבטיבי'),
  ('events.type.jewish_modern_orthodox', 'he', 'מודרני אורתודוקסי'),
  ('events.type.israeli', 'he', 'ישראלי'),
  ('events.type.party', 'he', 'מסיבת רווקים'),
  ('events.type.singles', 'he', 'מיקסר רווקים'),
  ('events.type.virtual', 'he', 'אירוע וירטואלי');

-- Static pages translations (English)
insert into translations (string_key, language_code, value) values
  ('about.title', 'en', 'About Us'),
  ('about.mission_title', 'en', 'Our Mission'),
  ('about.since_text', 'en', 'Bringing Jewish singles together since {{year}}'),
  ('how_it_works.title', 'en', 'How It Works'),
  ('how_it_works.subtitle', 'en', 'Six simple steps to finding your perfect match'),
  ('contact.title', 'en', 'Contact Us'),
  ('contact.subtitle', 'en', 'We''re here to help - get in touch with our team'),
  ('contact.name', 'en', 'Name'),
  ('contact.email', 'en', 'Email Address'),
  ('contact.subject', 'en', 'Subject'),
  ('contact.message', 'en', 'Message'),
  ('contact.send', 'en', 'Send Message'),
  ('contact.sent_success', 'en', 'Message sent successfully! We''ll get back to you soon.'),
  ('faqs.title', 'en', 'Frequently Asked Questions'),
  ('faqs.subtitle', 'en', 'Find answers to common questions about our events'),
  ('safety.title', 'en', 'Safety Guidelines'),
  ('terms.title', 'en', 'Terms & Conditions'),
  ('privacy.title', 'en', 'Privacy Policy');

-- Static pages translations (Hebrew)
insert into translations (string_key, language_code, value) values
  ('about.title', 'he', 'אודותינו'),
  ('about.mission_title', 'he', 'המשימה שלנו'),
  ('about.since_text', 'he', 'מחברים רווקים יהודים מאז {{year}}'),
  ('how_it_works.title', 'he', 'איך זה עובד'),
  ('how_it_works.subtitle', 'he', 'שישה שלבים פשוטים למציאת ההתאמה המושלמת'),
  ('contact.title', 'he', 'צור קשר'),
  ('contact.subtitle', 'he', 'אנחנו כאן לעזור - צרו קשר עם הצוות שלנו'),
  ('contact.name', 'he', 'שם'),
  ('contact.email', 'he', 'כתובת אימייל'),
  ('contact.subject', 'he', 'נושא'),
  ('contact.message', 'he', 'הודעה'),
  ('contact.send', 'he', 'שלח הודעה'),
  ('contact.sent_success', 'he', 'ההודעה נשלחה בהצלחה! נחזור אליך בקרוב.'),
  ('faqs.title', 'he', 'שאלות נפוצות'),
  ('faqs.subtitle', 'he', 'מצא תשובות לשאלות נפוצות על האירועים שלנו'),
  ('safety.title', 'he', 'הנחיות בטיחות'),
  ('terms.title', 'he', 'תנאי שימוש'),
  ('privacy.title', 'he', 'מדיניות פרטיות');

-- Sample venues
insert into venues (country_id, city_id, name, address, description, dress_code, transport_info, map_url, latitude, longitude, phone, website, venue_type) values
  (
    (select id from countries where code = 'gb'),
    (select id from cities where name = 'London' and country_id = (select id from countries where code = 'gb')),
    'The Montague Bar',
    '15 Montague St, Bloomsbury, London WC1B 5BJ',
    'A stylish cocktail bar in the heart of Bloomsbury, perfect for sophisticated speed dating events.',
    'Smart casual - no sportswear',
    'Nearest Tube: Russell Square (Piccadilly Line) - 2 min walk. Holborn (Central & Piccadilly Lines) - 5 min walk.',
    'https://maps.google.com/?q=The+Montague+Bar+London',
    51.5196,
    -0.1268,
    '+44 20 7637 1001',
    'https://themontaguebar.co.uk',
    'bar'
  ),
  (
    (select id from countries where code = 'gb'),
    (select id from cities where name = 'London' and country_id = (select id from countries where code = 'gb')),
    'Skylight Rooftop Bar',
    'Tobacco Dock, Wapping Ln, London E1W 2SF',
    'Beautiful rooftop venue with stunning views of the London skyline. Indoor and outdoor spaces available.',
    'Smart casual',
    'Nearest Station: Wapping (Overground) - 5 min walk. Shadwell (DLR) - 7 min walk.',
    'https://maps.google.com/?q=Skylight+Tobacco+Dock+London',
    51.5077,
    -0.0594,
    '+44 20 3942 7696',
    'https://skylightlondon.com',
    'bar'
  ),
  (
    (select id from countries where code = 'gb'),
    (select id from cities where name = 'Manchester' and country_id = (select id from countries where code = 'gb')),
    'Revolution Manchester',
    '94-96 Deansgate, Manchester M3 2QG',
    'Vibrant venue in the city centre, known for great cocktails and lively atmosphere.',
    'Smart casual',
    'City centre location. Tram: Deansgate-Castlefield (5 min walk). Multiple bus routes nearby.',
    'https://maps.google.com/?q=Revolution+Deansgate+Manchester',
    53.4795,
    -2.2502,
    '+44 161 839 7558',
    'https://revolution-bars.co.uk/manchester',
    'bar'
  ),
  (
    (select id from countries where code = 'il'),
    (select id from cities where name = 'Tel Aviv' and country_id = (select id from countries where code = 'il')),
    'Porter & Sons',
    'Nahalat Binyamin 5, Tel Aviv',
    'Trendy bar in the heart of Tel Aviv with great cocktails and a sophisticated atmosphere.',
    'Smart casual - מכנסיים ארוכים',
    'ממוקם בנחלת בנימין 5. חניון לילה סמוך. תחבורה ציבורית: קו 18, 61 ברחוב אלנבי.',
    'https://maps.google.com/?q=Porter+Sons+Tel+Aviv',
    32.0644,
    34.7714,
    '+972 3-624-6355',
    'https://porterandsons.co.il',
    'bar'
  );

-- Sample events
insert into events (
  country_id,
  city_id,
  venue_id,
  event_date,
  start_time,
  end_time,
  event_type,
  description,
  dress_code,
  age_min,
  age_max,
  age_min_male,
  age_max_male,
  age_min_female,
  age_max_female,
  enable_gendered_age,
  price,
  price_male,
  price_female,
  enable_gendered_price,
  vip_price,
  currency,
  special_offer,
  special_offer_value,
  limit_male,
  limit_female,
  is_published,
  is_cancelled,
  match_submission_open,
  match_results_released
) values
  -- UK Events
  (
    (select id from countries where code = 'gb'),
    (select id from cities where name = 'London' and country_id = (select id from countries where code = 'gb')),
    (select id from venues where name = 'The Montague Bar'),
    CURRENT_DATE + INTERVAL '5 days',
    '19:30:00',
    '22:00:00',
    'jewish_general',
    'Join us for an evening of exciting conversations with like-minded singles. Meet up to 15 matches in one night!',
    'Smart casual - dress to impress',
    25,
    40,
    null,
    null,
    null,
    null,
    false,
    30.00,
    null,
    null,
    false,
    null,
    'GBP',
    null,
    null,
    15,
    15,
    true,
    false,
    false,
    false
  ),
  (
    (select id from countries where code = 'gb'),
    (select id from cities where name = 'London' and country_id = (select id from countries where code = 'gb')),
    (select id from venues where name = 'Skylight Rooftop Bar'),
    CURRENT_DATE + INTERVAL '12 days',
    '20:00:00',
    '23:30:00',
    'party',
    'Exclusive rooftop singles party with DJs, cocktails, and stunning views. Perfect for meeting new people in a relaxed atmosphere.',
    'Smart casual - rooftop chic',
    28,
    45,
    28,
    45,
    26,
    42,
    true,
    0,
    25.00,
    20.00,
    true,
    35.00,
    'GBP',
    'early_bird',
    5.00,
    40,
    40,
    true,
    false,
    false,
    false
  ),
  (
    (select id from countries where code = 'gb'),
    (select id from cities where name = 'London' and country_id = (select id from countries where code = 'gb')),
    (select id from venues where name = 'The Montague Bar'),
    CURRENT_DATE + INTERVAL '19 days',
    '19:00:00',
    '21:30:00',
    'jewish_secular',
    'Speed dating with a twist! Enjoy curated wine tastings while meeting potential matches. Expert sommelier will guide you through 5 wines.',
    'Smart casual',
    30,
    50,
    null,
    null,
    null,
    null,
    false,
    45.00,
    null,
    null,
    false,
    null,
    'GBP',
    null,
    null,
    12,
    12,
    true,
    false,
    false,
    false
  ),
  (
    (select id from countries where code = 'gb'),
    (select id from cities where name = 'Manchester' and country_id = (select id from countries where code = 'gb')),
    (select id from venues where name = 'Revolution Manchester'),
    CURRENT_DATE + INTERVAL '8 days',
    '19:30:00',
    '22:00:00',
    'singles',
    'The classic lock and key party! Men receive keys, women receive locks. Find your match and win prizes!',
    'Smart casual',
    23,
    38,
    null,
    null,
    null,
    null,
    false,
    22.00,
    null,
    null,
    false,
    null,
    'GBP',
    null,
    null,
    30,
    30,
    true,
    false,
    false,
    false
  ),
  -- Israel Events
  (
    (select id from countries where code = 'il'),
    (select id from cities where name = 'Tel Aviv' and country_id = (select id from countries where code = 'il')),
    (select id from venues where name = 'Porter & Sons'),
    CURRENT_DATE + INTERVAL '7 days',
    '20:00:00',
    '22:30:00',
    'jewish_general',
    'ערב היכרויות מהירות במרכז תל אביב. פגשו עד 15 רווקים/ות מעניינים/ות בערב אחד!',
    'קז''ואל אלגנט',
    25,
    40,
    null,
    null,
    null,
    null,
    false,
    120.00,
    null,
    null,
    false,
    null,
    'ILS',
    null,
    null,
    15,
    15,
    true,
    false,
    false,
    false
  ),
  (
    (select id from countries where code = 'il'),
    (select id from cities where name = 'Tel Aviv' and country_id = (select id from countries where code = 'il')),
    (select id from venues where name = 'Porter & Sons'),
    CURRENT_DATE + INTERVAL '15 days',
    '20:30:00',
    '23:30:00',
    'party',
    'מסיבת רווקים אקסלוסיבית עם די.ג''יי, קוקטיילים ואווירה מעולה. בואו להכיר אנשים חדשים ומעניינים!',
    'קז''ואל אלגנט',
    27,
    43,
    27,
    45,
    25,
    43,
    true,
    0,
    100.00,
    80.00,
    true,
    140.00,
    'ILS',
    null,
    null,
    35,
    35,
    true,
    false,
    false,
    false
  );

-- VIP and Matchmaking translations (English)
insert into translations (string_key, language_code, value) values
  ('vip.title', 'en', 'VIP Membership'),
  ('vip.subtitle', 'en', 'Unlock exclusive benefits and enhance your dating experience'),
  ('vip.benefits_title', 'en', 'VIP Benefits'),
  ('vip.benefit_1', 'en', 'Discounted Event Tickets'),
  ('vip.benefit_2', 'en', 'See Who Chose You'),
  ('vip.benefit_3', 'en', 'Priority Booking'),
  ('vip.benefit_4', 'en', 'Matchmaking Discount'),
  ('vip.pricing_title', 'en', 'Choose Your Plan'),
  ('vip.subscribe', 'en', 'Subscribe Now'),
  ('vip.per_month', 'en', 'month'),
  ('vip.best_value', 'en', 'Best Value'),
  ('vip.popular', 'en', 'Popular'),
  ('vip.current_plan', 'en', 'Active VIP Membership'),
  ('matchmaking.title', 'en', 'Personal Matchmaking'),
  ('matchmaking.subtitle', 'en', 'Let our professional matchmakers find your perfect match'),
  ('matchmaking.how_title', 'en', 'How It Works'),
  ('matchmaking.step1', 'en', 'Apply & Share Your Story'),
  ('matchmaking.step2', 'en', 'Interview with Matchmaker'),
  ('matchmaking.step3', 'en', 'Get Matched on Dates'),
  ('matchmaking.packages_title', 'en', 'Matchmaking Packages'),
  ('matchmaking.apply', 'en', 'Apply Now'),
  ('matchmaking.about_you', 'en', 'Tell us about yourself'),
  ('matchmaking.looking_for', 'en', 'What are you looking for in a partner?'),
  ('matchmaking.age_range', 'en', 'Preferred age range'),
  ('matchmaking.areas', 'en', 'Preferred areas/cities'),
  ('matchmaking.submitted', 'en', 'Application submitted successfully!'),
  ('blog.title', 'en', 'Dating Tips & Stories'),
  ('blog.no_posts', 'en', 'No blog posts yet'),
  ('blog.read_more', 'en', 'Read More'),
  ('blog.back', 'en', 'Back to Blog');

-- VIP and Matchmaking translations (Hebrew)
insert into translations (string_key, language_code, value) values
  ('vip.title', 'he', 'מנוי VIP'),
  ('vip.subtitle', 'he', 'פתחו הטבות בלעדיות ושפרו את חוויית ההיכרויות שלכם'),
  ('vip.benefits_title', 'he', 'הטבות VIP'),
  ('vip.benefit_1', 'he', 'הנחה על כרטיסים לאירועים'),
  ('vip.benefit_2', 'he', 'ראו מי בחר בכם'),
  ('vip.benefit_3', 'he', 'עדיפות בהזמנה'),
  ('vip.benefit_4', 'he', 'הנחה על שירות שידוכים'),
  ('vip.pricing_title', 'he', 'בחרו את התוכנית שלכם'),
  ('vip.subscribe', 'he', 'הירשמו עכשיו'),
  ('vip.per_month', 'he', 'חודש'),
  ('vip.best_value', 'he', 'הכי משתלם'),
  ('vip.popular', 'he', 'פופולרי'),
  ('vip.current_plan', 'he', 'מנוי VIP פעיל'),
  ('matchmaking.title', 'he', 'שידוכים אישיים'),
  ('matchmaking.subtitle', 'he', 'השדכנים המקצועיים שלנו ימצאו עבורכם את ההתאמה המושלמת'),
  ('matchmaking.how_title', 'he', 'איך זה עובד'),
  ('matchmaking.step1', 'he', 'הגישו בקשה ושתפו את הסיפור שלכם'),
  ('matchmaking.step2', 'he', 'ראיון עם שדכן'),
  ('matchmaking.step3', 'he', 'קבלו התאמות לדייטים'),
  ('matchmaking.packages_title', 'he', 'חבילות שידוכים'),
  ('matchmaking.apply', 'he', 'הגישו בקשה'),
  ('matchmaking.about_you', 'he', 'ספרו לנו על עצמכם'),
  ('matchmaking.looking_for', 'he', 'מה אתם מחפשים בבן/בת זוג?'),
  ('matchmaking.age_range', 'he', 'טווח גילאים מועדף'),
  ('matchmaking.areas', 'he', 'אזורים/ערים מועדפים'),
  ('matchmaking.submitted', 'he', 'הבקשה נשלחה בהצלחה!'),
  ('blog.title', 'he', 'טיפים וסיפורים'),
  ('blog.no_posts', 'he', 'אין פוסטים בבלוג עדיין'),
  ('blog.read_more', 'he', 'קרא עוד'),
  ('blog.back', 'he', 'חזרה לבלוג');

-- Matchmaking Packages
insert into matchmaking_packages (name, country_id, num_dates, duration_months, price, currency, is_active) values
  ('Silver Package', (select id from countries where code = 'gb'), 3, 3, 495, 'GBP', true),
  ('Gold Package', (select id from countries where code = 'gb'), 6, 6, 895, 'GBP', true),
  ('Silver Package', (select id from countries where code = 'il'), 3, 3, 1990, 'ILS', true),
  ('Gold Package', (select id from countries where code = 'il'), 6, 6, 3490, 'ILS', true);

-- Blog Posts
insert into blog_posts (title, slug, body_html, featured_image, country_id, language_code, is_published, published_at) values
  (
    '10 Tips for a Successful Speed Dating Event',
    '10-tips-successful-speed-dating',
    '<h2>Make the Most of Your Evening</h2>
<p>Speed dating can be an exciting and efficient way to meet potential partners. Here are our top tips to ensure you have a great experience:</p>

<h3>1. Be Yourself</h3>
<p>Authenticity is key. Don''t try to be someone you''re not – the right person will appreciate the real you.</p>

<h3>2. Prepare Some Questions</h3>
<p>Have a few conversation starters ready. Ask about hobbies, interests, or recent experiences rather than interrogating about life goals.</p>

<h3>3. Listen Actively</h3>
<p>Show genuine interest in what your dates are saying. Good listening skills make you more memorable than clever conversation.</p>

<h3>4. Keep an Open Mind</h3>
<p>Chemistry isn''t always instant. Give everyone a fair chance – you might be surprised!</p>

<h3>5. Dress Comfortably</h3>
<p>Wear something that makes you feel confident but comfortable. You''ll be sitting and chatting all evening.</p>

<h3>6. Arrive Early</h3>
<p>Give yourself time to settle in, grab a drink, and feel comfortable in the venue before the event starts.</p>

<h3>7. Stay Positive</h3>
<p>Even if you don''t meet "the one," enjoy the experience and the opportunity to meet new people.</p>

<h3>8. Take Notes</h3>
<p>After the event, jot down memorable details about people you liked – it helps when making your choices.</p>

<h3>9. Don''t Overthink It</h3>
<p>Trust your instincts when marking your choices. Sometimes a gut feeling is more reliable than over-analysis.</p>

<h3>10. Follow Up on Matches</h3>
<p>If you get matches, reach out promptly! Strike while the iron is hot.</p>

<p>Remember, speed dating is meant to be fun. Relax, be yourself, and enjoy meeting new people. Good luck!</p>',
    null,
    (select id from countries where code = 'gb'),
    'en',
    true,
    now() - interval '5 days'
  ),
  (
    'Success Story: From Speed Dating to Wedding Bells',
    'success-story-speed-dating-wedding',
    '<h2>How Emma and James Found Love at Our London Event</h2>
<p>We love hearing success stories from our events, and Emma and James'' story is one of our favourites!</p>

<h3>The First Meeting</h3>
<p>Emma and James both attended our London event in March 2024. Emma was nervous – it was her first speed dating event. James had been to a few events before but hadn''t found a connection yet.</p>

<p>"When I sat down across from James, something just clicked," Emma recalls. "We talked about our shared love of hiking, and the five minutes flew by. I remember thinking, ''I really hope he ticks my box!''"</p>

<h3>A Match Made in Minutes</h3>
<p>Both Emma and James marked each other as "yes" on their scorecards. When they got their match notification the next day, they were both thrilled.</p>

<p>"I messaged Emma straight away," James says. "We arranged to meet for coffee that weekend, and we''ve been together ever since."</p>

<h3>The Journey</h3>
<p>After that first coffee date, Emma and James discovered they had much more in common than just hiking. They share values, humor, and life goals.</p>

<p>"Speed dating gave us the chance to connect in person straight away," Emma explains. "No endless texting or app fatigue – just real conversation and genuine connection."</p>

<h3>The Proposal</h3>
<p>Ten months after their first meeting, James proposed during a hiking trip in the Lake District – bringing their story full circle.</p>

<p>"I can''t believe we almost didn''t go to that event," James laughs. "It changed both our lives."</p>

<h3>The Wedding</h3>
<p>Emma and James are getting married next month, and they''ve invited the matchmaker who hosted their event to the wedding!</p>

<p>"We''re so grateful to The Speed Dating for bringing us together," Emma says. "If you''re thinking about trying it, just do it. You never know who you might meet!"</p>

<p><em>Congratulations Emma and James! We wish you all the happiness in the world.</em></p>',
    null,
    (select id from countries where code = 'gb'),
    'en',
    true,
    now() - interval '12 days'
  ),
  (
    'טיפים למפגש היכרות מהיר מוצלח',
    'tips-successful-speed-dating-hebrew',
    '<h2>להפיק את המירב מהערב שלכם</h2>
<p>דייט מהיר הוא דרך מרגשת ויעילה להכיר בני זוג פוטנציאליים. הנה הטיפים המובילים שלנו כדי להבטיח שתהיה לכם חוויה נהדרת:</p>

<h3>1. היו אותנטיים</h3>
<p>אותנטיות היא המפתח. אל תנסו להיות מישהו שאתם לא – האדם הנכון יעריך את האני האמיתי שלכם.</p>

<h3>2. הכינו כמה שאלות</h3>
<p>הכינו כמה פותחי שיחה. שאלו על תחביבים, תחומי עניין או חוויות אחרונות במקום לחקור על מטרות בחיים.</p>

<h3>3. הקשיבו באופן פעיל</h3>
<p>הפגינו עניין אמיתי במה שהדייטים שלכם אומרים. כישורי הקשבה טובים הופכים אותכם לבלתי נשכחים יותר משיחה חכמה.</p>

<h3>4. שמרו על ראש פתוח</h3>
<p>כימיה לא תמיד מיידית. תנו לכולם הזדמנות הוגנת – אתם עלולים להיות מופתעים!</p>

<h3>5. התלבשו בנוחות</h3>
<p>לבשו משהו שגורם לכם להרגיש בטוחים אך נוחים. תשבו ותשוחחו כל הערב.</p>

<h3>6. הגיעו מוקדם</h3>
<p>תנו לעצמכם זמן להתיישב, לשתות משהו ולהרגיש בנוח במקום לפני תחילת האירוע.</p>

<h3>7. הישארו חיוביים</h3>
<p>גם אם לא תפגשו את "האחד", תהנו מהחוויה ומההזדמנות להכיר אנשים חדשים.</p>

<h3>8. רשמו הערות</h3>
<p>אחרי האירוע, רשמו פרטים בלתי נשכחים על אנשים שאהבתם – זה עוזר בעת ביצוע הבחירות שלכם.</p>

<h3>9. אל תחשבו יותר מדי</h3>
<p>סמכו על האינסטינקטים שלכם כאשר אתם מסמנים את הבחירות שלכם. לפעמים תחושת בטן היא יותר אמינה מניתוח יתר.</p>

<h3>10. עקבו אחרי התאמות</h3>
<p>אם קיבלתם התאמות, פנו במהירות! תקפו בזמן שהברזל חם.</p>

<p>זכרו, דייט מהיר אמור להיות כיף. תירגעו, תהיו עצמכם, ותהנו מהכרת אנשים חדשים. בהצלחה!</p>',
    null,
    (select id from countries where code = 'il'),
    'he',
    true,
    now() - interval '8 days'
  );
