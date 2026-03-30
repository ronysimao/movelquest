
Asisto Fab

Visão de Produto · Requisitos · Arquitetura · Roadmap

**VERSÃO DATA CLASSIFICAÇÃO**

1 .0 27 de março de 2026 Interno - Confidencial

**RESPONSÁVEL**

Operação Asisto

# 1. Resumo Executivo

O **Asisto Fab** é uma plataforma B2B/B2B2C projetada para orquestrar e digitalizar toda a cadeia comercial do setor moveleiro. Seu objetivo central é transformar a complexidade de tabelas estáticas e dados desestruturados em um catálogo inteligente, dinâmico e centralizado. A solução conecta fabricantes, representantes, lojistas e arquitetos em um ecossistema único, permitindo controle granular sobre quem vende para quem, formação de preços ágil e gestão unificada de pedidos.

Originalmente prototipado sob o nome "MóvelQuest" (marca ainda visível em telas legadas do sistema atual), o produto está passando por um rebranding completo e evolução arquitetural para se tornar o **Asisto Fab**. Esta mudança reflete um posicionamento mais maduro e tecnológico, focado em gestão e inteligência de dados, não apenas em catálogo visual.

A visão estratégica de longo prazo transcende a gestão comercial: o roadmap prevê a incorporação de Inteligência Artificial para enriquecimento automático de dados e, futuramente, recursos de ambientação visual como diferencial competitivo.

# 2. Visão Estratégica

## 2.1 Posicionamento

O Asisto Fab se posiciona como o "Sistema Operacional Comercial" para a indústria de móveis de alto padrão e decoração. Não é apenas um e-commerce B2B, mas uma ferramenta de gestão de catálogo e força de vendas que habilita a complexa rede de relacionamentos entre fábrica, representação e varejo.

## 2.2 Proposta de Valor

- - - **Para o Fabricante:** Controle total da distribuição, inteligência de dados sobre o que é orçado/vendido e redução do atrito operacional.
      - **Para o Lojista:** Centralização de múltiplos fornecedores em uma única tela, agilidade na precificação (markup) e profissionalização da apresentação de orçamentos.
      - **Para o Arquiteto:** Acesso rápido a informações técnicas confiáveis e facilidade para especificar produtos reais em projetos.

## 2.3 Diferenciais Competitivos

**Transportador** Recebe dados logísticos e participa do fluxo de entrega do pedido.

- - - **Importação Inteligente:** Capacidade de ler e estruturar tabelas complexas (XLSX/PDF).
      - **Catálogo Consolidado:** O lojista vê produtos de várias fábricas lado a lado.
      - **Controle de Acesso Granular:** Visibilidade precisa por região, perfil e tabela de preço.

## 2.4 Modelo de Negócio

Plataforma SaaS com modelo de recorrência, precificação baseada em volume de SKUs gerenciados (para fabricantes) ou por "seats" de venda (para varejo).

# 3. Atores da Plataforma

| Persona              | Responsabilidades Principais                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Fabricante**       | Cadastra produtos, define preços base, configura regiões de venda, aprova lojistas, gerencia pedidos recebidos. |
| **Representante**    | Atua como canal comercial vinculado ao fabricante, acessa pedidos de sua região, intermedeia negociações.       |
| **Lojista**          | Consome catálogos, define markup de venda, configura acesso para sua equipe e arquitetos, gera orçamentos.      |
| **Arquiteto**        | Consulta produtos liberados pelo lojista, monta listas de especificação, solicita orçamentos.                   |
| **Consumidor Final** | Visualiza catálogos e orçamentos compartilhados pelo lojista (futuro: ambientação visual).                      |

# 4. Problemas que a Plataforma Resolve

## 4.1 Na Indústria / Fabricante

- - - Dificuldade em transformar tabelas (Excel/PDF) em catálogo digital utilizável.
      - Falta de padronização das informações técnicas de produto.
      - Complexidade para controlar quem vê e quem vende produtos por região.

## 4.2 No Lojista

