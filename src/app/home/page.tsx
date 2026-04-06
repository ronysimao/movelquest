"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* NavigationDrawer (Sidebar) */}
      <aside className="hidden md:flex flex-col py-8 gap-1 h-screen w-72 fixed left-0 top-0 z-40 bg-[#1C1B1B] shadow-[32px_0_32px_rgba(0,0,0,0.08)]">
        <div className="px-8 mb-10">
          <h1 className="text-[#EEBD8E] font-black italic text-2xl tracking-tighter">Asisto Fab (AI)</h1>
          <p className="text-[10px] text-tertiary uppercase tracking-[0.2em] mt-1 opacity-60">Atelier Digital</p>
        </div>
        <nav className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-4 gap-1">
          {/* Active state manually determined as 'Orçamentos' for Dashboard view */}
          <Link href="/search" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="font-['Inter'] text-sm font-medium">Catálogo Inteligente</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#EEBD8E] font-bold border-r-2 border-[#EEBD8E] bg-[#2A2A2A] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">request_quote</span>
            <span className="font-['Inter'] text-sm font-medium">Orçamentos</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">factory</span>
            <span className="font-['Inter'] text-sm font-medium">Fábricas</span>
          </Link>
          <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">groups</span>
            <span className="font-['Inter'] text-sm font-medium">Clientes</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-['Inter'] text-sm font-medium">Produtos</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-['Inter'] text-sm font-medium">Tabela de Preço</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-['Inter'] text-sm font-medium">Minhas Lojas</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">person</span>
            <span className="font-['Inter'] text-sm font-medium">Usuários</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-['Inter'] text-sm font-medium">Configurações</span>
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">upload_file</span>
            <span className="font-['Inter'] text-sm font-medium">Importar Catálogo</span>
          </Link>
        </nav>
        <div className="px-8 mt-auto pt-6 border-t border-outline-variant/10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/20 relative">
              <Image 
                alt="User" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfxFAe18Ba7GvWohA2-hF_ZCFQZ2_Bsd6XWIfVRfDc91zS4L9RBT777gj_3KwnbKxoAHZqU-psAfm59zyFz_dePxciimyXB4L9l3onoyYovXMuyoVnMdxVxEWxJtkk6thsKhQQU8vHRS-rYN3MR5pv24OdTEt9hs2bMrriEp3DYjDzA_o4OIQWrfWYQsnKYHPypIYM3-VP_XCeYXawKTGRUKeJJJVCWj1ZTc6AyXPTRhIQNSr9WIA6JJVSQ5zc4GmHDXxT-K43IiE"
                width={40} height={40}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">Ricardo Silva</span>
              <span className="text-xs text-on-surface-variant">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:pl-72 min-h-screen pb-20 md:pb-0">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-6 h-16 fixed top-0 w-full z-30 bg-[#131313] md:w-[calc(100%-18rem)] md:left-72">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[#ADC6FF] hover:bg-[#2A2A2A] transition-colors p-2 rounded cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-['Inter'] tracking-tight text-xl font-bold text-[#E5E2E1] tracking-tighter">Atelier Digital</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block w-64">
              <input className="bg-surface-container-low border-none rounded px-4 py-2 text-sm w-full focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/40" placeholder="Buscar orçamentos..." type="text"/>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 cursor-pointer relative">
              <Image 
                alt="User profile avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTX7xGkQ_ff4jOnXuXR8gYqM4t7rmohBrjps63xJKcSLmWucv5w9xz_muCRepSldaDRK15Zd8R4xvcLSYY8MRhz1lPXUaWzT6kwVx3TQ_GjOw8BkP_40nv63heZT_RpNMNpZJHt9CtQwqLjAx0ctgZ3hn9FUlqYjoWgZoyagaEs7yiz0rhXyZbBlr9A4S5qay7gKc6xq0XhB9imSbncH96LgOF3sd7nQWCAm4KjNFleUfxSbDY3sWPOmKpZJhXuu24QBLJJuczF5k"
                fill
              />
            </div>
          </div>
        </header>

        <section className="pt-24 pb-12 px-6 md:px-10 max-w-7xl mx-auto">
          {/* Hero Heading Area */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-tertiary text-xs font-bold tracking-widest uppercase mb-2 block">Visão Geral</span>
              <h3 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">Crafting Excellence.</h3>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded flex items-center gap-2 hover:scale-95 duration-200 cursor-pointer">
                <span className="material-symbols-outlined text-sm">add</span>
                Novo Orçamento
              </button>
            </div>
          </div>

          {/* Bento Grid Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded">Mensal</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Vendas Totais</p>
              <h4 className="text-3xl font-bold text-on-surface mt-1">R$ 142.400</h4>
              <div className="flex items-center gap-1 mt-4 text-[10px] text-primary">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                <span>+12.5% em relação ao mês anterior</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded bg-tertiary/10 text-tertiary">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <span className="text-[10px] font-bold text-tertiary px-2 py-1 bg-tertiary/10 rounded">Ativos</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Novos Leads</p>
              <h4 className="text-3xl font-bold text-on-surface mt-1">42</h4>
              <div className="flex items-center gap-1 mt-4 text-[10px] text-tertiary">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                <span>8 aguardando primeiro contato</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded bg-secondary-container/30 text-secondary">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Pedidos em Produção</p>
              <h4 className="text-3xl font-bold text-on-surface mt-1">18</h4>
              <div className="w-full bg-surface-container-highest h-1 mt-6 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[65%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container-high transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded bg-outline-variant/20 text-on-surface">
                  <span className="material-symbols-outlined">factory</span>
                </div>
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Fábricas Ativas</p>
              <h4 className="text-3xl font-bold text-on-surface mt-1">07</h4>
              <div className="flex -space-x-2 mt-4">
                <div className="w-6 h-6 rounded-full bg-primary-container border-2 border-surface-container-low"></div>
                <div className="w-6 h-6 rounded-full bg-tertiary-container border-2 border-surface-container-low"></div>
                <div className="w-6 h-6 rounded-full bg-secondary-container border-2 border-surface-container-low"></div>
              </div>
            </div>
          </div>

          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-black/20">
                <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-[#1C1B1B]">
                  <h5 className="text-lg font-bold">Produção Recente</h5>
                  <button className="text-tertiary text-xs font-bold uppercase hover:opacity-80 transition-opacity cursor-pointer">Ver Todos</button>
                </div>
                <div className="divide-y divide-outline-variant/5">
                  <div className="px-8 py-6 flex items-center gap-6 hover:bg-surface-bright transition-colors cursor-pointer">
                    <div className="w-20 h-20 rounded bg-surface-container-lowest flex-shrink-0 relative">
                      <Image 
                        alt="Product" 
                        className="w-full h-full object-cover rounded opacity-80 group-hover:opacity-100 transition-opacity" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFpBvADDNngxtsNdKEY_jMVi1_2WFRj8rfKWseveR5v7yUnA8YF5Z1xgajIFH9XII6lW2gsvxQW0zau7hKmr8zp12FHdnlR8prvXqxuHfO5KSN-9gk58dYvRmpCl6-G22TKnkcFqzKEnvZ0SHP6YRzw7_ED1ii-hXkOggcjvoa8JEkeiM1jRo3u3_aJ20TL5ZmY1LtmiPJGHHtkMNRzYFrLd746Z_k2U5PY_g9E8H9EyzcrYm8nTrAC5Si4juXFnsqVlN3N2Ywr_s"
                        fill
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">Móveis de Luxo</span>
                      <h6 className="font-bold text-lg">Cadeira Nordic Oak</h6>
                      <p className="text-sm text-on-surface-variant">Cliente: Residencial Vila Nova</p>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-bold">Status: Lixamento</div>
                      <div className="text-xs text-on-surface-variant mt-1">Entrega em 4 dias</div>
                    </div>
                  </div>

                  <div className="px-8 py-6 flex items-center gap-6 hover:bg-surface-bright transition-colors cursor-pointer">
                    <div className="w-20 h-20 rounded bg-surface-container-lowest flex-shrink-0 relative">
                      <Image 
                        alt="Product" 
                        className="w-full h-full object-cover rounded opacity-80 transition-opacity group-hover:opacity-100" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaGBC6NE73KQA2Ek9J3fsVd1LWX4T7RSqLVZaCXQxyEbnnOsxnN2-fYFrqlGQrPuxRFxZjG-AUiGst9o2uLKE0NjmYmLNzkS_LJURwPWzi-LIZqgRpf_e7ylTueQANRIjqH_Q3nwrNdVn3ECo6OWd6KPPOIY931YTA3RgmNB1TBkY7ZWKx0fY1AA8VAY5FWDpdEaNkaA3yHCp1x1zRYF_0Uq3KSqutmeGEYhdKgBgH3FwIScVdrugLNAmx-ul8iQFin-rttqHqelg"
                        fill
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">Design Industrial</span>
                      <h6 className="font-bold text-lg">Mesa de Jantar Raw Steel</h6>
                      <p className="text-sm text-on-surface-variant">Cliente: Studio Moema</p>
                    </div>
                    <div className="text-right">
                      <div className="text-secondary font-bold">Status: Montagem</div>
                      <div className="text-xs text-on-surface-variant mt-1">Entrega em 7 dias</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-low/70 backdrop-blur-md p-8 rounded-xl border border-outline-variant/10">
                <h5 className="text-lg font-bold mb-4 text-[#EEBD8E]">Dica do Especialista AI</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed italic">
                  "A demanda por acabamentos em nogueira aumentou 15% esta semana. Considere atualizar sua Tabela de Preços para a coleção de Inverno."
                </p>
                <button className="mt-6 w-full py-3 text-xs font-bold uppercase tracking-widest border border-outline-variant/30 rounded hover:bg-tertiary hover:text-on-tertiary transition-all duration-300 cursor-pointer">
                  Atualizar Catálogo
                </button>
              </div>

              <div className="bg-surface-container-low p-6 rounded-xl">
                <h5 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Status das Fábricas</h5>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unidade Joinville</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-[10px] text-on-surface-variant">Operando</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Atelier São Paulo</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-[10px] text-on-surface-variant">Operando</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fab Sul Gesso</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                      <span className="text-[10px] text-error">Manutenção</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-xl overflow-hidden">
                <h5 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Atividade Recente</h5>
                <div className="space-y-6 relative before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/20">
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 bg-primary/20 border-2 border-primary rounded-full"></div>
                    <p className="text-xs font-bold text-on-surface">Orçamento Aprovado</p>
                    <p className="text-[10px] text-on-surface-variant">Cliente Ana Costa • 2h atrás</p>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 bg-tertiary/20 border-2 border-tertiary rounded-full"></div>
                    <p className="text-xs font-bold text-on-surface">Novo Lead Adicionado</p>
                    <p className="text-[10px] text-on-surface-variant">Origem: Site Institucional • 5h atrás</p>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 bg-outline-variant/20 border-2 border-outline-variant rounded-full"></div>
                    <p className="text-xs font-bold text-on-surface">Estoque Atualizado</p>
                    <p className="text-[10px] text-on-surface-variant">Madeira Maciça (Cerejeira) • Ontem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low/70 backdrop-blur-md h-16 flex justify-around items-center z-50 border-t border-outline-variant/10">
        <button className="flex flex-col items-center justify-center text-[#EEBD8E] cursor-pointer">
          <span className="material-symbols-outlined">request_quote</span>
          <span className="text-[10px] font-medium">Orçamentos</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#D4C4B7] opacity-70 cursor-pointer hover:opacity-100">
          <span className="material-symbols-outlined">factory</span>
          <span className="text-[10px] font-medium">Fábricas</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#D4C4B7] opacity-70 cursor-pointer hover:opacity-100">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-[10px] font-medium">Produtos</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#D4C4B7] opacity-70 cursor-pointer hover:opacity-100">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Usuário</span>
        </button>
      </nav>

      {/* Contextual FAB - Mobile Primary Action */}
      <button className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50 cursor-pointer hover:scale-105 transition-transform duration-200">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
