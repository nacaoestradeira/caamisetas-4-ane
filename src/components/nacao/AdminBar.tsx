import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminBar = () => {
  const { user, isAdmin, signOut, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="max-w-[560px] mx-auto px-4 pt-3 flex justify-end">
        <Link to="/auth" className="text-[10px] font-oswald tracking-[2px] uppercase text-muted hover:text-gold transition-colors">
          🔒 Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[560px] mx-auto px-4 pt-3 flex justify-end items-center gap-3">
      <span className="text-[10px] font-oswald tracking-[1.5px] uppercase text-gold">
        {isAdmin ? '👑 Admin' : '👤'} {user.email}
      </span>
      <button
        onClick={() => signOut()}
        className="text-[10px] font-oswald tracking-[2px] uppercase text-muted hover:text-danger transition-colors"
      >
        Sair
      </button>
    </div>
  );
};

export default AdminBar;
