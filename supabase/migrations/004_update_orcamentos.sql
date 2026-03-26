-- ============================================
-- 004_update_orcamentos.sql
-- Update existing orcamentos tables for the new Purchase Order feature
-- ============================================

-- Add status to orcamentos
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected'));

-- Add snapshot to itens_orcamento to freeze the furniture details at the time of purchase
ALTER TABLE itens_orcamento ADD COLUMN IF NOT EXISTS snapshot JSONB DEFAULT '{}'::jsonb;

-- Optional: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_numero ON orcamentos(numero);
