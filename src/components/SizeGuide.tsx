import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ruler, Info, Box } from 'lucide-react';

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
    labelPos: { x: 345, y: 165 }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-neutral-900 rounded-sm p-6 md:p-12 scrollbar-none md:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Box className="text-accent" size={16} />
                <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase font-bold">Protocol 01: Sizing</p>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase text-white">Size Intelligence</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-neutral-900 rounded-full transition-colors text-neutral-500 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Visual Guide */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-b from-neutral-900/10 to-transparent border border-neutral-900/30 rounded-sm flex items-center justify-center relative overflow-hidden group">
                {/* Visual Grid Lines */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
                />
                
                <svg viewBox="0 0 400 400" className="w-[90%] h-[90%] drop-shadow-2xl">
                  <defs>
                   <marker id="arrow-start" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                    </marker>
                    <marker id="arrow-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                    </marker>
                  </defs>

                  {/* T-Shirt Path */}
                  <path 
                    d="M100 80 Q200 60 300 80 L360 140 L320 180 L300 160 L300 360 L100 360 L100 160 L80 180 L40 140 Z" 
                    fill="#171717" 
                    stroke="#333"
                    strokeWidth="1"
                  />
                  
                  {/* Measurement Lines Overlay */}
                  <g className="measurement-lines">
                    {/* shoulder Line */}
                    <motion.line 
                      onMouseEnter={() => setActiveMeasurement('shoulder')}
                      onMouseLeave={() => setActiveMeasurement(null)}
                      animate={{ stroke: activeMeasurement === 'shoulder' ? '#C2A15E' : '#FFFFFF' }}
                      x1="105" y1="50" x2="295" y2="50" strokeWidth="1.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" className="cursor-pointer"
                    />

                    {/* Chest Line */}
                    <motion.line 
                      onMouseEnter={() => setActiveMeasurement('chest')}
                      onMouseLeave={() => setActiveMeasurement(null)}
                      animate={{ stroke: activeMeasurement === 'chest' ? '#C2A15E' : '#FFFFFF' }}
                      x1="105" y1="210" x2="295" y2="210" strokeWidth="1.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" className="cursor-pointer"
                    />

                    {/* Length Line */}
                    <motion.line 
                      onMouseEnter={() => setActiveMeasurement('length')}
                      onMouseLeave={() => setActiveMeasurement(null)}
                      animate={{ stroke: activeMeasurement === 'length' ? '#C2A15E' : '#FFFFFF' }}
                      x1="220" y1="80" x2="220" y2="355" strokeWidth="1.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" className="cursor-pointer"
                    />

                    {/* Sleeve Line */}
                    <motion.line 
                      onMouseEnter={() => setActiveMeasurement('sleeve')}
                      onMouseLeave={() => setActiveMeasurement(null)}
                      animate={{ stroke: activeMeasurement === 'sleeve' ? '#C2A15E' : '#FFFFFF' }}
                      x1="305" y1="85" x2="355" y2="135" strokeWidth="1.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" className="cursor-pointer"
                    />

                    {/* Sleeve Open Line */}
                    <motion.line 
                      onMouseEnter={() => setActiveMeasurement('opening')}
                      onMouseLeave={() => setActiveMeasurement(null)}
                      animate={{ stroke: activeMeasurement === 'opening' ? '#C2A15E' : '#FFFFFF' }}
                      x1="310" y1="175" x2="345" y2="175" strokeWidth="1.5" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" className="cursor-pointer"
                    />

                    {/* Labels within SVG */}
                    {measurements.filter(m => m.labelPos).map(m => (
                      <motion.text
                        key={`svg-label-${m.key}`}
                        x={m.labelPos?.x}
                        y={m.labelPos?.y}
                        textAnchor="middle"
                        animate={{ 
                          fill: activeMeasurement === m.key ? '#C2A15E' : '#FFFFFF',
                          opacity: activeMeasurement === m.key ? 1 : 0.8,
                          scale: activeMeasurement === m.key ? 1.05 : 1
                        }}
                        className="text-[10px] font-medium tracking-tight"
                        style={{ pointerEvents: 'none' }}
                      >
                        {m.label}
                      </motion.text>
                    ))}
                  </g>
                </svg>
                
                <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-bold">
                  <Ruler size={10} />
                  Garment Blueprint View
                </div>
              </div>

              {/* Measurement Explanations */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                {measurements.slice(0, 4).map((m) => (
                  <div 
                    key={m.key}
                    onMouseEnter={() => setActiveMeasurement(m.key)}
                    onMouseLeave={() => setActiveMeasurement(null)}
                    className={`p-4 border transition-all duration-300 cursor-default ${activeMeasurement === m.key ? 'bg-neutral-900 border-accent/40' : 'bg-transparent border-neutral-900'}`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${activeMeasurement === m.key ? 'text-accent' : 'text-neutral-500'}`}>
                      {m.label}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-light leading-relaxed mb-2 truncate">{m.desc}</p>
                    <p className="text-[9px] text-neutral-600 uppercase tracking-tight font-medium italic border-t border-neutral-900/50 pt-2">
                      {m.howTo}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Chart Table */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] tracking-[0.3em] font-bold uppercase text-white">Measurement Matrix (Inches)</h3>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Garment Specs</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900">
                      <th className="py-4 text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Size</th>
                      <th 
                        onMouseEnter={() => setActiveMeasurement('chest')}
                        onMouseLeave={() => setActiveMeasurement(null)}
                        className={`py-4 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${activeMeasurement === 'chest' ? 'text-accent' : 'text-neutral-500'}`}
                      >
                        Chest
                      </th>
                      <th 
                        onMouseEnter={() => setActiveMeasurement('length')}
                        onMouseLeave={() => setActiveMeasurement(null)}
                        className={`py-4 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${activeMeasurement === 'length' ? 'text-accent' : 'text-neutral-500'}`}
                      >
                        Length
                      </th>
                      <th 
                        onMouseEnter={() => setActiveMeasurement('shoulder')}
                        onMouseLeave={() => setActiveMeasurement(null)}
                        className={`py-4 text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer ${activeMeasurement === 'shoulder' ? 'text-accent' : 'text-neutral-500'}`}
                      >
                        Shoulder
                      </th>
                      <th className="py-4 text-[10px] uppercase font-bold text-neutral-500 tracking-widest text-right">Fit Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeData.map((row) => (
                      <tr key={row.size} className="border-b border-neutral-900/50 hover:bg-neutral-900/30 transition-colors group">
                        <td className="py-5 font-display font-medium text-lg text-white">{row.size}</td>
                        <td className={`py-5 text-sm font-mono transition-colors ${activeMeasurement === 'chest' ? 'text-accent font-bold' : 'text-neutral-300'}`}>{row.chest}</td>
                        <td className={`py-5 text-sm font-mono transition-colors ${activeMeasurement === 'length' ? 'text-accent font-bold' : 'text-neutral-300'}`}>{row.length}</td>
                        <td className={`py-5 text-sm font-mono transition-colors ${activeMeasurement === 'shoulder' ? 'text-accent font-bold' : 'text-neutral-300'}`}>{row.shoulder}</td>
                        <td className="py-5 text-right">
                          <span className="text-[10px] uppercase py-1 px-3 border border-neutral-800 rounded-sm text-neutral-500 group-hover:border-accent group-hover:text-accent transition-all">
                            {row.fit}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advanced Specs Highlight */}
              <div className="mt-8 p-6 bg-neutral-900/50 border border-neutral-900 rounded-sm">
                <h4 className="text-[10px] tracking-[0.4em] font-bold uppercase text-accent mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  Secondary Calibration
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div 
                    onMouseEnter={() => setActiveMeasurement('opening')}
                    onMouseLeave={() => setActiveMeasurement(null)}
                    className="cursor-default"
                  >
                    <p className={`text-[9px] uppercase tracking-widest mb-1 transition-colors ${activeMeasurement === 'opening' ? 'text-accent' : 'text-neutral-500'}`}>Sleeve Opening</p>
                    <p className="text-sm font-mono text-white">5.5" — 7.5"</p>
                  </div>
                  <div 
                    onMouseEnter={() => setActiveMeasurement('sleeve')}
                    onMouseLeave={() => setActiveMeasurement(null)}
                    className="cursor-default"
                  >
                    <p className={`text-[9px] uppercase tracking-widest mb-1 transition-colors ${activeMeasurement === 'sleeve' ? 'text-accent' : 'text-neutral-500'}`}>Sleeve Length</p>
                    <p className="text-sm font-mono text-white">7.5" — 8.5"</p>
                  </div>
                </div>
              </div>

              {/* Guidance Line */}
              <div className="mt-8 flex items-start gap-4 p-5 bg-neutral-900/20 border-l border-neutral-800">
                <Info size={14} className="text-neutral-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                  For a precise standard fit, select your usual size. For an oversized aesthetic, we recommend one size increment up.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[9px] text-neutral-600 uppercase tracking-[0.3em] font-bold">
              © CHILS & CO. TECHNICAL SYSTEMS
            </p>
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest">
              Garment measurements in inches. Tolerance: ± 0.25"
            </p>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SizeGuide;
