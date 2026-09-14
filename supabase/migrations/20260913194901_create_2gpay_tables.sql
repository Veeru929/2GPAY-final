/*
# Create 2G pay transaction history and settings tables (single-tenant, no auth)

1. New Tables
- `transactions` — stores UPI payment history records
  - `id` (uuid, primary key)
  - `upi_id` (text, recipient UPI ID)
  - `amount` (numeric, transaction amount in INR)
  - `note` (text, optional payment note)
  - `status` (text: 'success', 'failed', 'pending')
  - `mode` (text: 'auto' or 'manual')
  - `created_at` (timestamp)
- `app_settings` — stores app configuration (mode, bank, etc.)
  - `id` (uuid, primary key)
  - `key` (text, unique setting key)
  - `value` (text, setting value)
  - `updated_at` (timestamp)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD on both tables (single-tenant, no auth app).
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  note text DEFAULT '',
  status text NOT NULL DEFAULT 'success',
  mode text NOT NULL DEFAULT 'auto',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
CREATE POLICY "anon_select_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON app_settings;
CREATE POLICY "anon_insert_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON app_settings;
CREATE POLICY "anon_update_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON app_settings;
CREATE POLICY "anon_delete_settings" ON app_settings FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at DESC);
