import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import Promises from '../components/Promises';

const SPECS = [
  ['240 GSM', 'Our oversized tees: heavyweight 100% cotton.'],
  ['Reinforced', 'Stitched neck and shoulders that hold their shape.'],
  ['DTF print', 'High-definition, fade-resistant artwork.'],
];

/** What we stand behind: the box, the waste, and how the tees are made. */
const OurPromise: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ block: 'start' }), 450);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="pt-16 md:pt-[72px] bg-[#fff] text-ink">
      <SEO
        title="Our promise | CHILS & CO."
        description="Reusable Second Life packaging, plastic-free shipping and tees made to last. What CHILS & CO. stands behind."
        canonical="https://chilsandco.com/our-promise"
      />

      <header className="max-w-[1500px] mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-10 md:pb-14">
        <p className="eyebrow text-stone mb-4">Our promise</p>
        <h1 className="text-[44px] md:text-[96px] leading-[.98] font-semibold tracking-[-0.04em] max-w-[1000px]">Nothing we make is meant to be thrown away.</h1>
      </header>

      <Promises />

      <section id="promise" className="seamless scroll-mt-20">
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 pt-16 md:pt-24 grid lg:grid-cols-2 gap-10 items-end">
          <div className="pb-14 md:pb-24">
            <p className="eyebrow text-stone mb-5">The build</p>
            <h2 className="text-4xl md:text-6xl font-semibold leading-[1.02]">Made like it has to last.</h2>
            <dl className="mt-8 md:mt-12 divide-y divide-black/10 border-y border-black/10">
              {SPECS.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[130px_1fr] md:grid-cols-[180px_1fr] gap-4 py-5">
                  <dt className="font-medium">{k}</dt>
                  <dd className="text-stone text-sm md:text-base">{v}</dd>
                </div>
              ))}
            </dl>
            <Link to="/collection" className="mt-9 inline-flex items-center gap-2 bg-ink text-[#fff] px-7 py-4 text-sm font-medium hover:opacity-85 transition-opacity">
              Shop the collection <ArrowRight size={15} />
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img src="/looks/1364_3.webp" alt="Model wearing the Vanilla Stack tee" loading="lazy" className="h-[56vh] md:h-[78vh] object-contain object-bottom" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurPromise;
