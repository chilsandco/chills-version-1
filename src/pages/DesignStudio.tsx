import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Shirt, Maximize2, Lock, ShoppingBag, ChevronLeft, ChevronRight, Check, Sparkles, RotateCcw, ZoomIn } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─── DATA: Tee Colors ─── */
const TEE_COLORS = [
  { id: 'black',       name: 'Midnight Black',   hex: '#1a1a1a', textColor: '#ffffff' },
  { id: 'white',       name: 'Arctic White',     hex: '#f5f5f0', textColor: '#000000' },
  { id: 'navy',        name: 'Deep Navy',        hex: '#1b2a4a', textColor: '#ffffff' },
  { id: 'charcoal',    name: 'Carbon Grey',      hex: '#3d3d3d', textColor: '#ffffff' },
  { id: 'olive',       name: 'Tactical Olive',   hex: '#4a5a3a', textColor: '#ffffff' },
  { id: 'burgundy',    name: 'Merlot',           hex: '#5a1a2a', textColor: '#ffffff' },
  { id: 'forest',      name: 'Forest Green',     hex: '#1a3a2a', textColor: '#ffffff' },
  { id: 'slate',       name: 'Slate Blue',       hex: '#4a5a6a', textColor: '#ffffff' },
  { id: 'sand',        name: 'Desert Sand',      hex: '#c2b280', textColor: '#000000' },
  { id: 'rust',        name: 'Burnt Rust',       hex: '#8b3a1a', textColor: '#ffffff' },
];

