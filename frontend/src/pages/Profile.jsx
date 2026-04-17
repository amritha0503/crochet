import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Profile() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      // Backend expects the Firebase UID to fetch orders
      const res = await axios.get(`${API_URL}/orders/user/${currentUser.uid}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch user orders", err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewingItem || !rating) return;
    setSubmittingReview(true);
    try {
      await axios.post(`${API_URL}/products/${reviewingItem.item.product_id}/reviews`, {
        user_id: currentUser.uid,
        user_name: currentUser.displayName || "Anonymous",
        rating: rating,
        comment: comment,
        created_at: new Date().toISOString()
      });
      alert('Review submitted successfully! Thank you!');
      setReviewingItem(null);
      setRating(5);
      setComment("");
    } catch (err) {
      console.error(err);
      alert('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-sm border border-[#fdf6f0] text-center">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-2xl font-bold text-[#3d2314] mb-2">Welcome Back!</h1>
        <p className="text-[#6b3a28] mb-8">Sign in to track your beautiful crochet orders.</p>
        
        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#fdf6f0] mb-8 flex flex-col md:flex-row items-center gap-6">
        <img src={currentUser.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 rounded-full border-4 border-[#e8b4b8]" />
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold text-[#3d2314]">{currentUser.displayName}</h1>
          <p className="text-[#6b3a28]">{currentUser.email}</p>
        </div>
        <button onClick={logout} className="px-6 py-2 border-2 border-[#c47c82] text-[#c47c82] rounded-lg font-bold hover:bg-[#c47c82] hover:text-white transition-colors">
          Logout
        </button>
      </div>

      <h2 className="text-2xl font-bold text-[#3d2314] mb-6">Your Order History</h2>
      
      {loading ? (
        <div className="text-center text-[#6b3a28] py-8">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-[#d4b4a0] text-center">
          <div className="text-4xl mb-4">🛍️</div>
          <h3 className="text-xl font-bold text-[#3d2314]">No Orders Yet</h3>
          <p className="text-gray-500 mt-2">You haven't placed any orders yet. Time to go shopping!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-[#fdf6f0] p-6">
              <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-gray-100 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-bold text-[#3d2314]">{order.id}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="text-sm text-gray-500">Date Placed</p>
                  <p className="font-bold text-[#6b3a28]">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'delivered' ? 'bg-[#fdf0ff] text-[#9b4ac4]' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-[#3d2314] text-lg">₹{order.total}</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2">
                    <span className="text-[#6b3a28]">{item.quantity}x {item.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">₹{item.subtotal}</span>
                      {order.status === 'delivered' && (
                        <button 
                          onClick={() => setReviewingItem({ orderId: order.id, item })}
                          className="px-3 py-1 bg-[#fdf6f0] border border-[#d4b4a0] text-[#3d2314] rounded-full text-xs hover:bg-[#e8b4b8] hover:border-[#c47c82] transition-colors"
                        >
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setReviewingItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-xl"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-[#3d2314] mb-2">Write a Review</h3>
            <p className="text-[#6b3a28] mb-6 whitespace-nowrap overflow-hidden text-ellipsis">How did you like the <strong>{reviewingItem.item.name}</strong>?</p>
            
            <form onSubmit={submitReview} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-[#3d2314] mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-3xl focus:outline-none focus:scale-110 transition-transform"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#3d2314] mb-2">Your Feedback</label>
                <textarea 
                  rows="4" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#c47c82] focus:outline-none"
                  placeholder="Tell us what you loved about it..."
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingReview}
                className="w-full bg-[#3d2314] text-white py-3 rounded-xl font-bold hover:bg-[#6b3a28] disabled:opacity-50 mt-2"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
