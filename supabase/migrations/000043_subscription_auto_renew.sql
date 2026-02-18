-- Add auto_renew column to vip_subscriptions
ALTER TABLE vip_subscriptions
  ADD COLUMN IF NOT EXISTS auto_renew boolean NOT NULL DEFAULT true;