/* ─── DATA: Designs (placeholder SVG patterns — replace with your real PNGs) ─── */
const DESIGNS: { id: string; name: string; category: string; svg: string }[] = [
  { id: 'd01', name: 'Syntax Overload',    category: 'Code',      svg: 'SYN\nTAX' },
  { id: 'd02', name: 'Stack Overflow',     category: 'Code',      svg: 'STK\nOVR' },
  { id: 'd03', name: 'Neural Drift',       category: 'Abstract',  svg: 'NEU\nRAL' },
  { id: 'd04', name: 'Pixel Storm',        category: 'Abstract',  svg: 'PIX\nEL' },
  { id: 'd05', name: 'Echo Chamber',       category: 'Typography',svg: 'ECH\nO' },
  { id: 'd06', name: 'Zero Day',           category: 'Code',      svg: '0\nDAY' },
  { id: 'd07', name: 'Signal Lost',        category: 'Abstract',  svg: 'SIG\nNAL' },
  { id: 'd08', name: 'Dark Mode',          category: 'Typography',svg: 'DRK\nMDE' },
  { id: 'd09', name: 'Cache Miss',         category: 'Code',      svg: 'CA$\nHE' },
  { id: 'd10', name: 'Void Return',        category: 'Code',      svg: 'VOI\nD()' },
  { id: 'd11', name: 'Glitch Art',         category: 'Abstract',  svg: 'GLI\nTCH' },
  { id: 'd12', name: 'Kernel Panic',       category: 'Code',      svg: 'KRN\nL!!' },
  { id: 'd13', name: 'Wave Function',      category: 'Abstract',  svg: '~~~\n≈≈≈' },
  { id: 'd14', name: 'Type Error',         category: 'Typography',svg: 'TYP\nERR' },
  { id: 'd15', name: 'Binary Sunset',      category: 'Abstract',  svg: '010\n101' },
  { id: 'd16', name: 'Recursion',          category: 'Code',      svg: 'f(f)\n...' },
  { id: 'd17', name: 'Neon Grid',          category: 'Abstract',  svg: '▦▦▦\n▦▦▦' },
  { id: 'd18', name: 'Root Access',        category: 'Code',      svg: 'SU\nDO' },
  { id: 'd19', name: 'Entropy',            category: 'Abstract',  svg: '△▽△\n▽△▽' },
  { id: 'd20', name: 'End Of File',        category: 'Typography',svg: 'EOF\n___' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['All', 'Code', 'Abstract', 'Typography'];

/* ─── Tee SVG Shape ─── */
const TeeSVG: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 400 480" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <path d={`M 120 0 L 60 30 L 0 80 L 30 120 L 80 90 L 80 460 
              C 80 475 90 480 100 480 L 300 480 C 310 480 320 475 320 460 
              L 320 90 L 370 120 L 400 80 L 340 30 L 280 0 
              C 270 30 240 50 200 50 C 160 50 130 30 120 0 Z`}
      fill={color} stroke="rgba(255,255,255,0.08)" strokeWidth="1"
    />
    {/* Collar */}
    <path d={`M 120 0 C 130 30 160 50 200 50 C 240 50 270 30 280 0`}
      fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"
    />
    {/* Subtle fabric texture */}
    <pattern id="fabric" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="transparent"/>
      <rect width="1" height="1" fill="rgba(255,255,255,0.02)"/>
    </pattern>
    <path d={`M 120 0 L 60 30 L 0 80 L 30 120 L 80 90 L 80 460 
              C 80 475 90 480 100 480 L 300 480 C 310 480 320 475 320 460 
              L 320 90 L 370 120 L 400 80 L 340 30 L 280 0 
              C 270 30 240 50 200 50 C 160 50 130 30 120 0 Z`}
      fill="url(#fabric)"
    />
  </svg>
);

/* ─── Design Thumbnail ─── */
const DesignThumb: React.FC<{
  design: typeof DESIGNS[0]; selected: boolean; onClick: () => void;
}> = ({ design, selected, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
    className={`relative aspect-square rounded-sm border-2 transition-all overflow-hidden group ${
      selected ? 'border-accent shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-white/30'
    }`}
  >
    <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
      <pre className="text-[10px] md:text-xs font-mono font-bold text-white/80 leading-tight text-center tracking-widest">
        {design.svg}
      </pre>
    </div>
    {selected && (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center z-10">
        <Check size={12} className="text-black" />
      </motion.div>
    )}
    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-2 py-1.5">
      <p className="text-[8px] uppercase tracking-[0.15em] font-bold text-white truncate">{design.name}</p>
    </div>
  </motion.button>
);

/* ─── MAIN COMPONENT ─── */
const DesignStudio: React.FC = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(TEE_COLORS[0]);
  const [selectedDesign, setSelectedDesign] = useState<typeof DESIGNS[0] | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [isLocked, setIsLocked] = useState(false);
  const [showLockAnim, setShowLockAnim] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredDesigns = category === 'All' ? DESIGNS : DESIGNS.filter(d => d.category === category);
  const canLock = selectedDesign && selectedSize;

  const handleLock = () => {
    if (!canLock) return;
    setShowLockAnim(true);
    setTimeout(() => {
      setIsLocked(true);
      setShowLockAnim(false);
    }, 1500);
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleAddToCart = () => {
    if (!selectedDesign || !selectedSize) return;
    addToCart({
      id: `studio-${selectedColor.id}-${selectedDesign.id}`,
      name: `CHILS Custom Tee — ${selectedDesign.name}`,
      category: 'Design Studio',
      price: 1899,
      description: `Custom tee: ${selectedDesign.name} design on ${selectedColor.name} tee.`,
      shortDescription: `${selectedDesign.name} on ${selectedColor.name}`,
      concept: selectedDesign.name,
      material: '100% Organic Cotton, 240 GSM.',
      fit: 'Oversized, dropped shoulders.',
      care: 'Machine wash cold, inside out.',
      images: [],
      status: 'Available',
    }, selectedSize);
    // Note: customization metadata will be set via CartContext extension
    navigate('/checkout');
  };

  return (
    <div className="bg-black min-h-screen pt-28 md:pt-24 pb-24 uppercase selection:bg-accent selection:text-black">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* ─── Hero ─── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={14} className="text-accent" />
            <span className="text-accent text-[10px] font-bold tracking-[0.8em]">Design Studio</span>
            <Sparkles size={14} className="text-accent" />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter leading-[0.9]">
            Build Your <span className="text-accent">Artifact</span>
          </h1>
          <p className="text-neutral-500 text-sm md:text-base normal-case max-w-lg mx-auto font-light">
            Pick your tee color. Choose your design. See it live. Lock it. Ship it.
          </p>
        </motion.div>
      </section>

      {/* ─── Main Studio Grid ─── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-1">

          {/* ─── LEFT: Controls ─── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Step 1: Tee Color */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }} className="bg-neutral-950 border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <Shirt size={12} className="text-accent" />
                  </div>
                  <h3 className="text-[11px] font-bold tracking-[0.3em] text-white">01 — Tee Color</h3>
                </div>
                <span className="text-[9px] text-accent font-mono tracking-widest">{selectedColor.name}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {TEE_COLORS.map(c => (
                  <button key={c.id} onClick={() => { if (!isLocked) setSelectedColor(c); }}
                    className={`group relative aspect-square rounded-sm transition-all ${
                      selectedColor.id === c.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-black scale-110' : 'hover:scale-105'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={c.name} disabled={isLocked}>
                    <div className="absolute inset-0 rounded-sm" style={{ backgroundColor: c.hex }} />
                    {selectedColor.id === c.id && (
                      <motion.div layoutId="colorCheck" className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} style={{ color: c.textColor }} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Step 2: Design */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }} className="bg-neutral-950 border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <Palette size={12} className="text-accent" />
                  </div>
                  <h3 className="text-[11px] font-bold tracking-[0.3em] text-white">02 — Design</h3>
                </div>
                <span className="text-[9px] text-accent font-mono tracking-widest">
                  {selectedDesign?.name || 'NONE'}
                </span>
              </div>
              {/* Category filter */}
              <div className="flex gap-1">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] transition-all ${
                      category === cat ? 'bg-accent text-black' : 'bg-white/5 text-neutral-500 hover:text-white'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLocked}>
                    {cat}
                  </button>
                ))}
              </div>
              {/* Design grid */}
              <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1
                scrollbar-thin scrollbar-track-neutral-900 scrollbar-thumb-neutral-700">
                {filteredDesigns.map(d => (
                  <DesignThumb key={d.id} design={d}
                    selected={selectedDesign?.id === d.id}
                    onClick={() => { if (!isLocked) setSelectedDesign(d); }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Step 3: Size */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }} className="bg-neutral-950 border border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <Maximize2 size={12} className="text-accent" />
                </div>
                <h3 className="text-[11px] font-bold tracking-[0.3em] text-white">03 — Size</h3>
              </div>
              <div className="flex gap-2">
                {SIZES.map(s => (
                  <button key={s} onClick={() => { if (!isLocked) setSelectedSize(s); }}
                    className={`flex-1 py-3 text-[11px] font-bold tracking-[0.2em] transition-all border ${
                      selectedSize === s
                        ? 'border-accent bg-accent text-black'
                        : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLocked}>
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }} className="space-y-3">
              {!isLocked ? (
                <button onClick={handleLock} disabled={!canLock}
                  className={`w-full py-5 text-[11px] font-bold tracking-[0.4em] flex items-center justify-center gap-3 transition-all ${
                    canLock
                      ? 'bg-accent text-black hover:bg-white active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.15)]'
                      : 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-white/5'
                  }`}>
                  <Lock size={14} />
                  {canLock ? 'Lock Design' : 'Select Color, Design & Size'}
                </button>
              ) : (
                <div className="space-y-2">
                  <button onClick={handleAddToCart}
                    className="w-full py-5 bg-accent text-black text-[11px] font-bold tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white active:scale-95 transition-all shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                    <ShoppingBag size={14} />
                    Add to Cart — ₹1,899
                  </button>
                  <button onClick={handleUnlock}
                    className="w-full py-3 bg-transparent border border-white/10 text-neutral-400 text-[10px] font-bold tracking-[0.3em] flex items-center justify-center gap-2 hover:border-white/30 hover:text-white transition-all">
                    <RotateCcw size={12} />
                    Unlock & Edit
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* ─── RIGHT: Live Preview ─── */}
          <div className="lg:col-span-7 flex items-start justify-center sticky top-24">
            <motion.div ref={previewRef}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative w-full max-w-[480px] aspect-[5/6] cursor-pointer"
              onClick={() => setIsZoomed(!isZoomed)}>

              {/* Ambient glow */}
              <div className="absolute inset-0 -m-8 rounded-full opacity-20 blur-3xl transition-colors duration-700"
                style={{ backgroundColor: selectedColor.hex }} />

              {/* The Tee */}
              <div className="relative w-full h-full">
                <TeeSVG color={selectedColor.hex} />

                {/* Design overlay — positioned on chest area */}
                <AnimatePresence mode="wait">
                  {selectedDesign && (
                    <motion.div
                      key={selectedDesign.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="absolute"
                      style={{
                        top: '22%', left: '28%', width: '44%', height: '30%',
                        mixBlendMode: 'screen',
                      }}>
                      <div className="w-full h-full flex items-center justify-center rounded-sm"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                        <pre className="text-xl md:text-2xl font-mono font-black text-white/90 leading-tight text-center tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                          {selectedDesign.svg}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-neutral-600">
                <ZoomIn size={14} />
                <span className="text-[9px] tracking-widest font-bold">
                  {isZoomed ? 'TAP TO MINIMIZE' : 'TAP TO ZOOM'}
                </span>
              </div>

              {/* Lock animation overlay */}
              <AnimatePresence>
                {showLockAnim && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-50 rounded-sm">
                    <motion.div animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, ease: 'linear' }}
                      className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full mb-6" />
                    <p className="text-accent text-[11px] font-bold tracking-[0.5em]">LOCKING DESIGN</p>
                    <p className="text-neutral-600 text-[9px] tracking-[0.3em] mt-2">COMPOSITING ARTIFACT...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Locked badge */}
              {isLocked && !showLockAnim && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-4 flex items-center gap-2 bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-sm">
                  <Lock size={10} className="text-accent" />
                  <span className="text-accent text-[9px] font-bold tracking-[0.3em]">DESIGN LOCKED</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Summary Strip ─── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16 relative z-10">
        <div className="border-t border-white/5 pt-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[9px] text-neutral-600 tracking-[0.4em] mb-1">TEE</p>
              <p className="text-sm font-bold text-white tracking-wider">{selectedColor.name}</p>
            </div>
            <div>
              <p className="text-[9px] text-neutral-600 tracking-[0.4em] mb-1">DESIGN</p>
              <p className="text-sm font-bold text-white tracking-wider">{selectedDesign?.name || '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-neutral-600 tracking-[0.4em] mb-1">SIZE</p>
              <p className="text-sm font-bold text-white tracking-wider">{selectedSize || '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Zoomed Modal ─── */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-8"
            onClick={() => setIsZoomed(false)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="relative w-full max-w-[600px] aspect-[5/6]">
              <div className="absolute inset-0 -m-16 rounded-full opacity-15 blur-3xl"
                style={{ backgroundColor: selectedColor.hex }} />
              <TeeSVG color={selectedColor.hex} />
              {selectedDesign && (
                <div className="absolute" style={{ top: '22%', left: '28%', width: '44%', height: '30%', mixBlendMode: 'screen' }}>
                  <div className="w-full h-full flex items-center justify-center rounded-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <pre className="text-3xl font-mono font-black text-white/90 leading-tight text-center tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                      {selectedDesign.svg}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white text-[10px] tracking-[0.3em] font-bold">
              CLOSE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesignStudio;
