-- ============================================
-- Add storage_path to charges
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cargas' AND column_name='storage_path') THEN
    ALTER TABLE cargas ADD COLUMN storage_path TEXT;
  END IF;
END $$;
