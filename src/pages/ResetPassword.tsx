import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery token in the URL hash via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    // Also check if already in recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password !== confirm) {
      setMsg({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Senha precisa ter pelo menos 6 caracteres' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMsg({ type: 'success', text: 'Senha alterada com sucesso! Redirecionando...' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao redefinir senha' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <h1 className="font-bebas text-2xl tracking-wider bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">
            Redefinir Senha
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded p-5 space-y-4">
          {!ready && (
            <div className="text-[13px] text-muted text-center py-2">
              Validando link de recuperação...
            </div>
          )}

          <div>
            <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">
              Nova senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#161616] border-[1.5px] border-border focus:border-gold rounded-sm text-foreground font-barlow text-[15px] px-3.5 py-3 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#161616] border-[1.5px] border-border focus:border-gold rounded-sm text-foreground font-barlow text-[15px] px-3.5 py-3 outline-none transition-colors"
            />
          </div>

          {msg && (
            <div className={`text-[13px] p-2.5 rounded-sm ${msg.type === 'error' ? 'bg-danger/10 text-danger border border-danger/30' : 'bg-green-900/20 text-green-400 border border-green-700/30'}`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full bg-gradient-to-br from-gold to-gold-shine text-black font-oswald text-sm font-bold tracking-[2px] uppercase py-3 rounded-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
