import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && session) navigate('/');
  }, [session, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setMsg({ type: 'success', text: 'Conta criada! Você já pode entrar.' });
        setMode('signin');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMsg({ type: 'success', text: 'Email de recuperação enviado. Verifique sua caixa de entrada.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Erro ao processar' });
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    signin: 'Entrar como Admin',
    signup: 'Criar Conta Admin',
    forgot: 'Recuperar Senha',
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6">
          <img src="/logo-nacao-estradeira.jpg" alt="Logo" className="w-24 mx-auto mb-3 rounded" />
          <h1 className="font-bebas text-2xl tracking-wider bg-gradient-to-br from-gold to-gold-shine bg-clip-text text-transparent">
            {titles[mode]}
          </h1>
          <p className="text-xs text-muted mt-1">Acesso restrito ao Consolidado</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded p-5 space-y-4">
          <div>
            <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#161616] border-[1.5px] border-border focus:border-gold rounded-sm text-foreground font-barlow text-[15px] px-3.5 py-3 outline-none transition-colors"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block font-oswald font-medium text-[11px] tracking-[2px] uppercase text-[#a09070] mb-2">
                Senha
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
          )}

          {msg && (
            <div className={`text-[13px] p-2.5 rounded-sm ${msg.type === 'error' ? 'bg-danger/10 text-danger border border-danger/30' : 'bg-green-900/20 text-green-400 border border-green-700/30'}`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-gold to-gold-shine text-black font-oswald text-sm font-bold tracking-[2px] uppercase py-3 rounded-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Processando...' : mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar email'}
          </button>

          <div className="text-center text-[12px] space-y-1.5 pt-2">
            {mode === 'signin' && (
              <>
                <button type="button" onClick={() => { setMode('forgot'); setMsg(null); }} className="text-gold hover:underline block w-full">
                  Esqueci minha senha
                </button>
                <button type="button" onClick={() => { setMode('signup'); setMsg(null); }} className="text-muted hover:text-gold block w-full">
                  Criar conta admin
                </button>
              </>
            )}
            {mode !== 'signin' && (
              <button type="button" onClick={() => { setMode('signin'); setMsg(null); }} className="text-muted hover:text-gold">
                ← Voltar para login
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted hover:text-gold">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
