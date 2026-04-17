import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import OrderTracking from './pages/OrderTracking';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-[#fdf6f0] font-sans flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/track" element={<OrderTracking />} />
              </Routes>
            </main>
            <footer className="bg-[#3d2314] text-[#fdf6f0] py-8 text-center mt-12 relative">
              <p>© 2026 Crochet E-Commerce. Made with ❤️</p>
              <Link to="/admin" className="absolute bottom-4 right-4 text-xs text-[#a08a7f] hover:text-[#c47c82]">Admin Login</Link>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
