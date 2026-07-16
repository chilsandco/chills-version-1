import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const ProfileIcon = () => (
  <motion.div
    whileHover="hover"
    initial="initial"
    className="relative flex items-center justify-center p-1"
  >
    {/* Refined Ambient Glow - Only on Hover */}
    <motion.div
      variants={{
        initial: { opacity: 0, scale: 0.8 },
        hover: { opacity: 0.2, scale: 1.5 }
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bg-accent/30 blur-[10px] rounded-full w-full h-full"
    />
    
    <motion.svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={{
        initial: { y: 0, scale: 1 },
        hover: { y: -2, scale: 1.05 }
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {/* Head */}
      <motion.circle 
        cx="12" cy="5.5" r="2.2" 
        fill="#D4AF37"
      />
      
      {/* Body / Torso */}
      <motion.path 
        d="M10.5 8.5h3v7h-3z" 
        fill="#D4AF37"
        variants={{
          hover: { scaleY: 1.05, originY: "bottom" }
        }}
      />

      {/* Arm (Left) - Continuous Subtle Wave + Hover Acknowledgement */}
      <motion.path
        d="M10.5 9.5L7.5 6.5"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ 
          rotate: [-6, 6, -6] 
        }}
        variants={{
          hover: { rotate: [-10, 10, 0] }
        }}
        transition={{ 
          animate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          hover: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }}
        style={{ originX: "10.5px", originY: "9.5px" }}
      />

      {/* Arm (Right) */}
      <motion.path
        d="M13.5 9.5L16.5 12.5"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{
          hover: { rotate: [5, -5, 0] }
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: "13.5px", originY: "9.5px" }}
      />

      {/* Legs */}
      <path d="M11 15.5v5" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 15.5v5" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
  </motion.div>
);

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [pulse, setPulse] = useState(false);
  const isProductPage = location.pathname.startsWith('/product/');

  useEffect(() => {
    const handlePulse = () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    };
    const handleShowNavbar = () => {
      setIsVisible(true);
    };
    window.addEventListener('pulse-cart', handlePulse);
    window.addEventListener('show-navbar', handleShowNavbar);
    return () => {
      window.removeEventListener('pulse-cart', handlePulse);
      window.removeEventListener('show-navbar', handleShowNavbar);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update scrolled state
      setIsScrolled(currentScrollY > 50);

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 80 && !isMenuOpen && !isProductPage) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen, isProductPage]);

  const adminEmails = ['chilsandco@gmail.com', 'chilsandco.com@gmail.com'];
  const userEmail = user?.email || "";
  const isAdmin = user && adminEmails.some(email => email.toLowerCase() === userEmail.toLowerCase());

  const navLinks = [
    { name: 'COLLECTION', path: '/collection' },
    { name: 'COMBOS', path: '/combos' },
    { name: 'THE BESPOKE', path: '/bespoke' },
    { name: 'CO-CREATOR', path: '/co-creator' },
    { name: 'CUSTOM STUDIO', path: '/customize' },
    // { name: 'SIGNAL NETWORK', path: '/signal-network' }, // removed from navbar, kept in footer
    { name: 'PHILOSOPHY', path: '/#philosophy' },
  ];

  const adminLinks = isAdmin ? [
    { name: 'SIGNALS', path: '/console/bespoke' },
    { name: 'CONFIG', path: '/admin/config' }
  ] : [];

  const allLinks = [...navLinks, ...adminLinks];

  const isHome = location.pathname === '/';

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -100 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -100
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${
          // Mobile & tablet: always solid glossy black
          // Desktop (md+): transparent at home top, solid when scrolled or on other pages
          isScrolled || !isHome
            ? 'bg-black/98 backdrop-blur-xl py-2 md:py-4 shadow-lg'
            : 'bg-black/90 backdrop-blur-lg py-4 md:py-8 md:bg-transparent md:backdrop-blur-none md:shadow-none'
        }`}
    >
      <div className="max-w-[1800px] mx-auto px-4 md:px-12 flex justify-between items-center h-14 md:h-auto">
        <motion.button 
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-accent relative z-50" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMenuOpen ? 'close' : 'menu'}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Left: Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          {allLinks.map(link => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-[11px] tracking-[0.2em] font-medium transition-opacity ${link.name === 'SIGNALS' ? 'text-accent hover:opacity-100' : 'text-neutral-400 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', rotate: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              filter: 'blur(0px)'
            }}
            whileHover={{ rotate: 360 }}
            transition={{ 
              opacity: { duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              filter: { duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              rotate: { duration: 10, ease: "linear" }
            }}
          >
            <img 
              src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png" 
              alt="CHILS & CO." 
              className="h-8 w-auto gold-icon"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <h1 className="text-lg md:text-xl font-display font-bold tracking-[0.25em] leading-none">CHILS & CO.</h1>
        </Link>

        {/* Right: Icons */}
        <div className="flex items-center gap-6">
          <Link to="/wishlist" className="relative hover:opacity-50 transition-opacity text-accent">
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={20} strokeWidth={1.5} fill={wishlist.length > 0 ? "currentColor" : "none"} />
            </motion.div>
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-black text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/auth" className="hover:opacity-50 transition-opacity text-accent">
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center"
            >
              <ProfileIcon />
            </motion.div>
          </Link>
          <Link 
            id="cart-icon" 
            to="/checkout" 
            className="relative hover:opacity-50 transition-opacity text-accent"
          >
            <motion.div
              animate={pulse ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.1, rotate: -5, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
            </motion.div>
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
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            />

            {/* Dropdown Card */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full left-4 right-4 mt-3 bg-black/90 border border-accent/20 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.15)] overflow-hidden z-50 md:hidden flex flex-col"
            >
              {/* Gold Top Accent Line inside Card */}
              <div 
                className="w-full h-[2px] flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, transparent, #D4AF37 30%, #f5d97a 70%, transparent)' }}
              />

              {/* Links Container */}
              <div className="flex flex-col gap-1 p-6">
                {allLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.3 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-3 text-lg font-display font-semibold tracking-[0.2em] transition-all hover:pl-2 ${
                        link.name === 'SIGNALS' ? 'text-accent font-bold' : 'text-neutral-300 hover:text-accent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="h-px bg-white/10 my-3" />

                {/* Wishlist & Account Links */}
                <div className="flex flex-col gap-4 mt-1">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * (allLinks.length), duration: 0.3 }}
                  >
                    <Link
                      to="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-sm font-medium tracking-[0.15em] text-neutral-300 hover:text-accent transition-colors"
                    >
                      <Heart size={18} className="text-accent" fill={wishlist.length > 0 ? "currentColor" : "none"} />
                      <span>WISHLIST ({wishlist.length})</span>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * (allLinks.length + 1), duration: 0.3 }}
                  >
                    <Link
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-sm font-medium tracking-[0.15em] text-neutral-300 hover:text-accent transition-colors"
                    >
                      <ProfileIcon />
                      <span>{isAuthenticated ? 'ACCOUNT' : 'LOG IN'}</span>
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-white/[0.02] px-6 py-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] text-neutral-500 tracking-[0.25em]">CHILS & CO.</span>
                <span className="text-[8px] text-accent/60 tracking-[0.15em] font-medium">ELEVATED IDENTITY</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
