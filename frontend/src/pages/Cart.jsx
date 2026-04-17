import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { state, removeFromCart, updateQuantity } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-8">🛒</div>
        <h1 className="text-3xl font-bold text-[#3d2314] mb-4">Your cart is feeling lonely</h1>
        <p className="text-[#6b3a28] mb-8">Looks like you haven't added any beautiful crochet items yet.</p>
        <Link to="/shop" className="bg-[#6b3a28] text-[#fdf6f0] px-8 py-3 rounded-full font-semibold hover:bg-[#3d2314] transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#3d2314] mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-grow">
          <div className="space-y-6">
            {state.items.map(item => (
              <div key={item.id} className="flex items-center gap-6 bg-white p-4 rounded-xl shadow-sm border border-[#fdf6f0]">
                <div className="h-24 w-24 bg-[#f0f8ff] flex items-center justify-center text-5xl rounded-lg flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-[#3d2314] mb-1">{item.name}</h3>
                  <p className="text-[#6b3a28] font-medium">{item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-[#d4b4a0] text-[#6b3a28] flex items-center justify-center hover:bg-[#fdf6f0]"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-[#d4b4a0] text-[#6b3a28] flex items-center justify-center hover:bg-[#fdf6f0]"
                  >
                    +
                  </button>
                </div>
                <div className="w-24 text-right font-bold text-[#3d2314]">
                  ₹{item.subtotal}
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#fdf6f0] sticky top-24">
            <h2 className="text-2xl font-bold text-[#3d2314] mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[#6b3a28]">
                <span>Subtotal ({state.total_items} items)</span>
                <span>₹{state.total_price}</span>
              </div>
              <div className="flex justify-between text-[#6b3a28]">
                <span>Shipping Fee</span>
                <span>₹50</span>
              </div>
              <div className="border-t border-[#fdf6f0] pt-4 flex justify-between font-bold text-xl text-[#3d2314]">
                <span>Total</span>
                <span>₹{state.total_price + 50}</span>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="block w-full bg-[#c47c82] text-white text-center py-3 rounded-lg font-bold hover:bg-[#a85a60] transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
