import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import LineUp from '../components/LineUp';
import ClothesRail from '../components/ClothesRail';
import PhoneHome from '../components/PhoneHome';
import { ModelRow } from '../components/ModelFloor';
import { useProducts } from '../hooks/useProducts';
import { useNarrow } from '../hooks/useNarrow';
import { GROUPS, curateRows } from '../data/groups';
import { Product } from '../types';
import { Trilogy } from '../components/Trilogy';

const FIRST_TRILOGY = '1727';

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const Home: React.FC = () => {
  const { products } = useProducts();
  const narrow = useNarrow(768);
  const { hash } = useLocation();

  // older links like /#second-life now live on the Our promise page
  const navigate = useNavigate();
  useEffect(() => {
    if (['#second-life', '#eco-engineered', '#promise'].includes(hash)) navigate(`/our-promise${hash}`, { replace: true });
  }, [hash, navigate]);

  // the top pick from each group, so the row shows range rather than four similar tees
  const best = useMemo(() => {
    const rows = curateRows(products.filter(p => p.type !== 'grouped' && p.status === 'Available' && p.images?.length && p.category !== 'Combos'));
    return GROUPS.map(g => rows[g.slug]?.[0]).filter(Boolean).slice(0, 4);
  }, [products]);

  // the first numbered set, shown as the real object
  const firstSet = useMemo(() => {
    const ids = products.find(p => p.id === FIRST_TRILOGY)?.groupedProducts ?? [];
    return ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [products]);

  if (narrow) return (
    <>
      <SEO title="CHILS & CO. | Premium Streetwear for Builders" description="Premium tees and polos designed by techies, for those who build. Choose a Trilogy of three tees and save 10%." />
      <PhoneHome />
    </>
  );

  return (
    <div className="pt-[72px] bg-[#fff] text-ink">
      <SEO
        title="CHILS & CO. | Premium Streetwear for Builders"
        description="Premium tees and polos designed by techies, for those who build. Choose a Trilogy of three tees and save 10%."
      />

      <LineUp />
      <ClothesRail />

      {/* MANIFESTO */}
      <section className="bg-paper text-ink">
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-16 md:py-40">
          <motion.p {...reveal} className="eyebrow text-stone mb-8">Our philosophy</motion.p>
          <motion.h2 {...reveal} className="text-[40px] leading-[1.04] md:text-[88px] font-semibold max-w-[1100px]">
            For those who build, ship and iterate.
          </motion.h2>
          <motion.div {...reveal} className="mt-12 md:mt-16 grid md:grid-cols-2 gap-8 items-end">
            <p className="text-stone text-lg max-w-md">Essential by design. Elevated by intent. Clothing that moves with you, from work to everything after.</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
              <Link to="/collection" className="inline-flex items-center gap-2.5 border-b border-ink pb-1 hover:opacity-60 transition-opacity">
                Shop the collection <ArrowRight size={16} />
              </Link>
              <Link to="/our-promise" className="inline-flex items-center gap-2.5 border-b border-black/20 pb-1 text-stone hover:text-ink hover:border-ink transition-colors">
                Our promise
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THE ESSENTIALS */}
      {best.length > 0 && (
        <section className="pb-4">
          <div className="max-w-[1500px] mx-auto px-5 md:px-12 pt-16 md:pt-32">
          <motion.div {...reveal} className="flex items-end justify-between mb-10 md:mb-14">
            <h2 className="text-[34px] md:text-6xl font-semibold">The essentials</h2>
            <Link to="/collection" className="text-sm border-b border-ink pb-0.5">View all</Link>
          </motion.div>
          </div>
          <ModelRow products={best.slice(0, 4)} />
        </section>
      )}

      {/* PICK YOUR THREE */}
      <section className="floor-band text-ink overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-5 md:px-12 pt-14 md:pt-20 grid md:grid-cols-2 items-end gap-6">
          <motion.div {...reveal} className="pb-2 md:pb-24">
            <p className="eyebrow text-stone mb-3">Three tees, chosen to go together</p>
            <h2 className="text-[42px] md:text-[80px] font-semibold leading-[1]">Pick your three.</h2>
            <p className="text-stone mt-3 md:text-lg">Choose a Trilogy and save 10%.</p>
            <Link to="/pick-your-three" className="mt-7 inline-flex items-center gap-2 bg-ink text-[#fff] px-7 py-4 text-sm font-medium hover:opacity-85 transition-opacity">See the Trilogies <ArrowRight size={15} /></Link>
          </motion.div>
          <div className="w-[76%] max-w-[380px] mx-auto pb-12 md:pb-20">
            {firstSet.length === 3 && <Trilogy edition="N° 01" tees={firstSet} onPick={() => navigate('/pick-your-three')} />}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
