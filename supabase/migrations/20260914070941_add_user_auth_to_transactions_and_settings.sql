/*
# Add user authentication support to transactions and app_settings

1. Changes
- Added `user_id` column to `transactions` (uuid, nullable, defaults to auth.uid(), FK to auth.users)
- Added `user_id` column to `app_settings` (uuid, nullable, defaults to auth.uid(), FK to auth.users)
- Updated unique constraint on app_settings from (key) to (user_id, key) for per-user settings
- Existing anonymous rows get NULL user_id — invisible to authenticated users under owner-scoped RLS

2. Security
- Replaced anon-accessible RLS policies with owner-scoped authenticated-only policies
- Each user can only SELECT/INSERT/UPDATE/DELETE their own rows
- user_id defaults to auth.uid() so inserts omitting user_id still pass RLS

3. Notes
- Old anonymous data is preserved but invisible (NULL user_id never matches auth.uid())
- This is correct behavior: it was test data from before auth existed
*/

-- Add user_id to transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN user_id uuid DEFAULT auth.uid();
    ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id to app_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN user_id uuid DEFAULT auth.uid();
    ALTER TABLE app_settings ADD CONSTRAINT app_settings_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update unique constraint on app_settings: from (key) to (user_id, key)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_key_key'
  ) THEN
    ALTER TABLE app_settings DROP CONSTRAINT app_settings_key_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_user_id_key_key'
  ) THEN
    ALTER TABLE app_settings ADD CONSTRAINT app_settings_user_id_key_key UNIQUE (user_id, key);
  END IF;
END $$;

-- Replace RLS policies on transactions (owner-scoped, authenticated only)
DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;

CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Replace RLS policies on app_settings (owner-scoped, authenticated only)
DROP POLICY IF EXISTS "anon_select_settings" ON app_settings;
DROP POLICY IF EXISTS "anon_insert_settings" ON app_settings;
DROP POLICY IF EXISTS "anon_update_settings" ON app_settings;
DROP POLICY IF EXISTS "anon_delete_settings" ON app_settings;
DROP POLICY IF EXISTS "select_own_settings" ON app_settings;
DROP POLICY IF EXISTS "insert_own_settings" ON app_settings;
DROP POLICY IF EXISTS "update_own_settings" ON app_settings;
DROP POLICY IF EXISTS "delete_own_settings" ON app_settings;

CREATE POLICY "select_own_settings" ON app_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_settings" ON app_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_settings" ON app_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_settings" ON app_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for faster per-user queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON app_settings (user_id);
