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
  ('vip.title', 'he', 'הצטרפו לחברות VIP וקבלו הנחות!'),
  ('vip.subtitle', 'he', 'הצטרפו למועדון החברים שלנו עוד היום!'),
  ('vip.benefits_title', 'he', 'הטבות VIP'),
  ('vip.benefit_1', 'he', 'ערבי ספיד דייט בהנחה של 25%'),
  ('vip.benefit_2', 'he', 'אנו מגלים לכם מי בחר בכם'),
  ('vip.benefit_3', 'he', 'הנחה של 15% לשירות השידוכים'),
  ('vip.benefit_4', 'he', 'ועוד הנחות מפתיעות'),
  ('vip.pricing_title', 'he', 'נא לבחור את תכנית המנוי המתאימה לך'),
  ('vip.subscribe', 'he', 'הצטרפו עכשיו'),
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

-- Additional UI translations (English)
insert into translations (string_key, language_code, value) values
  ('nav.dating_tips', 'en', 'Dating Tips'),
  ('nav.virtual_events', 'en', 'Virtual Events'),
  ('nav.success_stories', 'en', 'Success Stories'),
  ('nav.franchise', 'en', 'Franchise/Jobs'),
  ('nav.what_is_speed_dating', 'en', 'What Is Speed Dating'),
  ('home.sign_up_now', 'en', 'Sign Up Now'),
  ('home.get_notified', 'en', 'Sign up to get notified'),
  ('home.view_upcoming', 'en', 'View Upcoming Events'),
  ('home.read_stories', 'en', 'Read Their Stories'),
  ('home.cta_heading', 'en', 'Our evenings are about meeting new like-minded people in a friendly, fun evening.'),
  ('home.cta_subtext', 'en', 'Sign up now for the next event. All our events are Jewish.'),
  ('vip.hero_subtitle', 'en', 'Become our VIP member and get Discounts!'),
  ('vip.benefits_heading', 'en', 'VIP Benefits'),
  ('vip.benefits_subtext', 'en', 'Join our exclusive VIP membership today'),
  ('vip.plans_heading', 'en', 'Select Your VIP Membership Plan'),
  ('vip.plans_subtext', 'en', 'Choose the plan that works best for you'),
  ('vip.buy_membership', 'en', 'Buy VIP Membership'),
  ('vip.coming_soon', 'en', 'Coming Soon'),
  ('vip.notice_title', 'en', 'Important Notice'),
  ('matchmaking.packages_subtext', 'en', 'Choose the package that suits your needs. All packages include a personal interview and dedicated matchmaker.'),
  ('matchmaking.register_title', 'en', 'Register With Us Today'),
  ('matchmaking.register_subtext', 'en', 'It''s easy: Just give it a chance.'),
  ('matchmaking.login_prompt', 'en', 'Please log in or create an account to apply for our matchmaking service.'),
  ('success_stories.featured', 'en', 'Featured Stories'),
  ('success_stories.more', 'en', 'More Testimonials'),
  ('faqs.still_questions', 'en', 'Still Have Questions?'),
  ('faqs.still_questions_text', 'en', 'Can''t find the answer you''re looking for? Get in touch with our friendly team.'),
  ('faqs.hero_subtitle', 'en', 'Everything you need to know about our Jewish speed dating events'),
  ('contact.opening_hours', 'en', 'Opening Hours'),
  ('contact.contact_details', 'en', 'Contact Details'),
  ('contact.send_message', 'en', 'Send us a message'),
  ('contact.send_message_text', 'en', 'Or please fill in your details below and send — we will reply shortly!'),
  ('contact.error', 'en', 'Failed to send message. Please try again.'),
  ('events.back_to_events', 'en', '← Back to Events'),
  ('common.page', 'en', 'Page'),
  ('common.of', 'en', 'of'),
  ('common.previous', 'en', 'Previous'),
  ('common.next', 'en', 'Next');

-- Additional UI translations (Hebrew)
insert into translations (string_key, language_code, value) values
  ('nav.dating_tips', 'he', 'טיפים'),
  ('nav.virtual_events', 'he', 'אירועים וירטואליים'),
  ('nav.success_stories', 'he', 'סיפורי הצלחה'),
  ('nav.franchise', 'he', 'זיכיון ומשרות'),
  ('nav.what_is_speed_dating', 'he', 'מה זה ספיד דייט'),
  ('home.sign_up_now', 'he', 'הירשמו עכשיו'),
  ('home.get_notified', 'he', 'קבלו עדכון'),
  ('home.view_upcoming', 'he', 'צפו באירועים הקרובים'),
  ('home.read_stories', 'he', 'קראו סיפורים'),
  ('home.cta_heading', 'he', 'מוכנים למצוא את ההתאמה?'),
  ('home.cta_subtext', 'he', 'הצטרפו לאלפי רווקים יהודים שמצאו אהבה דרך ספיד דייטינג.'),
  ('vip.hero_subtitle', 'he', 'הצטרפו למועדון החברים שלנו עוד היום!'),
  ('vip.benefits_heading', 'he', 'הטבות VIP'),
  ('vip.benefits_subtext', 'he', 'הצטרפו לחברות VIP וקבלו הנחות!'),
  ('vip.plans_heading', 'he', 'נא לבחור את תכנית המנוי המתאימה לך'),
  ('vip.plans_subtext', 'he', 'נא לבחור את תכנית המנוי המתאימה לך'),
  ('vip.buy_membership', 'he', 'הצטרפו עכשיו'),
  ('vip.coming_soon', 'he', 'בקרוב'),
  ('vip.notice_title', 'he', 'מידע חשוב'),
  ('matchmaking.packages_subtext', 'he', 'בחרו את החבילה המתאימה לכם. כל החבילות כוללות ייעוץ אישי.'),
  ('matchmaking.register_title', 'he', 'זה קל! הצטרפו אלינו היום!'),
  ('matchmaking.register_subtext', 'he', 'מלאו את הטופס למטה והשדכן שלנו ייצור אתכם קשר.'),
  ('matchmaking.login_prompt', 'he', 'אנא התחברו או הירשמו כדי להגיש בקשה לשירות השידוכים.'),
  ('success_stories.featured', 'he', 'סיפורים מובחרים'),
  ('success_stories.more', 'he', 'עדויות נוספות'),
  ('faqs.still_questions', 'he', 'עדיין יש שאלות?'),
  ('faqs.still_questions_text', 'he', 'לא מצאתם את מה שחיפשתם? צרו איתנו קשר.'),
  ('faqs.hero_subtitle', 'he', 'כל מה שצריך לדעת על ספיד דייטינג'),
  ('contact.opening_hours', 'he', 'שעות פעילות'),
  ('contact.contact_details', 'he', 'פרטי התקשרות'),
  ('contact.send_message', 'he', 'שלחו לנו הודעה'),
  ('contact.send_message_text', 'he', 'או מלאו את הפרטים שלכם למטה ושלחו — נחזור אליכם בקרוב!'),
  ('contact.error', 'he', 'שליחת ההודעה נכשלה. אנא נסו שוב.'),
  ('events.back_to_events', 'he', '← חזרה לאירועים'),
  ('common.page', 'he', 'עמוד'),
  ('common.of', 'he', 'מתוך'),
  ('common.previous', 'he', 'הקודם'),
  ('common.next', 'he', 'הבא');

