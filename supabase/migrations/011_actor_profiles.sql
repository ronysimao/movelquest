-- ============================================
-- 011_actor_profiles.sql
-- Cadastro de Atores da Plataforma Asisto Fab
-- Tabela única com CHECKs condicionais por tipo
-- ============================================

-- ============================================
-- 1. Expandir o enum de perfil na tabela profiles
--    Antes: 'admin' | 'vendedor'
--    Agora: inclui papéis dos novos atores
-- ============================================

-- Remover o CHECK antigo e criar um novo expandido
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_perfil_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_perfil_check
  CHECK (perfil IN (
    'admin',
    'vendedor',
    'fabricante_admin',
    'representante',
    'lojista',
    'arquiteto',
    'consumidor'
  ));

-- ============================================
-- 2. Criar tabela actor_profiles
--    Armazena dados específicos de cada tipo de ator
-- ============================================

CREATE TABLE IF NOT EXISTS actor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Vínculos obrigatórios
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Tipo do ator (determina quais campos são obrigatórios)
  actor_type TEXT NOT NULL CHECK (actor_type IN (
    'fabricante',
    'representante',
    'lojista',
    'arquiteto',
    'consumidor'
  )),

  -- ==========================================
  -- Campos específicos por tipo (nullable)
  -- ==========================================

  -- Fabricante
  cnpj VARCHAR(20),
  razao_social VARCHAR(200),
  regiao_atuacao TEXT,

  -- Representante
  creci VARCHAR(20),
  fabricante_vinculado_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Lojista
  loja_nome VARCHAR(200),
  endereco TEXT,
  markup_padrao NUMERIC(5,2),

  -- Arquiteto
  portfolio_url TEXT,
  especialidade TEXT,

  -- Consumidor
  telefone VARCHAR(20),
  endereco_entrega TEXT,

  -- Metadados
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- ==========================================
  -- CHECKs condicionais: garante que campos
  -- obrigatórios estejam preenchidos por tipo
  -- ==========================================

  -- Fabricante DEVE ter CNPJ e razão social
  CONSTRAINT chk_fabricante CHECK (
    actor_type != 'fabricante' OR (
      cnpj IS NOT NULL AND
      razao_social IS NOT NULL
    )
  ),

  -- Representante DEVE ter CRECI e vínculo com fabricante
  CONSTRAINT chk_representante CHECK (
    actor_type != 'representante' OR (
      creci IS NOT NULL AND
      fabricante_vinculado_id IS NOT NULL
    )
  ),

  -- Lojista DEVE ter nome da loja
  CONSTRAINT chk_lojista CHECK (
    actor_type != 'lojista' OR (
      loja_nome IS NOT NULL
    )
  ),

  -- Arquiteto DEVE ter organização vinculada (lojista que o liberou)
  CONSTRAINT chk_arquiteto CHECK (
    actor_type != 'arquiteto' OR (
      organization_id IS NOT NULL
    )
  ),

  -- Um usuário só pode ter um perfil de ator
  CONSTRAINT uq_user_actor UNIQUE (user_id)
);

-- ============================================
-- 3. Índices para consultas frequentes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_actor_profiles_user
  ON actor_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_actor_profiles_org
  ON actor_profiles(organization_id);

CREATE INDEX IF NOT EXISTS idx_actor_profiles_type
  ON actor_profiles(actor_type);

CREATE INDEX IF NOT EXISTS idx_actor_profiles_cnpj
  ON actor_profiles(cnpj)
  WHERE cnpj IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_actor_profiles_fabricante_vinculado
  ON actor_profiles(fabricante_vinculado_id)
  WHERE fabricante_vinculado_id IS NOT NULL;

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================

ALTER TABLE actor_profiles ENABLE ROW LEVEL SECURITY;

-- Service role: acesso total (usado pelas rotas de API)
CREATE POLICY "Service role full access on actor_profiles"
  ON actor_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Usuário autenticado: pode ver seu próprio perfil
CREATE POLICY "Users can view their own actor profile"
  ON actor_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Usuário autenticado: pode atualizar seu próprio perfil
CREATE POLICY "Users can update their own actor profile"
  ON actor_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Membros da mesma organização podem ver perfis entre si
CREATE POLICY "Org members can view actor profiles"
  ON actor_profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM actor_profiles WHERE user_id = auth.uid()
    )
  );

-- Admin pode gerenciar perfis da mesma organização
CREATE POLICY "Admin can manage org actor profiles"
  ON actor_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND perfil IN ('admin', 'fabricante_admin')
        AND organization_id IN (
          SELECT organization_id FROM actor_profiles AS ap
          WHERE ap.id = actor_profiles.id
        )
    )
  );

-- ============================================
-- 5. Trigger para atualizar updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_actor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actor_profiles_updated_at
  BEFORE UPDATE ON actor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_actor_profiles_updated_at();
