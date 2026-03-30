-- ============================================
-- 006_asisto_fab_foundation.sql
-- Foundation for Multi-tenant Architecture & Rebranding
-- ============================================

-- Create organizations table (tenant)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('fabricante', 'lojista', 'representante')),
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add organization_id to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE moveis ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Enable RLS for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Service Role full access on organizations
CREATE POLICY "Service role full access on organizations"
    ON organizations FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- REBRANDING: Update existing order prefixes
-- From MQ-YYYY-XXXX to AS-YYYY-XXXX
-- ============================================
UPDATE orcamentos
SET numero = REPLACE(numero, 'MQ-', 'AS-')
WHERE numero LIKE 'MQ-%';
