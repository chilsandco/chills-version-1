import React from 'react';
import { Link } from 'react-router-dom';
import UdaySignature from './UdaySignature';

const col = 'text-sm text-neutral-600 hover:text-ink transition-colors';

const Footer: React.FC = () => {
  const [settings, setSettings] = React.useState({
    mobileLink: '+91 7842 07 0404',
    address: '3rd Floor, Plot No. 38 & 39\nMatrusri Nagar, Miyapur\nHyderabad, Telangana – 500049\nIndia',
    email: 'hello.chilsandco@gmail.com',
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d && d.mobileLink) setSettings(s => ({ ...s, ...d })); })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#f3f2ee] text-ink border-t border-black/10 pt-16 pb-10 px-6 md:px-10 mt-auto">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
                        <p className="text-sm text-neutral-600 leading-relaxed max-w-xs">
              Essential by design. Elevated by intent. Made for people who build.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-5">Shop</h3>
            <ul className="flex flex-col gap-3">
              <li><Link className={col} to="/collection">All products</Link></li>
              <li><Link className={col} to="/pick-your-three">Pick your three</Link></li>
              <li><Link className={col} to="/customize">Custom Studio</Link></li>
              <li><Link className={col} to="/bespoke">Bespoke</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-5">Help</h3>
            <ul className="flex flex-col gap-3">
              <li><Link className={col} to="/shipping-delivery">Shipping</Link></li>
              <li><Link className={col} to="/returns-refunds">Returns</Link></li>
              <li><Link className={col} to="/support">Support</Link></li>
              <li><Link className={col} to="/auth">Account</Link></li>
              <li><Link className={col} to="/co-creator">Co-Creator</Link></li>
              <li><Link className={col} to="/our-promise">Our promise</Link></li>
              <li><Link className={col} to="/our-promise#second-life">Second Life</Link></li>
              <li><Link className={col} to="/our-promise#eco-engineered">Eco Engineered</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-5">Contact</h3>
            <ul className="flex flex-col gap-3">
              <li><a className={`${col} break-all`} href={`mailto:${settings.email}`}>{settings.email}</a></li>
              <li className="text-sm text-neutral-600">{settings.mobileLink}<br />Mon–Sat · 10 AM – 6 PM IST</li>
              <li className="text-sm text-neutral-600 whitespace-pre-line">{settings.address}</li>
            </ul>
          </div>
        </div>

        <p aria-hidden className="wordmark-outline [-webkit-text-stroke-color:var(--color-ink)] leading-none tracking-[-0.02em] text-[14.4vw] md:text-[12.8vw] xl:text-[172px] whitespace-nowrap text-center select-none mb-8 md:mb-10">CHILS &amp; CO.</p>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-black/10 text-xs text-neutral-500">
          <p>© 2026 CHILS &amp; CO. All rights reserved by Chilamkuri Ventures.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-ink">Privacy</Link>
            <Link to="/terms-conditions" className="hover:text-ink">Terms</Link>
          </div>
          <UdaySignature />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