- - - Dificuldade em consolidar produtos de dezenas de fabricantes diferentes.
      - Perda de tempo com formação manual de preço (cálculo de markup item a item).
      - Processo de orçamento desestruturado e visualmente pobre.

## 4.3 Na Cadeia como um todo

- - - Dados técnicos dispersos e catálogos desatualizados.
      - Processo comercial lento e propenso a erros de especificação.
      - Falta de inteligência na busca (dependência de códigos exatos).

# 5. Módulos Funcionais e Requisitos

## 5.1 Cadastro e Gestão de Produtos

- - - Ficha técnica completa: dimensões (A/L/P), peso, volume, cubagem.
      - Atributos comerciais: SKU, EAN, marca, linha, coleção.
      - Gestão de mídia: upload de múltiplas fotos, renders, PDFs técnicos e vídeos.
      - Dados logísticos: informações de embalagem para cálculo de frete.

## 5.2 Importação Inteligente

- - - Upload de arquivos XLSX, PDF e CSV via drag-and-drop.

Parcialmente implementado. Requer rebranding urgente de "Admin Console" para Asisto Fab.

- - - IA interpreta cabeçalhos e mapeia colunas automaticamente.
      - Fila de processamento com status em tempo real.
      - Ferramenta de correção manual para linhas com baixa confiança.

## 5.3 Tabelas de Produtos

- - - Versionamento de tabelas (ex: Tabela Jan/2026 v1 ).
      - Suporte a importação de tabelas "offline" pelo lojista.
      - Comparativo entre versões para identificar mudanças de preço.

## 5.4 Tabelas de Preço

- - - Motor de markup configurável por produto, linha ou categoria global.
      - Suporte a preços diferenciados por acabamento/tecido.
      - Histórico de alterações de preço.

## 5.5 Disponibilização para Venda

- - - Regras de negócio: Produto + Tabela de Preço + Região + Destinatário + Método.
      - Controle granular de visibilidade (quem vê o quê).

## 5.6 Controle de Acesso

- - - Definições de visibilidade por perfil (Vendedor, Arquiteto, Cliente).
      - Logs de auditoria de acesso.

## 5.7 Catálogo e Busca

- - - Grid consolidado com produtos de múltiplos fabricantes.
      - Filtros avançados: categoria, dimensões (min/max), acabamento, preço.
      - Toggle entre visualização em grade (fotos) e lista (técnica).

## 5.8 Busca Inteligente por Imagem

- - - Upload de foto de referência → IA Vision → Texto descritivo → Busca vetorial.
      - Suporte a base de +1 00k SKUs com resposta rápida.
      - Resultado ordenado por score de similaridade visual.

## 5.9 Orçamento e Pedido

- - - Criação de orçamento vinculado a cliente e arquiteto.

Prefixo de pedidos deve ser migrado de "MQ-" para "AS-2026-XXXX".

- - - Aprovação e conversão automática em pedido.
      - Split automático de pedidos por fabricante.
      - Exportação em PDF e envio via WhatsApp.

## 5.10 Gestão de Pedidos

- - - Lista resumida com filtros de status (Aguardando, Produção, Expedido).
      - Detalhe do pedido com miniaturas e linha do tempo.
      - Histórico de alterações de status.

## 5.11 IA para Cadastro (Backend)

- - - Serviço de background para normalização e categorização de produtos.
      - Geração automática de descrições comerciais via LLM.
      - Sugestão de tags e atributos faltantes.

## 5.12 Módulo de Ambientação Visual (Roadmap)

- - - Upload de foto do ambiente do cliente.
      - Drag-and-drop de produtos na cena.
      - Renderização realista via IA generativa.

## 5.13 Sugestão por Projeto

- - - Análise de plantas (CAD/PDF).
      - Geração automática de lista de produtos (BOM) compatíveis.

# 6. Arquitetura de Solução

## 6.1 Visão Geral

Arquitetura SaaS multi-tenant com isolamento lógico de dados. Todos os módulos compartilham o mesmo banco de dados relacional, com segregação garantida por tenant_id em todas as consultas.