-- CMS Pages (UK - English)
insert into pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published) values
  (
    'home',
    (select id from countries where code = 'gb'),
    'en',
    'Welcome to The Speed Dating',
    '<h2>Welcome to the Jewish Speed Dating organizer in the UK</h2>
<p>Getting a chance to meet one-on-one in a fun, classy, yet relaxed evening. Join the worldwide success! Speed Dating offers a chance to meet new people and have a 7-minute date with each one.</p>
<p>It''s a cool way of having a selection of people to choose from and say ''YES'' to the potentially right one without wasting time on the wrong one!</p>
<p>Take your chance! You can, for a relatively small amount of money, meet around 10 different potential partners in a single night. Our events are hosted in a friendly, warm and open atmosphere.</p>
<p>The evening isn''t just about meeting your dream partner; it''s also about meeting new people and making new friends. You never know who knows who!</p>
<p>Sign up now for the next event. All our events are Jewish.</p>
<p><strong>Please note:</strong> We accept advance bookings only to ensure the evening''s success.</p>
<p>** wish to be considered as a virtual host? were hiring!</p>',
    'Jewish Speed Dating UK & Israel | The Speed Dating',
    'Professional evenings for professional Jewish people. Jewish speed dating events in London, Manchester, Tel Aviv since 2003. Over 120 weddings worldwide.',
    true
  ),
  (
    'about-us',
    (select id from countries where code = 'gb'),
    'en',
    'About Us',
    '<p>The Speed Dating was established in May 2003 by Michal in London, as a Jewish speed dating events organisation.</p>
<p>Starting with 2 events per month in London for ages ranging from 20-40 we have gradually started organising more events (7-8 per month) for a wider age group. We now host events in London for ages ranging from 20-65 on different nights.</p>
<p>The venues we use are always high class with nice vibe.</p>
<p>In September 2006 we started organising events in Manchester as well.</p>
<p>In Jan 2009 we have opened our Tel Aviv branch and hope to open the Jerusalem operation this year. We host 4 events per month in Tel Aviv for ages ranging from 22-52.</p>
<p>in May 2009 we have opened our NYC branch. we host between 4-6 events per month for ages ranging from 22-60</p>
<p>Our Paris branch opened in February 2011</p>
<p>We have been hosting a party once or twice a year in London and will continue to host parties and mixers every year.</p>
<p>in 2006 we also launched our new personal service Jewish Matches. We cater for singles of all ages that would like to gain access to all the singles that join the speed dating events as well as the Jewish Matches members.</p>
<p>since June 2010 we are also offering Jewish Matches in New York.</p>
<p>Since 2003 we have over 120 couples who got married. Many people are dating and have formed friendships.</p>
<p>We pride ourselves with having people travel to our events from other European countries such as Holland, Denmark and Belgium. The Speed Dating is offering an important service and helping Jewish singles meet.</p>',
    'About Us | The Speed Dating',
    'Learn about TheSpeedDating - Jewish speed dating events since May 2003. Over 120 weddings worldwide across London, Manchester, Tel Aviv, NYC, and Paris.',
    true
  ),
  (
    'dating-tips',
    (select id from countries where code = 'gb'),
    'en',
    'Dating Tips',
    '<h2>General Dating Tips</h2>
<ul>
<li>Be who you are</li>
<li>First impressions are the most powerful ones</li>
<li>Try to talk and listen equally</li>
<li>Avoid asking the same questions each time</li>
<li>Be creative</li>
<li>Try and make it entertaining</li>
</ul>
<p>You can ask any questions you like, but remember that first impressions count and being original is a plus.</p>
<p>You can be creative and ask different questions to ''What do you do for work?'' or ''Where do you live?'' We suggest you try more surprsing set of questions, like ''Where would you go for a romantic holiday?'' or ''What do you look at first when meeting someone for the first time?''</p>
<p>Enjoy dating for what it is, dating. It is meeting people and socializing and spending time in the company of stimulating individuals who may or may not play a bigger part in your life down the road. The fact is, most people have something interesting to offer. While you may not be out on the dating scene looking for new friends, you may well find one or two fabulous people along the way.</p>

<h2>Tips for Men</h2>
<ol>
<li>Smile, Women are smile addicts. A few well-placed smiles, a happy attitude, some (non-erotic!) jokes here and there and you can win a woman''s heart faster than a handsome tall guy, who is grumpy.</li>
<li>Stand straight and sit up. It shows that you are strong, well trained and not ill. And it will make you taller.</li>
<li>Use her name thruout the talks with her. This alone creates a more intimate atmosphere.</li>
<li>Even if you feel mentally close to the other person, keep your hands to yourself, its only a first mini date!</li>
<li>Use deodorants. Under normal circumstances most women hate sweat odor. Hate it. Its not even about using perfumes. Perfumes can be used additionally. The main idea is non-smelling, which is more important than good-smelling.</li>
<li>The reason of talking to a woman is to establish a relaxed atmosphere and to be friendly. Thus don''t get involved into highly arguable subjects such as ''Why death penalties for minors should be allowed'' or ''Why Greenpeace is doing more harm than good''</li>
<li>You should show a tolerant and open-minded attitude towards many subjects. Anything that can cause you a bad mood or her a bad mood should be avoided.</li>
<li>Be aware that if you give vent to your feelings this can tell the woman that you are weak and she needs to be your talk friend. But to date her you need to show the direct opposite: That you are her strong shoulder; that you are self-confident; that you know what to do; and that she can rely on your emotional strength to be a help for her.</li>
<li>If a woman asks questions who you are and what you do and what you want to achieve in life, then you should know what to answer. If you begin to stutter, flush red and say ''Well, I have no clue, I am too helpless for this world'' then this is NOT what they want to hear. By mentioning your hobbies, your job, sport interests you describe yourself as someone with a stable background whom she can classify and trust.</li>
</ol>

<h2>Tips for Women</h2>
<ol>
<li>Always look great, whatever your income. Gorgeous hair and some lipstick with rags will still turn his head. You have the advantage. You are the woman. Look your best. Looking your best will make you feel your best.</li>
<li>Never reveal information you don''t have to. An enigmatic woman drives men wild.</li>
<li>Never ever talk about previous boyfriends, particularly their prowess in the bedroom. Your ex-boyfriends are your business only.</li>
<li>Assume nothing about your date until you choose to know him better. You cannot always tell by looking.</li>
<li>Men are seeking a woman who is attractive to them. Women may despair that men can be so shallow and that looks could matter so much but be careful. Men aren''t necessarily looking for a catwalk model, but men do want a woman who takes pride in their appearance (though not excessively). Men are proud of having a girlfriend who looks good and I don''t believe any man who says otherwise.</li>
<li>Men are looking for a trustworthy girl, someone they can have faith in and someone who will be there for them.</li>
<li>Men are looking for women who retain their femininity and and are caring and kind.</li>
<li>Men love a challenging woman, someone who keeps them on their toes.</li>
<li>Your posture is one of the most telling signals you transmit. An open posture is evidence of an open person. Turning your body toward the man you''re conversing with, keeping your feet flat on the floor and leaning forward are actions that show interest.</li>
</ol>',
    'Dating Tips | The Speed Dating',
    'Speed dating tips and advice for men and women to help you make the most of your evening.',
    true
  ),
  (
    'what-is-speed-dating',
    (select id from countries where code = 'gb'),
    'en',
    'What Is Speed Dating?',
    '<h2>What is speed dating?</h2>
<p>It is often heard that single people are wasting their time – a valuable one if you are a busy person, on a long date with the wrong person for you. Someone you are not acquainted with received your number from a friend of yours, he or she said they were fabulous and you accepted an invitation to go on a date.</p>
<p>You go out to a restaurant. Another blind date that went wrong.</p>
<p>They are not your type, and after three minutes you are looking for conversation topics that will pass the time.</p>
<p>You end up spending the whole evening thinking you should have stayed at home or just went out for a drink with your best friend. At least you would have enjoyed the evening!</p>
<p>You are also a kind person and you wouldn''t like to offend the person sitting in front of you, by going home after only half an hour.</p>
<p>Sounds familiar? It happens to all the single people all over the world!</p>
<p>With any successful blind date there will be hundreds of awful ones.</p>
<p>The experienced blind daters, men and women will tell you that already in the first 5 minutes they are able to know whether the person opposite them is a potential partner. This is what generated the idea of speed dating.</p>
<p>Why spend a whole evening trying to get to know someone you wouldn''t want to know in the first place?</p>
<p>You therefore, can spend 7 minutes meeting around 10-12 potential partners,in a warm and friendly evening during which you will decide whether you would like to meet them again or not, with no strings attached!</p>

<h2>How does it work?</h2>
<p>The idea is of genius simplicity. For a small amount of money, we will get you to meet around 12 professional Jewish singles in your age group.</p>
<p>The evenings are held at a local or centrally located trendy bar. You will be seated around tables or sofas.</p>
<p>The women stay seated during the event and the men move around from one table to the next when 7 minutes are up.</p>
<p>At the end of the 7 minutes of each round, the bell will ring giving the men the signal to move on to the next table and meet with the next woman. After each date the participants mark on the score card they have received from the hostess at the start of the evening.</p>
<p>You have a choice whether you would like to meet that person again as a Date or as a friend.</p>
<p>A simple choice will determine whether you would like to see that person again or not.</p>
<p>We give you the choice of either choosing to see someone again as a date which means that if that person chose you as a date as well - you will have a Date match with them, and both your contact details will be revealed to both of you.</p>
<p>The additional choice of choosing someone as a friend is to enable you to decide that that person was nice enough to be friends with, you never know, that person might have another friend who might be your one!</p>
<p>its always good to enlarge your circle of friends!</p>

<h2>During the evening</h2>
<p>Upon arrival you will be checked in and receive a score card. You will have some time to mingle, get used to the atmosphere and have a drink. We will show you which table to attend for your first date.</p>
<p>You will spend 7 minutes talking to the person opposite you. At the end of this encounter you will mark in the designated box whether you wish to see that person again or as a date or as a friend.</p>
<p>The men then move to the next table. We will give you a break at some point in order to get another drink or freshen up.</p>
<p>At the end of the event everyone are welcome to stay around for another drink and mingle.</p>
<p>Please make sure you keep the score card as you will need it to enter your choices on our website at home later.</p>

<h2>Login process</h2>
<p>When you purchase a ticket to any event, you will be asked to enter some of your details, all kept confidential, and you will also get a user name and password, which will enable you to login to your account and submit your choices after the event.</p>

<h2>Submitting your choices</h2>
<p>Please login with your user name and password on our site.</p>
<p>Please choose the event date you have participated from the list.</p>
<p>After choosing your event date you will see a list of the people you met at the event along with a selection box of Date and Friend.</p>
<p>Please make your selection and choose which contact detail of yours (Email and or phone number) you would like to reveal to a potential match. You need to select the box of the email address and /or phone number in order for those details to be shown to your matches. A match is achieved once both sides choose each other as a date or as a friend.</p>
<p>If one side chose the other as a date and the other made a choice of a friend, a friend match will be achieved.</p>

<h2>Updating your details</h2>
<p>On your profile page you can change and update your profile details at any time.</p>
<p>You can also change your password at any time you choose.</p>

<h2>Forgotten password</h2>
<p>Forgot your password? Just click on Reset password, and an email with a new password will be sent to the email address you provided us when you registered.</p>

<h2>How do I get my match results?</h2>
<p>Please log in to the website using your login name and password, which you got when you have booked your ticket.</p>
<p>The sooner you do it the better. once you have submitted your choices you can click on Match results in order to see the outcome. You are invited to come back and check the results more than once to allow time for all the participants to submit theirs.</p>
<p>If after 3 days you haven''t submitted your choices, we will email you a reminder to do so.</p>
<p>We will send you an email with your matches a week after the event regardless of the results.</p>
<p>What is "No match yet"? it means that this person hasn''t entered their choices yet.</p>
<p>If for some reason you dont have online access, you can:</p>
<ul>
<li>Hand your score card with your name on it to the hostess on the night - we shall submit your choices for you.</li>
<li>Email your choices to info@ThespeedDating.co.uk</li>
<li>Call 0700 3401347 to give them out over the phone.</li>
</ul>
<p>In any of the above cases you will be asked to call us for your results on 0700 3401347</p>
<p>You then need to select the box next to the name of the person – either DATE or FRIEND or both.</p>
<p>You can also select yes as a DATE and a FRIEND.</p>
<p>As we also give you the option of choosing someone as a friend, the email will include your DATES and FRIENDS matches.</p>

<h2>What if I chose someone as a "DATE" and they have chosen me as a "FRIEND"? (Or vice versa?)</h2>
<p>This will come up as a FRIENDS match.</p>

<h2>Why do so many people come to speed dating?</h2>
<p>In one evening you have been given the chance to meet many different singles - men and women, where as if you were to meet any of them separately you would have had to spend two to three months!</p>

<h2>What do we think this night is all about?</h2>
<p>We believe that this evening is not only about finding your date, but also about finding other friends.</p>
<p>You never know who you might meet, and each person is a world with people surrounding it.</p>
<p>This is also a good chance for you to brush your communication skills.</p>
<p>We pride ourselves with a relaxed atmosphere during our events and we do not like to create too many ''rules''.</p>
<p>Above all we believe that being spontaneous is the best way to be!</p>

<h2>Some tips</h2>
<ul>
<li>Be who you are.</li>
<li>First impressions are the most powerful ones.</li>
<li>Try to talk and listen equally</li>
<li>Avoid asking the same questions each time</li>
<li>Be creative.</li>
<li>Try to make it entertaining</li>
<li>Enjoy dating for what it is, dating. It is meeting people and socializing and spending time in the company of stimulating individuals who may or may not play a bigger part in your life down the road.</li>
<li>The fact is, most people have something interesting to offer. While you may not be out on the dating scene looking for new friends, you may well find one or two fabulous people along the way.</li>
</ul>
<p>Please read more dating tips on our <a href="/dating-tips">Dating Tips</a> page.</p>
<p>You will, after all, have a great evening out!</p>
<p>If you have been to one of our events, why not let other people know how it went for you! We receive comments daily on how well the service was organised.</p>
<p>We also have had many success stories, including 120 couples who got married as a result of meeting at one of events.</p>
<p>Goes to show that Speed Dating works!</p>',
    'What Is Speed Dating? | The Speed Dating',
    'Learn how Jewish speed dating works - meet ~12 professional singles in your age group through fun 7-minute dates at trendy bars. Over 120 weddings since 2003.',
    true
  ),
  (
    'success-stories',
    (select id from countries where code = 'gb'),
    'en',
    'Success Stories',
    '<p>We are proud to present some of our success stories here: 120 weddings worldwide! Goes to show Speed Dating works!</p>
<p>These are some of the Thank you emails we got from couples who got married.</p>',
    'Success Stories | The Speed Dating',
    '120 weddings worldwide! Read real love stories from couples who met through TheSpeedDating Jewish speed dating events.',
    true
  ),
  (
    'matchmaking',
    (select id from countries where code = 'gb'),
    'en',
    'Matchmaking',
    '<p>Many working professionals find it difficult to set aside time for personal pleasure and dating.</p>
<p>Jewish Matches will help to cut down the time and stress involved in finding your suitable match.</p>
<p>Jewish matches began when we at TheSpeedDating.co.uk realized there was a need for an additional service to complement our Speed Dating events.</p>
<p>Often we find a potentially perfect match would arrive on a separate evening to the potentially perfect partner resulting in the two never crossing paths.</p>
<p>The desire of putting the two together led to the formation of Jewish matches.</p>
<p>We have 17 years experience running the speed dating, with 235 marriages up to date and lots of couples dating.</p>
<p>Our experience has taught us how to identify what would make a suitable match.<br/>We currently have over 5000 singles (of All ages) on our books all looking to meet their perfect partner.</p>
<p><strong>It''s easy: Just give it a chance. Register with us today.</strong></p>

<h2>How does it work?</h2>
<p>Each candidate is interviewed through our careful screening process.</p>
<p>Please Register with us today to download our detailed questionnaire for you to fill in. Please email it back to us with your details, all personal details are kept confidential.</p>
<p>Once we receive your questionnaire we shall get in touch in order to schedule a chat with you.</p>
<p>During this interview you will be asked about your background and your preferences.</p>
<p>Your photo can either be emailed to us or taken during the interview (For our records).</p>
<p>Once you are fully registered, we will start searching for your perfect match.</p>
<p>We will then contact you and arrange for you to start dating!</p>

<h2>What people say:</h2>
<p><em>"I am very impressed so far with your service! This is the first time I have attempted this type of approach to dating and it is quite an eye opener (in terms of responses). Many thanks".</em></p>
<p><em>"Your service is a fantastic way to meet good, honest and decent people and I am truly grateful that I took the step. I am getting married to someone I feel privileged to have met and we would never have done so without your help. Thank you."</em></p>
<p><em>"Via your dating service I have found the woman of my dreams!!!"</em></p>
<p><em>"I have actually started seeing someone that I met up with from Jewish Matches. So thank you very much."</em></p>
<p><em>"Just to let you know that having met about 7 people through Jewish Matches and having been in contact with numerous others, I have recently got engaged to Paul. So thank you!"</em></p>
<p>Shiran and NItsan Wedding - Tel Aviv November 2012</p>

<h2>Subscription cost:</h2>
<p>3 Months membership including 5 dates: £700<br/>6 Months membership including 10 dates: £950<br/>1 Year membership including 20 dates: £1450</p>',
    'Matchmaking | The Speed Dating',
    'Personal Jewish matchmaking service. 17+ years experience, 235 marriages, 5000+ singles on our books.',
    true
  ),
  (
    'virtual-events',
    (select id from countries where code = 'gb'),
    'en',
    'Virtual Events',
    '<p>We are now offering Virtual events with Zoom</p>
<p>Please check our <a href="/events">EVENTS PAGE</a> for more details and join our next event!</p>',
    'Virtual Events | The Speed Dating',
    'Join our virtual Jewish speed dating events via Zoom. Check our events page for upcoming virtual events.',
    true
  ),
  (
    'franchise-jobs',
    (select id from countries where code = 'gb'),
    'en',
    'Franchise & Jobs',
    '<h2>Jobs</h2>
<h3>April 2020 - were hiring!</h3>
<p>If you know your way with apps and consider yourself Tech, also sociable and can host under pressure - Please contact us</p>
<p>We hire people from time to time to join our team.</p>
<p>Please check back with us for an update or simply email us with your resume. We would be looking for the following:</p>
<ol>
<li>Hosts for a min. of 6 months commitment starting immediately in London.</li>
<li>Part time manager to help with advertising and event running, long term commitment.</li>
</ol>
<p>If you are: Good at socializing, presentable, reliable, punctual, have a computer and can work under pressure.</p>
<p>Please email us with your Resume and a recent photo to <a href="mailto:info@TheSpeedDating.co.uk">info@TheSpeedDating.co.uk</a></p>

<h2>Franchise / Licensing</h2>
<p>TheSpeed Dating.co.uk is a UK leader in organizing stylish &amp; professional singles events hosted at upmarket classic venues around London and Manchester, with worldwide locations in NYC, Tel Aviv and Paris.</p>
<p>The opportunity therefore is to join our company as a Licensee operating in the UK or anywhere else, hosting events, including speed dating events, singles parties, dinner dating, holidays etc.</p>
<p>All of which will be advertised and marketed through the company''s website and throughout the net.</p>
<ul>
<li>We operate within growing market.</li>
<li>We enjoy a 70% average repeat business</li>
<li>There is no selling involved.</li>
<li>All bookings are made via TheSpeedDating website or via the phone.</li>
<li>No stock required.</li>
<li>Positive cash flow from the start.</li>
<li>Can be managed from home.</li>
<li>Access to our own exclusive database.</li>
</ul>
<p>We believe that there is a need in the market for the way we organize our events.</p>
<p>We work professionally and offer great nights out.</p>
<p>TheSpeedDating.us has been hosting Jewish events since 2003 in London and Manchester, also in NY and Tel Aviv, with over 130 marriages as well as lots of people dating each other.</p>
<p>If you are organized and a good communicator who would like to run their own business, if you have basic computer skills, own a high level of integrity and enjoy meeting people, we would like to hear from you.</p>
<p>Please contact us for more detailed information: <a href="mailto:info@thespeeddating.co.uk">info@thespeeddating.co.uk</a></p>

<h2>International Speed Dating Franchise</h2>
<p>We are interested in expanding our Speed Dating service and brand internationally.</p>
<p>We will provide the service in the local country language.</p>
<p>Please contact us for more details: <a href="mailto:info@thespeeddating.co.uk">info@thespeeddating.co.uk</a></p>',
    'Franchise & Jobs | The Speed Dating',
    'Franchise opportunities and job openings at TheSpeedDating. Join our team or become a licensee.',
    true
  ),
  (
    'vip',
    (select id from countries where code = 'gb'),
    'en',
    'VIP Membership',
    '<h2>Become our VIP member and get Discounts!</h2>
<ul>
<li>Speed Dating event tickets at a special price</li>
<li>15% off our Match-Making service</li>
<li>We reveal to you who chose you at the Speed Dating event you participated.</li>
<li>MORE special offers and discounts!</li>
</ul>
<p>Join our exclusive VIP membership today.</p>
<p>All memberships will renew automatically after duration expired. To cancel please write an email to <a href="mailto:Cancel@TheSpeedDating.co.uk">Cancel@TheSpeedDating.co.uk</a></p>',
    'VIP Membership | The Speed Dating',
    'Become a VIP member and get discounts on speed dating events, matchmaking services, and exclusive perks.',
    true
  ),
  (
    'terms',
    (select id from countries where code = 'gb'),
    'en',
    'Terms And Conditions',
    '<h2>Terms And Conditions</h2>
<p><strong>By using this Website and attending events, you automatically accept the following terms:</strong></p>
<p>thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk are all names registered by Direct Touch Limited and are operating on and behalf of Direct Touch Limited. Therefore all terms and conditions apply.</p>
<p>By booking a thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk event you are registering your acceptance of the above registered websites terms and conditions as detailed below.</p>
<p>By booking an event with thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk you warrant that you have the right, authority and capacity to enter into this agreement and to abide by all the terms and conditions written herein.</p>
<p>We aim to conduct peaceful and enjoyable events to single people, which will enable them to meet new possible friends and potential partners. However, we cannot verify the personal details of the people registering with us for the events. It is up to any participant to verify the personal details of other participants to your satisfaction.</p>
<p>When registering with thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk you agree that neither thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk nor its owners are liable for any damages, incidental, consequential, direct or indirect, that may arise from partaking in any of thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk service. This includes any damages, without limitation, arising out of communicating with other participants registered with us. Such damages include, without limitation, physical damages, bodily injury, and or emotional distress or discomfort. This also includes any damages which may occur through meeting and communicating with any customer or representative of thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk</p>
<p>Although thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk has made every effort to design a secure on line service we disclaim liability for any security issues which occur as a result of using our on line service. thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk events are held at venues over which thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk has no control. Therefore in the event that you are injured or suffer damages of any kind at one of our events you agree to release thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk and its owners from any liability with respect thereof.</p>
<p>As a registered participant of a thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk event you understand that we offer an opportunity to meet new people but we do not guarantee that any participant will successfully match with another participant. thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk does also not guarantee that any pre matching or post matching between two participants at an event will be turn out to be successful in the future.</p>
<p>By registering with thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk you provide your assurance that you are 18 years or older and that you are single. thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk is not liable for any damage, without limitation, resulting from use of any of our website.</p>
<p>We might use your contact details to let you know of upcoming events and updates from thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk. We will not use any of your contact details or personal details to anyone without your permission unless required to do so by law. Our aim is to register equal numbers of participants to each event.</p>
<p>We conduct a non-refund policy at all times unless we need to cancel an event on our part for some unexpected reason. We, however do operate a compensation policy should we think it is deserved.</p>
<p>The numbers might change from time to time, as we cannot guarantee participants will show on the night of the event. thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk reserves the right to refuse to admit, and or to expel any person who we feel is not behaving according to our standards, i.e. is aggressive, offensive or can distress other participants on any of our events.</p>
<p>All participants at a thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk events should be polite and respectful to other participants on the night.</p>
<p>No refunds are available if you do not show up. If you let us know 7 days in advance we will that be able to register you to a future event of ours. All contents of this web site and all it''s promotional literature are the property of thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk.</p>
<p>Information and content contained herein should not be distributed or copied in whole or in part in any written format without the written permission of thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk.</p>

<h2>VIP Membership</h2>
<p>You may cancel your registration or subscription to the Service at any time during the term of such registration or subscription or any renewal period by accessing the "Personal Settings" page under the and clicking on "Delete Account" button, and providing the information requested. Alternatively, you may cancel your registration or subscription by sending a notice of cancellation to: cancel@zivoogim.com, such notice being effective upon our receipt. In each case, your subscription will terminate at the end of the subscription term for which you have paid, and you will not receive any refund for any unused days of such subscription term.</p>

<h2>Privacy Policy</h2>
<p>thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk value our customer''s privacy and sees it as a matter of an utmost importance. Your personal details and any information we have from your registration will be used to: Add your details as a customer of thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk e mail list and/or register you to one or more of our events. This information will be used to let you know whether you have got any matches resulting from the event you have participated in and only when you yourself have been expressing your interest in meeting the other person again and obtaining his or her details.</p>
<p>Therefore, when registering to an event you are giving us permission to match and pre match you with the other participants on the night of the event, and allowing us to email you the results of your choice. All the information held on our customers remains the property of thespeeddating.us / thespeeddating.co.uk / thespeeddating.co.il / thespeedating.com / thejewishspeedating.co.uk and will be stored on our database.</p>',
    'Terms And Conditions | The Speed Dating',
    'Terms and Conditions for TheSpeedDating speed dating events and services.',
    true
  ),
  (
    'contact',
    (select id from countries where code = 'gb'),
    'en',
    'Contact Us',
    '<p>We''d love to hear from you! Whether you have a question about our events, need help with your account, or want to share feedback, please get in touch.</p>
<p>Please fill in your details below and send - we will reply shortly!</p>',
    'Contact Us | The Speed Dating',
    'Get in touch with TheSpeedDating. Call 07950272671, email info@TheSpeedDating.co.uk, or fill in our contact form.',
    true
  );

