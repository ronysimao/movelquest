-- ============================================
-- Catalog Standardization Migration (Medallion JSONB)
-- ============================================

-- A. Camada Bronze: raw_imports
CREATE TABLE IF NOT EXISTS raw_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id INTEGER REFERENCES fornecedores(id),
  carga_id INTEGER REFERENCES cargas(id) ON DELETE CASCADE,
  payload_bruto JSONB NOT NULL,
  source_type TEXT NOT NULL, -- 'pdf', 'xlsx'
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir que carga_id existe caso a tabela já tenha sido criada
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='raw_imports' AND column_name='carga_id') THEN
    ALTER TABLE raw_imports ADD COLUMN carga_id INTEGER REFERENCES cargas(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_raw_imports_vendor ON raw_imports(vendor_id);
CREATE INDEX IF NOT EXISTS idx_raw_imports_status ON raw_imports(status);
CREATE INDEX IF NOT EXISTS idx_raw_imports_carga ON raw_imports(carga_id);

-- B. Tabela de Metadados: field_mappings
CREATE TABLE IF NOT EXISTS field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id INTEGER REFERENCES fornecedores(id),
  raw_key TEXT NOT NULL, -- ex: "Alt.", "Altura_MM"
  standard_key TEXT NOT NULL, -- ex: "height"
  unit_multiplier NUMERIC DEFAULT 1, -- ex: 0.1 para converter mm em cm
  UNIQUE(vendor_id, raw_key)
);

CREATE INDEX IF NOT EXISTS idx_field_mappings_vendor ON field_mappings(vendor_id);

-- C. Camada Silver/Gold: products
-- Mantendo sincronizado com moveis mas com estrutura JSONB
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  vendor_id INTEGER REFERENCES fornecedores(id),
  carga_id INTEGER REFERENCES cargas(id) ON DELETE CASCADE, -- Link para exclusão em cascata
  main_category TEXT,
  technical_specs JSONB DEFAULT '{}', -- Cor, material, peso, etc.
  dimensions JSONB DEFAULT '{"h": 0, "w": 0, "d": 0, "unit": "cm"}',
  images TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garantir que carga_id existe caso a tabela já tenha sido criada (Corrige o erro 42703)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='carga_id') THEN
    ALTER TABLE products ADD COLUMN carga_id INTEGER REFERENCES cargas(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indices GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_products_specs ON products USING GIN (technical_specs);
CREATE INDEX IF NOT EXISTS idx_products_dimensions ON products USING GIN (dimensions);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(main_category);
CREATE INDEX IF NOT EXISTS idx_products_carga ON products(carga_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
