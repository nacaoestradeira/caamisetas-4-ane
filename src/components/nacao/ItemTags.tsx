import { CamisetaItem } from '@/lib/constants';

interface TagProps {
  item: CamisetaItem;
}

export const ItemTags = ({ item }: TagProps) => (
  <div className="flex flex-wrap gap-1.5">
    <span className={`font-oswald text-[11px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-sm border ${item.cor === 'Preta' ? 'bg-[rgba(30,30,30,.5)] border-[#444] text-[#aaa]' : 'bg-[rgba(240,232,216,.07)] border-[rgba(240,232,216,.2)] text-[#ede8d8]'}`}>
      {item.cor}
    </span>
    <span className="font-oswald text-[11px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-sm bg-gold/10 border border-gold/20 text-gold">
      {item.modelo}
    </span>
    <span className="font-oswald text-[11px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-sm bg-gold/10 border border-gold/20 text-gold">
      {item.tamanho}
    </span>
    <span className="font-oswald text-[11px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-sm bg-[rgba(100,140,200,.12)] border-[rgba(100,140,200,.35)] border text-[#8ab4e8]">
      Manga {item.manga || 'Curta'}
    </span>
    <span className="font-oswald text-[11px] font-medium tracking-[1.5px] uppercase px-2.5 py-1 rounded-sm bg-gold/10 border border-gold/20 text-gold">
      Qtd: {item.quantidade}
    </span>
  </div>
);