-- CMS Pages (Israel - Hebrew)
insert into pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published) values
  (
    'dating-tips',
    (select id from countries where code = 'il'),
    'he',
    'טיפים להיכרויות',
    '<h2>טיפים מובילים להצלחה בדייט מהיר</h2>
<p>בין אם זו הפעם הראשונה שלכם או שאתם מנוסים, הטיפים האלה יעזרו לכם להפיק את המירב מהערב.</p>

<h3>לפני האירוע</h3>
<ul>
<li><strong>התלבשו להרשים</strong> – קז׳ואל אלגנט עובד הכי טוב. לבשו משהו שגורם לכם להרגיש בטוחים.</li>
<li><strong>הגיעו בזמן</strong> – תנו לעצמכם כמה דקות להתיישב ולשתות משהו לפני תחילת האירוע.</li>
<li><strong>הכינו נושאי שיחה</strong> – חשבו על כמה שאלות מעניינות מעבר ל"מה את/ה עושה?"</li>
</ul>

<h3>במהלך האירוע</h3>
<ul>
<li><strong>היו עצמכם</strong> – אותנטיות מושכת הרבה יותר מניסיון להיות מישהו אחר.</li>
<li><strong>הקשיבו באופן פעיל</strong> – הפגינו עניין אמיתי. שאלו שאלות המשך וזכרו פרטים.</li>
<li><strong>הישארו חיוביים</strong> – שמרו על שיחה קלילה. שמרו נושאים כבדים לדייטים מאוחרים יותר.</li>
</ul>

<h3>אחרי האירוע</h3>
<ul>
<li><strong>סמכו על האינסטינקט</strong> – כשאתם מסמנים את הבחירות, לכו עם התחושה ואל תחשבו יותר מדי.</li>
<li><strong>צרו קשר מהר</strong> – אם קיבלתם התאמה, פנו תוך יום-יומיים כשהחיבור עדיין טרי.</li>
<li><strong>שמרו על ראש פתוח</strong> – כימיה יכולה לגדול. תנו להתאמות שלכם הזדמנות הוגנת.</li>
</ul>

<p>זכרו, דייט מהיר אמור להיות כיף! תירגעו, תהנו מהכרת אנשים חדשים, ותנו לחיבורים לקרות באופן טבעי.</p>',
    'טיפים להיכרויות - עצות לדייט מהיר | The Speed Dating',
    'טיפים ועצות מקצועיות להפקת המירב מחוויית הדייט המהיר שלכם.',
    true
  ),
  (
    'what-is-speed-dating',
    (select id from countries where code = 'il'),
    'he',
    'מה זה דייט מהיר?',
    '<h2>המדריך שלכם לדייט מהיר</h2>
<p>דייט מהיר הוא אירוע חברתי מובנה בו רווקים פוגשים סדרה של שותפים פוטנציאליים בשיחות קצרות ומתוזמנות – בדרך כלל 4 עד 5 דקות כל אחת.</p>

<h3>איך זה עובד?</h3>
<ol>
<li><strong>צ׳ק-אין</strong> – הגיעו למקום, קבלו כרטיס ניקוד ותג שם, והזמינו שתייה.</li>
<li><strong>שבו במקומכם</strong> – הנשים יושבות בשולחנות ממוספרים והגברים מסתובבים ביניהם.</li>
<li><strong>שוחחו</strong> – יש לכם 4-5 דקות לשוחח עם כל אדם. פעמון מסמן מתי להמשיך הלאה.</li>
<li><strong>סמנו בכרטיס</strong> – אחרי כל דייט, ציינו אם תרצו לראות אותם שוב (כן, לא, או חברים).</li>
<li><strong>קבלו התאמות</strong> – אחרי האירוע, אנחנו משווים כרטיסים. אם שניכם אמרתם "כן", זו התאמה!</li>
<li><strong>התחברו</strong> – נשתף את פרטי ההתאמה שלכם כדי שתוכלו לקבוע דייט אמיתי.</li>
</ol>

<h3>מה מייחד את האירועים שלנו?</h3>
<p>The Speed Dating מחבר רווקים יהודים מאז 2003. האירועים שלנו:</p>
<ul>
<li><strong>מנוהלים מקצועית</strong> – המנחים המנוסים שלנו מוודאים שהכל רץ חלק.</li>
<li><strong>מותאמי גיל</strong> – אנחנו מקפידים לקבץ אירועים לפי טווח גילאים.</li>
<li><strong>מוכווני קהילה</strong> – מעוצבים במיוחד עבור הקהילה היהודית.</li>
<li><strong>מקומות מעולים</strong> – אנחנו בוחרים מיקומים מסוגננים ומרכזיים.</li>
</ul>

<p>סקרנים? <a href="/events">בדקו את האירועים הקרובים</a> ועשו את הצעד הראשון.</p>',
    'מה זה דייט מהיר? | The Speed Dating',
    'למדו איך דייט מהיר עובד, מה לצפות באירוע, ולמה זו הדרך הטובה ביותר להכיר רווקים יהודים.',
    true
  );