## 6.2 Estrutura de Tabelas e Relacionamentos

**DOMÍNIO: IDENTIDADE E ACESSO**

**organizations**

| Campo | Tipo    | Tags | Descrição                              |
| ----- | ------- | ---- | -------------------------------------- |
| id    | UUID    | PK   | Identificador único do tenant          |
| name  | VARCHAR | NN   | Razão social ou nome fantasia          |
| type  | ENUM    | NN   | fabricante \| lojista \| representante |
| slug  | VARCHAR | UQ   | Identificador amigável para URL        |

**users**



**DOMÍNIO: PRODUTOS**

status ENUM NN rascunho | ativo | inativo

**products**

| Campo           | Tipo    | Tags | Descrição                      |
| --------------- | ------- | ---- | ------------------------------ |
| id              | UUID    | PK   | Identificador do usuário       |
| organization_id | UUID    | FK   | Vínculo com o tenant           |
| email           | VARCHAR | UQ   | Login de acesso                |
| role            | ENUM    | NN   | admin \| vendedor \| arquiteto |

| Campo     | Tipo    | Tags | Descrição                  |
| --------- | ------- | ---- | -------------------------- |
| id        | UUID    | PK   | Identificador do produto   |
| tenant_id | UUID    | FK   | Fabricante dono do produto |
| sku       | VARCHAR | IDX  | Código único do produto    |
| name      | VARCHAR | NN   | Nome do produto            |

**product_variants**



**DOMÍNIO: COMERCIAL**

**orders**

| Campo       | Tipo    | Tags | Descrição                  |
| ----------- | ------- | ---- | -------------------------- |
| id          | UUID    | PK   | Identificador da variação  |
| product_id  | UUID    | FK   | Vínculo com produto pai    |
| sku_variant | VARCHAR | UQ   | SKU específico da variação |
| color       | VARCHAR | \-   | Cor ou acabamento          |

| Campo           | Tipo    | Tags | Descrição                            |
| --------------- | ------- | ---- | ------------------------------------ |
| id              | UUID    | PK   | Identificador do pedido              |
| organization_id | UUID    | FK   | Lojista que comprou                  |
| supplier_id     | UUID    | FK   | Fabricante que vendeu                |
| order_number    | VARCHAR | UQ   | Formato AS-2026-XXXX                 |
| status          | ENUM    | NN   | aguardando \| confirmado \| entregue |
| total_value     | NUMERIC | NN   | Valor total do pedido                |

## 6.3 Fluxos e Jornadas

|  FLUXO: IMPORTAÇÃO DE CATÁLOGO |
| :------------: |
| Upload de arquivo (XLSX/PDF)  |
| ⬇️ |
| Fila de Processamento  |
| ⬇️ |
| IA Interpreta Colunas  |
| ⬇️ |
| Confiança > 80% |
| ⬇️ |
| Produto Criado |

Se confiança < 80%, encaminha para Revisão Humana

|  FLUXO: ORÇAMENTO E PEDIDO |
| :------------: |
| Vendedor Busca Produto  |
| ⬇️ |
| Adiciona ao Orçamento |
| ⬇️ |
| Aprovação do Cliente  |
| ⬇️ |
| Conversão em Pedido |
| ⬇️ |
| Split por Fabricante |


## 6.4 Requisitos Não-Funcionais
**Performance:** Resposta < 2s para busca em catálogos com até 500k SKUs.

**Escalabilidade:** Suporte a crescimento de 1 00k para 500k+ SKUs sem refatoração.

**Segurança:** Isolamento rigoroso de dados por tenant.

**Disponibilidade:** SLA de 99,9%.

# 7. Estado Atual (Análise das Telas)

Nota: As telas abaixo representam o estado funcional atual do protótipo "MóvelQuest". Elas servem como referência do que deve ser mantido, corrigido (rebranding para Asisto Fab) ou evoluído.



**TELA 1 - Painel de Importação (Admin Console)**

