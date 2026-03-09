// ============================================
// MóvelQuest - Type Definitions
// ============================================

export type UserProfile = "admin" | "vendedor";

export interface Profile {
    id: string;
    nome: string;
    perfil: UserProfile;
    email: string;
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

export type CargaStatus = "processando" | "sucesso" | "falha";

export interface Carga {
    id: number;
    nome_arquivo: string;
    data_upload: string;
    status: CargaStatus;
    registros_processados: number;
    erro_mensagem?: string;
    usuario_id: string;
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