-- CMS Pages: Set page_type and content_json for structured pages

-- Contact (GB) → contact
UPDATE pages SET page_type = 'contact', content_json = '{
  "openingHours": [
    {"days": "Monday - Friday", "hours": "9:30am - 7:00pm"},
    {"days": "Sunday", "hours": "9:30am - 7:30pm", "note": "Tickets booking only"},
    {"days": "Saturday", "hours": "Closed"}
  ],
  "phone": "07950 272 671",
  "email": "info@TheSpeedDating.co.uk"
}'::jsonb
WHERE page_key = 'contact' AND country_id = (SELECT id FROM countries WHERE code = 'gb');

-- Success Stories → testimony (set by migration 027, but ensure it for seed)
UPDATE pages SET page_type = 'testimony' WHERE page_key = 'success-stories';

-- FAQ (GB) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published, page_type, content_json) VALUES (
  'faq',
  (SELECT id FROM countries WHERE code = 'gb'),
  'en',
  'Frequently Asked Questions',
  '<p>Find answers to the most common questions about our speed dating events, matching process, and more.</p>',
  'FAQs | The Speed Dating',
  'Frequently asked questions about TheSpeedDating Jewish speed dating events, matching, booking, and VIP membership.',
  true,
  'faq',
  '{
    "categories": [
      {
        "title": "About Speed Dating",
        "questions": [
          {"question": "What is speed dating?", "answer": "Speed dating is a fun and efficient way to meet multiple potential partners in one evening. You''ll have a series of 7-minute conversations with each person. For a modest fee, you meet around 12 professional Jewish singles in your age group at trendy bar venues. It''s a cool way of having a selection of people to choose from and say ''YES'' to the potentially right one without wasting time on the wrong one!"},
          {"question": "How does it work?", "answer": "Women stay seated while men rotate between tables when a bell signals the time change. Each conversation lasts 7 minutes. You receive a score card and mark whether you''d like to meet each person again as a ''Date'' or ''Friend''. If both people select ''Date'' for each other, it''s a mutual match and contact details are revealed."},
          {"question": "What happens during the evening?", "answer": "You arrive and check in at the venue, receive your score card, and have some time to mingle. The speed dating begins at 7pm — you''ll have 7-minute dates with each person, with short breaks in between for refreshments. After all the dates, there''s time for more mingling and drinks. The typical schedule is: 6:30pm Reception & Registration, 7:00-9:00pm Speed Dating, 9:00pm onwards Mingle and Drinks."},
          {"question": "What age groups do you cater to?", "answer": "We run events for various age groups: 20s, 30s, 40s, 50s, and 60s. Each event is clearly labeled with its age range. We carefully segment events to ensure the best possible experience for everyone."},
          {"question": "What event types do you offer?", "answer": "We offer several types of events: Jewish General (our most common), Singles, Traditional, Divorcees, Single Parents, Conservative, Virtual Events, Israeli, and Party/Mixer events. Each event type is clearly labeled so you can choose what suits you best."},
          {"question": "What should I wear?", "answer": "The dress code is smart casual. You want to look and feel your best! Our events are held at high-class venues with a nice vibe, so avoid overly casual clothing like sportswear."}
        ]
      },
      {
        "title": "Matching & Results",
        "questions": [
          {"question": "How do I submit my choices?", "answer": "After the event, log in to the website with your username and password (provided when you purchased your ticket). Select the event date, view the list of people you met, and choose ''Date'' or ''Friend'' for each person. You can also select which contact details to reveal — email, phone, or both."},
          {"question": "How do I get my match results?", "answer": "Log in to the website to view your matches. We recommend submitting your choices promptly and checking back multiple times. An email reminder is sent after 3 days if you haven''t submitted your choices. Final results are sent via email after 1 week."},
          {"question": "What does ''No match yet'' mean?", "answer": "It simply means the other person hasn''t entered their choices yet. Once they do, if you''ve both selected ''Date'' for each other, you''ll see the match and receive their contact details. Be patient — not everyone submits right away!"},
          {"question": "What if I can''t submit my choices online?", "answer": "You have several options: hand your completed score card to the hostess at the end of the event, email your choices to info@TheSpeedDating.co.uk, or call us at 0700 3401347."},
          {"question": "When will I find out my matches?", "answer": "Matches appear as soon as both people have submitted their choices. If the other person hasn''t submitted yet, you''ll see ''No match yet''. We send an email reminder after 3 days and final results after 1 week."}
        ]
      },
      {
        "title": "Practical Information",
        "questions": [
          {"question": "Do I need to book in advance?", "answer": "Yes! We accept advance bookings only to ensure the evening''s success. This allows us to balance the number of men and women and ensure the right age group mix. Book online or contact us to reserve your spot."},
          {"question": "Can I cancel my booking?", "answer": "Yes, you can cancel up to 48 hours before the event for a full refund. Cancellations made less than 48 hours before are non-refundable, though you may be able to transfer your ticket to another event (subject to availability)."},
          {"question": "Is this only for Jewish people?", "answer": "Our events are primarily designed for Jewish singles, and most participants are Jewish. However, we welcome people of all backgrounds who are interested in meeting Jewish partners and are respectful of Jewish culture and traditions. All our events are Jewish-focused."},
          {"question": "Where do you hold events?", "answer": "We hold events in London (primarily), Manchester, and Leeds in the UK, as well as Tel Aviv and Jerusalem in Israel. Our venues are high-class bars and restaurants with a nice vibe. People even travel from other European countries — Holland, Denmark, Belgium — to attend our London events!"},
          {"question": "What are the VIP benefits?", "answer": "VIP members enjoy discounted event tickets at a special price, we reveal who chose you at events you participated in, 15% off our matchmaking service, and access to special offers and promotions. VIP membership starts from just £6 per month."},
          {"question": "Why do so many people come to speed dating?", "answer": "You can meet many singles in one evening rather than spending months meeting people separately. The evening isn''t just about finding a date — it''s also about meeting new people, making friends, networking, and practicing your communication skills in a fun, relaxed atmosphere. With 120+ weddings to date, speed dating clearly works!"}
        ]
      }
    ]
  }'::jsonb
);

-- FAQ (IL) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published, page_type, content_json) VALUES (
  'faq',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'שאלות נפוצות',
  '<p>מצאו תשובות לשאלות הנפוצות ביותר על אירועי הדייט המהיר שלנו, תהליך ההתאמה ועוד.</p>',
  'שאלות נפוצות | The Speed Dating',
  'שאלות נפוצות על אירועי דייט מהיר, התאמות, הזמנות וחברות VIP.',
  true,
  'faq',
  '{
    "categories": [
      {
        "title": "About Speed Dating",
        "questions": [
          {"question": "What is speed dating?", "answer": "Speed dating is a fun and efficient way to meet multiple potential partners in one evening. You''ll have a series of short conversations with each person. For a modest fee, you meet around 12 professional Jewish singles in your age group at trendy venues."},
          {"question": "How does it work?", "answer": "Women stay seated while men rotate between tables when a bell signals the time change. Each conversation lasts about 5 minutes. You receive a score card and mark whether you''d like to meet each person again. If both people select each other, it''s a mutual match and contact details are revealed."},
          {"question": "What age groups do you cater to?", "answer": "We run events for various age groups: 20s, 30s, 40s, and 50s. Each event is clearly labeled with its age range."},
          {"question": "What should I wear?", "answer": "The dress code is smart casual. You want to look and feel your best!"}
        ]
      },
      {
        "title": "Matching & Results",
        "questions": [
          {"question": "How do I submit my choices?", "answer": "After the event, log in to the website and select the event date, view the list of people you met, and choose ''Date'' or ''Friend'' for each person."},
          {"question": "How do I get my match results?", "answer": "Log in to the website to view your matches. We recommend submitting your choices promptly. Final results are sent via email after 1 week."},
          {"question": "When will I find out my matches?", "answer": "Matches appear as soon as both people have submitted their choices. We send an email reminder after 3 days and final results after 1 week."}
        ]
      },
      {
        "title": "Practical Information",
        "questions": [
          {"question": "Do I need to book in advance?", "answer": "Yes! We accept advance bookings only to ensure the evening''s success."},
          {"question": "Where do you hold events?", "answer": "We hold events in Tel Aviv and Jerusalem. Our venues are trendy bars and restaurants."}
        ]
      }
    ]
  }'::jsonb
);

-- VIP (IL) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published) VALUES (
  'vip',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'הצטרפו לחברות VIP וקבלו הנחות!',
  '<h2>הצטרפו לחברות VIP וקבלו הנחות!</h2>
<ul>
<li>ערבי ספיד דייט בהנחה של 25%</li>
<li>הנחה של 15% לשירות השידוכים האישי</li>
<li>אנו מגלים לכם מי בחר בכם בערב הספיד דייט בו השתתפתם</li>
<li>ועוד הנחות מפתיעות</li>
</ul>
<p>הצטרפו למועדון החברים שלנו עוד היום!</p>',
  'הצטרפו לחברות VIP | The Speed Dating',
  'הצטרפו לחברות VIP וקבלו הנחות על ערבי ספיד דייט, שירותי שידוכים והטבות בלעדיות.',
  true
);

-- Contact (IL) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published, page_type, content_json) VALUES (
  'contact',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'צור קשר',
  '<p>נשמח לשמוע מכם! בין אם יש לכם שאלה על האירועים שלנו, צריכים עזרה עם החשבון, או רוצים לשתף משוב.</p>',
  'צור קשר | The Speed Dating',
  'צרו קשר עם The Speed Dating. שלחו לנו הודעה או מלאו את טופס יצירת הקשר.',
  true,
  'contact',
  '{
    "openingHours": [
      {"days": "Sunday - Thursday", "hours": "9:30 - 19:00"},
      {"days": "Friday", "hours": "9:30 - 14:00"},
      {"days": "Saturday", "hours": "Closed"}
    ],
    "phone": "03-1234567",
    "email": "info@TheSpeedDating.co.il"
  }'::jsonb
);

