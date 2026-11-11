import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Heart, Search, User } from 'lucide-react';
import SearchOverlay from './SearchOverlay';
import PlayfulFlake from './PlayfulFlake';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useAuth } from '../AuthContext';
import { AnimatePresence, motion } from 'motion/react';

const ADMIN_EMAILS = ['chilsandco@gmail.com', 'chilsandco.com@gmail.com'];

// Uses the legacy utilities (bg-black, text-white…) on purpose: the theme
// layer in index.css flips them, so the same bar works on light and dark pages.
const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pulse, setPulse] = useState(false);
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email || '').toLowerCase());

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onPulse = () => { setPulse(true); setTimeout(() => setPulse(false), 500); };
    window.addEventListener('pulse-cart', onPulse);
    return () => window.removeEventListener('pulse-cart', onPulse);
  }, []);

  const links = [
    { name: 'Shop', path: '/collection' },
    { name: 'Polos', path: '/collection?group=polos' },
    { name: 'Blacks', path: '/collection?group=blacks' },
    { name: 'Pick your three', path: '/pick-your-three' },
    { name: 'Custom Studio', path: '/customize' },
    ...(isAdmin ? [
      { name: 'Signals', path: '/console/bespoke' },
      { name: 'Amazon', path: '/console/amazon' },
      { name: 'Config', path: '/admin/config' },
    ] : []),
  ];

  const active = (path: string) => location.pathname + location.search === path;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-black/95 backdrop-blur-md text-white transition-shadow max-md:!bg-[#fff] max-md:!backdrop-blur-none max-md:!text-ink max-md:border-b max-md:border-black/10 ${
          scrolled ? 'md:shadow-[0_1px_0_rgba(128,128,128,0.25)]' : ''
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-3 md:pl-10 md:pr-10 pr-5 h-16 md:h-[72px] flex items-center justify-between">
          <div className="md:contents flex items-center">
          <button className="md:hidden -ml-1 p-2.5" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" aria-label="CHILS & CO. home" className="inline-flex items-center gap-2 md:gap-2.5 wordmark tracking-[0.18em] md:tracking-[0.25em] text-[14px] md:text-xl">
            <PlayfulFlake className="w-[15px] h-[17px] md:w-[19px] md:h-[21px]" />
            CHILS &amp; CO.
          </Link>
          </div>

          <nav className="hidden md:flex items-center gap-5 lg:gap-8 absolute left-1/2 -translate-x-1/2 translate-y-0">
            {links.slice(0, 5).map(l => (
              <Link
                key={l.name}
                to={l.path}
                className={`text-[13px] font-medium transition-opacity hover:opacity-100 ${active(l.path) ? 'opacity-100 underline underline-offset-8 decoration-1' : 'opacity-60'}`}
              >
                {l.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-5">
            {isAdmin && (
              <div className="hidden lg:flex gap-4 text-[11px] opacity-60">
                {links.slice(5).map(l => <Link key={l.name} to={l.path} className="hover:opacity-100">{l.name}</Link>)}
              </div>
            )}
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="-m-2.5 p-2.5 hover:opacity-60 transition-opacity">
              <Search size={20} strokeWidth={1.6} />
            </button>
            <Link to="/wishlist" aria-label="Wishlist" className="relative hidden sm:block hover:opacity-60 transition-opacity">
              <Heart size={20} strokeWidth={1.6} fill={wishlist.length ? 'currentColor' : 'none'} />
            </Link>
            <Link to="/auth" aria-label={isAuthenticated ? 'Account' : 'Log in'} className="hidden sm:block hover:opacity-60 transition-opacity">
              <User size={20} strokeWidth={1.6} />
            </Link>
            <button id="cart-icon" onClick={() => window.dispatchEvent(new CustomEvent('bag-open'))} aria-label="Open bag" className="relative -m-2.5 p-2.5 hover:opacity-60 transition-opacity">
              <motion.span animate={pulse ? { scale: [1, 1.25, 1] } : {}} className="block">
                <ShoppingBag size={20} strokeWidth={1.6} />
              </motion.span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pt-16 z-40 bg-black text-white md:hidden overflow-y-auto"
          >
            <div className="px-6 py-8 flex flex-col">
              {links.map(l => (
                <Link key={l.name} to={l.path} className="py-4 text-2xl font-display font-semibold border-b border-white/10">
                  {l.name}
                </Link>
              ))}
              <Link to="/wishlist" className="py-4 text-lg border-b border-white/10 flex justify-between">
                <span>Wishlist</span><span className="opacity-50">{wishlist.length}</span>
              </Link>
              <Link to="/auth" className="py-4 text-lg border-b border-white/10">
                {isAuthenticated ? 'Account' : 'Log in'}
              </Link>
              <Link to="/support" className="py-4 text-lg">Support</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
