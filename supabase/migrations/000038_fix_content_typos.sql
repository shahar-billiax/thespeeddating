-- Fix typos and incorrect email in CMS page content

-- Fix "were hiring" → "We're hiring" on home page
UPDATE pages
SET content_html = REPLACE(content_html, 'were hiring!', 'We''re hiring!')
WHERE page_key = 'home' AND content_html LIKE '%were hiring!%';

-- Fix "were hiring" → "We're hiring" on franchise-jobs page
UPDATE pages
SET content_html = REPLACE(content_html, 'were hiring!', 'We''re hiring!')
WHERE page_key = 'franchise-jobs' AND content_html LIKE '%were hiring!%';

-- Fix "surprsing" → "surprising" on dating-tips page
UPDATE pages
SET content_html = REPLACE(content_html, 'surprsing', 'surprising')
WHERE page_key = 'dating-tips' AND content_html LIKE '%surprsing%';

-- Fix "try more surprising" → "try a more surprising" (missing article)
UPDATE pages
SET content_html = REPLACE(content_html, 'try more surprising', 'try a more surprising')
WHERE page_key = 'dating-tips' AND content_html LIKE '%try more surprising%';

-- Fix "thruout" → "throughout" on dating-tips page
UPDATE pages
SET content_html = REPLACE(content_html, 'thruout', 'throughout')
WHERE page_key = 'dating-tips' AND content_html LIKE '%thruout%';

-- Fix wrong email cancel@zivoogim.com → Cancel@TheSpeedDating.co.uk on terms page
UPDATE pages
SET content_html = REPLACE(content_html, 'cancel@zivoogim.com', 'Cancel@TheSpeedDating.co.uk')
WHERE page_key = 'terms' AND content_html LIKE '%cancel@zivoogim.com%';
