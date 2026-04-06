// ============================================
// CATÁLOGO DE PRODUTOS - Type Definitions
// ============================================

export type UserProfile =
    | "admin"
    | "vendedor"
    | "fabricante_admin"
    | "representante"
    | "lojista"
    | "arquiteto"
    | "consumidor";

export type ActorType =
    | "fabricante"
    | "representante"
    | "lojista"
    | "arquiteto"
    | "consumidor";

export type OrganizationType = "fabricante" | "lojista" | "representante";

export interface Profile {
    id: string;
    nome: string;
    perfil: UserProfile;
    email: string;
    organization_id?: string;
}

export interface Organization {
    id: string;
    name: string;
    type: OrganizationType;
    slug: string;
    created_at?: string;
}

export interface ActorProfile {
    id: string;
    user_id: string;
    organization_id?: string;
    actor_type: ActorType;

    // Fabricante
    cnpj?: string;
    razao_social?: string;
    regiao_atuacao?: string;

    // Representante
    creci?: string;
    fabricante_vinculado_id?: string;

    // Lojista
    loja_nome?: string;
    endereco?: string;
    markup_padrao?: number;

    // Arquiteto
    portfolio_url?: string;
    especialidade?: string;

    // Consumidor
    telefone?: string;
    endereco_entrega?: string;

    // Metadados
    ativo: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Fornecedor {
    id: number;
    cod_fornecedor: string;
    nome: string;
    contato?: string;
}

export interface Movel {
    id: number;
    fornecedor_id: number;
    fornecedor?: Fornecedor;
    categoria: string;
    modelo: string;
    variante?: string;
    tipo?: string;
    comprimento_cm?: number;
    largura_cm?: number;
    altura_cm?: number;
    material?: string;
    tecido?: string;
    preco: number;
    condicao_pagamento?: string;
    imagem_url?: string;
    ativo: boolean;
    created_at?: string;
}

export type CargaStatus = "processando" | "sucesso" | "falha" | "needs_human_help";

export interface Carga {
    id: number;
    nome_arquivo: string;
    data_upload: string;
    status: CargaStatus;
    registros_processados: number;
    erro_mensagem?: string;
    usuario_id: string;
    /** Quantidade de itens pendentes na fila de revisão (enriquecido pela API) */
    revisao_pendente?: number;
    /** Motivo pelo qual a IA escalou para ajuste humano */
    fallback_reason?: string;
    /** Cabeçalhos brutos do arquivo original (para mapeamento manual) */
    raw_headers?: string[];
}

export interface FieldMapping {
    id: number;
    organization_id?: string;
    fornecedor_id?: number;
    raw_key: string;
    standard_key: string;
    unit_multiplier?: number;
    confidence?: number;
    is_active: boolean;
    created_at?: string;
}

export interface Orcamento {
    id: number;
    numero: string;
    data: string;
    cliente_nome: string;
    cliente_email?: string;
    cliente_endereco?: string;
    vendedor_id: string;
    valor_total: number;
    itens?: ItemOrcamento[];
}

export interface ItemOrcamento {
    id: number;
    orcamento_id: number;
    movel_id: number;
    movel?: Movel;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
}

// Filter types for the search page
export interface MovelFilters {
    busca?: string;
    categoria?: string;
    tecido?: string;
    altura_max?: number;
    largura_max?: number;
    profundidade_max?: number;
    modelos?: string[];
}

// Pagination
export interface PaginatedResult<T> {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
