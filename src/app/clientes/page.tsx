"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ClientesPage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen flex">
      {/* NavigationDrawer (Sidebar) */}
      <aside className="hidden md:flex flex-col py-8 gap-1 h-screen w-72 fixed left-0 top-0 z-40 bg-[#1C1B1B] shadow-[32px_0_32px_rgba(0,0,0,0.08)]">
        <div className="px-8 mb-10">
          <h1 className="text-[#EEBD8E] font-black italic text-2xl tracking-tighter">Asisto Fab (AI)</h1>
          <p className="text-[10px] text-tertiary uppercase tracking-[0.2em] mt-1 opacity-60">Atelier Digital</p>
        </div>
        <nav className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-4 gap-1">
          <Link href="/search" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="font-['Inter'] text-sm font-medium">Catálogo Inteligente</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">request_quote</span>
            <span className="font-['Inter'] text-sm font-medium">Orçamentos</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded text-[#D4C4B7] opacity-70 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all duration-300 ease-out cursor-pointer">
            <span className="material-symbols-outlined">factory</span>
            <span className="font-['Inter'] text-sm font-medium">Fábricas</span>
          </Link>
          {/* Active state manually determined as 'Clientes' for this view */}
          <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded text-[#EEBD8E] font-bold border-r-2 border-[#EEBD8E] bg-[#2A2A2A] transition-all duration-300 ease-out cursor-pointer">
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

      {/* Main Content Area */}
      <main className="md:pl-72 flex-1 min-h-screen flex flex-col pb-20 md:pb-0">
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
              <input className="bg-surface-container-low border-none rounded px-4 py-2 text-sm w-full focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/40" placeholder="Buscar clientes..." type="text"/>
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

        {/* Content Canvas */}
        <div className="pt-24 pb-12 px-6 md:px-12 flex-1 w-full max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-10">
            <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-3 font-medium tracking-wide">
              <span>REGISTROS</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-tertiary">NOVO CLIENTE</span>
            </nav>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Cadastro de Clientes</h2>
            <p className="text-on-surface-variant mt-2 max-w-2xl">Integre novos clientes ao ecossistema Asisto Fab. Cada registro é o início de um novo projeto de carpinteria digital.</p>
          </div>

          {/* Layout: Asymmetric Bento Style */}
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Primary Data */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section: Informações Básicas */}
              <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                  <h3 className="text-lg font-bold text-on-surface tracking-tight">Informações Básicas</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Tipo de Cliente */}
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4 block">Tipo de Cliente</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input defaultChecked className="peer appearance-none w-5 h-5 rounded-full border-2 border-outline-variant checked:border-primary transition-all cursor-pointer" name="tipo_cliente" type="radio"/>
                          <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-on-surface group-hover:text-primary transition-colors cursor-pointer">Pessoa Física</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input className="peer appearance-none w-5 h-5 rounded-full border-2 border-outline-variant checked:border-primary transition-all cursor-pointer" name="tipo_cliente" type="radio"/>
                          <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-on-surface group-hover:text-primary transition-colors cursor-pointer">Pessoa Jurídica</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-on-surface-variant ml-1">Nome / Razão Social</label>
                      <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="Ex: Marcenaria Design Ltda" type="text"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-on-surface-variant ml-1">CPF / CNPJ</label>
                      <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="000.000.000-00" type="text"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-on-surface-variant ml-1">E-mail Corporativo</label>
                      <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="cliente@empresa.com.br" type="email"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-on-surface-variant ml-1">Telefone / WhatsApp</label>
                      <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="(00) 00000-0000" type="tel"/>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Endereço */}
              <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  <h3 className="text-lg font-bold text-on-surface tracking-tight">Endereço de Entrega/Sede</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">CEP</label>
                    <div className="flex gap-2">
                      <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="00000-000" type="text"/>
                      <button className="bg-surface-container-highest px-3 rounded-lg hover:bg-surface-bright transition-colors text-primary flex items-center justify-center cursor-pointer" type="button">
                        <span className="material-symbols-outlined">search</span>
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-8 space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">Logradouro</label>
                    <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="Rua, Avenida, Praça..." type="text"/>
                  </div>
                  
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">Número e Complemento</label>
                    <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="Ex: 123, Sala 402" type="text"/>
                  </div>
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">Bairro</label>
                    <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="Nome do bairro" type="text"/>
                  </div>
                  
                  <div className="md:col-span-8 space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">Cidade</label>
                    <input className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none" placeholder="Cidade" type="text"/>
                  </div>
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">UF</label>
                    <select defaultValue="" className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface transition-all outline-none appearance-none cursor-pointer">
                      <option disabled value="">Estado</option>
                      <option value="SP">São Paulo (SP)</option>
                      <option value="RJ">Rio de Janeiro (RJ)</option>
                      <option value="MG">Minas Gerais (MG)</option>
                      <option value="PR">Paraná (PR)</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Secondary Metadata */}
            <div className="lg:col-span-4 space-y-6">
              {/* Section: Origem & Segmentação */}
              <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                  <h3 className="text-lg font-bold text-on-surface tracking-tight">Origem</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">Como nos conheceu?</label>
                    <select className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface transition-all outline-none cursor-pointer">
                      <option value="indicacao">Indicação</option>
                      <option value="redes_sociais">Redes Sociais</option>
                      <option value="site">Site</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-on-surface-variant ml-1">Observações Técnicas</label>
                    <textarea className="w-full bg-surface-container-high border-0 ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none resize-none" placeholder="Preferências de madeira, prazos específicos, restrições de entrega..." rows={6}></textarea>
                  </div>
                </div>
              </section>

              {/* Profile Visual Placeholder */}
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-surface-container-low border border-outline-variant/10">
                <Image 
                  alt="Workshop background" 
                  className="w-full h-full object-cover opacity-40 mix-blend-luminosity" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuByckTNVfiQORolIqEDQVhJ-ghcB1RVbK9A86dzD-wh4JCtJDHxozdmluZoD2622AOV41kT_rtPLS4jwi6yzwsoZto9AmkvWA_gcMxO9DsDsbpoI0KkdiwoR0jLZv8SbEUzD3ghjGyw-kl9y10O2tNJoKfXMdD56wknosRPEmnWMBkCsckskDAOz4aIQdVdJSZRB8PotYQndGqzhdLXDeSBJ-WKa6vPKR-VTfuns0OtGrvtn3EdETmbLD3dUIepQ0p1l44CcSoC90Q"
                  fill
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-block px-2 py-1 bg-tertiary/20 text-tertiary text-[10px] font-bold tracking-tighter uppercase rounded mb-2">Artisan Trust</div>
                  <h4 className="text-xl font-bold text-on-surface leading-tight">Excelência no Relacionamento</h4>
                  <p className="text-on-surface-variant text-sm mt-1">Um cadastro completo garante a precisão do projeto e a satisfação do cliente final.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer" type="button">
                  <span className="material-symbols-outlined">save</span>
                  Salvar Cliente
                </button>
                <button className="w-full py-4 text-on-surface-variant font-medium hover:text-on-surface transition-colors flex items-center justify-center gap-2 cursor-pointer" type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low/70 backdrop-blur-md h-16 flex justify-around items-center z-50 border-t border-outline-variant/10">
        <Link href="/home" className="flex flex-col items-center justify-center text-[#D4C4B7] opacity-70 cursor-pointer hover:opacity-100">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium">Início</span>
        </Link>
        <button className="flex flex-col items-center justify-center text-[#EEBD8E] font-bold cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          <span className="text-[10px] font-medium">Clientes</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#D4C4B7] opacity-70 cursor-pointer hover:opacity-100">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-[10px] font-medium">Estoque</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#D4C4B7] opacity-70 cursor-pointer hover:opacity-100">
          <span className="material-symbols-outlined">factory</span>
          <span className="text-[10px] font-medium">Fábrica</span>
        </button>
      </nav>
    </div>
  );
}
