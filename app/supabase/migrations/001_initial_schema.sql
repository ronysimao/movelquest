-- ============================================
-- MóvelQuest - Supabase Database Schema
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- Profiles (linked to Supabase Auth users via trigger, OR standalone)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'vendedor')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  cod_fornecedor TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  contato TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Moveis (tabela principal de produtos)
CREATE TABLE IF NOT EXISTS moveis (
  id SERIAL PRIMARY KEY,
  fornecedor_id INTEGER REFERENCES fornecedores(id) ON DELETE SET NULL,
  categoria TEXT NOT NULL,
  modelo TEXT NOT NULL,
  variante TEXT,
  tipo TEXT,
  comprimento_cm NUMERIC,
  largura_cm NUMERIC,
  altura_cm NUMERIC,
  material TEXT,
  tecido TEXT,
  preco NUMERIC NOT NULL DEFAULT 0,
  condicao_pagamento TEXT,
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices para busca eficiente
CREATE INDEX IF NOT EXISTS idx_moveis_categoria ON moveis(categoria);
CREATE INDEX IF NOT EXISTS idx_moveis_modelo ON moveis(modelo);
CREATE INDEX IF NOT EXISTS idx_moveis_fornecedor ON moveis(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_moveis_ativo ON moveis(ativo);
CREATE INDEX IF NOT EXISTS idx_moveis_preco ON moveis(preco);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_moveis_search ON moveis
  USING gin(to_tsvector('portuguese', coalesce(categoria, '') || ' ' || coalesce(modelo, '') || ' ' || coalesce(variante, '') || ' ' || coalesce(material, '')));

-- Cargas (histórico de importações)
CREATE TABLE IF NOT EXISTS cargas (
  id SERIAL PRIMARY KEY,
  nome_arquivo TEXT NOT NULL,
  data_upload TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'processando' CHECK (status IN ('processando', 'sucesso', 'falha')),
  registros_processados INTEGER DEFAULT 0,
  erro_mensagem TEXT,
  usuario_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orcamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id SERIAL PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  data TIMESTAMPTZ DEFAULT now(),
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  cliente_endereco TEXT,
  vendedor_id UUID REFERENCES profiles(id),
  valor_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens do Orcamento
CREATE TABLE IF NOT EXISTS itens_orcamento (
  id SERIAL PRIMARY KEY,
  orcamento_id INTEGER REFERENCES orcamentos(id) ON DELETE CASCADE,
  movel_id INTEGER REFERENCES moveis(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE moveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_orcamento ENABLE ROW LEVEL SECURITY;

-- Policies: allow service_role full access (used by our API routes)
-- For profiles
CREATE POLICY "Service role full access on profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- For fornecedores
CREATE POLICY "Service role full access on fornecedores"
  ON fornecedores FOR ALL
  USING (true)
  WITH CHECK (true);

-- For moveis
CREATE POLICY "Service role full access on moveis"
  ON moveis FOR ALL
  USING (true)
  WITH CHECK (true);

-- For cargas
CREATE POLICY "Service role full access on cargas"
  ON cargas FOR ALL
  USING (true)
  WITH CHECK (true);

-- For orcamentos
CREATE POLICY "Service role full access on orcamentos"
  ON orcamentos FOR ALL
  USING (true)
  WITH CHECK (true);

-- For itens_orcamento
CREATE POLICY "Service role full access on itens_orcamento"
  ON itens_orcamento FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Seed: Admin user (password: admin123)
-- Change this after first login!
-- ============================================
-- The hash below is for 'admin123' using bcrypt with 12 rounds
INSERT INTO profiles (email, senha_hash, nome, perfil, ativo)
VALUES (
  'admin@movelquest.com.br',
  '$2b$12$VG5STFkAgm8/s3Y6dTSFk.uS2UyiYFC73MsADvy8kCLDmXWchKL0i',
  'Administrador',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;
