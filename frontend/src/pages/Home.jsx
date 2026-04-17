import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

// Floating particle component
function Particle({ style }) {
  return <div className="particle" style={style} />;
}

export default function Home() {
  const { currentUser, loginWithGoogle } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    fetchFeatured();
    // Trigger hero animation on load
    const t = setTimeout(() => setHeroVisible(true), 150);

    const handleScroll = () => {
      requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for Scroll Reveals
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scrolled-in');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // We use a timeout to let React render elements first
    const t2 = setTimeout(() => {
      const hiddenElements = document.querySelectorAll('.scroll-hidden');
      hiddenElements.forEach(el => observer.observe(el));
    }, 500);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Make sure we re-observe when featured products load (for the marquee)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scrolled-in');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.scroll-hidden');
    hiddenElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [featuredProducts]);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/`);
      const featured = res.data.filter(p => p.is_featured);
      setFeaturedProducts(featured.length > 0 ? featured : res.data.slice(0, 8));
    } catch (err) {
      console.error("Failed to load products");
    }
  };

  const marqueeItems = [...featuredProducts, ...featuredProducts, ...featuredProducts, ...featuredProducts];

  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${4 + Math.random() * 6}s`,
    width: `${6 + Math.random() * 10}px`,
    height: `${6 + Math.random() * 10}px`,
    opacity: 0.12 + Math.random() * 0.2,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --cream: #fdf6ef;
          --blush: #e8b4b8;
          --rose: #c47c82;
          --cocoa: #3d2314;
          --sienna: #6b3a28;
          --sand: #d4b4a0;
          --warm-white: #fffaf6;
        }

        body { background: var(--cream); }

        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }

        /* ---- Hero ---- */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(135deg, #f5cdd0 0%, #e8b4b8 40%, #d4a0a8 70%, #c47c82 100%);
        }

        .hero-bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          pointer-events: none;
        }
        .blob-1 { width: 600px; height: 600px; background: #fdf0d5; top: -200px; left: -200px; animation: blobDrift 14s ease-in-out infinite alternate; }
        .blob-2 { width: 500px; height: 500px; background: #f5cdd0; bottom: -180px; right: -180px; animation: blobDrift 10s ease-in-out infinite alternate-reverse; }
        .blob-3 { width: 350px; height: 350px; background: #fff0e8; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: blobDrift 8s ease-in-out infinite alternate; }

        @keyframes blobDrift {
          from { transform: scale(1) translate(0,0); }
          to   { transform: scale(1.12) translate(30px, -20px); }
        }

        /* Texture grain overlay */
        .grain-overlay {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.5;
        }

        /* Particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: white;
          pointer-events: none;
          animation: floatUp var(--dur, 6s) ease-in-out var(--delay, 0s) infinite alternate;
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-40px) scale(1.15); }
        }

        /* Decorative yarn balls */
        .deco-yarn {
          position: absolute;
          pointer-events: none;
          font-size: 5rem;
          opacity: 0.15;
          animation: yarnSpin 20s linear infinite;
        }
        @keyframes yarnSpin {
          from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }

        /* Hero card */
        .hero-card {
          position: relative; z-index: 10;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 32px;
          padding: 64px 56px;
          box-shadow: 0 32px 80px rgba(61,35,20,0.18), 0 0 0 1px rgba(255,255,255,0.4) inset;
          max-width: 700px;
          text-align: center;
          transition: transform 0.3s ease;
        }
        .hero-card:hover { transform: translateY(-4px); }

        /* Hero text reveal */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-1 { transition-delay: 0.1s; }
        .reveal-2 { transition-delay: 0.25s; }
        .reveal-3 { transition-delay: 0.42s; }
        .reveal-4 { transition-delay: 0.58s; }

        /* Scroll Animation Utility */
        .scroll-hidden {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-hidden.scrolled-in {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-100 { transition-delay: 0.1s; }
        .delay-200 { transition-delay: 0.2s; }
        .delay-300 { transition-delay: 0.3s; }
        .delay-400 { transition-delay: 0.4s; }

        /* Badge */
        .badge {
          display: inline-block;
          background: rgba(196,124,130,0.18);
          border: 1px solid rgba(196,124,130,0.4);
          color: #3d2314;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 6px 18px;
          border-radius: 100px;
          margin-bottom: 24px;
        }

        /* CTA buttons */
        .btn-primary {
          background: linear-gradient(135deg, #3d2314 0%, #6b3a28 100%);
          color: #fdf6ef;
          border: none;
          padding: 18px 48px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 1.05rem;
          letter-spacing: 0.02em;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(61,35,20,0.25);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%);
        }
        .btn-primary:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 16px 48px rgba(61,35,20,0.3); }

        .btn-google {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          background: white;
          color: #3d2314;
          border: 1.5px solid rgba(61,35,20,0.12);
          padding: 16px 36px;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(61,35,20,0.1);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          width: 100%;
          max-width: 280px;
        }
        .btn-google:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(61,35,20,0.15); }

        /* Scroll indicator */
        .scroll-indicator {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: rgba(61,35,20,0.5); font-family: 'DM Sans', sans-serif; font-size: 0.7rem;
          letter-spacing: 0.12em; text-transform: uppercase; animation: scrollBounce 2s ease-in-out infinite;
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }

        /* ---- Marquee ---- */
        .marquee-section { background: var(--warm-white); border-top: 1px solid #e8d5c8; border-bottom: 1px solid #e8d5c8; }
        .animate-marquee { animation: marquee 35s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .product-card {
          background: white;
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 2px 16px rgba(61,35,20,0.06);
          border: 1px solid rgba(212,180,160,0.3);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          overflow: hidden;
          position: relative;
          display: block;
          text-decoration: none;
        }
        .product-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(232,180,184,0.08) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .product-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 16px 48px rgba(61,35,20,0.12); }
        .product-card:hover::before { opacity: 1; }
        
        .product-img-wrap img { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .product-card:hover .product-img-wrap img { transform: scale(1.1); }

        .product-img-wrap {
          aspect-ratio: 1;
          background: linear-gradient(135deg, #fdf0e8 0%, #f5e0d8 100%);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem;
        }

        /* ---- Features ---- */
        .features-section { background: var(--cream); padding: 100px 24px; }
        .feature-card {
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          text-align: center;
          border: 1px solid rgba(212,180,160,0.3);
          box-shadow: 0 4px 24px rgba(61,35,20,0.05);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .feature-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(61,35,20,0.1); }

        .feature-icon-wrap {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbeaea 0%, #f5d5d8 100%);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          font-size: 2rem;
          box-shadow: 0 4px 16px rgba(196,124,130,0.2);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .feature-card:hover .feature-icon-wrap { transform: scale(1.15) rotate(-5deg); }

        /* ---- Banner ---- */
        .banner-section {
          background: linear-gradient(135deg, #3d2314 0%, #6b3a28 60%, #5a2e1e 100%);
          padding: 80px 24px;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .banner-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(232,180,184,0.12) 0%, transparent 60%),
                            radial-gradient(circle at 80% 50%, rgba(253,246,240,0.08) 0%, transparent 60%);
        }

        /* ---- Testimonial ---- */
        .testimonial-section { background: var(--warm-white); padding: 100px 24px; }
        .testimonial-card {
          background: white;
          border-radius: 24px;
          padding: 36px 32px;
          border: 1px solid rgba(212,180,160,0.3);
          box-shadow: 0 4px 24px rgba(61,35,20,0.05);
          transition: all 0.3s ease;
          position: relative;
        }
        .testimonial-card::before {
          content: '"';
          position: absolute; top: 16px; left: 24px;
          font-family: 'Playfair Display', serif;
          font-size: 5rem; color: rgba(196,124,130,0.15);
          line-height: 1;
        }
        .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(61,35,20,0.08); }

        /* Divider */
        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--rose);
          margin-bottom: 12px;
          display: block;
        }

        /* Animated underline */
        .animated-underline {
          position: relative; display: inline-block;
        }
        .animated-underline::after {
          content: '';
          position: absolute; bottom: -4px; left: 0;
          width: 100%; height: 3px;
          background: linear-gradient(90deg, #c47c82, #e8b4b8);
          border-radius: 2px;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.5s ease 0.3s;
        }
        .hero-card.visible .animated-underline::after { transform: scaleX(1); }

        /* Count-up stats */
        .stat-item { text-align: center; }
        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 3rem; font-weight: 900;
          color: var(--cocoa); line-height: 1;
        }
        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; color: var(--sienna); margin-top: 6px;
        }

        /* Stars */
        .stars { color: #f5a623; letter-spacing: 2px; }
      `}</style>

      <div className="font-body flex flex-col">

        {/* ===== HERO ===== */}
        <section className="hero-section">
          {/* Blobs with Parallax */}
          <div className="hero-bg-blob blob-1" style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
          <div className="hero-bg-blob blob-2" style={{ transform: `translateY(${scrollY * -0.15}px)` }} />
          <div className="hero-bg-blob blob-3" style={{ transform: `translate(-50%, calc(-50% + ${scrollY * 0.1}px))` }} />
          <div className="grain-overlay" />

          {/* Decorative emojis with Parallax */}
          <span className="deco-yarn" style={{ top: '12%', left: '6%', animationDuration: '22s', transform: `translateY(${scrollY * -0.3}px)` }}>🧶</span>
          <span className="deco-yarn" style={{ bottom: '18%', right: '7%', animationDuration: '18s', animationDirection: 'reverse', transform: `translateY(${scrollY * -0.2}px)` }}>🌸</span>
          <span className="deco-yarn" style={{ top: '55%', left: '4%', animationDuration: '28s', fontSize: '3.5rem', transform: `translateY(${scrollY * 0.2}px)` }}>✨</span>
          <span className="deco-yarn" style={{ top: '15%', right: '5%', animationDuration: '24s', fontSize: '4rem', transform: `translateY(${scrollY * 0.3}px)` }}>🧸</span>

          {/* Particles */}
          {particles.map((p, i) => (
            <div key={i} className="particle" style={{
              left: p.left, top: p.top, width: p.width, height: p.height, opacity: p.opacity,
              '--delay': p.animationDelay, '--dur': p.animationDuration,
              animationDelay: p.animationDelay, animationDuration: p.animationDuration,
            }} />
          ))}

          {/* Main card */}
          <div className={`hero-card ${heroVisible ? 'visible' : ''}`}>
            <div className={`reveal reveal-1 ${heroVisible ? 'visible' : ''}`}>
              <span className="badge">✦ New Collection 2026</span>
            </div>

            <div className={`reveal reveal-2 ${heroVisible ? 'visible' : ''}`}>
              <h1 className="font-display" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 900, color: '#3d2314', lineHeight: 1.1, marginBottom: '20px' }}>
                Handcrafted<br />
                <span className="animated-underline" style={{ color: '#c47c82', fontStyle: 'italic' }}>Warmth & Joy</span>
              </h1>
            </div>

            <div className={`reveal reveal-3 ${heroVisible ? 'visible' : ''}`}>
              <p className="font-body" style={{ fontSize: '1.1rem', color: '#6b3a28', marginBottom: '36px', fontWeight: 400, lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 36px' }}>
                Discover our magical collection of amigurumi, crochet plushies, and artisan accessories — made with love, one stitch at a time.
              </p>
            </div>

            <div className={`reveal reveal-4 ${heroVisible ? 'visible' : ''}`}>
              {!currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <button onClick={loginWithGoogle} className="btn-google">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '22px', height: '22px' }} />
                    Continue with Google
                  </button>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(61,35,20,0.45)', fontFamily: "'DM Sans', sans-serif" }}>
                    Sign in to unlock the full boutique
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <p className="font-body" style={{ color: '#6b3a28', fontWeight: 500 }}>
                    Welcome back, <strong style={{ color: '#3d2314' }}>{currentUser.displayName}</strong>! 🌸
                  </p>
                  <Link to="/shop" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    Enter the Boutique →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Scroll hint removed per user request */}
        </section>

        {/* ===== STATS BAR ===== */}
        <section style={{ background: 'white', padding: '48px 24px', borderBottom: '1px solid #ece0d8' }}>
          <div className="scroll-hidden" style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { num: '500+', label: 'Happy Customers' },
              { num: '200+', label: 'Unique Designs' },
              { num: '4.9★', label: 'Average Rating' },
            ].map((stat, i) => (
              <div key={i} className={`stat-item scroll-hidden delay-${(i + 1) * 100}`}>
                <div className="stat-number">{stat.num}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== MARQUEE ===== */}
        <section className="marquee-section" style={{ padding: '72px 0' }}>
          <div className="scroll-hidden" style={{ textAlign: 'center', marginBottom: '40px', padding: '0 24px' }}>
            <span className="section-label">Featured Products</span>
            <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#3d2314' }}>
              Sneak Peek Collection
            </h2>
            <p className="font-body" style={{ color: '#6b3a28', marginTop: '8px' }}>Hover to pause · Sign in for full details</p>
          </div>

          <div className="scroll-hidden delay-100" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Fade edges */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(to right, #fffaf6, transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', background: 'linear-gradient(to left, #fffaf6, transparent)', zIndex: 2, pointerEvents: 'none' }} />

            <div style={{ display: 'flex', width: 'max-content' }} className="animate-marquee">
              {marqueeItems.map((product, idx) => (
                <Link
                  key={idx}
                  to={currentUser ? `/product/${product.slug}` : "#"}
                  onClick={(e) => !currentUser && e.preventDefault()}
                  className="product-card"
                  style={{ width: '220px', margin: '0 14px', flexShrink: 0 }}
                >
                  <div className="product-img-wrap">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <span>🧸</span>}
                  </div>
                  <h3 className="font-body" style={{ fontWeight: 600, color: '#3d2314', fontSize: '0.95rem', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#c47c82', fontWeight: 800, fontSize: '1.1rem', fontFamily: "'DM Sans', sans-serif" }}>₹{product.price}</span>
                    <span style={{ fontSize: '0.7rem', background: '#fbeaea', color: '#c47c82', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>New</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="features-section">
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="scroll-hidden" style={{ textAlign: 'center', marginBottom: '56px' }}>
              <span className="section-label">Why Choose Us</span>
              <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 700, color: '#3d2314' }}>
                Crafted with Purpose
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              {[
                { icon: '🌿', title: 'Organic Materials', desc: 'Handmade with premium, eco-friendly organic yarns that are safe for all ages.' },
                { icon: '💝', title: 'Made with Love', desc: 'Every stitch is placed with care — no two pieces are exactly alike.' },
                { icon: '🚀', title: 'Swift Delivery', desc: 'Carefully packed and shipped nationwide with real-time tracking.' },
                { icon: '✨', title: 'Custom Orders', desc: 'Dream up your perfect piece and we\'ll bring it to life, just for you.' },
              ].map((f, i) => (
                <div key={i} className={`feature-card scroll-hidden delay-${((i % 4) + 1) * 100}`}>
                  <div className="feature-icon-wrap">{f.icon}</div>
                  <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3d2314', marginBottom: '10px' }}>{f.title}</h3>
                  <p className="font-body" style={{ color: '#6b3a28', lineHeight: 1.7, fontSize: '0.9rem' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DARK BANNER CTA ===== */}
        <section className="banner-section">
          <div className="scroll-hidden delay-100" style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
            <span className="section-label" style={{ color: 'rgba(232,180,184,0.9)' }}>Limited Time</span>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fdf6ef', marginBottom: '16px', lineHeight: 1.2 }}>
              Every Piece Tells a Story
            </h2>
            <p className="font-body" style={{ color: 'rgba(253,246,240,0.75)', marginBottom: '36px', lineHeight: 1.7 }}>
              New arrivals every week. Sign in to explore our full boutique and find your perfect companion.
            </p>
            {!currentUser ? (
              <button onClick={loginWithGoogle} className="btn-google" style={{ margin: '0 auto' }}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '22px' }} />
                Get Started Free
              </button>
            ) : (
              <Link to="/shop" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', background: 'linear-gradient(135deg, #e8b4b8 0%, #c47c82 100%)', color: '#3d2314' }}>
                Shop Now →
              </Link>
            )}
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="testimonial-section">
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="scroll-hidden" style={{ textAlign: 'center', marginBottom: '56px' }}>
              <span className="section-label">Customer Love</span>
              <h2 className="font-display" style={{ fontSize: '2.4rem', fontWeight: 700, color: '#3d2314' }}>
                What People Are Saying
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { name: 'Priya S.', text: 'The little bunny I ordered was absolutely adorable. My daughter sleeps with it every night now!', stars: 5 },
                { name: 'Ananya M.', text: 'Incredible craftsmanship. The colors are so vibrant and the yarn quality is top-notch. Will definitely order again!', stars: 5 },
                { name: 'Rohan K.', text: 'Ordered a custom piece for my girlfriend\'s birthday and it was perfect. Great communication throughout!', stars: 5 },
              ].map((t, i) => (
                <div key={i} className={`testimonial-card scroll-hidden delay-${((i % 3) + 1) * 100}`}>
                  <div className="stars" style={{ marginBottom: '14px', marginTop: '12px' }}>{'★'.repeat(t.stars)}</div>
                  <p className="font-body" style={{ color: '#3d2314', lineHeight: 1.8, marginBottom: '20px', fontStyle: 'italic' }}>{t.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #e8b4b8, #c47c82)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'DM Sans'" }}>
                      {t.name[0]}
                    </div>
                    <span className="font-body" style={{ fontWeight: 600, color: '#3d2314', fontSize: '0.9rem' }}>{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FOOTER STRIP ===== */}
        <div style={{ background: '#3d2314', padding: '48px 24px 36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <a href="https://www.instagram.com/cro.chet_stories?igsh=eGNyenUxejAyY256" target="_blank" rel="noreferrer" className="social-link instagram" aria-label="Instagram">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 110 2.881 1.44 1.44 0 010-2.881z" />
              </svg>
            </a>
            <a href="https://wa.me/9946949286" target="_blank" rel="noreferrer" className="social-link whatsapp" aria-label="WhatsApp">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.996 0A12 12 0 000 12c0 2.09.537 4.103 1.558 5.908L.005 24l6.236-1.614A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 11.996 0zm0 21.998c-1.782 0-3.522-.449-5.076-1.298l-.364-.2-.303.078-3.669.95.968-3.578.1-.383-.223-.376C2.652 15.534 2.012 13.805 2.012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.492-7.5c-.301-.15-1.781-.88-2.057-.98-.276-.1-.477-.15-.678.15s-.778.98-.954 1.18c-.176.2-.351.225-.652.075-.3-.15-1.272-.47-2.423-1.492-.895-.795-1.5-1.776-1.676-2.076-.176-.3-.019-.462.13-.612.136-.135.301-.35.452-.525.151-.175.201-.3.301-.5.101-.2.051-.375-.025-.525-.075-.15-.678-1.635-.928-2.24-.244-.59-.493-.51-.678-.52h-.578c-.201 0-.527.075-.803.375s-1.054 1.03-1.054 2.51c0 1.48 1.079 2.91 1.229 3.11.15.2 2.122 3.238 5.138 4.54 2.164.935 3.037.892 3.663.832.7-.068 1.781-.728 2.032-1.432.251-.703.251-1.305.176-1.432-.075-.125-.276-.2-.577-.35z" />
              </svg>
            </a>
          </div>
          <p className="font-body" style={{ color: 'rgba(253,246,240,0.4)', fontSize: '0.85rem' }}>
            © 2026 Crochet Stories · Handcrafted with 💝 in India
          </p>
        </div>
      </div>
    </>
  );
}