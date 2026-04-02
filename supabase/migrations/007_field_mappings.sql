-- Migration: 007_field_mappings.sql
-- Propósito: Adicionar tabela para inteligência de mapeamento De-Para na importação de catálogos

DROP TABLE IF EXISTS field_mappings CASCADE;

CREATE TABLE field_mappings (
    id SERIAL PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    fornecedor_id INTEGER REFERENCES fornecedores(id) ON DELETE CASCADE,
    raw_key TEXT NOT NULL,          -- O nome da coluna como vem no XLSX (ex: "DESCRIÇÃO DO PRODUTO")
    standard_key TEXT NOT NULL,     -- O campo destino na tabela moveis (ex: "modelo")
    unit_multiplier NUMERIC DEFAULT 1, -- Fator multiplicador (ex: se preço vem em centavos, ou dimensões em mm)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, fornecedor_id, raw_key)
);

-- Habilitar RLS
ALTER TABLE field_mappings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para service_role (usado em server-actions)
CREATE POLICY "Service role full access on field_mappings"
  ON field_mappings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Índices de busca
CREATE INDEX idx_field_mappings_org_fornecedor ON field_mappings(organization_id, fornecedor_id);

-- Para testar rapidamente o frontend, vamos adicionar dados iniciais (Seed) genéricos
-- que valem para fornecedor_id nulo caso queiramos ter mapeamentos padrão:
-- Obs: O UNIQUE constraints precisa lidar com fornecedor_id null, mas no Postgres NULL != NULL
-- então múltiplos nulls passariam. Para mapeamentos padrão de sistema, vamos inseri-los sem vendor.