-- Home (IL) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published) VALUES (
  'home',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'ברוכים הבאים לספיד דייטינג',
  '<h2>ברוכים הבאים לספיד דייטינג ישראל</h2>
<p>ברוכים הבאים לאתר הישראלי של חברת הספיד דייטינג העולמית - ערבי ספיד דייט לאנשי קריירה ואקדמאים. <strong>חזרנו לערבי ספיד דייט בבתי הקפה!</strong></p>
<p>לחברה שלנו יש ניסיון של 17 שנים בארץ ובעולם וסניפים מצליחים באנגליה, ארצות הברית וצרפת. אנחנו גאים להיות אחראים ל-150 חתונות ואלפי דייטים ברחבי העולם, ומבטיחים להעניק לכם חוויה נינוחה ונעימה במהלך ערב שעשוי לשנות את חייכם.</p>
<p>כמו כן אנו מציעים שירות דייטינג אונליין באתר זיווגים ולמי שמחפש שירות שידוכים אנו מציעים שירות שידוכים אישי.</p>
<hr>
<h2>למה להגיע דווקא אלינו?</h2>
<p>המון אנשים מצלצלים אלינו בחשש - האם מתאים לי להגיע לערב כזה? אילו אנשים אפגוש? יש כאלה שהיו בערבי ספיד דייט אחרים (לא שלנו) והתאכזבו קשות.</p>
<p><strong>אנו מתחייבים בפניכם:</strong></p>
<ul>
<li>ערב נעים, איכותי מכל הבחינות ואסתטי</li>
<li>לא "שוק בשר" - אלא חם וחברותי עם אנשים שתרצו לפגוש</li>
<li>עד 14 משתתפים מכל מין - איכות ולא רק כמות</li>
<li>סינון מוקפד של המשתתפים - אקדמאים ואנשי קריירה בלבד</li>
</ul>
<hr>
<h2>איך זה עובד?</h2>
<p>כולנו אנשים עסוקים וקשה לנו להרחיב את מעגל ההיכרויות שלנו ולהכיר אנשים חדשים. ערב הספיד דייט מציע לכם אלטרנטיבה יעילה, מהנה ובטוחה להכיר אנשים איכותיים, בעלי תחומי עניין וגיל משותפים לכם.</p>
<p>תוכלו לדבר אחד על אחד ללא כל התחייבות מצידכם, וניתנת לכם האפשרות לומר "כן" ולהמשיך לפגישה נוספת או "לא" - מבלי לפגוע באף אחד מהאנשים איתם נפגשתם.</p>
<h3>היתרונות שלכם</h3>
<ul>
<li>להגדיל בבת אחת את כמות הדייטים הפוטנציאליים שלכם</li>
<li>להרחיב את מעגל ההיכרויות שלכם ולזכות גם בידידים חדשים</li>
<li>להכיר חבר חדש, עמית למקצוע או לשכלל את יכולות הנטוורקינג שלכם</li>
</ul>
<p><em>בערב הספיד דייט לכל מפגש יש פוטנציאל חיובי עבורכם!</em></p>',
  'ספיד דייט ישראל | The Speed Dating',
  'ערבי ספיד דייט לרווקים יהודים בתל אביב וירושלים. מעל 120 חתונות ברחבי העולם.',
  true
);

-- About Us (IL) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published) VALUES (
  'about-us',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'אודות',
  '<p>חברת הספיד דייטינג הוקמה על ידי מיכל בחודש מאי 2003 בלונדון כחברה המארגנת ערבי ספיד דייט ליהודים.</p>
<p>בשנתיים הראשונות התקיימו שני אירועי ספיד דייט בחודש לרווקים ורווקות יהודים בין הגילאים 20-40 אך עם הזמן הרחבנו את קבוצות הגיל. כיום מתקיימים בלונדון ערבי ספיד דייט פעמיים בשבוע לקבוצות גיל שונות בטווחי גילאים של 20-65. המקומות בהם מתקיימים ערבי הספיד דייט הם מקומות קלאסיים, אופנתיים וברמה גבוהה עם אוירה טובה וחברותית. מספטמבר 2006 אנו גם מארחים ערבים אלה בערים מנצ''סטר ולידס</p>
<p>בינואר 2009 נפתח סניף ספיד דייט ישראל בתל אביב, סניף ספיד דייט ירושלים נפתח באוגוסט 2011 וסניף ספיד דייט חיפה באוקטובר 2011. אנו מקיימים כ 8 ערבי ספיד דייט בכל חודש לקבוצות גיל של 22-55</p>
<p>בחודש מאי 2009 נפתח סניף ניו יורק - אנו מקיימים בין 4-6 ערבי ספיד דייט בחודש לגילאי 22-60</p>
<p>סניף פריס נפתח בחודש פברואר 2011</p>
<p>ב 2006 הוספנו את שירות השידוכים האישי שלנו הנקרא Jewish Matches. במסגרת שירות זה אנו משדכים על פי הצרכים והתכונות של כל לקוח. שרות השידוכים שלנו מספק ללקוחותינו גישה לקהל רחב יותר של אנשים המגיעים מדי חודש לערבי הספיד דייט שלנו כמו גם לאלה המצטרפים לשירות זה. מיוני 2010 אנו מציעים שירות זה גם בניו יורק ובישראל החל משנת 2011.</p>
<blockquote>
<p>"הגענו למיכל עם שאיפות וצפיות ענקיות כי שמענו על ההצלחות שלה...
אבל הן היו כאין וכאפס לעומת מה שגילינו עליה בהמשך.
היא אשת אשכולות, עם ראיה וזווית חדה ורחבה, הרואה לעומקן את כל תכונות האופי.
יש לה יכולות שרק למעטים יש. יש לה את היכולת לאבחן אנשים, ולראות הרבה מעבר לכיסוי החיצוני
וכך גם לדעת מי מתאים למי, ובמדויק.
אלוהים חנן אותה בתכונות ייחודיות ורבות ...
ולכן, (על פי המקורות) שמור מקומה, (לאחר 120,) בגן עדן !!
אנו מאחלים לך המשך עבודה מוצלח, בה יזכו להקים זוגות רבים ונוספים לעמוד מתחת לחופה.
עבודתך, היא עבודת קודש...
ישר כוח....
ללא היכרותנו אותך, שירן הייתה ממשיכה לתור אחר בן זוג.
בברכת חג שמח"</p>
</blockquote>
<p>משנת 2003 אנו גאים בלפחות 120 חתונות (שידועות לנו) הרבה זוגות שמקיימים מערכות יחסים רציניות ואנשים שמצאו חברים חדשים כולם הכירו בערבי הספיד דייט.</p>
<p>יש לנו לקוחות שמגיעים מארצות אחרות באירופה במיוחד לערבי הספיד דייט שלנו בלונדון- מהולנד, בלגיה, שוויץ ואף מאיטליה.</p>
<p>שירות הספיד דייט שאנו מספקים מציע פתרון נהדר המחבר בין פנויים ופנויות יהודים ברחבי העולם וגם בישראל.</p>',
  'אודות | The Speed Dating',
  'חברת הספיד דייטינג הוקמה בלונדון ב-2003 ומארגנת ערבי ספיד דייט ליהודים ברחבי העולם.',
  true
);

-- Success Stories (IL) — new page (testimonies live in success_stories table)
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published, page_type) VALUES (
  'success-stories',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'סיפורי הצלחה',
  '<p>אנו גאים להציג כאן מעט מסיפורי ההצלחה שלנו: 120 חתונות ברחבי העולם – ההוכחה לכך ששיטת הספיד דייטינג עובדת היטב!</p>
<p>כמה דוגמאות מתודות שקיבלנו מזוגות שהתחתנו דרכנו:</p>',
  'סיפורי הצלחה | The Speed Dating',
  '120 חתונות ברחבי העולם! קראו סיפורי אהבה אמיתיים מזוגות שהכירו דרך ערבי הספיד דייט שלנו.',
  true,
  'testimony'
);

-- Matchmaking (IL) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published) VALUES (
  'matchmaking',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'שירות שידוכים',
  '<h2>מהו שירות השידוכים?</h2>
<p>אנשי קריירה רבים מרגישים כמה קשה לפנות זמן על מנת להכיר את המיועד או המיועדת. אנו מציעים שירות שידוכים (באיזור המרכז בלבד) מיוחד זה על מנת לחסוך לך זמן בדרך להיכרות עם האדם המתאים.</p>
<p>שירות זה קיים משנת 2006 באנגליה וארה"ב כשירות משלים לערבי הספיד דייט שאנו מארגנים</p>
<p>המון פעמים אנו רואים בערבי הספיד דייט אנשים אשר עשויים להתאים אחד לשני אך הם פשוט לא נרשמו לאותו הערב! כך שלא יצא להם להפגש. הרצון להפגיש בין אנשים המתאימים אחד לשני הוליד את הרעיון לשירות השידוכים שלנו.</p>
<p>יש לנו 10 שנים של נסיון באירוח ערבי ספיד דייט בארץ ובעולם עם לפחות 74 חתונות והרבה זוגות אשר יוצאים אחד עם השני</p>
<p>הניסיון שלנו לימד אותנו לזהות מהו האלמנט אשר מחבר בין אנשים שונים. יש לנו מאגר של יותר מ 3000 פנויים ופנויות (בכל הגילאים) אשר מחפשים להכיר את המיועד או המיועדת.</p>
<h2>כיצד השירות עובד?</h2>
<p>אנו נבקש ממך למלא את השאלון ולשלוח לנו את השאלון חזרה באימייל - כל פרטיך האישיים נשארים חסויים</p>
<p>נא לשלוח את השאלון שמלאת ל michal@thespeeddating.co.il</p>
<p>לאחר מכן אנו ניצור עמך קשר טלפוני ונתאם פגישה של כחצי שעה על מנת שנוכל להכירך טוב יותר</p>
<p>במהלך הפגישה נשאל אותך שאלות נוספות עליך ועל מי שאת/ה מחפש/ת.</p>
<p>עם השלמת ההרשמה נתחיל לחפש לך מועמד או מועמדת מתאימים וניצור קשר לתאום הדייט הראשון שלך!</p>
<h2>לקוחות מרוצים כותבים:</h2>
<blockquote><p>"הגענו למיכל עם שאיפות וצפיות ענקיות כי שמענו על ההצלחות שלה...
אבל הן היו כאין וכאפס לעומת מה שגילינו עליה בהמשך.
היא אשת אשכולות, עם ראיה וזווית חדה ורחבה, הרואה לעומקן את כל תכונות האופי.
יש לה יכולות שרק למעטים יש. יש לה את היכולת לאבחן אנשים, ולראות הרבה מעבר לכיסוי החיצוני
וכך גם לדעת מי מתאים למי, ובמדויק."</p></blockquote>
<blockquote><p>"אני מתחתנת עם אהוב ליבי שפגשתי דרכך, מיכל! אין לי מילים לתאר כמה אני מאושרת! המלצתי עלייך לכל חברותיי!!" שירה, תל אביב</p></blockquote>
<blockquote><p>"מאוד התרשמתי מהשירות שלכם! זו הפעם הראשונה שאני מנסה סוג כזה של שירות - זה ממש פקח את עיניי לאפשרות הזו - תודה רבה!" נורית, ראשון לציון</p></blockquote>
<blockquote><p>"השירות מעולה ודרך מצויינת להכיר אנשים איכותיים. אני ממש אסירת תודה שעשיתי את הצעד הזה. אני עומדת להתחתן עם מישהו מקסים - אני מרגישה שזכיתי בגדול! לא הייתי מגיעה לכך בלעדי העזרה מכם - תודה!" אמיר, רמת גן</p></blockquote>
<blockquote><p>"דרך שירות השידוכים שלכם מצאתי את אשת חלומותי!!" שלמה, תל אביב</p></blockquote>
<blockquote><p>"התחלתי לצאת עם מישהו דרך שירות השידוכים שלכם - אז תודה רבה!! אני מאושרת!" קרן, גבעתיים</p></blockquote>
<blockquote><p>"רק רציתי ליידע אתכם שאחרי שפגשתי 7 גברים דרך שירות השידוכים שלכם התארסתי לאחרונה עם אחד מהם. תודה רבה!" נעמי, תל אביב</p></blockquote>
<p>ניתן לפנות לטלפון 052-8809879 לפרטים נוספים</p>',
  'שירות שידוכים | The Speed Dating',
  'שירות שידוכים אישי ליהודים. ניסיון של למעלה מ-10 שנים עם עשרות חתונות.',
  true
);

