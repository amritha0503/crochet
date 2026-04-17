import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { state } = useCart();
  const { currentUser } = useAuth();

  return (
    <nav className="bg-[#fdf6f0] shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-[#6b3a28] flex items-center gap-2">
              <span>🧶</span> Crochet Boutique
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link to="/" className="text-[#3d2314] hover:text-[#c47c82] px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-[#3d2314] hover:text-[#c47c82] px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Shop
            </Link>
            <Link to="/track" className="text-[#3d2314] hover:text-[#c47c82] px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Track Order
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/profile" className="text-[#3d2314] hover:text-[#c47c82] transition-colors font-bold flex items-center gap-2">
              {currentUser ? (
                <>
                 <img src={currentUser.photoURL || 'https://via.placeholder.com/30'} alt="Pfp" className="w-6 h-6 rounded-full border border-[#3d2314]" />
                 <span className="hidden sm:inline">{currentUser.displayName?.split(' ')[0]}</span>
                </>
              ) : (
                'Login'
              )}
            </Link>
            <Link to="/cart" className="text-[#3d2314] hover:text-[#c47c82] p-2 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {state.total_items > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#c47c82] rounded-full">
                  {state.total_items}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
