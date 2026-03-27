const Footer = () => (
  <footer className="text-center px-5 pt-7 pb-4 border-t border-[#1a1a1a] mt-10">
    <div className="inline-flex items-center gap-1.5 bg-[#161616] border border-[#252525] rounded-full px-3 py-1 text-[11px] text-[#555] font-oswald tracking-[1px] uppercase mb-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      Feito com Claude
    </div>
    <p className="text-[11px] text-[#333] leading-relaxed">
      Formulário criado com <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-[#444] border-b border-[#2a2a2a] pb-px hover:text-gold transition-colors">Claude</a> · Anthropic<br/>
      4º Aniversário Nação Estradeira · Teresina/PI · Junho 2026
    </p>
  </footer>
);

export default Footer;
