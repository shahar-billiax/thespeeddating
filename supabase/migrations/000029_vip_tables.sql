-- ─── VIP Plans ───────────────────────────────────────────────
CREATE TABLE vip_plans (
  id serial PRIMARY KEY,
  country_id integer NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  months integer NOT NULL,
  price_per_month numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'GBP',
  badge text CHECK (badge IN ('popular', 'best_value')),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(country_id, months)
);

-- ─── VIP Benefits ────────────────────────────────────────────
CREATE TABLE vip_benefits (
  id serial PRIMARY KEY,
  country_id integer NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  icon text NOT NULL DEFAULT 'Gift',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── VIP Settings ────────────────────────────────────────────
CREATE TABLE vip_settings (
  id serial PRIMARY KEY,
  country_id integer NOT NULL UNIQUE REFERENCES countries(id) ON DELETE CASCADE,
  auto_renewal_notice text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX idx_vip_plans_country ON vip_plans(country_id);
CREATE INDEX idx_vip_plans_active ON vip_plans(is_active);
CREATE INDEX idx_vip_benefits_country ON vip_benefits(country_id);
CREATE INDEX idx_vip_benefits_active ON vip_benefits(is_active);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE vip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_settings ENABLE ROW LEVEL SECURITY;

-- Public SELECT on active rows
CREATE POLICY "vip_plans_select_active" ON vip_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "vip_benefits_select_active" ON vip_benefits
  FOR SELECT USING (is_active = true);

CREATE POLICY "vip_settings_select" ON vip_settings
  FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "admin_vip_plans" ON vip_plans
  FOR ALL USING (public.is_admin());

CREATE POLICY "admin_vip_benefits" ON vip_benefits
  FOR ALL USING (public.is_admin());

CREATE POLICY "admin_vip_settings" ON vip_settings
  FOR ALL USING (public.is_admin());

-- ─── Migrate existing content_json data ──────────────────────
DO $$
DECLARE
  _page RECORD;
  _tier jsonb;
  _benefit jsonb;
  _sort int;
  _country_id int;
  _currency text;
BEGIN
  FOR _page IN
    SELECT p.id, p.country_id, p.content_json, c.currency
    FROM pages p
    JOIN countries c ON c.id = p.country_id
    WHERE p.page_key = 'vip'
      AND p.content_json IS NOT NULL
      AND p.page_type = 'pricing'
  LOOP
    _country_id := _page.country_id;
    _currency := _page.currency;

    -- Migrate tiers
    _sort := 0;
    IF _page.content_json ? 'tiers' THEN
      FOR _tier IN SELECT * FROM jsonb_array_elements(_page.content_json -> 'tiers')
      LOOP
        INSERT INTO vip_plans (country_id, months, price_per_month, total_price, currency, badge, sort_order)
        VALUES (
          _country_id,
          (_tier ->> 'months')::int,
          (_tier ->> 'pricePerMonth')::numeric,
          (_tier ->> 'totalPrice')::numeric,
          _currency,
          NULLIF(_tier ->> 'badge', ''),
          _sort
        )
        ON CONFLICT (country_id, months) DO NOTHING;
        _sort := _sort + 1;
      END LOOP;
    END IF;

    -- Migrate benefits
    _sort := 0;
    IF _page.content_json ? 'benefits' THEN
      FOR _benefit IN SELECT * FROM jsonb_array_elements(_page.content_json -> 'benefits')
      LOOP
        INSERT INTO vip_benefits (country_id, icon, title, description, sort_order)
        VALUES (
          _country_id,
          COALESCE(_benefit ->> 'icon', 'Gift'),
          _benefit ->> 'title',
          COALESCE(_benefit ->> 'description', ''),
          _sort
        );
        _sort := _sort + 1;
      END LOOP;
    END IF;

    -- Migrate notice
    IF _page.content_json ? 'notice' THEN
      INSERT INTO vip_settings (country_id, auto_renewal_notice)
      VALUES (_country_id, _page.content_json ->> 'notice')
      ON CONFLICT (country_id) DO UPDATE SET
        auto_renewal_notice = EXCLUDED.auto_renewal_notice,
        updated_at = now();
    END IF;
  END LOOP;
END
$$;

-- ─── Clear VIP page structured data ─────────────────────────
UPDATE pages
SET page_type = 'standard', content_json = NULL
WHERE page_key = 'vip';
