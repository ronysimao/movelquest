-- Migration: 008_import_review_queue.sql
-- Propósito: Tabela para filas de revisão quando a confiança na importação for baixa (< 80%)

DROP TABLE IF EXISTS import_review_queue CASCADE;

CREATE TABLE import_review_queue (
    id SERIAL PRIMARY KEY,
    carga_id INTEGER REFERENCES cargas(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    raw_data JSONB NOT NULL,           -- A linha bruta original do arquivo (XLSX/PDF)
    mapped_data JSONB NOT NULL,        -- A sugestão de mapeamento feita pela IA/Algoritmo
    confidence_score INTEGER,          -- 0 a 100
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE import_review_queue ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para service_role
CREATE POLICY "Service role full access on import_review_queue"
  ON import_review_queue FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para usuários visualizarem apenas filas da sua organização
CREATE POLICY "Users can view review queue of their organization"
  ON import_review_queue FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Índices de busca para carregar as telas mais rápido
CREATE INDEX idx_import_review_carga ON import_review_queue(carga_id);
CREATE INDEX idx_import_review_status ON import_review_queue(status);
CREATE INDEX idx_import_review_org ON import_review_queue(organization_id);
