-- ============================================
-- 012_human_fallback.sql
-- Suporte ao Fallback Humano no Pipeline de Importação
-- Quando a IA não consegue normalizar os dados com confiança
-- aceitável, a carga é escalada para ajuste manual.
-- ============================================

-- 1. Expandir o CHECK de status na tabela cargas
--    Adiciona 'needs_human_help' como status válido
ALTER TABLE cargas
  DROP CONSTRAINT IF EXISTS cargas_status_check;

ALTER TABLE cargas
  ADD CONSTRAINT cargas_status_check
  CHECK (status IN ('processando', 'sucesso', 'falha', 'needs_human_help'));

-- 2. Adicionar colunas de suporte ao fallback
--    fallback_reason: motivo detalhado pelo qual a IA falhou
--    raw_headers: cabeçalhos brutos do arquivo (para a tela de mapeamento manual)
ALTER TABLE cargas
  ADD COLUMN IF NOT EXISTS fallback_reason TEXT;

ALTER TABLE cargas
  ADD COLUMN IF NOT EXISTS raw_headers JSONB;

-- 3. Adicionar coluna de confiança na tabela field_mappings
--    Para rastrear a qualidade do mapeamento salvo (manual = 100, IA = variável)
ALTER TABLE field_mappings
  ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 100;

-- 4. Índice para buscar rapidamente cargas que precisam de ajuste
CREATE INDEX IF NOT EXISTS idx_cargas_needs_help
  ON cargas(status)
  WHERE status = 'needs_human_help';
