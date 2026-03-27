import { useState, useCallback } from 'react';
import Header from '@/components/nacao/Header';
import Footer from '@/components/nacao/Footer';
import Toast from '@/components/nacao/Toast';
import ItemModal from '@/components/nacao/ItemModal';
import Consolidado from '@/components/nacao/Consolidado';
import { ItemTags } from '@/components/nacao/ItemTags';
import { useAppToast } from '@/hooks/useToast';
import { CamisetaItem, GAS_URL, STEP_NAMES } from '@/lib/constants';

const Index = () => {
  const { toast, showToast } = useAppToast();
  const [page, setPage] = useState<'form' | 'consolidado'>('form');
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form fields
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [entrega, setEntrega] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [obs, setObs] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Pedidos (items in current order)
  const [pedidos, setPedidos] = useState<CamisetaItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((s: number) => {
    const errs: Record<string, boolean> = {};
    if (s === 1) {
      if (!nome.trim()) errs.nome = true;
      if (!telefone.trim()) errs.telefone = true;
      if (!cidade.trim()) errs.cidade = true;
      if (!entrega) errs.entrega = true;
      if (entrega === 'Entrega no Endereço') {
        if (!endereco.trim()) errs.endereco = true;
        if (!cep.trim()) errs.cep = true;
      }
    }
    if (s === 2) {
      if (pedidos.length === 0) errs.pedidos = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [nome, telefone, cidade, entrega, endereco, cep, pedidos]);

  const goTo = useCallback((n: number) => {
    if (n > step && !validate(step)) return;
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, validate]);

  const openModal = (idx = -1) => {
    setEditIndex(idx);
    setModalOpen(true);
  };

  const saveItem = (item: CamisetaItem) => {
    if (editIndex >= 0) {
      setPedidos(prev => prev.map((p, i) => i === editIndex ? item : p));
    } else {
      setPedidos(prev => [...prev, item]);
    }
    setModalOpen(false);
  };

  const removeItem = (idx: number) => {
    setPedidos(prev => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    setSubmitting(true);
    const pedido = {
      id: Date.now(),
      ts: new Date().toISOString(),
      nome, telefone, cidade, entrega,
      endereco: endereco || null,
      cep: cep || null,
      obs: obs || null,
      itens: pedidos
    };
    try {
      await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido) });
    } catch (e) { console.warn(e); }
    setShowSuccess(true);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setStep(1);
    setPedidos([]);
    setNome(''); setTelefone(''); setCidade('');
    setEntrega(''); setEndereco(''); setCep(''); setObs('');
    setErrors({});
    setShowSuccess(false);
    setSubmitting(false);
    setPage('form');
  };

  const switchPage = (p: 'form' | 'consolidado') => {
    setPage(p);
    if (p === 'form') setShowSuccess(false);
  };

  const Field = ({ label, required, value, onChange, id, placeholder, type = 'text', multiline = false }: any) => (
    <div className="mb-4">
      <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">
        {label} {required && <span className="text-gold-light">*</span>}
      </label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-[#161616] border-[1.5px] rounded-sm text-foreground font-barlow text-[15px] px-3.5 py-3 outline-none transition-colors resize-y min-h-[72px] ${errors[id] ? 'border-danger' : 'border-border focus:border-gold'}`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-[#161616] border-[1.5px] rounded-sm text-foreground font-barlow text-[15px] px-3.5 py-3 outline-none transition-colors ${errors[id] ? 'border-danger' : 'border-border focus:border-gold'}`} />
      )}
      {errors[id] && <p className="text-[11px] text-danger mt-1">Campo obrigatório.</p>}
    </div>
  );

  const totalCamisetas = pedidos.reduce((a, p) => a + p.quantidade, 0);

  return (
    <div className="pb-20">
      <Header />

      {/* Nav Tabs */}
      <div className="flex max-w-[560px] mx-auto border-b-2 border-[#1e1e1e]">
        <button
          onClick={() => switchPage('form')}
          className={`flex-1 py-3.5 px-2 font-oswald text-[13px] font-semibold tracking-[2px] uppercase bg-transparent border-none cursor-pointer border-b-2 -mb-[2px] transition-colors ${page === 'form' ? 'text-gold-light border-gold-light' : 'text-muted border-transparent'}`}
        >
          📋 Fazer Pedido
        </button>
        <button
          onClick={() => switchPage('consolidado')}
          className={`flex-1 py-3.5 px-2 font-oswald text-[13px] font-semibold tracking-[2px] uppercase bg-transparent border-none cursor-pointer border-b-2 -mb-[2px] transition-colors ${page === 'consolidado' ? 'text-gold-light border-gold-light' : 'text-muted border-transparent'}`}
        >
          📊 Consolidado
        </button>
      </div>

      <div className="max-w-[560px] mx-auto px-4">
        {/* FORM PAGE */}
        {page === 'form' && !showSuccess && (
          <>
            {/* Progress */}
            <div className="py-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-oswald text-xs tracking-[2px] uppercase text-gold">Etapa {step} de 3</span>
                <span className="text-xs text-muted">{STEP_NAMES[step - 1]}</span>
              </div>
              <div className="h-[3px] bg-[#222] rounded-sm overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-sm transition-all duration-400" style={{ width: `${(step / 3) * 100}%` }} />
              </div>
            </div>

            {/* Step 1: Identificação */}
            {step === 1 && (
              <div className="animate-fadeUp">
                <div className="my-6 mb-5">
                  <h2 className="font-bebas text-[26px] tracking-[2px] bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">Identificação</h2>
                  <p className="text-[13px] text-muted mt-1">Preencha seus dados para registrar o pedido</p>
                </div>

                <Field label="Nome completo" required id="nome" value={nome} onChange={setNome} placeholder="Seu nome completo" />
                <Field label="WhatsApp" required id="telefone" value={telefone} onChange={setTelefone} placeholder="(00) 00000-0000" type="tel" />
                <Field label="Cidade e Estado" required id="cidade" value={cidade} onChange={setCidade} placeholder="Ex: Cuiabá – MT" />

                <div className="mb-4">
                  <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">
                    Entrega <span className="text-gold-light">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[['Retirada no Evento', '📍 Retirar no Evento (Teresina/PI)'], ['Entrega no Endereço', '🚚 Receber no endereço (Correios)']].map(([val, label]) => (
                      <div key={val} className="relative">
                        <input type="radio" name="entrega" value={val} checked={entrega === val} onChange={() => setEntrega(val)} className="absolute opacity-0 w-0 h-0 peer" id={`ent-${val}`} />
                        <label htmlFor={`ent-${val}`} className="flex items-center gap-2.5 bg-[#161616] border-[1.5px] border-border rounded-sm px-3 py-3 cursor-pointer text-sm font-medium text-[#c0b090] transition-all peer-checked:border-gold peer-checked:bg-gold/[.07] peer-checked:text-gold-light">
                          <span className="w-4 h-4 border-2 border-[#444] rounded-full flex-shrink-0 flex items-center justify-center" style={entrega === val ? { borderColor: 'hsl(40,73%,47%)', background: 'hsl(40,73%,47%)' } : {}}>
                            {entrega === val && <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full" />}
                          </span>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.entrega && <p className="text-[11px] text-danger mt-1">Selecione a forma de entrega.</p>}
                </div>

                {entrega === 'Entrega no Endereço' && (
                  <div className="mt-3.5 p-4 bg-[#141414] border border-dashed border-border rounded-sm animate-fadeUp">
                    <div className="flex gap-2.5 items-start bg-gold/[.08] border border-gold/30 rounded p-3 mb-3.5 text-xs text-[#c0a060] leading-relaxed">
                      <span>📦</span>
                      <div><strong className="text-gold-light block mb-1">Envio pelos Correios</strong>O frete será calculado separadamente e informado via WhatsApp após o pedido.</div>
                    </div>
                    <Field label="Endereço completo" required id="endereco" value={endereco} onChange={setEndereco} placeholder="Rua, número, bairro, cidade, UF" />
                    <Field label="CEP" required id="cep" value={cep} onChange={setCep} placeholder="00000-000" />
                  </div>
                )}

                <Field label="Observações" id="obs" value={obs} onChange={setObs} placeholder="Alguma observação especial?" multiline />

                <div className="flex gap-2.5 mt-7">
                  <button onClick={() => goTo(2)} className="flex-1 py-4 bg-gradient-to-br from-gold to-gold-light text-[#0a0a0a] font-oswald text-[15px] font-bold tracking-[2px] uppercase rounded-sm cursor-pointer transition-opacity hover:opacity-90 active:scale-[.98]">
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Montar Pedido */}
            {step === 2 && (
              <div className="animate-fadeUp">
                <div className="my-6 mb-5">
                  <h2 className="font-bebas text-[26px] tracking-[2px] bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">Montar Pedido</h2>
                  <p className="text-[13px] text-muted mt-1">Adicione as camisetas que deseja encomendar</p>
                </div>

                <div className="mb-4">
                  {pedidos.map((p, i) => (
                    <div key={i} className="bg-card border border-border rounded p-3.5 mb-2.5 animate-fadeUp">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bebas text-[15px] tracking-[2px] text-gold">Camiseta #{i + 1}</span>
                        <div className="flex gap-1.5">
                          <button onClick={() => openModal(i)} className="bg-transparent border-none text-[#555] text-base cursor-pointer px-1.5 py-1 rounded-sm hover:text-gold hover:bg-gold/10 transition-colors" title="Editar">✏️</button>
                          <button onClick={() => removeItem(i)} className="bg-transparent border-none text-[#555] text-base cursor-pointer px-1.5 py-1 rounded-sm hover:text-danger hover:bg-danger/10 transition-colors" title="Remover">✕</button>
                        </div>
                      </div>
                      <ItemTags item={p} />
                    </div>
                  ))}

                  <button onClick={() => openModal(-1)} className="w-full py-3 bg-transparent border-[1.5px] border-dashed border-[#333] rounded text-[#555] font-oswald text-sm tracking-[2px] uppercase cursor-pointer transition-colors hover:border-gold hover:text-gold flex items-center justify-center gap-2">
                    + Adicionar camiseta
                  </button>

                  {errors.pedidos && <p className="text-[11px] text-danger mt-2 text-center">Adicione pelo menos uma camiseta ao pedido.</p>}
                </div>

                <div className="flex gap-2.5 mt-7">
                  <button onClick={() => goTo(1)} className="py-4 px-4.5 bg-transparent border-[1.5px] border-[#333] text-[#666] font-oswald text-[15px] font-semibold tracking-[2px] uppercase rounded-sm cursor-pointer active:scale-[.98]">←</button>
                  <button onClick={() => goTo(3)} className="flex-1 py-4 bg-gradient-to-br from-gold to-gold-light text-[#0a0a0a] font-oswald text-[15px] font-bold tracking-[2px] uppercase rounded-sm cursor-pointer transition-opacity hover:opacity-90 active:scale-[.98]">
                    Revisar pedido →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Revisão */}
            {step === 3 && (
              <div className="animate-fadeUp">
                <div className="my-6 mb-5">
                  <h2 className="font-bebas text-[26px] tracking-[2px] bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">Revisão</h2>
                  <p className="text-[13px] text-muted mt-1">Confira todos os dados antes de confirmar</p>
                </div>

                <div className="bg-card border border-border rounded overflow-hidden mb-3.5">
                  <div className="p-3.5 border-b border-border">
                    <h4 className="font-oswald text-[10px] tracking-[2px] uppercase text-gold mb-2.5">👤 Dados pessoais</h4>
                    <Row label="Nome" value={nome} />
                    <Row label="WhatsApp" value={telefone} />
                    <Row label="Cidade" value={cidade} />
                  </div>
                  <div className="p-3.5 border-b border-border">
                    <h4 className="font-oswald text-[10px] tracking-[2px] uppercase text-gold mb-2.5">📦 Entrega</h4>
                    <Row label="Forma" value={entrega} />
                    {entrega === 'Entrega no Endereço' && (
                      <>
                        <Row label="Endereço" value={endereco} />
                        <Row label="CEP" value={cep} />
                      </>
                    )}
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-oswald text-[10px] tracking-[2px] uppercase text-gold mb-2.5">👕 Camisetas ({totalCamisetas} unid.)</h4>
                    {pedidos.map((p, i) => (
                      <div key={i} className="bg-[#141414] border border-[#222] rounded p-3 mb-2">
                        <div className="font-oswald text-xs tracking-[2px] uppercase text-gold mb-2">Camiseta #{i + 1}</div>
                        <ItemTags item={p} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 mt-7">
                  <button onClick={() => goTo(2)} className="py-4 px-4.5 bg-transparent border-[1.5px] border-[#333] text-[#666] font-oswald text-[15px] font-semibold tracking-[2px] uppercase rounded-sm cursor-pointer active:scale-[.98]">←</button>
                  <button onClick={submit} disabled={submitting} className="flex-1 py-4 bg-gradient-to-br from-gold to-gold-light text-[#0a0a0a] font-oswald text-[15px] font-bold tracking-[2px] uppercase rounded-sm cursor-pointer transition-opacity hover:opacity-90 active:scale-[.98] disabled:opacity-50">
                    {submitting ? 'Salvando...' : '✔ Confirmar pedido'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* SUCCESS */}
        {page === 'form' && showSuccess && (
          <div className="text-center py-16 px-6 animate-fadeUp">
            <div className="text-7xl mb-5">🎉</div>
            <h2 className="font-bebas text-4xl tracking-[2px] bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent mb-3">Pedido Registrado!</h2>
            <p className="text-sm text-[#9a8a6a] leading-relaxed max-w-[340px] mx-auto mb-2.5">
              Obrigado, <strong>{nome.split(' ')[0]}</strong>! Seu pedido de camisetas foi registrado com sucesso.
            </p>
            <p className="text-sm text-[#9a8a6a] leading-relaxed max-w-[340px] mx-auto mb-6">
              Você será contatado via WhatsApp para confirmar o pagamento.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button onClick={() => switchPage('consolidado')} className="inline-flex items-center gap-2 bg-gold/10 border-[1.5px] border-gold rounded-sm px-6 py-3.5 text-gold font-oswald text-sm tracking-[2px] uppercase cursor-pointer hover:bg-gold/[.18] transition-colors">
                📊 Ver consolidado
              </button>
              <button onClick={resetForm} className="inline-flex items-center gap-2 bg-white/[.04] border-[1.5px] border-[#333] rounded-sm px-6 py-3.5 text-[#aaa] font-oswald text-sm tracking-[2px] uppercase cursor-pointer hover:bg-white/[.08] hover:border-[#666] hover:text-foreground transition-colors">
                ➕ Novo pedido
              </button>
            </div>
          </div>
        )}

        {/* CONSOLIDADO PAGE */}
        {page === 'consolidado' && (
          <div className="pt-6">
            <div className="mb-5 flex justify-between items-start">
              <div>
                <h2 className="font-bebas text-[26px] tracking-[2px] bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">Consolidado</h2>
                <p className="text-xs text-muted mt-1">Visão geral de todos os pedidos</p>
              </div>
              <button onClick={() => { resetForm(); switchPage('form'); }} className="inline-flex items-center gap-2 bg-white/[.04] border-[1.5px] border-[#333] rounded-sm px-3 py-2 text-[#aaa] font-oswald text-xs tracking-[2px] uppercase cursor-pointer hover:bg-white/[.08] hover:border-[#666] hover:text-foreground transition-colors">
                ➕ Novo pedido
              </button>
            </div>
            <Consolidado showToast={showToast} />
          </div>
        )}
      </div>

      <Footer />
      <Toast toast={toast} />

      <ItemModal
        open={modalOpen}
        editIndex={editIndex}
        onClose={() => setModalOpen(false)}
        onSave={saveItem}
        initial={editIndex >= 0 ? pedidos[editIndex] : undefined}
      />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-[13px] mb-1.5 text-[#9a8a6a]">
    <span>{label}</span>
    <strong className="text-foreground font-semibold text-right max-w-[60%]">{value || '–'}</strong>
  </div>
);

export default Index;