**Manter:** Drag-and-drop, histórico de importações, fila com status em tempo real.

**Corrigir:** Atualizar logo e nome para Asisto Fab, remover referências MóvelQuest. 

**Evoluir:** Preview de produtos antes da confirmação, indicador de confiança da IA.

**TELA 2 - Lista de Pedidos**

**Manter:** Tabela resumida, indicadores de status, filtros básicos.

**Corrigir:** Prefixo dos pedidos de "MQ-" para "AS-2026-XXXX", branding Asisto Fab. 

**Evoluir:** Filtros por responsável e fabricante, exportação CSV.

**TELA 3 - Catálogo de Vendas**

**Manter:** Grade visual, tags de origem, preços visíveis.

**Corrigir:** Header e logo Asisto Fab, labels de filtros.

**Evoluir:** Slider de intervalo para dimensões, busca por imagem na barra principal.

# 8. Roadmap de Desenvolvimento

Os prazos internos serão definidos pela equipe. O roadmap abaixo agrupa entregas por prioridade e complexidade, com estimativa máxima de 3 meses para o core.

| Fase | Entregas Principais | Prioridade |
| :------------: | :------------: | :------------: |
|  **FASE 1** Fundação e Rebranding | - Rebranding completo para Asisto Fab (logos, cores, textos). - Remoção de referências "MóvelQuest" e prefixo MQ-. - Prefixo de pedidos atualizado para AS-AAAA-XXXX. - Refatoração multi-tenant real e RBAC robusto.  | Crítica |
|  **FASE 2** Produtos e Importação| - Cadastro completo de produtos (técnico/logístico). - Pipeline de importação via IA estável (XLSX/PDF). - Ferramenta de revisão manual de erros. - Gestão de variações e mídia. | Alta |
| **FASE 3** Comercial e Catálogo | - Motor de markup e regras de disponibilização. - Catálogo consolidado com filtros avançados. - Fluxo de orçamento → pedido com split por fabricante. | Alta |
| **FASE 4** Inteligência e Evolução | - Busca por imagem (IA Vision). - Geração automática de descrições. - Ambientação visual (drag-and-drop). | Roadmap |


# 9. Critérios de Aceitação

## Definition of Done (DoD) Global

- Code review aprovado por ao menos 1 desenvolvedor.
- Cobertura de testes unitários ≥ 70%.
- UI alinhada ao guia de estilo Asisto Fab.
- Validação em ambiente de staging com dados reais.
- Sem bugs críticos ou bloqueadores.

## Critérios por Fase

- **Fase 1 :** Zero referências "MóvelQuest", prefixo AS- ativo, RBAC funcional.
- **Fase 2:** Importação de XLSX (500 linhas) em < 60s, taxa de erro < 5%.
- **Fase 3:** Markup calculado corretamente, pedidos gerados com sucesso.
- **Fase 4:** Busca por imagem retorna ≥ 5 produtos em < 5s.

# 10. Riscos e Dependências

| Risco                             | Impacto | Mitigação                                               |
| --------------------------------- | ------- | ------------------------------------------------------- |
| Custo elevado de IA em escala     | Alto    | Usar modelos menores para triagem; cache de embeddings. |
| Qualidade heterogênea de arquivos | Médio   | Interface de revisão manual robusta; feedback loop.     |
| Performance do catálogo visual    | Alto    | CDN para imagens, lazy loading, paginação otimizada.    |

# 11. Glossário

- **Multi-tenant:** Arquitetura onde múltiplos clientes compartilham a infraestrutura com isolamento de dados.
- **SaaS:** Software-as-a-Service, modelo de entrega por assinatura.
- **SKU:** Stock Keeping Unit, código único de identificação.
- **Markup:** Valor adicionado ao custo para compor o preço de venda.
- **LLM:** Large Language Model, IA para texto e interpretação.
- **Vector DB:** Banco de dados para busca semântica por similaridade.


Asisto Fab - Documento Interno Confidencial | © 2026 Asisto | Versão 1 .0