-- ============================================
-- 005_add_observacoes_orcamentos.sql
-- Add an observacoes column to the orcamentos table for order-level notes
-- ============================================

ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS observacoes TEXT;