-- Virtual Events (IL) — new page
INSERT INTO pages (page_key, country_id, language_code, title, content_html, meta_title, meta_description, is_published) VALUES (
  'virtual-events',
  (SELECT id FROM countries WHERE code = 'il'),
  'he',
  'אירועים וירטואליים',
  '<p>אנו מארגנים אירועים וירטואליים באמצעות ZOOM בעקבות המצב הנוכחי המונע מכולנו לצאת ולהפגש, בואו נפגש פנים אל פנים אונליין!</p>
<p>אנא בקרו בעמוד האירועים שלנו והזמינו לעצמכם מקום בערב הקרוב!</p>
<p>מאחלים בריאות לכולם!</p>',
  'אירועים וירטואליים | The Speed Dating',
  'אירועי ספיד דייט וירטואליים באמצעות ZOOM. בואו נפגש פנים אל פנים אונליין!',
  true
);

-- Update existing IL/he dating-tips with correct HebrewText.md content
UPDATE pages SET
  title = 'טיפים',
  content_html = '<h2>טיפים כללים:</h2>
<ul>
<li>לבוש: כדאי להגיע בלבוש לא רשמי מדי, אבל כזה שגורם לכם להרגיש בו נוח ושאתם יודעים שאתם נראים בו אטרקטיביים. ג''ינס עם חולצה יפה עובד מצוין.</li>
<li>נסו לדבר ולהקשיב באופן שווה.</li>
<li>היו קלילים. אל תגררו לשיחות מדכאות על מערכות יחסים ובעיקר לא על מערכות יחסים מן העבר שלכם. אל תדברו על פוליטיקה!</li>
<li>נושאים טובים לשיחה: מוזיקה, סרטים, טיולים, חברים, אוכל, תחביבים, דברים שיש לכם תשוקה אליהם ואתם אוהבים במיוחד.</li>
<li>היו יצירתיים. נסו שלא לשאול בכל פעם את אותן השאלות כמו "מה אתה עושה", איפה אתה גר", "בן כמה אתה" וכד''.</li>
<li>אל תעירו הערות על מי שהכרתם לפני רגע בשולחן הקודם.</li>
<li>השתמשו בשם של מי שיושב מולכם.</li>
<li>אל תענו לטלפונים!!</li>
</ul>
<h2>טיפים לנשים:</h2>
<ul>
<li>שמרי על ראש פתוח וגם על שפת גוף פתוחה ואל תשבי בידיים משולבות. שמרי תמיד על קשר עין ואל תורידי את מבטך כלפי מטה. והכי חשוב- חייכי</li>
<li>היי את עצמך השתדלי להיות נינוחה ופתוחה.</li>
<li>לבשי משהו שגורם לך להרגיש נוח עם עצמך, ומאפשר לך להרגיש מושכת ובטוחה</li>
</ul>
<h2>טיפים לגברים:</h2>
<ul>
<li>אל תהיה גס רוח ואל תעיר הערות שעשויות להתפרש כהצעות מגונות. התנהג בג''נטלמניות.</li>
<li>אם אתה נשען קדימה זה אומר שיש לך עניין ושאתה שם לב.</li>
<li>השתדל להיות נינוח מחוייך ופתוח</li>
<li>הומור בטעם מתקבל תמיד בברכה, נשים אוהבות שמצחיקים אותן!</li>
</ul>',
  meta_title = 'טיפים | The Speed Dating',
  meta_description = 'טיפים להכנה לערב ספיד דייט - טיפים לנשים וגברים.'
WHERE page_key = 'dating-tips' AND country_id = (SELECT id FROM countries WHERE code = 'il');

-- Update existing IL/he what-is-speed-dating with correct HebrewText.md content
UPDATE pages SET
  title = 'מה זה ספיד דייט',
  content_html = '<h2>מה זה ספיד דייט</h2>
<p>יד על הלב- כמה פעמים קרה לכם שיצאתם לדייט לא מוצלח?</p>
<p>קיבלתם טלפון של מישהו, אתם נורא עסוקים וכבר אין לכם כוח לעוד בליינד דייט ולא ממש התחשק לכם אבל... דיברתם קצת בטלפון והחלטתם להיפגש. התלבשתם, התאפרתם, חיפשתם אותו טוב טוב בגוגל, הרצתם בראש נושאים לשיחות (ונשבעתם לעצמכם שלא תדברו על האקס), הכרחתם את עצמכם לחשוב חיובי ובסוף... הגעתם והבנתם אחרי 2 דקות שעדיף היה להישאר בבית. רק בגלל שאתם אנשים מנומסים ומחונכים אתם מכריחים את עצמכם לגמור את הקפה.</p>
<p>זה קורה להרבה מאד אנשים ברחבי העולם. זה אולי ישמע לכם מוזר, אבל רושם ראשוני נוצר תוך 30 שניות בלבד (!). 6 הדקות שיבואו אחר כך רק מחזקות את הרושם הראשוני שלכם. וזה בעצם כל הרעיון של ספיד דייטינג – 7 דקות! למה לכם לבזבז ערב שלם בניסיון להקשיב ולתקשר עם מישהו שכלל אינכם רוצים להכיר? בערב הספיד דייטינג אתם יכולים לבלות 7 דקות עם כ 10 פרטנרים פוטנציאלים. תוכלו להחליט את מי מהם תרצו לפגוש שוב לדייט ארוך ואמיתי או אולי סתם להכיר ידיד חדש. וזה לא סתם רעיון מהזמן האחרון - הספיד דייטינג נולד באמריקה לפני כ 10 שנים ומאז הפורמט הזה מצליח בכל העולם.</p>
<h2>כיצד ספיד דייט עובד</h2>
<p>הרעיון גאוני בפשטותו: תמורת סכום כסף קטן יחסית תוכלו לפגוש עד 10 פרטנרים פוטנציאליים בקבוצת הגיל שלכם. האירוע נערך בבארים או בתי קפה נעימים ברחבי הארץ, בהתאם למקום מגוריכם. עם הגעתכם לאירוע תתקבלו על ידי המארח/ת שלנו ותקבלו כרטיס בחירה ועט. בזמן שכולם מגיעים לאירוע יעמוד לרשותכם זמן להתרגל לאווירה, לשוחח עם אנשים שונים ולשתות משקה כלשהו. אנו נראה לך היכן לשבת לפני שנתחיל.</p>
<p>הישיבה באירוע נעשית סביב שולחנות באופן המאפשר פרטיות בשיחה. הבנות מתיישבות על יד השולחן, כל אחת בשולחן שלה. עם צלצול הפעמון הראשון יש לכם 7 דקות של "מיני-דייט" עם האדם שמולכם. בתום 7 הדקות ישמע צלצול הפעמון ויסמן לגברים לעבור לשולחן הבא ולפגוש את הבחורה הבאה.</p>
<p>זה הרגע בו תוכלו לסמן לעצמכם בכרטיס הבחירה האם תרצו לפגוש אדם זה שוב כ"דייט" או כ"ידיד/ה". בתום 7 הדקות הבאות ישמע שוב צלצול הפעמון- אז תמשיכו לדייט הבא וכן הלאה.</p>
<p>הפסקה תינתן בשלב מסוים על מנת לאפשר לכם להתרענן. בסוף המפגש כולם מוזמנים להישאר, להזמין משקה וליהנות מהמשך הערב.</p>
<h2>כניסה לאתר</h2>
<p>כשאתם רוכשים כרטיס לאירוע, תתבקשו למלא פרטים על עצמכם ועבורכם - פרטים אלה נשמרים חסויים. אנו נשלח לך באמייל את שם המשתמש והסיסמא. מומלץ לשמור פרטים אלה כדי להיכנס לאתר בתום האירוע ולסמן את בחירותיכם.</p>
<p>בדף הבית שלכם תוכלו למצוא את רשימת האנשים שפגשתם באירוע עם אפשרות סימון בחירה של "דייט" או "ידידות".</p>
<p>אם השתתפתם ביותר מאירוע אחד תוכלו לראות את הפרטים של האירועים הקודמים בהם השתתפתם.</p>
<p>בעמוד הפרופיל תוכלו לשנות ולעדכן את פרטיכם.</p>
<h2>שכחתי סיסמא</h2>
<p>אנא לחצו על שכחתי סיסמא בעמוד הבית ונשלח לכם אימייל תזכורת לכתובת האימייל עמה נרשמתם.</p>
<h2>כיצד מקבלים את התוצאות</h2>
<ul>
<li>אנא היכנסו לאתר עם שם המשתמש והסיסמה אותה קיבלתם כשרכשתם את הכרטיס.</li>
<li>אנו ממליצים לעדכן את בחירתכם כמה שיותר מוקדם.</li>
<li>יש באפשרותכם לבחור לראות שוב את מי שפגשתם באירוע כדייט או כידידים או לבחור בשתי האפשרויות על ידי סימון V ליד שמם.</li>
<li>ניתן לסמן מישהו/י כדייט וכידיד/ה.</li>
<li>אם סימנתם מישהו והם סימנו אתכם בחזרה – תקבלו אם פרטי ההתקשרות של אותו אדם.</li>
<li>כתובת האימייל שלכם תנתן למי שבחרתם במידה שהבחירה היא הדדית.</li>
<li>יש באפשרותכם לחשוף גם את מספר הטלפון שלכם. אנא סמנו V לצד המילה "גלה" - פרטיכם יחשפו לאלה שעימם יש לכם התאמה הדדית. (שניכם סימנתם אחד את השני כדייט ו/או כידידים).</li>
<li>בכל פעם שתיווצר התאמת דייט או ידידות תקבלו אימייל המודיע לכם על כך</li>
<li>יש באפשרותכם להיכנס לאתר בכל עת כדי לעדכן ולבדוק עדכונים.</li>
<li>תוכלו לראות את פרטי האימייל ו/או הטלפון של האנשים עמם הייתה לך התאמה כדייט ו/או כידיד/ה.</li>
<li>במקרה שאני סימנתי מישהו/י כדייט והם סימנו אותי כידיד/ה (או להיפך) התוצאה תהיה התאמה כידידים.</li>
</ul>
<h2>למה דווקא ספיד דייט</h2>
<ul>
<li>בערב אחד ניתנת לך הזדמנות לפגוש 20 גברים ונשים (כ 10 מכל מין) בבת אחת. אם היית מנסה לפגוש כל אחד/ת בנפרד זה היה לוקח לך חודשיים-שלושה וגם עולה לך לא מעט כסף!</li>
<li>תכלס! מי שמגיע לערב הספיד דייטינג רוצה באמת להכיר בן זוג ולקחת את העניינים לידיים, במקום לשבת בבית בפיג''מה ולצ''וטט מבלי באמת לעשות שום דבר..</li>
<li>זהו אינו דייט אלא מיני-דייט. רק אם יש לכם עניין באדם השני תוכלו להמשיך לדייט רגיל. המפגש קצר ותכליתי אך האווירה נעימה, ותוך רגעים ספורים תוכלו להבין אם יש ביניכם כימיה, משיכה ועניין ואם תרצו לפגוש את האדם שמולכם פעם נוספת.</li>
<li>אין מבוכה של "אחרי" כמו בדייט רגיל. אם מישהו לא מצא חן בעינכם לא תצטרכו להתנצל בטלפון, להסביר את עצמכם או להתחמק... רק אם שניכם מעוניינים זה בזה תוכלו ליצור קשר.</li>
</ul>
<p>אף פעם אי אפשר לדעת לאן יובילו המפגשים בערב הספיד דייטינג. גם אם לא תמצאו את בן-הזוג שלכם אתם עשויים להכיר חבר טוב, עמית חדש למקצוע, הזדמנות עסקית מעניינת או אפילו את מי שיכיר לכם את בן הזוג העתידי שלכם. מה שחשוב הוא להגדיל את מעגל החברים והמכרים שלכם ולכן כדאי להגיע תמיד עם ראש פתוח ואנרגיות חיוביות</p>
<h2>טיפים</h2>
<ul>
<li>לבוש: כדאי להגיע בלבוש לא רשמי מדי, אבל כזה שגורם לכם להרגיש בו נוח ושאתם יודעים שאתם נראים בו אטרקטיביים. ג''ינס עם חולצה יפה עובד מצוין.</li>
<li>נסו לדבר ולהקשיב באופן שווה.</li>
<li>היו קלילים. אל תגררו לשיחות מדכאות על מערכות יחסים ובעיקר לא על מערכות יחסים מן העבר שלכם. אל תדברו על פוליטיקה!</li>
<li>נושאים טובים לשיחה: מוזיקה, סרטים, טיולים, חברים, אוכל, תחביבים, דברים שיש לכם תשוקה אליהם ואתם אוהבים במיוחד.</li>
<li>היו יצירתיים. נסו שלא לשאול בכל פעם את אותן השאלות כמו "מה אתה עושה", איפה אתה גר", "בן כמה אתה" וכד''.</li>
<li>אל תעירו הערות על מי שהכרתם לפני רגע בשולחן הקודם.</li>
<li>השתמשו בשם של מי שיושב מולכם.</li>
<li>אל תענו לטלפונים!!</li>
</ul>',
  meta_title = 'מה זה ספיד דייט | The Speed Dating',
  meta_description = 'מה זה ספיד דייט וכיצד הוא עובד. כל מה שצריך לדעת לפני ערב הספיד דייט הראשון שלכם.'
