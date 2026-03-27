import React from 'react';
import { LogIn, LogOut, Ticket, ShoppingCart, User as UserIcon } from 'lucide-react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onScannerClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, onScannerClick }) => {
  const [user] = useAuthState(auth);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Ticket className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tighter">TIKETI</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onScannerClick}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Staff Scanner"
          >
            <Ticket className="w-6 h-6 rotate-45" />
          </button>
          
          <button 
            onClick={onCartClick}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/20" />
              <button onClick={logout} className="p-2 text-gray-400 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
