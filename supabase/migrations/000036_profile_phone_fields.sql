-- Add middle name and separate phone fields to profiles
ALTER TABLE profiles ADD COLUMN middle_name text;
ALTER TABLE profiles ADD COLUMN home_phone text;
ALTER TABLE profiles ADD COLUMN mobile_phone text;
ALTER TABLE profiles ADD COLUMN work_phone text;
