-- Add language_code to vip_benefits
ALTER TABLE vip_benefits ADD COLUMN language_code text NOT NULL DEFAULT 'en';

-- Set existing IL benefits to Hebrew (for production where data already exists)
UPDATE vip_benefits SET language_code = 'he'
WHERE country_id = (SELECT id FROM countries WHERE code = 'il');

-- Add index for language_code lookups
CREATE INDEX idx_vip_benefits_lang ON vip_benefits(country_id, language_code);

-- Add language_code to vip_settings (drop unique on country_id first)
ALTER TABLE vip_settings DROP CONSTRAINT vip_settings_country_id_key;
ALTER TABLE vip_settings ADD COLUMN language_code text NOT NULL DEFAULT 'en';

-- Set existing IL settings to Hebrew (for production where data already exists)
UPDATE vip_settings SET language_code = 'he'
WHERE country_id = (SELECT id FROM countries WHERE code = 'il');

-- New composite unique constraint
ALTER TABLE vip_settings ADD UNIQUE (country_id, language_code);