WHERE page_key = 'what-is-speed-dating' AND country_id = (SELECT id FROM countries WHERE code = 'il');

-- Matchmaking Packages
insert into matchmaking_packages (name, country_id, num_dates, duration_months, price, currency, is_active) values
  ('3 Months membership including 5 dates', (select id from countries where code = 'gb'), 5, 3, 700, 'GBP', true),
  ('6 Months membership including 10 dates', (select id from countries where code = 'gb'), 10, 6, 950, 'GBP', true),
  ('1 Year membership including 20 dates', (select id from countries where code = 'gb'), 20, 12, 1450, 'GBP', true),
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

-- ===========================================
-- Success Stories
-- ===========================================
insert into success_stories (couple_names, quote, year, location, story_type, is_featured, is_active, sort_order, country_id) values
(
  'Howard B & Louise J',
  'Louise J and I met at your event in Swiss Cottage at the Establishment and our Wedding is on the 5th December 2004! I think the Speed Dating method is very effective because you can meet a lot of people in one evening and you''re likely to hit it off with someone. So did we, and we would like to thank you very much for that!',
  'December 2004',
  'London',
  'wedding',
  true,
  true,
  1,
  (select id from countries where code = 'gb')
),
(
  'R & Wife',
  'Hi TheSpeedDating, just wanted to thank you - you have over achieved! My wife and I met at your event on August 2005 and we are now expecting our first baby in June!',
  'Feb 2008',
  'London',
  'wedding',
  true,
  true,
  2,
  (select id from countries where code = 'gb')
),
(
  'Amir & Lara',
  'Well done, I can''t think of anything I would like to see changed. The organisers were all very friendly and a good laugh. The venue was centrally located and cosy. I have met Lara that night and we are dating since! What a great way of meeting your one!',
  NULL,
  'London',
  'dating',
  true,
  true,
  3,
  (select id from countries where code = 'gb')
),
(
  'Sarah Y & Gary P',
  'Sarah Y. and Gary P. got married. They met at the e bar on Feb 2006.',
  'March 2008',
  'London',
  'wedding',
  false,
  true,
  4,
  (select id from countries where code = 'gb')
),
(
  'Barry B & Alison R',
  'Barry B and Alison R. met in Oct 2006 at the e bar - got married Feb 2008!',
  'Feb 2008',
  'London',
  'wedding',
  false,
  true,
  5,
  (select id from countries where code = 'gb')
),
(
  'Valda Brill & Stuart Harris',
  'We thought that we would drop you a line to let you know that we recently got married. Our photo is in the JC this week. It all started when we met at one of your speed dating events so thank you! Best wishes.',
  'December 2008',
  'London',
  'wedding',
  true,
  true,
  6,
  (select id from countries where code = 'gb')
),
(
  'Ben',
  'I came to your event and since then myself and the lovely girl I met are spending each evening so cosy on the sofa. Thank you very much, now I know this was the best decision I made so far - coming to your event!',
  'March 2010',
  'NYC',
  'dating',
  false,
  true,
  7,
  (select id from countries where code = 'gb')
),
(
  'Shiran & Nitsan',
  'Shiran and Nitsan Wedding - Tel Aviv November 2012.',
  'November 2012',
  'Tel Aviv',
  'wedding',
  true,
  true,
  8,
  (select id from countries where code = 'gb')
),
(
  'Ehud & Wife',
  'Hi Michal, Just wanted to let you know that my husband, Ehud, and I met at one of the speed dating events May 1, 2011 at bar luna on the upper west side. He proposed one year later at slightly Oliver (which was where bar luna was). We now live together on the uws with our 2 month old daughter, Ella. We thank you so much for having this event!',
  'March 2014',
  'NYC',
  'wedding',
  true,
  true,
  9,
  (select id from countries where code = 'gb')
),
(
  'S',
  'Dear Speed Dating Team, Many thanks for the enjoyable evening...it was great fun and nicely organised...very nice/cosy venue too!...I have entered my results for the event now, Wish me Luck!',
  'Jan 2012',
  NULL,
  'testimonial',
  false,
  true,
  10,
  (select id from countries where code = 'gb')
),
(
  'A',
  'Thanks for a brilliant night out - an excellent choice of venue as well, one of my favorite bars! There seemed to be a never-ending stream of men! Everyone was so nice.',
  'Jan 2012',
  NULL,
  'testimonial',
  false,
  true,
  11,
  (select id from countries where code = 'gb')
),
(
  'Lilah',
  'I just wanted to say thank you for yesterday. I was feeling very ambivalent about coming last night but I''m so glad that I did. I thoroughly enjoyed meeting all the guys, and the hostess was utterly lovely, setting a relaxed, light-hearted and professional mood. I particularly enjoyed the setting, which was so brilliantly resonant. A brilliant night. Thank you!',
  'August 2011',
  'London',
  'testimonial',
  false,
  true,
  12,
  (select id from countries where code = 'gb')
),
(
  'Jeremy',
  'I wanted to drop you a note to let you know I was very impressed with how well organized your event was last Sunday (5/31). While at first I was caught off guard by having my photo taken, I certainly saw the value of it when it came time to entering matches. It''s especially helpful if you were on the fence about someone and wanted to get a refresher of what they looked like. I am planning to attend more of your events in the future.',
  'June 2011',
  'NYC',
  'testimonial',
  false,
  true,
  13,
  (select id from countries where code = 'gb')
),
(
  'Jacob',
  'Hi Michal, I was actually in your last event and met somebody there, so I''ll see how this goes before coming again. Thank you, I''ll surely refer friends to your events.',
  'June 2009',
  'NYC',
  'testimonial',
  false,
  true,
  14,
  (select id from countries where code = 'gb')
),
(
  'Marc',
  'Thanks for the great speed dating evening it was lots of fun, I have 4 new friends now. I may have to come back for another speed dating event!',
  'Dec 2008',
  NULL,
  'testimonial',
  false,
  true,
  15,
  (select id from countries where code = 'gb')
),
(
  'Anonymous',
  'Just wanted to extend a big thank you for holding the Valentines Day speed dating event at the e-bar. I met the perfect girl who''s kind, smart, funny and beautiful and I''m about to go on my third date with her. I hope everyone who attends your events will be as lucky as I have been :)',
  'February 2007',
  'London',
  'dating',
  false,
  true,
  16,
  (select id from countries where code = 'gb')
),
(
  'Anonymous',
  'I attended your event at the e-bar last night (11th Aug). Congratulations on another excellent night!',
  'August 2006',
  'London',
  'testimonial',
  false,
  true,
  17,
  (select id from countries where code = 'gb')
),
(
  'A.E.',
  'Just wanted to say that I had a wonderful time on Sunday evening. The whole event was very professional and well organised. I would definitely come again and would recommend this type of function to my single friends. You are delivering a much needed service in a good atmosphere and environment. Thank you.',
  'May 2006',
  'London',
  'testimonial',
  false,
  true,
  18,
  (select id from countries where code = 'gb')
),
(
  'A',
  'Just wanted to compliment you for a highly enjoyable evening, with so many nice people! Had a great time, the night was professionally orchestrated and once there, forgot all my worries about coming on my own to Speed Dating.',
  'May 2006',
  'London',
  'testimonial',
  false,
  true,
  19,
  (select id from countries where code = 'gb')
),
(
  'R',
  'Met my current girlfriend at your event at Mojama in August 05, really happy I decided to go. Thanks very much!!',
  'April 2006',
  'London',
  'dating',
  false,
  true,
  20,
  (select id from countries where code = 'gb')
);

-- Success Stories (Israel)
insert into success_stories (couple_names, quote, year, location, story_type, is_featured, is_active, sort_order, country_id) values
(
  'הווארד ב. ולואיז',
  'לואיז ואני נפגשנו בערב הספיד דייט שלכם בסוויס קוטג'' בלונדון והחתונה שלנו תערך ב 5.12.2004! אני חושב ששיטת הספיד דייטינג עובדת נפלא וביעילות כי אתה פוגש הרבה אנשים בערב אחד וכך מגדיל את הסיכוי שלך להצליח עם מישהי. כך קרה לנו ואנו רוצים להודות לכם מקרב הלב!',
  'דצמבר 2004',
  'לונדון',
  'wedding',
  true,
  true,
  1,
  (select id from countries where code = 'il')
),
(
  'ח.',
  'מיכל תודה לך, אני כבר לא פנויה! בזכותך פגשתי את בן זוגי בספידייט שארגנת לפני חודשיים. לכן שמחה לעדכן שאני תפושה ולא פנויה להכיר אחרים :)',
  '2019',
  NULL,
  'dating',
  true,
  true,
  2,
  (select id from countries where code = 'il')
),
(
  'אמיר ודנה',
  'כל הכבוד, אני לא חושב שהייתי משנה משהו. המארגנים היו נחמדים מאוד וכל הערב היה מהנה. המקום היה נעים ואינטימי וממוקם באזור מרכזי. פגשתי את דנה באותו הערב ואנחנו יוצאים מאז. איזו דרך מעולה לפגוש את האחת שלי!',
  NULL,
  'תל אביב',
  'dating',
  true,
  true,
  3,
  (select id from countries where code = 'il')
),
(
  'בן',
  'הגעתי לערב שלכם ומאז אני והבחורה המקסימה שפגשתי מבלים כל ערב בבית באינטימיות על הספה. תודה רבה, אני יודע שלבוא לערב שלכם היתה ההחלטה הטובה ביותר שעשיתי עד כה בחיים!',
  'מרץ 2011',
  'ניו יורק',
  'dating',
  false,
  true,
  4,
  (select id from countries where code = 'il')
),
(
  'ר. ואשתו',
  'שלום לחברת הספיד דייטינג – רק רציתי להודות לכם – אתם הצלחתם מעבר למשוער! אשתי ואני נפגשנו בערב שלכם באוגוסט 2005 ואנו מצפים כעת לתינוקת הראשונה שלנו ביוני!',
  '2008',
  'לונדון',
  'wedding',
  true,
  true,
  5,
  (select id from countries where code = 'il')
),
(
  'אמא של שירן',
  'הגענו למיכל עם שאיפות וצפיות ענקיות כי שמענו על ההצלחות שלה... אבל הן היו כאין וכאפס לעומת מה שגילינו עליה בהמשך. היא אשת אשכולות, עם ראיה וזווית חדה ורחבה, הרואה לעומקן את כל תכונות האופי. יש לה יכולות שרק למעטים יש. יש לה את היכולת לאבחן אנשים, ולראות הרבה מעבר לכיסוי החיצוני וכך גם לדעת מי מתאים למי, ובמדויק.',
  'נובמבר 2012',
  'תל אביב',
  'wedding',
  true,
  true,
  6,
  (select id from countries where code = 'il')
),
(
  'רני',
  'רציתי להודות לכם על ערב מהנה ביותר, הארגון היה מקצועי – עוד לפני הערב, במהלכו ולאחריו! מאוד הופתעתי לטובה ואמרתי לחבר עמו הגעתי איך אתם מציעים שירות כל כך טוב. שנינו נהנינו מאוד, היו אנשים ברמה גבוהה, המקום היה אינטימי וביתי, הערב היה מאורגן למופת, היה שווה להגיע!',
  'דצמבר 2011',
  'תל אביב',
  'testimonial',
  false,
  true,
  7,
  (select id from countries where code = 'il')
),
(
  'יעל',
  'הי! רוצה להחמיא לכם ולמיכל על ערב מעולה! אני הולכת לספר לכל חברי וחברותיי – היתה אוירה כל כך טובה, אנשים יפים הרגשה לא מנוכרת – פשוט חוויה!',
  'דצמבר 2011',
  'תל אביב',
  'testimonial',
  false,
  true,
  8,
  (select id from countries where code = 'il')
),
(
  'אורית',
  'לחברת הספיד דייט: תודה על ערב מקסים עם קהל איכותי ויפה! היתה לי התאמה עם כמה בחורים והתחלתי לצאת עם אחד מהם, תודה רבה!!',
  'דצמבר 2011',
  'חיפה',
  'dating',
  false,
  true,
  9,
  (select id from countries where code = 'il')
),
(
  'יעקב',
  'הי מיכל, השתתפתי בערב האחרון שארגנתם ופגשתי שם מישהי! אני אראה איך הדברים זורמים לפני שאבוא שוב. תודה רבה אני בהחלט אמליץ לחברים להגיע לערבי הספיד דייט שלכם',
  'דצמבר 2008',
  'תל אביב',
  'dating',
  false,
  true,
  10,
  (select id from countries where code = 'il')
),
(
  'דני',
  'רק רציתי להעביר את תודתי הענקית לך ולצוות על ארגון ערב הספיד דייט בוולנטיין דיי, פגשתי את האשה המושלמת – היא חכמה, מקסימה, מצחיקה ויפה! אני עומד לפגוש אותה לדייט שלישי. אני מקווה שכל מי שישתתף בערבי הספיד דייט שלכם יהיה בר מזל כמוני!',
  'פברואר 2007',
  'לונדון',
  'dating',
  false,
  true,
  11,
  (select id from countries where code = 'il')
),
(
  'ר.',
  'פגשתי את החברה שלי בערב בהמפסטד באוגוסט 2005 אני שמח שהחלטתי ללכת, תודה רבה!!',
  'אפריל 2006',
  'לונדון',
  'dating',
  false,
  true,
  12,
  (select id from countries where code = 'il')
);

