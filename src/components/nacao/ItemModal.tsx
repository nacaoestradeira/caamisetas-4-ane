import { CamisetaItem } from '@/lib/constants';

interface ItemModalProps {
  open: boolean;
  editIndex: number;
  onClose: () => void;
  onSave: (item: CamisetaItem) => void;
  initial?: CamisetaItem;
}

import { useState, useEffect } from 'react';

const ItemModal = ({ open, editIndex, onClose, onSave, initial }: ItemModalProps) => {
  const [cor, setCor] = useState('');
  const [modelo, setModelo] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [manga, setManga] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      if (initial) {
        setCor(initial.cor);
        setModelo(initial.modelo);
        setTamanho(initial.tamanho);
        setQuantidade(String(initial.quantidade));
        setManga(initial.manga || 'Curta');
      } else {
        setCor('Preta'); setModelo(''); setTamanho(''); setQuantidade(''); setManga('');
      }
      setErrors({});
    }
  }, [open, initial]);

  const handleSave = () => {
    const errs: Record<string, boolean> = {};
    // cor is always 'Preta', no validation needed
    if (!modelo) errs.modelo = true;
    if (!tamanho) errs.tamanho = true;
    if (!quantidade) errs.quantidade = true;
    if (!manga) errs.manga = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ cor, modelo, tamanho, quantidade: parseInt(quantidade), manga });
  };

  if (!open) return null;

  const RadioOption = ({ name, value, checked, onChange, children }: any) => (
    <div className="relative">
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="absolute opacity-0 w-0 h-0 peer" id={`${name}-${value}`} />
      <label htmlFor={`${name}-${value}`} className="flex items-center gap-2.5 bg-[#161616] border-[1.5px] border-border rounded-sm px-3 py-3 cursor-pointer text-sm font-medium text-[#c0b090] transition-all peer-checked:border-gold peer-checked:bg-gold/[.07] peer-checked:text-gold-light">
        <span className="w-4 h-4 border-2 border-[#444] rounded-full flex-shrink-0 flex items-center justify-center transition-all peer-checked:border-gold peer-checked:bg-gold">
          {checked && <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full" />}
        </span>
        {children}
      </label>
    </div>
  );

  const SizeChip = ({ name, value, checked, onChange }: any) => (
    <div className="relative">
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="absolute opacity-0 w-0 h-0 peer" id={`${name}-${value}`} />
      <label htmlFor={`${name}-${value}`} className="flex items-center justify-center w-14 h-11 bg-[#161616] border-[1.5px] border-border rounded-sm font-oswald text-[15px] font-semibold tracking-[1px] text-[#a09070] cursor-pointer transition-all peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-gold-light">
        {value === 'Infantil' ? 'INF' : value}
      </label>
    </div>
  );

  const ErrMsg = ({ show, text }: { show: boolean; text: string }) => (
    show ? <p className="text-[11px] text-danger mt-1">{text}</p> : null
  );

  return (
    <div className="fixed inset-0 bg-black/[.88] z-[100] flex items-end justify-center transition-opacity" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[560px] bg-[#131313] border-t-2 border-gold rounded-t-lg px-5 pb-10 pt-6 max-h-[92vh] overflow-y-auto animate-fadeUp">
        <h3 className="font-bebas text-[22px] tracking-[2px] text-gold mb-4">
          {editIndex >= 0 ? `Editar Camiseta #${editIndex + 1}` : 'Nova Camiseta'}
        </h3>

        <div className="mb-4">
          <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">Cor</label>
          <div className="flex items-center gap-2.5 bg-gold/[.07] border-[1.5px] border-gold/30 rounded-sm px-3 py-2.5 text-sm text-gold-light font-oswald tracking-[1px] uppercase">
            <span className="w-5 h-5 rounded-full border-2 border-[#555] bg-[#111] flex-shrink-0" />
            Camiseta Oficial Preta
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">Modelo <span className="text-gold-light">*</span></label>
          <div className="grid grid-cols-1 gap-2">
            {['Masculino', 'Feminino', 'Infantil'].map(m => (
              <RadioOption key={m} name="m-modelo" value={m} checked={modelo === m} onChange={setModelo}>
                <span className="w-4 h-4 border-2 border-[#444] rounded-full flex-shrink-0 flex items-center justify-center" style={modelo === m ? { borderColor: 'hsl(40,73%,47%)', background: 'hsl(40,73%,47%)' } : {}}>
                  {modelo === m && <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full" />}
                </span>
                {m}
              </RadioOption>
            ))}
          </div>
          <ErrMsg show={!!errors.modelo} text="Selecione o modelo." />
        </div>

        <div className="mb-4">
          <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">Tamanho <span className="text-gold-light">*</span></label>
          <div className="flex flex-wrap gap-2">
            {['Infantil', 'PP', 'P', 'M', 'G', 'GG', 'XGG'].map(t => (
              <SizeChip key={t} name="m-tam" value={t} checked={tamanho === t} onChange={setTamanho} />
            ))}
          </div>
          <ErrMsg show={!!errors.tamanho} text="Selecione o tamanho." />
        </div>

        <div className="mb-4">
          <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">Quantidade <span className="text-gold-light">*</span></label>
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3', '4', '5'].map(q => (
              <SizeChip key={q} name="m-qtd" value={q} checked={quantidade === q} onChange={setQuantidade} />
            ))}
          </div>
          <ErrMsg show={!!errors.quantidade} text="Selecione a quantidade." />
        </div>

        <div className="mb-2">
          <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-1.5">Manga <span className="text-gold-light">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {['Curta', 'Longa'].map(m => (
              <RadioOption key={m} name="m-manga" value={m} checked={manga === m} onChange={setManga}>
                <span className="w-4 h-4 border-2 border-[#444] rounded-full flex-shrink-0 flex items-center justify-center" style={manga === m ? { borderColor: 'hsl(40,73%,47%)', background: 'hsl(40,73%,47%)' } : {}}>
                  {manga === m && <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full" />}
                </span>
                Manga {m}
              </RadioOption>
            ))}
          </div>
          <ErrMsg show={!!errors.manga} text="Selecione o tipo de manga." />
        </div>

        <div className="flex gap-2.5 mt-5">
          <button onClick={onClose} className="flex-1 py-4 bg-transparent border-[1.5px] border-gold text-gold font-oswald text-[15px] font-semibold tracking-[2px] uppercase rounded-sm cursor-pointer transition-opacity active:scale-[.98]">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-4 bg-gradient-to-br from-gold to-gold-light text-[#0a0a0a] font-oswald text-[15px] font-bold tracking-[2px] uppercase rounded-sm cursor-pointer transition-opacity hover:opacity-90 active:scale-[.98]">
            {editIndex >= 0 ? 'Salvar alteração' : 'Adicionar ao pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
