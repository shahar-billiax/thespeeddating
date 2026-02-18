-- Add gendered pricing support to VIP, Early Bird, and Last Minute tiers
-- When enable_gendered_price is true, these override the flat tier prices

-- VIP gendered pricing
alter table events
  add column if not exists vip_price_male numeric(10,2),
  add column if not exists vip_price_female numeric(10,2);

-- Early Bird gendered pricing
alter table events
  add column if not exists early_bird_price_male numeric(10,2),
  add column if not exists early_bird_price_female numeric(10,2);

-- Last Minute gendered pricing
alter table events
  add column if not exists last_minute_price_male numeric(10,2),
  add column if not exists last_minute_price_female numeric(10,2);
