import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META = {
  pending:    { icon: '📋', label: 'Order Placed',   color: '#f5a623', desc: 'We received your order and are getting ready!' },
  processing: { icon: '🧶', label: 'Being Crafted',  color: '#c47c82', desc: 'Our artisan is handcrafting your item with love.' },
  shipped:    { icon: '🚚', label: 'Out for Delivery',color: '#4a90c4', desc: 'Your package is on its way to you!' },
  delivered:  { icon: '🎉', label: 'Delivered',       color: '#2e9e56', desc: 'Enjoy your handcrafted crochet piece!' },
};

function StatusBar({ currentStatus }) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', margin: '32px 0' }}>
      {/* connecting line */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', height: '4px', background: '#f0e0d8', borderRadius: '2px', zIndex: 0 }} />
      <div style={{
        position: 'absolute', top: '24px', left: '24px', height: '4px',
        background: 'linear-gradient(90deg, #c47c82, #e8b4b8)',
        borderRadius: '2px', zIndex: 1,
        width: currentIdx === 0 ? '0%' : currentIdx === 1 ? '33%' : currentIdx === 2 ? '66%' : '100%',
        transition: 'width 1s ease'
      }} />

      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const meta = STATUS_META[step];
        return (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: done ? 'linear-gradient(135deg, #c47c82, #e8b4b8)' : '#f5ede8',
              border: `3px solid ${done ? '#c47c82' : '#e0c8b8'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: done ? '0 4px 16px rgba(196,124,130,0.35)' : 'none',
              transition: 'all 0.4s ease',
              transform: i === currentIdx ? 'scale(1.15)' : 'scale(1)',
            }}>
              {meta.icon}
            </div>
            <p style={{
              marginTop: 8, fontSize: '0.72rem', fontWeight: 700,
              color: done ? '#3d2314' : '#b0907e',
              textAlign: 'center', maxWidth: 72,
              fontFamily: "'DM Sans', sans-serif"
            }}>{meta.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const payLabel = order.payment_status === 'cod' ? '💵 Cash on Delivery'
    : order.payment_status === 'whatsapp' ? '💬 WhatsApp Order'
    : order.payment_status === 'paid' ? '✅ Paid Online'
    : '⏳ Pending';

  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: 28,
      border: '1px solid #f0e0d8', boxShadow: '0 4px 24px rgba(61,35,20,0.07)',
      marginBottom: 20, fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: '#b0907e', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order ID</p>
          <p style={{ fontWeight: 800, color: '#3d2314', fontSize: '1rem' }}>{order.id}</p>
        </div>
        <span style={{
          background: meta.color + '20', color: meta.color,
          border: `1.5px solid ${meta.color}40`,
          padding: '4px 14px', borderRadius: 100, fontWeight: 700, fontSize: '0.8rem'
        }}>
          {meta.icon} {meta.label}
        </span>
      </div>

      <p style={{ color: '#9a7060', fontSize: '0.8rem', marginBottom: 20 }}>
        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {/* Status Bar */}
      <StatusBar currentStatus={order.status} />

      {/* Current status description */}
      <div style={{
        background: meta.color + '12', border: `1px solid ${meta.color}30`,
        borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'center'
      }}>
        <p style={{ color: meta.color, fontWeight: 600, fontSize: '0.9rem' }}>{meta.desc}</p>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, color: '#3d2314', marginBottom: 8, fontSize: '0.9rem' }}>Items Ordered</p>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5ede8', fontSize: '0.875rem' }}>
            <span style={{ color: '#6b3a28' }}>{item.name} × {item.quantity}</span>
            <span style={{ fontWeight: 700, color: '#3d2314' }}>₹{item.subtotal}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
        <span style={{ fontSize: '0.82rem', color: '#9a7060' }}>Payment: {payLabel}</span>
        <span style={{ fontWeight: 800, color: '#3d2314', fontSize: '1.1rem' }}>Total: ₹{order.total}</span>
      </div>
    </div>
  );
}

export default function OrderTracking() {
  const location = useLocation();
  const [phone, setPhone] = useState(location.state?.phone || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchOrders = useCallback(async (phoneNumber) => {
    if (!phoneNumber) return;
    setLoading(true);
    setError(null);
    setOrders([]);
    setSearched(false);
    try {
      // Clean phone number: remove any non-digit characters
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const res = await axios.get(`${API_URL}/orders/track/${cleanPhone}`);
      setOrders(res.data);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'No orders found for this phone number.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search if phone is provided in location state
  useEffect(() => {
    if (location.state?.phone) {
      fetchOrders(location.state.phone);
    }
  }, [location.state, fetchOrders]);

  const handleTrack = (e) => {
    e.preventDefault();
    fetchOrders(phone);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .track-page { font-family: 'DM Sans', sans-serif; min-height: 80vh; background: #fdf6f0; padding: 60px 24px; }
        .track-card { background: white; border-radius: 24px; padding: 40px 36px; box-shadow: 0 8px 40px rgba(61,35,20,0.1); border: 1px solid #f0e0d8; max-width: 540px; margin: 0 auto 40px; }
        .track-input { width: 100%; padding: 14px 18px; border: 2px solid #e8d5c8; border-radius: 12px; font-size: 1rem; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s; box-sizing: border-box; }
        .track-input:focus { border-color: #c47c82; }
        .track-btn { width: 100%; background: linear-gradient(135deg, #3d2314, #6b3a28); color: #fdf6ef; border: none; padding: 16px; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: transform 0.2s, box-shadow 0.2s; margin-top: 12px; }
        .track-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(61,35,20,0.25); }
        .track-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="track-page">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ display: 'inline-block', background: 'rgba(196,124,130,0.12)', border: '1px solid rgba(196,124,130,0.3)', color: '#c47c82', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 18px', borderRadius: 100, marginBottom: 16 }}>
            ✦ Real-time Updates
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#3d2314', marginBottom: 12 }}>
            Track Your Order
          </h1>
          <p style={{ color: '#6b3a28', fontSize: '1.05rem', maxWidth: 420, margin: '0 auto' }}>
            Enter the phone number you used when placing your order.
          </p>
        </div>

        {/* Search Card */}
        <div className="track-card">
          <form onSubmit={handleTrack}>
            <label style={{ display: 'block', fontWeight: 700, color: '#3d2314', marginBottom: 8 }}>
              📱 Phone Number
            </label>
            <input
              className="track-input"
              type="tel"
              placeholder="e.g. 9946949286"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              maxLength={10}
            />
            <button className="track-btn" type="submit" disabled={loading}>
              {loading ? '🔍 Searching...' : '🔍 Track My Orders'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {error ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: 20, border: '1px solid #f0e0d8' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>📭</div>
                <h3 style={{ color: '#3d2314', fontWeight: 700, marginBottom: 8 }}>No Orders Found</h3>
                <p style={{ color: '#9a7060' }}>{error}</p>
                <Link to="/shop" style={{ display: 'inline-block', marginTop: 20, background: '#3d2314', color: '#fdf6ef', padding: '10px 28px', borderRadius: 100, fontWeight: 700, textDecoration: 'none' }}>
                  Shop Now →
                </Link>
              </div>
            ) : (
              <>
                <p style={{ color: '#6b3a28', fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                  Found {orders.length} order{orders.length > 1 ? 's' : ''} 🎉
                </p>
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
