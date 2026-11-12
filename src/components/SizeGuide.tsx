import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, Info } from 'lucide-react';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const measurements = [
  { 
    key: 'chest', 
    label: 'Chest', 
    desc: 'How wide the t-shirt feels around your body',
    howTo: 'Measure pit-to-pit (1" below armhole) across the chest.',
    labelPos: { x: 200, y: 195 }
  },
  { 
    key: 'length', 
    label: 'Length', 
    desc: 'Where the t-shirt falls on your torso',
    howTo: 'Measure from highest shoulder point to bottom hem.',
    labelPos: { x: 235, y: 280 }
  },
  { 
    key: 'shoulder', 
    label: 'Across Shoulder', 
    desc: 'How structured the fit feels on top',
    howTo: 'Measure horizontally from shoulder seam to shoulder seam.',
    labelPos: { x: 200, y: 35 }
  },
  { 
    key: 'sleeve', 
    label: 'Sleeve Length', 
    desc: 'Distance from shoulder to sleeve end',
    howTo: 'Measure from shoulder seam to sleeve edge.',
    labelPos: { x: 345, y: 95 }
  },
  { 
    key: 'opening', 
    label: 'Sleeve Open', 
    desc: 'Width of the sleeve hem',
    howTo: 'Measure the width of the sleeve cuff flat.',
    labelPos: { x: 360, y: 180 }
  },
  { 
    key: 'collar', 
    label: 'Collar Rib', 
    desc: 'Detailing of the neckline width',
    howTo: 'Width of the ribbing material at the neckline.'
  },
];

const sizeData = [
  { size: 'S', fit: 'Slim fit', chest: '38.5', length: '28', shoulder: '16.25', opening: '5.5', sleeve: '7.5', collar: '0.6' },
  { size: 'M', fit: 'Standard fit', chest: '40.5', length: '28.5', shoulder: '16.75', opening: '6', sleeve: '8', collar: '0.6' },
  { size: 'L', fit: 'Relaxed fit', chest: '42.5', length: '29', shoulder: '17.25', opening: '6.5', sleeve: '8', collar: '0.6' },
  { size: 'XL', fit: 'Loose fit', chest: '45.5', length: '29.5', shoulder: '17.75', opening: '7', sleeve: '8.5', collar: '0.7' },
  { size: '2XL', fit: 'Extra relaxed', chest: '48.5', length: '30', shoulder: '18.25', opening: '7.5', sleeve: '8.5', collar: '0.7' },
];

