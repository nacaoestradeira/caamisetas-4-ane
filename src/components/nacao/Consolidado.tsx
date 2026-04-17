import { useState, useCallback, useEffect } from 'react';
import { Pedido, GAS_URL, TAM_ORDEM, nomeModelo } from '@/lib/constants';
import { ItemTags } from './ItemTags';
import EditModal from './EditModal';
import * as XLSX from 'xlsx';

interface ConsolidadoProps {
  showToast: (msg: string, type?: string) => void;
}

const Consolidado = ({ showToast }: ConsolidadoProps) => {
  const [data, setData] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editPedido, setEditPedido] = useState<Pedido | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${GAS_URL}?t=${Date.now()}`, { method: 'GET', redirect: 'follow' });
      const text = await res.text();
      // GAS pode retornar JSON puro ou JSONP — tentar parse direto e fallback
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        const m = text.match(/^[^(]*\((.*)\)\s*;?\s*$/s);
        if (m) json = JSON.parse(m[1]);
      }
      if (json?.ok && Array.isArray(json.pedidos)) {
        setData(json.pedidos.filter((p: Pedido) => p.status !== 'excluido'));
      } else {
        console.warn('[Consolidado] Resposta inesperada do GAS:', text.slice(0, 200));
        setData([]);
      }
    } catch (e) {
      console.error('[Consolidado] Falha ao carregar pedidos:', e);
      setData([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportarPlanilha = () => {
    if (!data.length) return;
    const totais: Record<string, number> = {};
    let totalGeral = 0;
    data.forEach(p => p.itens.forEach(item => {
      const modelo = nomeModelo(item.modelo);
      const k = `${item.cor}||${modelo}||${item.tamanho}||${item.manga || 'Curta'}`;
      totais[k] = (totais[k] || 0) + item.quantidade;
      totalGeral += item.quantidade;
    }));

    const aba1: any[][] = [];
    aba1.push(['4º ANIVERSÁRIO NAÇÃO ESTRADEIRA - PEDIDOS DE CAMISETAS']);
    aba1.push([`Exportado em: ${new Date().toLocaleString('pt-BR')}   |   Participantes: ${data.length}   |   Total de camisetas: ${totalGeral}`]);
    aba1.push([]);
    aba1.push(['Nº', 'Nome', 'WhatsApp', 'Cidade', 'Entrega', 'Endereço', 'CEP', 'Cor', 'Modelo', 'Tamanho', 'Manga', 'Qtd', 'Observações', 'Data do Pedido', 'Editado em']);
    let linha = 1;
    [...data].sort((a, b) => String(a.nome).localeCompare(String(b.nome))).forEach(p => {
      const dt = p.ts ? new Date(Number(p.id) || p.ts as any).toLocaleString('pt-BR') : '';
      p.itens.forEach(item => {
        aba1.push([linha++, p.nome, p.telefone, p.cidade, p.entrega, p.endereco || '', p.cep || '', item.cor, nomeModelo(item.modelo), item.tamanho, item.manga || 'Curta', item.quantidade, p.obs || '', dt, p.editedAt || '']);
      });
    });

    const aba2: any[][] = [];
    aba2.push(['4º ANIVERSÁRIO NAÇÃO ESTRADEIRA - RESUMO PARA FORNECEDOR']);
    aba2.push([`Exportado em: ${new Date().toLocaleString('pt-BR')}`]);
    aba2.push([]);
    aba2.push(['Cor', 'Modelo', 'Tamanho', 'Manga', 'Total de Unidades']);
    Object.entries(totais).sort((a, b) => {
      const [cA, mA, tA] = a[0].split('||');
      const [cB, mB, tB] = b[0].split('||');
      if (cA !== cB) return cA.localeCompare(cB);
      if (mA !== mB) return mA.localeCompare(mB);
      return TAM_ORDEM.indexOf(tA) - TAM_ORDEM.indexOf(tB);
    }).forEach(([k, qtd]) => {
      const [cor, modelo, tamanho, manga] = k.split('||');
      aba2.push([cor, modelo, tamanho, manga, qtd]);
    });
    aba2.push(['', '', 'TOTAL GERAL', '', totalGeral]);

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(aba1);
    ws1['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 22 }, { wch: 36 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Pedidos');
    const ws2 = XLSX.utils.aoa_to_sheet(aba2);
    ws2['!cols'] = [{ wch: 24 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumo Fornecedor');
    XLSX.writeFile(wb, `pedidos_camisetas_4ANE_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Stats
  let totalPessoas = data.length, totalUnidades = 0;
  const byCor: Record<string, number> = {};
  const byModelo: Record<string, number> = {};
  const byManga: Record<string, number> = {};
  const byEntrega: Record<string, number> = {};
  const tamPorModelo: Record<string, Record<string, number>> = { Masculino: {}, Feminino: {}, Infantil: {} };

  data.forEach(p => {
    byEntrega[p.entrega] = (byEntrega[p.entrega] || 0) + 1;
    p.itens.forEach(item => {
      totalUnidades += item.quantidade;
      byCor[item.cor] = (byCor[item.cor] || 0) + item.quantidade;
      const nm = nomeModelo(item.modelo);
      byModelo[nm] = (byModelo[nm] || 0) + item.quantidade;
      const mg = item.manga || 'Curta';
      byManga[mg] = (byManga[mg] || 0) + item.quantidade;
      tamPorModelo[nm][item.tamanho] = (tamPorModelo[nm][item.tamanho] || 0) + item.quantidade;
    });
  });

  const BreakdownRow = ({ label, count, total, labelEl }: { label?: string; count: number; total: number; labelEl?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1c1c1c] last:border-b-0 text-[13px] text-[#c0b090]">
      <div className="flex items-center gap-2.5 min-w-[100px]">{labelEl || label}</div>
      <div className="h-1 bg-gold/[.15] rounded-sm flex-1 mx-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-sm transition-all duration-500" style={{ width: `${total > 0 ? (count / total * 100).toFixed(0) : 0}%` }} />
      </div>
      <span className="font-oswald text-[15px] font-semibold text-gold-light min-w-[32px] text-right">{count}</span>
    </div>
  );

  const Breakdown = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card border border-border rounded overflow-hidden mb-4">
      <div className="px-4 py-3 bg-[#141414] border-b border-border font-oswald text-[11px] tracking-[2px] uppercase text-gold">{title}</div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-9 h-9 border-[3px] border-[#222] border-t-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[13px] text-muted">Carregando pedidos...</p>
      </div>
    );
  }

  if (loaded && !data.length) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-2">🏍️</div>
        <p className="text-sm text-muted mt-2">Nenhum pedido registrado ainda.<br />Seja o primeiro!</p>
        <button onClick={load} className="mt-4 flex items-center gap-1.5 mx-auto bg-transparent border border-border rounded-sm text-muted font-oswald text-[11px] tracking-[2px] uppercase px-3.5 py-2 cursor-pointer hover:text-gold hover:border-gold transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
          Atualizar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
        <button onClick={load} className={`flex items-center gap-1.5 bg-transparent border border-border rounded-sm text-muted font-oswald text-[11px] tracking-[2px] uppercase px-3.5 py-2 cursor-pointer hover:text-gold hover:border-gold transition-colors ${loading ? 'animate-spin-custom' : ''}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
          Atualizar
        </button>
        <button onClick={exportarPlanilha} className="flex items-center gap-1.5 bg-gradient-to-br from-[#1a4a1a] to-[#1e5c1e] border-[1.5px] border-[#2d7a2d] rounded-sm px-3.5 py-2 text-[#7ecf7e] font-oswald text-[11px] tracking-[2px] uppercase cursor-pointer hover:opacity-85 transition-opacity">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          Exportar .xlsx
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="bg-card border border-border rounded p-4 text-center">
          <div className="font-bebas text-4xl tracking-[1px] bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">{totalPessoas}</div>
          <div className="font-oswald text-[10px] tracking-[2px] uppercase text-muted mt-0.5">Participantes</div>
        </div>
        <div className="bg-card border border-border rounded p-4 text-center">
          <div className="font-bebas text-4xl tracking-[1px] bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">{totalUnidades}</div>
          <div className="font-oswald text-[10px] tracking-[2px] uppercase text-muted mt-0.5">Camisetas</div>
        </div>
      </div>

      {/* Breakdowns */}
      <Breakdown title="🎨 Por Cor">
        {Object.entries(byCor).map(([cor, qtd]) => (
          <BreakdownRow key={cor} count={qtd} total={totalUnidades} labelEl={
            <span className={`font-oswald text-[11px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-sm border min-w-[58px] text-center ${cor === 'Preta' ? 'bg-[rgba(30,30,30,.5)] border-[#444] text-[#aaa]' : 'bg-gold/10 border-gold/20 text-gold'}`}>{cor}</span>
          } />
        ))}
      </Breakdown>

      <Breakdown title="👕 Por Modelo">
        {Object.entries(byModelo).map(([m, qtd]) => (
          <BreakdownRow key={m} label={m} count={qtd} total={totalUnidades} />
        ))}
      </Breakdown>

      {Object.entries(tamPorModelo).filter(([, tams]) => Object.keys(tams).length > 0).map(([grupo, tams]) => {
        const total = Object.values(tams).reduce((a, b) => a + b, 0);
        return (
          <Breakdown key={grupo} title={`📐 Tamanhos — ${grupo}`}>
            {TAM_ORDEM.filter(t => tams[t]).map(t => (
              <BreakdownRow key={t} label={t === 'Infantil' ? 'INF' : t} count={tams[t]} total={total} />
            ))}
          </Breakdown>
        );
      })}

      <Breakdown title="✂️ Por Manga">
        {Object.entries(byManga).map(([m, qtd]) => (
          <BreakdownRow key={m} label={`Manga ${m}`} count={qtd} total={totalUnidades} />
        ))}
      </Breakdown>

      <Breakdown title="📦 Por Entrega">
        {Object.entries(byEntrega).map(([tipo, qtd]) => (
          <BreakdownRow key={tipo} label={tipo} count={qtd} total={totalPessoas} />
        ))}
      </Breakdown>

      {/* Individual orders */}
      <div className="mt-5 mb-3">
        <div className="font-oswald text-[11px] tracking-[2px] uppercase text-gold mb-3">
          📋 Pedidos individuais ({totalPessoas})
        </div>
        {[...data].sort((a, b) => b.id - a.id).map(p => (
          <div key={p.id} className="bg-card border border-border rounded overflow-hidden mb-2.5 animate-fadeUp">
            <div className="px-4 py-3 bg-[#141414] border-b border-border flex items-center justify-between gap-2.5">
              <div className="flex-1 min-w-0">
                <div className="font-oswald text-sm font-semibold text-foreground truncate">{p.nome}</div>
                <div className="text-[11px] text-muted mt-0.5">{p.cidade} · {p.telefone}</div>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="text-right">
                  <div className="font-bebas text-[22px] text-gold">{p.itens.reduce((a, i) => a + i.quantidade, 0)}</div>
                  <div className="text-[10px] text-muted font-oswald tracking-[1px] uppercase">unid.</div>
                </div>
                <button onClick={() => setEditPedido(p)} className="flex items-center gap-1.5 bg-gold/[.08] border border-gold/25 rounded-sm px-3 py-2 text-gold font-oswald text-[11px] tracking-[1.5px] uppercase cursor-pointer hover:bg-gold/[.16] hover:border-gold transition-colors whitespace-nowrap">
                  ✏️ Editar
                </button>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[11px] text-[#8a7a5a] mb-2.5 font-oswald tracking-[1px] uppercase">
                {p.entrega === 'Retirada no Evento' ? '📍 Retirada no evento' : '🚚 Envio pelos Correios'}
                {p.endereco && ` · ${p.endereco}`}
              </div>
              {p.itens.map((item, ii) => (
                <div key={ii} className="flex gap-1.5 flex-wrap mb-1.5 items-center">
                  <span className="font-oswald text-[10px] text-muted tracking-[1px] uppercase min-w-[20px]">#{ii + 1}</span>
                  <ItemTags item={item} />
                </div>
              ))}
              {p.obs && <div className="mt-2 text-xs text-[#7a6a4a] italic">"{p.obs}"</div>}
            </div>
          </div>
        ))}
      </div>

      <EditModal
        open={!!editPedido}
        pedido={editPedido}
        onClose={() => setEditPedido(null)}
        onSaved={load}
        onDeleted={load}
        showToast={showToast}
      />
    </div>
  );
};

export default Consolidado;
