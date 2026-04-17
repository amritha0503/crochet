import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { state, addToCart } = useCart();
  const { currentUser, loginWithGoogle } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      // Find the product by fetching all and filtering by slug, 
      // or ideally a backend endpoint like /products/slug/{slug}
      const res = await axios.get(`${API_URL}/products/`);
      const found = res.data.find(p => p.slug === slug);
      if (found) {
        setProduct(found);
      } else {
        // Not found
        navigate('/shop');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500">Loading product details...</div>;
  }

  if (!product) return null;

  const inCart = state.items.some(item => item.id === product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: `₹${product.price}`,
      emoji: '🧶',
      image_url: product.images && product.images[0] ? product.images[0] : null
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link to="/shop" className="text-[#c47c82] hover:text-[#3d2314] font-bold inline-flex items-center gap-2 mb-8 transition-colors">
        <span>←</span> Back to Shop
      </Link>
      
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#fdf6f0] flex flex-col md:flex-row gap-12">
        {/* Images */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center text-7xl border border-gray-100">
             {product.images && product.images[0] ? (
               <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
             ) : (<span>🧸</span>)}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <img key={i} src={img} alt="thumbnail" className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm" />
              ))}
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="md:w-1/2 flex flex-col justify-center">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-[#fdf6f0] text-[#3d2314] rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#e8b4b8]">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-[#3d2314] mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-3xl font-black text-[#c47c82]">₹{product.price}</span>
              {product.compare_price && (
                <span className="text-xl text-gray-400 line-through font-bold">₹{product.compare_price}</span>
              )}
            </div>
          </div>
          
          <div className="my-6 pt-6 border-t border-gray-100">
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{product.description}</p>
          </div>
          
          <div className="mb-8">
            <p className="font-bold text-[#3d2314] mb-2">Details</p>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Weight: {product.weight_grams} grams</li>
              <li>• Tags: {product.tags ? product.tags.join(', ') : 'None'}</li>
              <li>• Status: {product.stock > 0 ? <span className="text-green-600 font-bold">In Stock ({product.stock} left)</span> : <span className="text-red-500 font-bold">Out of Stock</span>}</li>
            </ul>
          </div>
          
          <div className="mt-auto pt-6">
            {!currentUser ? (
              <button 
                onClick={loginWithGoogle}
                className="w-full flex justify-center items-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-4 text-lg rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Sign in to Purchase
              </button>
            ) : inCart ? (
              <Link 
                to="/cart"
                className="w-full block text-center bg-[#fdf6f0] border-2 border-[#3d2314] text-[#3d2314] py-4 text-lg rounded-xl font-bold hover:bg-[#3d2314] hover:text-white transition-colors shadow-sm"
              >
                View in Cart →
              </Link>
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-[#3d2314] text-white py-4 text-lg rounded-xl font-bold hover:bg-[#6b3a28] shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Out of Stock" : "+ Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-[#fdf6f0]">
          <h2 className="text-2xl font-bold text-[#3d2314] mb-6">
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="grid gap-6">
            {product.reviews.map((review, i) => (
              <div key={i} className="p-6 bg-[#fcf9f6] rounded-2xl border border-[#f5e0d8]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-bold text-[#3d2314] block">{review.user_name}</span>
                    <span className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-yellow-400 text-sm tracking-widest">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="text-[#6b3a28] italic">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
