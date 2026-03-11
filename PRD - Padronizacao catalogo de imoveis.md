# 📑 Especificação Técnica: Arquitetura de Dados de Catálogo (Medallion JSONB)

## 1. Visão Geral

O objetivo é processar catálogos de móveis não estruturados (PDF/XLSX) de múltiplos fornecedores, utilizando uma arquitetura de camadas no **Supabase (PostgreSQL)** e processamento **ETL via Windmill (Python)**, garantindo flexibilidade total para atributos variados através do tipo `JSONB`.

## 2. Estrutura do Banco de Dados (Supabase)

O Antigravity deve considerar as seguintes tabelas core:

### A. Camada Bronze: `raw_imports`

Armazena o dado exatamente como foi lido, sem tratamento.

* `id`: uuid (PK)
* `vendor_id`: uuid (FK)
* `payload_bruto`: **JSONB** (Onde o script Python despeja o dicionário/dataframe original)
* `source_type`: text (ex: 'pdf', 'xlsx')
* `status`: text (pending, processed, error)

### B. Tabela de Metadados: `field_mappings`

O "cérebro" da normalização.

* `vendor_id`: uuid
* `raw_key`: text (ex: "Alt.", "Altura_MM", "Altura Total")
* `standard_key`: text (ex: "height")
* `unit_multiplier`: numeric (ex: 0.1 para converter mm em cm)

### C. Camada Silver/Gold: `products`

O dado limpo pronto para o Next.js.

* `id`: uuid (PK)
* `sku`: text (Unique)
* `name`: text
* `vendor_id`: uuid
* `main_category`: text
* **`technical_specs`**: **JSONB** (Aqui guardamos os atributos variáveis: cor, material, peso, etc.)
* `dimensions`: jsonb (Estrutura: `{"h": 0, "w": 0, "d": 0, "unit": "cm"}`)
* `images`: text[] (Array de URLs do Supabase Storage)

---

## 3. Lógica do Workflow (Windmill / Python)

Ao gerar ou editar scripts no Windmill, o Antigravity deve seguir este fluxo de execução:

1. **Leitura (Extract):** Utilizar `pandas` para XLSX ou `PyMuPDF`/`unstructured` para PDFs.
2. **Mapeamento (Transform):**
* Consultar a tabela `field_mappings` para traduzir as chaves do fornecedor.
* *Fallback de IA:* Se o arquivo for um PDF complexo, enviar o bloco de texto para um LLM (GPT-4o/Claude) com o prompt: *"Extraia os dados técnicos deste móvel e retorne um JSON puro nas chaves: [lista de chaves padronizadas]"*.


3. **Normalização:** Converter todas as medidas para uma unidade única (ex: cm) e datas para ISO 8601.
4. **Carga (Load):** Utilizar `upsert` no Supabase baseado no `sku` ou `vendor_id + original_name`.

---

## 4. Instruções de Implementação para o Antigravity (Prompts Diretos)

Copie e cole estas diretrizes nas configurações de contexto ou no chat da sua IDE:

> **Contexto de Desenvolvimento:**
> 1. **Stack:** Next.js (Frontend), Supabase (PostgreSQL), Windmill (Python ETL).
> 2. **Regra de JSONB:** Sempre que encontrar dados de produtos que variam entre fornecedores, utilize a coluna `technical_specs` do tipo JSONB. Não crie colunas específicas para atributos voláteis.
> 3. **Segurança:** Utilize as bibliotecas oficiais do Supabase (`@supabase/supabase-js` para JS e `supabase` para Python).
> 4. **Performance:** Ao realizar consultas no Next.js sobre campos JSONB, utilize a sintaxe de filtro do Supabase `->>` para garantir que os índices GIN sejam aproveitados.
> 5. **Normalização:** Todo script de importação deve tentar primeiro buscar o mapeamento na tabela `field_mappings`. Se não existir, o script deve registrar o campo novo em um log para revisão manual.
> 
> 

---

### Próximo Passo Recomendado

Agora que o Antigravity tem o "mapa da mina", o que você prefere fazer primeiro?

1. **Eu posso gerar o SQL de migração** para você rodar no Supabase e criar essas tabelas (incluindo os índices JSONB).
2. **Eu posso esboçar o script Python base** para o Windmill que faz essa leitura e mapeamento "De/Para".

O que seria mais útil agora?