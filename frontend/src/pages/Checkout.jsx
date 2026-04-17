import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to dynamically load the Razorpay script
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { state, clearCart } = useCart();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: currentUser ? currentUser.displayName?.split(' ')[0] || '' : '', 
    lastName: currentUser ? currentUser.displayName?.split(' ')[1] || '' : '', 
    email: currentUser ? currentUser.email : '', 
    phone: '', line1: '', city: '', state: '', pincode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'online' | 'cod' | 'whatsapp'

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const displayRazorpay = async (orderId) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    // 1. Ask backend to create a Razorpay order
    const paymentAmount = (state.total_price + 50) * 100; // paise
    const createOrderResponse = await axios.post(`${API_URL}/payment/create-order`, {
      order_id: orderId,
      amount: paymentAmount,
      currency: "INR",
      receipt: orderId
    });

    const { amount, razorpay_order_id, key_id, currency } = createOrderResponse.data;

    // 2. Open Razorpay Checkout popup
    const options = {
      key: key_id,
      amount: amount.toString(),
      currency: currency,
      name: "Crochet Boutique",
      description: "Handcrafted with love 🧶",
      order_id: razorpay_order_id,
      handler: async function (response) {
        // 3. User successfully paid, now verify signature with Backend
        try {
          const verifyData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_id: orderId
          };
          
          await axios.post(`${API_URL}/payment/verify`, verifyData);
          
          // Verify success
          clearCart();
          setSuccess(true);
        } catch (err) {
          console.error("Payment verification failed", err);
          setError("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone
      },
      theme: { color: "#c47c82" },
      // Explicitly enable UPI and all payment methods
      config: {
        display: {
          blocks: {
            upi_block: {
              name: "Pay via UPI",
              instruments: [{ method: "upi" }]
            },
            other: {
              name: "Other Payment Modes",
              instruments: [
                { method: "card" },
                { method: "netbanking" },
                { method: "wallet" }
              ]
            }
          },
          sequence: ["block.upi_block", "block.other"],
          preferences: { show_default_blocks: false }
        }
      },
      modal: {
        ondismiss: function() {
           setLoading(false);
        }
      }
    };


    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const buildOrderPayload = () => ({
    user_id: currentUser ? currentUser.uid : null,
    items: state.items.map(item => ({
      product_id: item.id,
      name: item.name,
      image_url: item.image_url || '',
      price: parseInt(item.price.replace('₹', '')),
      quantity: item.quantity,
      subtotal: item.subtotal
    })),
    shipping_address: {
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone || '0000000000',
      line1: formData.line1,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    },
    subtotal: state.total_price,
    shipping_fee: 50,
    discount: 0,
    total: state.total_price + 50
  });

  const handleCOD = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/orders/`, { ...buildOrderPayload(), payment_status: 'cod' });
      clearCart();
      setSuccessMsg('🎉 Order placed! Pay ₹' + (state.total_price + 50) + ' when your package arrives.');
      setSuccess(true);
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/orders/`, { ...buildOrderPayload(), payment_status: 'whatsapp' });
      const itemsList = state.items.map(i => `• ${i.name} x${i.quantity} = ₹${i.subtotal}`).join('%0A');
      const msg = `Hi! I'd like to order:%0A${itemsList}%0A%0ATotal: ₹${state.total_price + 50}%0AName: ${formData.firstName} ${formData.lastName}%0AAddress: ${formData.line1}, ${formData.city}%0APhone: ${formData.phone}`;
      clearCart();
      setSuccess(true);
      setSuccessMsg('✅ Order saved! Redirecting to WhatsApp...');
      setTimeout(() => window.open(`https://wa.me/919946949286?text=${msg}`, '_blank'), 1000);
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'cod') { handleCOD(); return; }
    if (paymentMethod === 'whatsapp') { handleWhatsApp(); return; }

    // Online payment via Razorpay
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/orders/`, buildOrderPayload());
      await displayRazorpay(response.data.id);
    } catch (err) {
      console.error('Order creation failed:', err);
      setError('Failed to create order. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-8">🎉</div>
        <h1 className="text-4xl font-bold text-[#2e9e56] mb-4">Order Confirmed!</h1>
        <p className="text-[#6b3a28] mb-8 text-lg">{successMsg || 'Thank you! Your crochet order has been placed.'}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/track" 
            state={{ phone: formData.phone }}
            className="bg-[#c47c82] text-white px-8 py-3 rounded-full font-bold hover:bg-[#a85c63] transition-colors shadow-md"
          >
            Track Your Order →
          </Link>
          <Link to="/shop" className="bg-[#fcf9f6] border-2 border-[#3d2314] text-[#3d2314] px-8 py-3 rounded-full font-bold hover:bg-[#3d2314] hover:text-white transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }


  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#3d2314] mb-4">Nothing to checkout!</h1>
        <Link to="/shop" className="text-[#c47c82] font-semibold underline">Go back to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#3d2314] mb-8">Checkout</h1>
      
      {error && (
         <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
           <strong>Error: </strong> {error}
         </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Shipping Form */}
        <div className="flex-grow bg-white p-8 rounded-xl shadow-sm border border-[#fdf6f0]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-[#3d2314] mb-6">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-1">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-1">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-1">Email Address</label>
                <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-1">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} type="text" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6b3a28] mb-1">Address Line 1</label>
              <textarea name="line1" value={formData.line1} onChange={handleChange} rows="2" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-1">City</label>
                <input name="city" value={formData.city} onChange={handleChange} type="text" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-1">State</label>
                <input name="state" value={formData.state} onChange={handleChange} type="text" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6b3a28] mb-1">PIN Code</label>
                <input name="pincode" value={formData.pincode} onChange={handleChange} type="text" className="w-full p-3 border border-[#d4b4a0] rounded-lg focus:ring-2 focus:ring-[#c47c82] focus:border-transparent outline-none" required />
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-[#fdf6f0]">
              <h2 className="text-2xl font-bold text-[#3d2314] mb-4">Choose Payment</h2>
              <div className="grid grid-cols-1 gap-3">

                {/* Cash on Delivery */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#c47c82] bg-[#fff5f5]' : 'border-gray-200 hover:border-[#e8b4b8]'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#c47c82] w-4 h-4" />
                  <div className="text-3xl">🚚</div>
                  <div>
                    <p className="font-bold text-[#3d2314]">Cash on Delivery</p>
                    <p className="text-sm text-[#6b3a28]">Pay when your package arrives — no card needed!</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Popular</span>
                </label>

                {/* WhatsApp Order */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'whatsapp' ? 'border-[#25D366] bg-[#f0fff4]' : 'border-gray-200 hover:border-[#25D366]'}`}>
                  <input type="radio" name="payment" value="whatsapp" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} className="accent-[#25D366] w-4 h-4" />
                  <div className="text-3xl">💬</div>
                  <div>
                    <p className="font-bold text-[#3d2314]">Order via WhatsApp</p>
                    <p className="text-sm text-[#6b3a28]">Place order &amp; pay via UPI/bank on WhatsApp</p>
                  </div>
                </label>

                {/* Online Payment */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#1b365d] bg-[#f0f4ff]' : 'border-gray-200 hover:border-[#1b365d]'}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="accent-[#1b365d] w-4 h-4" />
                  <div className="text-3xl">💳</div>
                  <div>
                    <p className="font-bold text-[#3d2314]">Pay Online (Razorpay)</p>
                    <p className="text-sm text-[#6b3a28]">UPI, Cards, Netbanking, Wallets</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <span className="text-xs bg-white border px-1.5 py-0.5 rounded font-bold shadow-sm">UPI</span>
                    <span className="text-xs bg-white border px-1.5 py-0.5 rounded font-bold shadow-sm">Card</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-lg font-bold text-lg transition-colors mt-6 shadow-md flex items-center justify-center gap-2 text-white ${
              paymentMethod === 'whatsapp' ? 'bg-[#25D366] hover:bg-[#1da851]' :
              paymentMethod === 'cod'      ? 'bg-[#c47c82] hover:bg-[#a85c63]' :
                                            'bg-[#1b365d] hover:bg-[#122440]'
            }`}>
              {loading ? 'Processing...' :
               paymentMethod === 'whatsapp' ? `📲 Order on WhatsApp — ₹${state.total_price + 50}` :
               paymentMethod === 'cod'      ? `🚚 Place COD Order — ₹${state.total_price + 50}` :
                                              `💳 Pay Online — ₹${state.total_price + 50}`}
            </button>

          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-[#fdf6f0] p-6 rounded-xl border border-[#e8d4b4] sticky top-24">
            <h2 className="text-xl font-bold text-[#3d2314] mb-4">In your cart</h2>
            
            <div className="space-y-4 mb-6">
              {state.items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#f5d9a0] opacity-90">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="text-sm font-bold text-[#3d2314]">{item.name}</div>
                      <div className="text-xs text-[#6b3a28]">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-[#3d2314] text-sm">₹{item.subtotal}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#d4b4a0] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#6b3a28]">
                <span>Subtotal</span>
                <span>₹{state.total_price}</span>
              </div>
              <div className="flex justify-between text-[#6b3a28]">
                <span>Shipping</span>
                <span>₹50</span>
              </div>
              <div className="border-t border-[#d4b4a0] mt-2 pt-2 flex justify-between font-bold text-lg text-[#3d2314]">
                <span>Total</span>
                <span>₹{state.total_price + 50}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
