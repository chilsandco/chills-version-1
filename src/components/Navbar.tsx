import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '../CartContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'COLLECTION', path: '/collection' },
    { name: 'STORY', path: '/#story' },
    { name: 'PHILOSOPHY', path: '/#philosophy' },
  ];

  const isHome = location.pathname === '/';

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled || !isHome ? 'bg-black/90 backdrop-blur-md py-4' : 'bg-transparent py-8'}`}
    >
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Left: Menu Toggle (Mobile) */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        {/* Left: Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path} className="text-[11px] tracking-[0.2em] font-medium hover:opacity-50 transition-opacity">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group">
          <motion.img 
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', rotate: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              filter: 'blur(0px)',
              rotate: 360
            }}
            transition={{ 
              opacity: { duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              filter: { duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
            src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1774670973/Untitled_design_bofz3h.jpg" 
            alt="CHILS & CO." 
            className="h-8 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] rounded-full"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-lg md:text-xl font-display font-bold tracking-[0.25em] leading-none">CHILS & CO.</h1>
        </Link>

        {/* Right: Icons */}
        <div className="flex items-center gap-6">
          <button className="hidden md:block hover:opacity-50 transition-opacity">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link to="/checkout" className="relative hover:opacity-50 transition-opacity">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 bg-black z-[60] p-8 flex flex-col"
          >
            <div className="flex justify-end">
              <button onClick={() => setIsMenuOpen(false)}>
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-8 mt-12">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl font-display font-bold tracking-tighter"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