-- Set language_code for success stories based on country
update success_stories set language_code = 'he'
where country_id = (select id from countries where code = 'il');

-- ===========================================
-- VIP Plans, Benefits & Settings
-- ===========================================

-- GB Plans
INSERT INTO vip_plans (country_id, months, price_per_month, total_price, currency, badge, sort_order) VALUES
  ((SELECT id FROM countries WHERE code = 'gb'), 1, 18, 18, 'GBP', NULL, 0),
  ((SELECT id FROM countries WHERE code = 'gb'), 3, 12, 36, 'GBP', 'popular', 1),
  ((SELECT id FROM countries WHERE code = 'gb'), 6, 8, 48, 'GBP', NULL, 2),
  ((SELECT id FROM countries WHERE code = 'gb'), 12, 6, 72, 'GBP', 'best_value', 3);

-- IL Plans
INSERT INTO vip_plans (country_id, months, price_per_month, total_price, currency, badge, sort_order) VALUES
  ((SELECT id FROM countries WHERE code = 'il'), 1, 69, 69, 'ILS', NULL, 0),
  ((SELECT id FROM countries WHERE code = 'il'), 3, 45, 135, 'ILS', 'popular', 1),
  ((SELECT id FROM countries WHERE code = 'il'), 6, 30, 180, 'ILS', NULL, 2),
  ((SELECT id FROM countries WHERE code = 'il'), 12, 22, 264, 'ILS', 'best_value', 3);

-- Benefits (English) — shared across all countries
INSERT INTO vip_benefits (country_id, icon, title, description, sort_order, language_code) VALUES
  ((SELECT id FROM countries WHERE code = 'gb'), 'Percent', 'Discounted Event Tickets', 'Speed Dating event tickets at a special price', 0, 'en'),
  ((SELECT id FROM countries WHERE code = 'gb'), 'Heart', '15% Off Matchmaking', '15% off our Match-Making service', 1, 'en'),
  ((SELECT id FROM countries WHERE code = 'gb'), 'Eye', 'See Who Chose You', 'We reveal to you who chose you at the Speed Dating event you participated', 2, 'en'),
  ((SELECT id FROM countries WHERE code = 'gb'), 'Gift', 'Special Offers & Discounts', 'MORE special offers and discounts!', 3, 'en');

-- Benefits (Hebrew) — shared across all countries
INSERT INTO vip_benefits (country_id, icon, title, description, sort_order, language_code) VALUES
  ((SELECT id FROM countries WHERE code = 'il'), 'Percent', 'ערבי ספיד דייט בהנחה של 25%', 'כרטיסים לערבי ספיד דייט במחיר מוזל', 0, 'he'),
  ((SELECT id FROM countries WHERE code = 'il'), 'Heart', 'הנחה של 15% לשירות השידוכים', '15% הנחה על שירות השידוכים האישי שלנו', 1, 'he'),
  ((SELECT id FROM countries WHERE code = 'il'), 'Eye', 'גלו מי בחר בכם', 'אנו מגלים לכם מי בחר בכם בערב הספיד דייט בו השתתפתם', 2, 'he'),
  ((SELECT id FROM countries WHERE code = 'il'), 'Gift', 'הנחות מפתיעות נוספות', 'ועוד הנחות מפתיעות לחברי המועדון!', 3, 'he');

-- Auto-renewal notices (one per language, shared across countries)
INSERT INTO vip_settings (country_id, auto_renewal_notice, language_code) VALUES
  ((SELECT id FROM countries WHERE code = 'gb'), 'All memberships will renew automatically after duration expired. To cancel please write an email to Cancel@TheSpeedDating.co.uk', 'en'),
  ((SELECT id FROM countries WHERE code = 'il'), 'כל תקופות המנוי יתחדשו עם תום תוקפן באופן אוטומטי, על מנת לבטל אנא כתבו אימייל ל Cancel@TheSpeedDating.co.il', 'he');

-- Profile form translations (English)
INSERT INTO translations (string_key, language_code, value) VALUES
  ('profile.first_name', 'en', 'First Name'),
  ('profile.last_name', 'en', 'Last Name'),
  ('profile.date_of_birth', 'en', 'Date of Birth'),
  ('profile.gender', 'en', 'Gender'),
  ('profile.male', 'en', 'Male'),
  ('profile.female', 'en', 'Female'),
  ('profile.bio', 'en', 'Bio'),
  ('profile.occupation', 'en', 'Occupation'),
  ('profile.education', 'en', 'Education'),
  ('profile.relationship_status', 'en', 'Relationship Status'),
  ('profile.select_status', 'en', 'Select status'),
  ('profile.status_single', 'en', 'Single'),
  ('profile.status_divorced', 'en', 'Divorced'),
  ('profile.status_widowed', 'en', 'Widowed'),
  ('profile.status_separated', 'en', 'Separated'),
  ('profile.faith', 'en', 'Faith'),
  ('profile.select_faith', 'en', 'Select faith'),
  ('profile.height', 'en', 'Height (cm)'),
  ('profile.has_children', 'en', 'Has Children'),
  ('profile.country', 'en', 'Country'),
  ('profile.city', 'en', 'City'),
  ('profile.phone', 'en', 'Phone'),
  ('profile.interested_in', 'en', 'Interested In'),
  ('profile.email_notifications', 'en', 'Email Notifications'),
  ('profile.phone_notifications', 'en', 'Phone Notifications'),
  ('profile.sms_notifications', 'en', 'SMS Notifications'),
  ('profile.update_password', 'en', 'Update Password'),
  ('profile.change_password_desc', 'en', 'Update your account password'),
  ('profile.data_privacy', 'en', 'Data & Privacy'),
  ('profile.data_privacy_desc', 'en', 'Manage your personal data'),
  ('profile.export_data', 'en', 'Export My Data'),
  ('profile.export_data_desc', 'en', 'Download all your personal data as JSON'),
  ('profile.export', 'en', 'Export'),
  ('profile.delete_account', 'en', 'Delete Account'),
  ('profile.delete_account_desc', 'en', 'Permanently delete your account and all data'),
  ('profile.delete_confirm_title', 'en', 'Are you absolutely sure?'),
  ('profile.delete_confirm_desc', 'en', 'This action cannot be undone. This will permanently delete your account and all associated data including event history, match results, and profile information.'),
  ('auth.signing_in', 'en', 'Signing in...'),
  ('auth.no_account', 'en', 'Don''t have an account?'),
  ('auth.have_account', 'en', 'Already have an account?'),
  ('auth.creating_account', 'en', 'Creating account...'),
  ('auth.step_of', 'en', 'Step {{step}} of {{total}}'),
  ('common.back', 'en', 'Back'),
  ('common.cancel', 'en', 'Cancel'),
  ('common.saving', 'en', 'Saving...');

-- Profile form translations (Hebrew)
INSERT INTO translations (string_key, language_code, value) VALUES
  ('profile.first_name', 'he', 'שם פרטי'),
  ('profile.last_name', 'he', 'שם משפחה'),
  ('profile.date_of_birth', 'he', 'תאריך לידה'),
  ('profile.gender', 'he', 'מגדר'),
  ('profile.male', 'he', 'זכר'),
  ('profile.female', 'he', 'נקבה'),
  ('profile.bio', 'he', 'ביוגרפיה'),
  ('profile.occupation', 'he', 'עיסוק'),
  ('profile.education', 'he', 'השכלה'),
  ('profile.relationship_status', 'he', 'מצב משפחתי'),
  ('profile.select_status', 'he', 'בחירת מצב'),
  ('profile.status_single', 'he', 'רווק/ה'),
  ('profile.status_divorced', 'he', 'גרוש/ה'),
  ('profile.status_widowed', 'he', 'אלמן/ה'),
  ('profile.status_separated', 'he', 'פרוד/ה'),
  ('profile.faith', 'he', 'זרם דתי'),
  ('profile.select_faith', 'he', 'בחירת זרם'),
  ('profile.height', 'he', 'גובה (ס"מ)'),
  ('profile.has_children', 'he', 'יש ילדים'),
  ('profile.country', 'he', 'מדינה'),
  ('profile.city', 'he', 'עיר'),
  ('profile.phone', 'he', 'טלפון'),
  ('profile.interested_in', 'he', 'מעוניין/ת ב'),
  ('profile.email_notifications', 'he', 'התראות אימייל'),
  ('profile.phone_notifications', 'he', 'התראות טלפון'),
  ('profile.sms_notifications', 'he', 'התראות SMS'),
  ('profile.update_password', 'he', 'עדכון סיסמה'),
  ('profile.change_password_desc', 'he', 'עדכון סיסמת החשבון'),
  ('profile.data_privacy', 'he', 'נתונים ופרטיות'),
  ('profile.data_privacy_desc', 'he', 'ניהול המידע האישי שלך'),
  ('profile.export_data', 'he', 'ייצוא הנתונים שלי'),
  ('profile.export_data_desc', 'he', 'הורדת כל המידע האישי כ-JSON'),
  ('profile.export', 'he', 'ייצוא'),
  ('profile.delete_account', 'he', 'מחיקת חשבון'),
  ('profile.delete_account_desc', 'he', 'מחיקת החשבון וכל המידע לצמיתות'),
  ('profile.delete_confirm_title', 'he', 'האם את/ה בטוח/ה לחלוטין?'),
  ('profile.delete_confirm_desc', 'he', 'פעולה זו לא ניתנת לביטול. החשבון וכל המידע המשויך אליו יימחקו לצמיתות, כולל היסטוריית אירועים, תוצאות התאמה ומידע פרופיל.'),
  ('auth.signing_in', 'he', 'מתחבר...'),
  ('auth.no_account', 'he', 'אין לך חשבון?'),
  ('auth.have_account', 'he', 'כבר יש לך חשבון?'),
  ('auth.creating_account', 'he', 'יוצר חשבון...'),
  ('auth.step_of', 'he', 'שלב {{step}} מתוך {{total}}'),
  ('common.back', 'he', 'חזרה'),
  ('common.cancel', 'he', 'ביטול'),
  ('common.saving', 'he', 'שומר...');
