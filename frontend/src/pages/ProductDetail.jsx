import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Interactive Star Rating Component
function StarRating({ rating, onRate, interactive = false, size = 'text-xl' }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => interactive && setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} transition-all duration-150 ${interactive ? 'cursor-pointer' : ''} ${
            star <= (interactive ? (hovered || rating) : rating)
              ? 'text-yellow-400 drop-shadow-sm'
              : 'text-gray-300'
          } ${interactive && star <= hovered ? 'scale-125' : ''}`}
          style={{ transition: 'transform 0.15s ease, color 0.15s ease' }}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { state, addToCart } = useCart();
  const { currentUser, loginWithGoogle } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  // Pre-fill review if user already submitted one
  useEffect(() => {
    if (product && currentUser && product.reviews) {
      const existing = product.reviews.find(r => r.user_id === currentUser.uid);
      if (existing) {
        setHasExistingReview(true);
        // Only override state if we aren't actively submitting or just submitted
        if (!submittingReview && !reviewSuccess) {
          setReviewRating(existing.rating);
          setReviewComment(existing.comment);
        }
      }
    }
  }, [product, currentUser, submittingReview, reviewSuccess]);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/`);
      const found = res.data.find(p => p.slug === slug);
      if (found) {
        setProduct(found);
        setSelectedImage(found.images?.[0] || null);
      } else {
        navigate('/shop');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      alert('Please select a star rating');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Please write a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await axios.post(`${API_URL}/products/${product.id}/reviews`, {
        user_id: currentUser.uid,
        user_name: currentUser.displayName || 'Anonymous',
        rating: reviewRating,
        comment: reviewComment.trim(),
        created_at: new Date().toISOString()
      });
      setProduct(res.data);
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-gray-500">Loading product details...</div>;
  }

  if (!product) return null;

  const currentVariantString = product.variants && product.variants.length > 0 
    ? Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')
    : null;

  const inCart = state.items.some(item => item.id === product.id && item.variant === currentVariantString);
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0) {
      const missing = product.variants.find(v => !selectedVariants[v.name]);
      if (missing) {
        alert(`Please select a ${missing.name}`);
        return;
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: `₹${product.price}`,
      emoji: '🧶',
      image_url: product.images && product.images[0] ? product.images[0] : null,
      variant: currentVariantString
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
             {selectedImage ? (
               <img
                 src={selectedImage}
                 alt={product.name}
                 className="w-full h-full object-cover transition-opacity duration-300"
               />
             ) : <span>🧸</span>}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`view ${i + 1}`}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl object-cover shadow-sm cursor-pointer transition-all duration-200 ${
                    selectedImage === img
                      ? 'border-2 border-[#c47c82] scale-105 shadow-md'
                      : 'border border-gray-200 hover:border-[#e8b4b8] hover:scale-105'
                  }`}
                />
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
            
            {/* Average Rating */}
            {avgRating && (
              <div className="flex items-center gap-3 mt-2">
                <StarRating rating={Math.round(parseFloat(avgRating))} size="text-lg" />
                <span className="text-[#6b3a28] font-semibold text-sm">
                  {avgRating} out of 5
                </span>
                <span className="text-gray-400 text-sm">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

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
          
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <p className="font-bold text-[#3d2314] mb-2">Options</p>
              <div className="space-y-4">
                {product.variants.map((v, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">{v.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt, j) => (
                        <button
                          key={j}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                          className={`px-4 py-2 border rounded-xl font-bold text-sm transition-colors ${
                            selectedVariants[v.name] === opt 
                              ? 'bg-[#c47c82] text-white border-[#c47c82]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#c47c82]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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

      {/* ===== Reviews Section ===== */}
      <div className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-[#fdf6f0]">
        <h2 className="text-2xl font-bold text-[#3d2314] mb-6 flex items-center gap-3">
          💬 Customer Reviews
          {reviews.length > 0 && (
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {reviews.length}
            </span>
          )}
        </h2>

        {/* Write a Review Form */}
        {currentUser ? (
          <div className="mb-8 p-6 bg-gradient-to-br from-[#fdf6f0] to-[#fef9f5] rounded-2xl border border-[#e8d5c8]">
            <h3 className="text-xl font-bold text-[#3d2314] mb-4">
              {hasExistingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            
            {reviewSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium text-sm flex items-center gap-2">
                ✅ Thank you! Your review has been {hasExistingReview ? 'updated' : 'submitted'}.
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-2">Your Rating</label>
                <StarRating rating={reviewRating} onRate={setReviewRating} interactive size="text-3xl" />
                {reviewRating > 0 && (
                  <span className="text-sm text-[#c47c82] font-medium ml-2">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-2">Your Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows="3"
                  className="w-full p-4 border border-[#d4b4a0] rounded-xl focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none resize-none bg-white text-[#3d2314] placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview || reviewRating === 0}
                className="bg-[#3d2314] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6b3a28] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? (hasExistingReview ? 'Updating...' : 'Submitting...') : (hasExistingReview ? 'Update Review' : 'Submit Review')}
              </button>
            </form>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-[#fdf6f0] rounded-2xl border border-dashed border-[#d4b4a0] text-center">
            <p className="text-[#6b3a28] mb-3">Sign in to share your review</p>
            <button
              onClick={loginWithGoogle}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm text-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        )}

        {/* Existing Reviews */}
        {reviews.length > 0 ? (
          <div className="grid gap-4">
            {reviews.slice().reverse().map((review, i) => (
              <div key={i} className="p-6 bg-[#fcf9f6] rounded-2xl border border-[#f5e0d8] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8b4b8] to-[#c47c82] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {review.user_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <span className="font-bold text-[#3d2314] block">{review.user_name}</span>
                      <span className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="text-sm" />
                </div>
                <p className="text-[#6b3a28] italic leading-relaxed">"{review.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}

