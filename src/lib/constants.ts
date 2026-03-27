export const GAS_URL = 'https://script.google.com/macros/s/AKfycbypaGUP_zmVPsECCuaXLECy6S-QQqDp6Xg3w78vPMw2NeeYyFP4BwhUsGu3CnYpLR1V/exec';
export const TAM_ORDEM = ['Infantil', 'PP', 'P', 'M', 'G', 'GG', 'XGG'];
export const STEP_NAMES = ['Identificação', 'Montar Pedido', 'Confirmar Pedido'];

export interface CamisetaItem {
  cor: string;
  modelo: string;
  tamanho: string;
  quantidade: number;
  manga: string;
}

export interface Pedido {
  id: number;
  ts: string;
  nome: string;
  telefone: string;
  cidade: string;
  entrega: string;
  endereco: string | null;
  cep: string | null;
  obs: string | null;
  itens: CamisetaItem[];
  editedAt?: string;
  status?: string;
}

export function nomeModelo(m: string): string {
  if (m === 'Masculino' || m === 'Tradicional') return 'Masculino';
  if (m === 'Feminino' || m === 'Baby Look') return 'Feminino';
  return 'Infantil';
}
