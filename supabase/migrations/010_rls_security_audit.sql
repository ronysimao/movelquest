-- ============================================
-- 010_rls_security_audit.sql
-- Implementação de RLS (Row Level Security) focado no isolamento multi-tenant
-- ============================================

-- 1. Organizations
-- Permitir que usuários acessem os dados apenas da sua própria organização
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- 2. Profiles
-- Restringir visibilidade de perfis para apenas membros da mesma organização
CREATE POLICY "Users can view members of their organization"
  ON profiles FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    OR
    id = auth.uid()
  );

-- Vendedores podem atualizar seus próprios dados. Apenas admin pode atualizar outros na organização.
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Orcamentos
-- Isolar o acesso a orçamentos criados por membros da organização
CREATE POLICY "Users can view orcamentos of their organization"
  ON orcamentos FOR SELECT
  USING (
    vendedor_id IN (
        SELECT id FROM profiles WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    )
    OR
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Vendedores can insert their own orcamentos"
  ON orcamentos FOR INSERT
  WITH CHECK (vendedor_id = auth.uid());

-- 4. Itens do Orcamento
-- Restringir o acesso a itens atrelados a orçamentos da mesma organização
CREATE POLICY "Users can view items of orcamentos of their organization"
  ON itens_orcamento FOR SELECT
  USING (
    orcamento_id IN (
        SELECT id FROM orcamentos WHERE vendedor_id IN (
            SELECT id FROM profiles WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    )
  );

CREATE POLICY "Users can insert items to their own orcamentos"
  ON itens_orcamento FOR INSERT
  WITH CHECK (
    orcamento_id IN (
        SELECT id FROM orcamentos WHERE vendedor_id = auth.uid()
    )
  );