const SizeGuide: React.FC<SizeGuideProps> = ({ isOpen, onClose }) => {
  const [activeMeasurement, setActiveMeasurement] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const hi = (k: string) => activeMeasurement === k;
  const hover = (k: string) => ({ onMouseEnter: () => setActiveMeasurement(k), onMouseLeave: () => setActiveMeasurement(null) });
  const INK = '#0e0e0c', MUTED = '#a8a49b';
  const cols = [
    { k: 'chest', l: 'Chest' }, { k: 'length', l: 'Length' }, { k: 'shoulder', l: 'Shoulder' }, { k: 'sleeve', l: 'Sleeve' },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-8 bg-ink/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-paper text-ink rounded-t-2xl md:rounded-2xl p-4 md:p-8 scrollbar-none"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <div className="flex justify-between items-start gap-4 mb-6 px-1">
              <div>
                <p className="eyebrow text-neutral-500 mb-2">Size guide</p>
                <h2 className="text-[28px] md:text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]">Find your size</h2>
                <p className="text-neutral-600 mt-1">Measurements of the tee laid flat, in inches.</p>
              </div>
              <button onClick={onClose} aria-label="Close size guide" className="w-9 h-9 shrink-0 rounded-full bg-[#fff] grid place-items-center hover:bg-ink hover:text-[#fff] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start">
              {/* The chart */}
              <div className="space-y-2 lg:order-2">
                <div className="bg-[#fff] rounded-2xl p-2 md:p-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[420px]">
                    <thead>
                      <tr className="text-sm text-neutral-500">
                        <th className="py-3 px-3 font-normal">Size</th>
                        {cols.map(c => (
                          <th key={c.k} {...hover(c.k)} className={`py-3 px-3 font-normal cursor-default transition-colors ${hi(c.k) ? 'text-ink font-medium' : ''}`}>{c.l}</th>
                        ))}
                        <th className="py-3 px-3 font-normal text-right">Fit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeData.map((row) => (
                        <tr key={row.size} className="border-t border-[#eeece6]">
                          <td className="py-3.5 px-3 font-semibold">{row.size}</td>
                          {cols.map(c => (
                            <td key={c.k} className={`py-3.5 px-3 tabular-nums transition-colors ${hi(c.k) ? 'font-semibold bg-paper' : 'text-ink/80'}`}>{(row as any)[c.k]}</td>
                          ))}
                          <td className="py-3.5 px-3 text-right"><span className="text-xs bg-paper rounded-full px-2.5 py-1 whitespace-nowrap">{row.fit}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-ink text-[#fff] rounded-2xl p-5 flex gap-3 items-start">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p className="text-[15px] leading-relaxed">Pick your usual size for a regular fit. For a roomier, oversized look, go one size up.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div {...hover('opening')} className="bg-[#fff] rounded-2xl p-4">
                    <p className="text-sm text-neutral-500">Sleeve opening</p>
                    <p className="font-semibold mt-0.5">5.5" – 7.5"</p>
                  </div>
                  <div className="bg-[#fff] rounded-2xl p-4">
                    <p className="text-sm text-neutral-500">Collar rib</p>
                    <p className="font-semibold mt-0.5">0.6" – 0.7"</p>
                  </div>
                </div>
              </div>

              {/* How to measure */}
              <div className="space-y-2 lg:order-1">
                <div className="bg-[#fff] rounded-2xl p-4 relative">
                  <svg viewBox="0 0 400 400" className="w-full max-w-[380px] mx-auto block">
                    <defs>
                      <marker id="arrow-start" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" /></marker>
                      <marker id="arrow-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" /></marker>
                    </defs>
                    <path d="M100 80 Q200 60 300 80 L360 140 L320 180 L300 160 L300 360 L100 360 L100 160 L80 180 L40 140 Z" fill="#f3f2ee" stroke="#d9d5cc" strokeWidth="1.5" />
                    {[
                      ['shoulder', 105, 50, 295, 50], ['chest', 105, 210, 295, 210], ['length', 220, 80, 220, 355],
                      ['sleeve', 305, 85, 355, 135], ['opening', 365, 145, 325, 185],
                    ].map(([k, x1, y1, x2, y2]) => (
                      <motion.line key={k as string} {...hover(k as string)} animate={{ stroke: hi(k as string) ? INK : MUTED, strokeWidth: hi(k as string) ? 2.5 : 1.5 }}
                        x1={x1 as number} y1={y1 as number} x2={x2 as number} y2={y2 as number} markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" className="cursor-pointer" />
                    ))}
                    {measurements.filter(m => m.labelPos).map(m => (
                      <text key={m.key} x={m.labelPos?.x} y={m.labelPos?.y} textAnchor="middle" fill={hi(m.key) ? INK : '#76746e'} fontWeight={hi(m.key) ? 600 : 400} fontSize="12" style={{ pointerEvents: 'none' }}>
                        {m.label}
                      </text>
                    ))}
                  </svg>
                  <p className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-neutral-500"><Ruler size={12} /> Hover a line or a card</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {measurements.slice(0, 4).map((m) => (
                    <div key={m.key} {...hover(m.key)} className={`rounded-2xl p-4 transition-colors cursor-default ${hi(m.key) ? 'bg-ink text-[#fff]' : 'bg-[#fff]'}`}>
                      <p className="font-medium">{m.label}</p>
                      <p className={`text-sm mt-1 leading-relaxed ${hi(m.key) ? 'text-[#fff]/70' : 'text-neutral-500'}`}>{m.howTo}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-4 px-1">Measurements can vary by up to ±0.25".</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SizeGuide;
