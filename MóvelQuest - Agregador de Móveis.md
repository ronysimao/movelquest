# MóvelQuest - Agregador de Móveis

## Objetivo

Centralizar dados heterogêneos de fornecedores de móveis para consulta rápida por vendedores e gestão administrativa.

## Telas

### Login

**Rota:** `/`

**Objetivo:** Autenticar usuários e redirecioná-los com base em seus perfis (Admin ou Vendedor).

**Componentes:**

- **Formulário de Login (Email e Senha)**: Faz a verificação das credenciais e redireciona para /admin se for gestor ou /search se for vendedor.

### Gerenciamento de Dados (Admin)

**Rota:** `/admin`

**Objetivo:** Permitir a importação e padronização de arquivos de fornecedores externos.

**Componentes:**

- **Upload de Arquivos (PDF/Planilhas)**: Abre o explorador de arquivos para seleção de documentos (PDF, XLSX).
- **Botão Processar Dados**: Inicia o processamento e padronização dos dados enviados para a base concisa.
- **Tabela de Histórico de Cargas**: Navega para a visualização detalhada de um item processado.

### Consulta de Móveis (Vendedor)

**Rota:** `/search`

**Objetivo:** Interface de busca rápida e filtrada para consulta de estoque e especificações de móveis.

**Componentes:**

- **Input de Busca Geral (Nome/Marca)**: Filtra os resultados da busca em tempo real conforme digitação.
- **Select de Cor**: Exibe opções de cores disponíveis na base de dados.
- **Lista de Resultados Dinâmica**: Exibe os detalhes completos do móvel selecionado em um modal ou expansão.

## Requisitos Não Funcionais (UI/UX)

- **Design System Moderno**: Uso de cores Dark (Slate/Indigo), tipografia forte, botões arredondados com hover progressivo, e cursores explícitos (`cursor: pointer`) para todos os elementos interativos.
- **Responsividade Total (Mobile-First)**:
    - **A aba de Busca (`/search`)** e **A aba Admin (`/admin`)** devem ser perfeitamente utilizáveis via dispositivos móveis.
    - Sidebars devem virar gavetas ou *overlays* no celular.
    - Tabelas espalhadas (histórico, listagem de upload) e painéis de filtros devem possuir *scroll* horizontal ou amontoar flexivelmente (stacks) em telas pequenas.


