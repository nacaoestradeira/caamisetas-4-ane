import { useState, useCallback } from 'react';
import { Pedido, CamisetaItem, GAS_URL, TAM_ORDEM, nomeModelo } from '@/lib/constants';
import tabelaMangaCurta from '@/assets/tabela-manga-curta.jpg';
import tabelaMangaLonga from '@/assets/tabela-manga-longa.jpg';

interface EditModalProps {
  open: boolean;
  pedido: Pedido | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  showToast: (msg: string, type?: string) => void;
}

const EditModal = ({ open, pedido, onClose, onSaved, onDeleted, showToast }: EditModalProps) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [entrega, setEntrega] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [obs, setObs] = useState('');
  const [itens, setItens] = useState<CamisetaItem[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync when pedido changes
  const [prevPedidoId, setPrevPedidoId] = useState<number | null>(null);
  if (pedido && pedido.id !== prevPedidoId) {
    setPrevPedidoId(pedido.id);
    setNome(pedido.nome);
    setTelefone(pedido.telefone);
    setCidade(pedido.cidade);
    setEntrega(pedido.entrega);
    setEndereco(pedido.endereco || '');
    setCep(pedido.cep || '');
    setObs(pedido.obs || '');
    setItens(pedido.itens.map(i => ({ ...i, manga: i.manga || 'Curta' })));
    setErrors({});
    setSaving(false);
    setDeleting(false);
    setConfirmDelete(false);
  }
  if (!pedido && prevPedidoId !== null) {
    setPrevPedidoId(null);
  }

  const updateItem = (idx: number, field: string, value: any) => {
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, [field]: field === 'quantidade' ? parseInt(value) : value } : it));
  };

  const removeItem = (idx: number) => {
    if (itens.length <= 1) { showToast('Deve haver ao menos uma camiseta', 'error'); return; }
    setItens(prev => prev.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    setItens(prev => [...prev, { cor: 'Preta', modelo: 'Masculino', tamanho: 'M', quantidade: 1, manga: 'Curta' }]);
  };

  const handleSave = async () => {
    const errs: Record<string, boolean> = {};
    if (!nome.trim()) errs.nome = true;
    if (!telefone.trim()) errs.telefone = true;
    if (!cidade.trim()) errs.cidade = true;
    if (!entrega) errs.entrega = true;
    if (entrega === 'Entrega no Endereço') {
      if (!endereco.trim()) errs.endereco = true;
      if (!cep.trim()) errs.cep = true;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    const pedidoAtualizado = {
      ...pedido,
      nome: nome.trim(), telefone: telefone.trim(), cidade: cidade.trim(),
      entrega, endereco: endereco.trim() || null, cep: cep.trim() || null,
      obs: obs.trim() || null, itens, editedAt: new Date().toISOString(),
      _action: 'edit'
    };

    try {
      await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedidoAtualizado) });
      showToast('✓ Pedido atualizado com sucesso!');
      onClose();
      setTimeout(onSaved, 1200);
    } catch {
      showToast('Erro ao salvar. Tente novamente.', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!pedido) return;
    setDeleting(true);
    try {
      await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id: pedido.id }) });
      showToast('Pedido excluído com sucesso');
      onClose();
      setTimeout(onDeleted, 1200);
    } catch { showToast('Erro ao excluir', 'error'); }
    setDeleting(false);
    setConfirmDelete(false);
  };

  if (!open || !pedido) return null;

  const Field = ({ label, required, value, onChange, id, placeholder, type = 'text', multiline = false }: any) => (
    <div className="mb-4">
      <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">{label} {required && <span className="text-gold-light">*</span>}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-[#161616] border-[1.5px] rounded-sm text-foreground font-barlow text-[15px] px-3.5 py-3 outline-none transition-colors resize-y min-h-[72px] ${errors[id] ? 'border-danger' : 'border-border focus:border-gold'}`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-[#161616] border-[1.5px] rounded-sm text-foreground font-barlow text-[15px] px-3.5 py-3 outline-none transition-colors ${errors[id] ? 'border-danger' : 'border-border focus:border-gold'}`} />
      )}
      {errors[id] && <p className="text-[11px] text-danger mt-1">Campo obrigatório.</p>}
    </div>
  );

  return (
    <>
      <div className={`fixed inset-0 bg-black/[.92] z-[200] flex items-end justify-center transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full max-w-[560px] bg-[#0f0f0f] border-t-[3px] border-gold-light rounded-t-lg px-5 pb-12 pt-6 max-h-[96vh] overflow-y-auto animate-fadeUp">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-bebas text-2xl tracking-[2px] text-gold-light">✏️ Editar Pedido</h3>
              <p className="text-xs text-muted mt-1">Pedido de {pedido.nome}</p>
            </div>
            <button onClick={onClose} className="bg-transparent border border-[#333] rounded-sm text-[#666] text-xl cursor-pointer px-2.5 py-1 leading-none hover:text-foreground hover:border-[#666] transition-colors">✕</button>
          </div>

          {/* Dados pessoais */}
          <div className="bg-[#161616] border border-[#222] rounded p-4 mb-3.5">
            <div className="font-oswald text-[10px] tracking-[2px] uppercase text-gold mb-3.5 flex items-center gap-2">👤 Dados pessoais</div>
            <Field label="Nome completo" required id="nome" value={nome} onChange={setNome} placeholder="Nome completo" />
            <Field label="WhatsApp" required id="telefone" value={telefone} onChange={setTelefone} placeholder="(00) 00000-0000" type="tel" />
            <Field label="Cidade e Estado" required id="cidade" value={cidade} onChange={setCidade} placeholder="Ex: Cuiabá – MT" />
          </div>

          {/* Entrega */}
          <div className="bg-[#161616] border border-[#222] rounded p-4 mb-3.5">
            <div className="font-oswald text-[10px] tracking-[2px] uppercase text-gold mb-3.5 flex items-center gap-2">📦 Entrega</div>
            <div className="grid grid-cols-1 gap-2 mb-3">
              {[['Retirada no Evento', 'Retirar no Evento (Teresina/PI)'], ['Entrega no Endereço', 'Receber no endereço (Correios)']].map(([val, label]) => (
                <div key={val} className="relative">
                  <input type="radio" name="edit-entrega" value={val} checked={entrega === val} onChange={() => setEntrega(val)} className="absolute opacity-0 w-0 h-0 peer" id={`ee-${val}`} />
                  <label htmlFor={`ee-${val}`} className="flex items-center gap-2.5 bg-[#161616] border-[1.5px] border-border rounded-sm px-3 py-3 cursor-pointer text-sm font-medium text-[#c0b090] transition-all peer-checked:border-gold peer-checked:bg-gold/[.07] peer-checked:text-gold-light">
                    <span className="w-4 h-4 border-2 border-[#444] rounded-full flex-shrink-0 flex items-center justify-center" style={entrega === val ? { borderColor: 'hsl(40,73%,47%)', background: 'hsl(40,73%,47%)' } : {}}>
                      {entrega === val && <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full" />}
                    </span>
                    {label}
                  </label>
                </div>
              ))}
            </div>
            {errors.entrega && <p className="text-[11px] text-danger mb-2">Selecione a entrega.</p>}
            {entrega === 'Entrega no Endereço' && (
              <div className="mt-3.5 p-4 bg-[#141414] border border-dashed border-border rounded-sm">
                <Field label="Endereço completo" required id="endereco" value={endereco} onChange={setEndereco} placeholder="Rua, número, bairro, cidade, UF" />
                <Field label="CEP" required id="cep" value={cep} onChange={setCep} placeholder="00000-000" />
              </div>
            )}
            <div className="mt-3">
              <Field label="Observações" id="obs" value={obs} onChange={setObs} placeholder="Observações adicionais..." multiline />
            </div>
          </div>

          {/* Camisetas */}
          <div className="bg-[#161616] border border-[#222] rounded p-4 mb-3.5">
            <div className="font-oswald text-[10px] tracking-[2px] uppercase text-gold mb-3.5 flex items-center gap-2">👕 Camisetas</div>
            {itens.map((item, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3.5 mb-2.5 animate-fadeUp">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-oswald text-xs tracking-[2px] uppercase text-[#7a6a4a]">Camiseta #{i + 1}</span>
                  {itens.length > 1 && (
                    <button onClick={() => removeItem(i)} className="bg-transparent border-none text-[#444] text-sm cursor-pointer px-1 hover:text-danger transition-colors">✕ Remover</button>
                  )}
                </div>

                {/* Cor - always Preta */}
                <div className="mb-3">
                  <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-1.5">Cor</label>
                  <div className="bg-gold/[.07] border-[1.5px] border-gold/30 rounded-sm px-3 py-2.5 text-sm text-gold-light font-oswald tracking-[1px] uppercase">
                    Camiseta Oficial Preta
                  </div>
                </div>

                {/* Modelo */}
                <div className="mb-3">
                  <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-1.5">Modelo</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Masculino', 'Feminino', 'Infantil'].map(m => (
                      <div key={m} className="relative">
                        <input type="radio" name={`ei-mod-${i}`} value={m} checked={item.modelo === m} onChange={() => updateItem(i, 'modelo', m)} className="absolute opacity-0 w-0 h-0 peer" id={`eim-${m}-${i}`} />
                        <label htmlFor={`eim-${m}-${i}`} className="flex items-center gap-2.5 bg-[#161616] border-[1.5px] border-border rounded-sm px-3 py-2.5 cursor-pointer text-sm text-[#c0b090] transition-all peer-checked:border-gold peer-checked:bg-gold/[.07] peer-checked:text-gold-light">
                          {m}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tamanho */}
                <div className="mb-3">
                  <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-1.5">Tamanho</label>
                  <div className="flex flex-wrap gap-2">
                    {TAM_ORDEM.map(t => (
                      <div key={t} className="relative">
                        <input type="radio" name={`ei-tam-${i}`} value={t} checked={item.tamanho === t} onChange={() => updateItem(i, 'tamanho', t)} className="absolute opacity-0 w-0 h-0 peer" id={`eit-${t}-${i}`} />
                        <label htmlFor={`eit-${t}-${i}`} className="flex items-center justify-center w-14 h-11 bg-[#161616] border-[1.5px] border-border rounded-sm font-oswald text-[15px] font-semibold tracking-[1px] text-[#a09070] cursor-pointer transition-all peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-gold-light">
                          {t === 'Infantil' ? 'INF' : t}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantidade */}
                <div className="mb-2">
                  <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-1.5">Quantidade</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(q => (
                      <div key={q} className="relative">
                        <input type="radio" name={`ei-qtd-${i}`} value={q} checked={item.quantidade === q} onChange={() => updateItem(i, 'quantidade', q)} className="absolute opacity-0 w-0 h-0 peer" id={`eiq-${q}-${i}`} />
                        <label htmlFor={`eiq-${q}-${i}`} className="flex items-center justify-center w-14 h-11 bg-[#161616] border-[1.5px] border-border rounded-sm font-oswald text-[15px] font-semibold tracking-[1px] text-[#a09070] cursor-pointer transition-all peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-gold-light">
                          {q}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manga */}
                <div>
                  <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-1.5">Manga</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Curta', 'Longa'].map(m => (
                      <div key={m} className="relative">
                        <input type="radio" name={`ei-manga-${i}`} value={m} checked={(item.manga || 'Curta') === m} onChange={() => updateItem(i, 'manga', m)} className="absolute opacity-0 w-0 h-0 peer" id={`emng-${m}-${i}`} />
                        <label htmlFor={`emng-${m}-${i}`} className="flex items-center gap-2 bg-[#161616] border-[1.5px] border-border rounded-sm px-3 py-2.5 cursor-pointer text-sm text-[#c0b090] transition-all peer-checked:border-gold peer-checked:bg-gold/[.07] peer-checked:text-gold-light">
                          Manga {m}
                        </label>
                      </div>
                    ))}
                  </div>
                  {/* Tabela de medidas */}
                  {(item.manga || 'Curta') && (
                    <div className="mt-3 bg-[#111] border border-[#222] rounded overflow-hidden">
                      <p className="font-oswald text-[10px] tracking-[2px] uppercase text-gold px-3 py-2 border-b border-[#222]">📏 Tabela de medidas — Manga {item.manga || 'Curta'}</p>
                      <img src={(item.manga || 'Curta') === 'Longa' ? tabelaMangaLonga : tabelaMangaCurta} alt={`Tabela de medidas manga ${item.manga || 'Curta'}`} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button onClick={addItem} className="w-full py-2.5 bg-transparent border-[1.5px] border-dashed border-[#2a2a2a] rounded text-[#444] font-oswald text-xs tracking-[2px] uppercase cursor-pointer transition-colors hover:border-gold hover:text-gold flex items-center justify-center gap-1.5 mt-2.5">+ Adicionar camiseta</button>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-gradient-to-br from-gold to-gold-light text-[#0a0a0a] font-oswald text-[15px] font-bold tracking-[2px] uppercase rounded-sm cursor-pointer mt-1.5 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Salvando...' : '💾 Salvar alterações'}
          </button>
          <button onClick={() => setConfirmDelete(true)} disabled={deleting} className="w-full mt-2.5 bg-transparent border-[1.5px] border-danger/40 text-danger font-oswald text-[13px] font-semibold tracking-[1px] uppercase py-3 rounded-sm cursor-pointer transition-colors hover:bg-danger/10 hover:border-danger">
            {deleting ? 'Excluindo...' : '🗑️ Excluir este pedido'}
          </button>
        </div>
      </div>

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/[.85] z-[3000] flex items-center justify-center p-5">
          <div className="bg-[#1a1a1a] border border-danger rounded-md px-6 py-7 max-w-[360px] w-full text-center">
            <h3 className="font-bebas text-[22px] tracking-[2px] text-danger mb-2.5">⚠️ Excluir Pedido</h3>
            <p className="text-[13px] text-[#a09070] leading-relaxed mb-5">
              Tem certeza que deseja excluir o pedido de <strong className="text-foreground">{pedido.nome}</strong>?<br />
              Esta ação marca o pedido como excluído.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button onClick={() => setConfirmDelete(false)} className="bg-transparent border-[1.5px] border-[#333] text-muted font-oswald text-[13px] font-semibold tracking-[1px] uppercase px-5 py-3 rounded-sm cursor-pointer">Cancelar</button>
              <button onClick={handleDelete} className="bg-danger border-none text-white font-oswald text-[13px] font-semibold tracking-[1px] uppercase px-5 py-3 rounded-sm cursor-pointer">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModal;
