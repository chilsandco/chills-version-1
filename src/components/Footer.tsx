import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Footer: React.FC = () => {
  const [settings, setSettings] = React.useState({
    mobileLink: "+91 7842 07 0404",
    address: "3rd Floor, Plot No. 38 & 39\nMatrusri Nagar, Miyapur\nHyderabad, Telangana – 500049\nIndia",
    coordinates: "17.4948, 78.3444",
    email: "hello.chilsandco@gmail.com"
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.mobileLink) setSettings(data);
      })
      .catch(err => console.error("Failed to sync global nodes:", err));
  }, []);

  return (
    <footer className="bg-black border-t border-neutral-900 pt-20 pb-12 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="md:col-span-1">
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
              <li><Link to="/collection" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Collection</Link></li>
              <li><Link to="/bespoke" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">The Bespoke</Link></li>
              <li><Link to="/co-creator" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Co-Creator</Link></li>
              <li><Link to="/#philosophy" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Philosophy</Link></li>
              <li><Link to="/#promise" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Promise</Link></li>
              <li><Link to="/#second-life" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Second Life</Link></li>
              <li><Link to="/#eco-engineered" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Eco Engineered</Link></li>
              <li><Link to="/auth" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-6">Service</h3>
            <ul className="flex flex-col gap-4 mb-8">
              <li><Link to="/shipping-delivery" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Shipping</Link></li>
              <li><Link to="/returns-refunds" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Returns</Link></li>
              <li><Link to="/support" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Support Center</Link></li>
              <li><Link to="/privacy-policy" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-neutral-500 hover:text-white text-sm transition-colors uppercase tracking-widest">Terms & Conditions</Link></li>
              <li><a href={`mailto:${settings.email}`} className="text-neutral-500 hover:text-white text-[10px] transition-colors uppercase tracking-widest">{settings.email}</a></li>
            </ul>

            <div className="space-y-6 pt-6 border-t border-neutral-900">
              <div className="space-y-1">
                <p className="text-white text-[11px] font-bold tracking-widest">{settings.mobileLink}</p>
                <p className="text-neutral-600 text-[9px] uppercase tracking-widest leading-relaxed">
                  Mon–Sat · 10 AM – 6 PM IST
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-neutral-500 text-[10px] uppercase tracking-widest leading-relaxed font-medium whitespace-pre-line">
                  {settings.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-neutral-900 gap-6">
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
            © 2026 CHILS & CO. ALL RIGHTS RESERVED by Chilamkuri Ventures.
          </p>
          <div className="flex gap-8">
            {/* Social links or other footer secondary elements can go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
