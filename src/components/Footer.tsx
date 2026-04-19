import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-neutral-900 pt-20 pb-12 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <motion.img 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png" 
                alt="CHILS & CO." 
                className="h-10 w-auto gold-icon"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-2xl font-display font-bold tracking-widest">CHILS & CO.</h2>
            </div>
            <p className="text-neutral-500 text-sm max-w-md leading-relaxed">
              Essential by Design. Elevated by Intent. Engineered apparel for the modern builder.
              Born at the intersection of hardware and software.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-6">Explore</h3>
            <ul className="flex flex-col gap-4">
              <li><Link to="/collection" className="text-neutral-500 hover:text-white text-sm transition-colors">Collection</Link></li>
              <li><Link to="/console/orders" className="text-neutral-500 hover:text-white text-sm transition-colors">Order Signals</Link></li>
              <li><Link to="/#story" className="text-neutral-500 hover:text-white text-sm transition-colors">Our Story</Link></li>
              <li><Link to="/#philosophy" className="text-neutral-500 hover:text-white text-sm transition-colors">Philosophy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-6">Support</h3>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Shipping</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Returns</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-neutral-900 gap-6">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
            © 2026 CHILS & CO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] text-neutral-600 hover:text-white uppercase tracking-widest transition-colors">Instagram</a>
            <a href="#" className="text-[10px] text-neutral-600 hover:text-white uppercase tracking-widest transition-colors">Twitter</a>
            <a href="#" className="text-[10px] text-neutral-600 hover:text-white uppercase tracking-widest transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
