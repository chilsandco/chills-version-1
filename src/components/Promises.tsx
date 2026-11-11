import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import EcoEngineeredLogo from './EcoEngineeredLogo';

const EASE = [0.22, 1, 0.36, 1] as const;

const BOX_USES = [
  { id: 'empty', label: 'The box', src: '/promise/box-empty.webp', line: 'Nine compartments, built to stay.' },
  { id: 'socks', label: 'Socks', src: '/promise/box-socks.webp', line: 'Keeps socks organised and easy to find.' },
  { id: 'stationery', label: 'Stationery', src: '/promise/box-stationery.webp', line: 'Holds your desk essentials.' },
];

const ECO_POINTS = [
  ['No plastic', 'We eliminate it entirely.'],
  ['Less material', 'Excess is reduced at every step.'],
  ['Made to reuse', 'Every component works beyond its first use.'],
];

/** Second Life and Eco Engineered: the two things most tee brands can't claim. */
const Promises: React.FC = () => {
  const [use, setUse] = useState(0);
  const box = BOX_USES[use];

  return (
    <section aria-label="Our promise" className="grid lg:grid-cols-2">
      {/* SECOND LIFE */}
      <div id="second-life" className="relative overflow-hidden scroll-mt-20 text-ink px-6 md:px-12 pt-14 pb-10 md:pt-20 lg:min-h-[820px] flex flex-col" style={{ backgroundColor: '#e2d3bb' }}>
        <p className="eyebrow text-ink/55">Second Life</p>
        <h2 className="mt-3 text-[40px] md:text-[64px] leading-[1.02] font-semibold tracking-[-0.035em]">Not made to be discarded.</h2>
        <p className="mt-4 text-ink/65 md:text-lg max-w-md">Your box isn’t packaging. It’s a storage system, with a second function long after delivery.</p>

        <div className="relative flex-1 min-h-[300px] md:min-h-[360px] mt-4 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={box.id}
              src={box.src}
              alt={`Second Life box: ${box.label}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="max-h-[300px] md:max-h-[380px] max-w-full w-auto object-contain drop-shadow-[0_22px_24px_rgba(70,50,20,.28)]"
            />
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex gap-2" role="group" aria-label="See the box in use">
            {BOX_USES.map((u, i) => (
              <button
                key={u.id}
                onClick={() => setUse(i)}
                onMouseEnter={() => setUse(i)}
                aria-pressed={i === use}
                className={`px-4 h-10 text-sm border transition-colors cursor-pointer ${i === use ? 'bg-ink text-[#fff] border-ink' : 'border-ink/25 hover:border-ink'}`}
              >
                {u.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink/60">{box.line}</p>
        </div>
        <p className="mt-4 pt-4 border-t border-ink/15 text-xs text-ink/55">Included with orders of two or more tees.</p>
      </div>

      {/* ECO ENGINEERED */}
      <div id="eco-engineered" className="relative overflow-hidden scroll-mt-20 text-[#fff] px-6 md:px-12 pt-14 pb-10 md:pt-20 lg:min-h-[820px] flex flex-col" style={{ backgroundColor: '#14231a' }}>
        <p className="eyebrow text-[#fff]/50">Eco Engineered</p>
        <h2 className="mt-3 text-[40px] md:text-[64px] leading-[1.02] font-semibold tracking-[-0.035em]">Built with purpose. Designed without waste.</h2>
        <p className="mt-4 text-[#fff]/60 md:text-lg max-w-md">Sustainability here isn’t an addition. It’s engineered into the system.</p>

        <div className="flex-1 flex items-center justify-center py-8 lg:py-0 min-h-[170px]" aria-hidden>
          <div className="scale-[1.35]"><EcoEngineeredLogo /></div>
        </div>

        <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-5 border-t border-[#fff]/15 pt-6">
          {ECO_POINTS.map(([k, v]) => (
            <div key={k}>
              <dt className="text-lg font-semibold tracking-[-0.01em]">{k}</dt>
              <dd className="text-sm text-[#fff]/55 mt-1">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Promises;
