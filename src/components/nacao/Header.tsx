const Header = () => (
  <div className="relative overflow-hidden border-b-2 border-gold bg-gradient-to-b from-[#000] via-[#0e0800] to-[#1a0f00] px-5 pb-6 pt-8 text-center">
    <div className="pointer-events-none absolute inset-0" style={{background:'radial-gradient(ellipse 80% 60% at 50% 120%,rgba(201,146,42,.18),transparent)'}} />
    <img
      src="/logo-nacao-estradeira.jpg"
      alt="Logo Nação Estradeira"
      className="relative z-10 mx-auto mb-4 w-[min(200px,55vw)] drop-shadow-[0_4px_24px_rgba(201,146,42,.5)]"
    />
    <p className="font-oswald text-[13px] font-light tracking-[4px] uppercase text-gold mb-3.5">04 a 07 de junho de 2026 · Teresina/PI</p>
    <h1 className="font-bebas text-[clamp(22px,6vw,36px)] tracking-wider leading-tight text-foreground relative z-10">
      Camisetas Oficiais{' '}
      <em className="not-italic bg-gradient-to-br from-gold via-gold-shine to-gold bg-clip-text text-transparent">4º A.N.E.</em>
    </h1>
    <p className="relative z-10 mt-2.5 text-[13px] text-[#9a8a6a] leading-relaxed max-w-[380px] mx-auto">
      Intenção de compra das camisetas do 4º Aniversário Nação Estradeira.
    </p>
    <div className="mt-3 flex justify-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-sm px-3.5 py-1.5 font-oswald text-[12px] tracking-[2px] uppercase text-gold">
        <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-[#555] bg-[#111] inline-block" />
        Preta
      </span>
    </div>
  </div>
);

export default Header;
