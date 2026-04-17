import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

const categories = [
  { id: 'all', name: 'All Products', emoji: '🌟' },
  { id: 'amigurumi', name: 'Amigurumi', emoji: '🧸' },
  { id: 'bags', name: 'Bags', emoji: '👜' },
  { id: 'home-decor', name: 'Home Decor', emoji: '🏠' },
  { id: 'accessories', name: 'Accessories', emoji: '🎀' }
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const { state, addToCart: contextAddToCart } = useCart();
  const { currentUser, loginWithGoogle } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const getEmojiForCategory = (cat) => {
    return categories.find(c => c.id === cat)?.emoji || '🧶';
  };

  const addToCart = (product, e) => {
    e.preventDefault(); // prevent triggering the Link navigation
    e.stopPropagation();
    
    if (!currentUser) {
      loginWithGoogle();
      return;
    }

    contextAddToCart({
      id: product.id,
      name: product.name,
      price: `₹${product.price}`,
      emoji: getEmojiForCategory(product.category),
      image_url: product.images && product.images[0] ? product.images[0] : null
    });
  };

  const getButtonUI = (product) => {
    const inCart = state.items.some(item => item.id === product.id);

    if (!currentUser) {
      return (
        <button 
          onClick={(e) => addToCart(product, e)}
          className="mt-4 w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
          Login to Buy
        </button>
      );
    }

    if (inCart) {
      return (
        <Link 
          to="/cart"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 w-full block text-center bg-[#fdf6f0] border-2 border-[#3d2314] text-[#3d2314] font-bold py-2 rounded-lg hover:bg-[#3d2314] hover:text-white transition-colors"
        >
          View in Cart →
        </Link>
      );
    }

    return (
      <button 
        onClick={(e) => addToCart(product, e)}
        disabled={product.stock === 0}
        className="mt-4 w-full bg-[#3d2314] text-[#fdf6f0] font-bold py-2 rounded-lg hover:bg-[#6b3a28] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
      </button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-4 mb-12 justify-center">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-3 rounded-full font-bold shadow-sm transition-colors text-lg flex items-center gap-2 ${
              activeCategory === category.id 
                ? 'bg-[#3d2314] text-[#fdf6f0]' 
                : 'bg-white text-[#3d2314] hover:bg-[#fdf6f0] border border-[#d4b4a0]'
            }`}
          >
            <span>{category.emoji}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.filter(p => p.is_active).map(product => (
          <Link key={product.id} to={`/product/${product.slug}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#fdf6f0] flex flex-col group block">
            {/* Image Placeholder */}
            <div className="h-48 bg-gray-50 flex items-center justify-center text-6xl shadow-inner overflow-hidden relative">
              {product.images && product.images[0] ? (
                 <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (<span>{getEmojiForCategory(product.category)}</span>)}
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-[#3d2314] leading-tight">{product.name}</h3>
                <span className="font-black text-[#c47c82] ml-2 tracking-tight">₹{product.price}</span>
              </div>
              <p className="text-sm text-[#6b3a28] line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
              
              <div className="mt-auto">
                {getButtonUI(product)}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-[#6b3a28] font-medium">Sorry, no products found in this category yet!</p>
        </div>
      )}
    </div>
  );
}
