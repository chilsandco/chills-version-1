import React from 'react';
import { motion } from 'motion/react';
import { 
  RotateCcw, 
  Clock, 
  Package, 
  Brain, 
  FileText, 
  Camera, 
  Search, 
  AlertTriangle, 
  Handshake, 
  Mail,
  ArrowRight,
  ExternalLink,
  IndianRupee
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Returns: React.FC = () => {
  const [settings, setSettings] = React.useState({
    email: "hello.chilsandco@gmail.com"
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.email) setSettings(data);
      })
      .catch(err => console.error("Failed to sync global nodes:", err));
  }, []);

  return (
    <div className="pt-36 md:pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto min-h-screen bg-black">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-20 text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="p-4 bg-accent/10 rounded-full cursor-pointer"
          >
            <RotateCcw className="text-accent" size={40} strokeWidth={1.5} />
          </motion.div>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-6">
          Returns & Refunds
        </h1>
        <p className="text-xl text-neutral-400 font-medium tracking-tight">
          Built with intention. Handled with care.
        </p>
      </motion.div>

      {/* Main Philosophy */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-24 p-8 md:p-12 border border-neutral-900 bg-black relative overflow-hidden"
      >
        <motion.div 
          whileHover="hover"
          className="absolute top-0 right-0 p-8 opacity-5 overflow-hidden w-[184px] h-[184px] flex items-center justify-center cursor-pointer"
        >
            <motion.div
              variants={{
                hover: {
                  x: [0, -1, 1, -1, 200, -200, 0],
                  opacity: [1, 1, 1, 1, 0, 0, 1],
                  transition: { 
                    duration: 0.8,
                    times: [0, 0.05, 0.1, 0.15, 0.5, 0.51, 1],
                    ease: "easeInOut"
                  }
                }
              }}
            >
              <RotateCcw size={120} />
            </motion.div>
        </motion.div>
        <div className="relative z-10 space-y-6 max-w-2xl leading-relaxed text-neutral-300">
          <p>
            At Chils & Co, every piece is designed beyond just appearance — from fabric behavior and color accuracy to durability and finish.
          </p>
          <div className="py-4">
            <p className="text-accent font-display text-2xl font-bold uppercase tracking-widest italic">
              We don’t build for seasons.<br/>
              We build for reasons.
            </p>
          </div>
          <p>
            At the same time, if something doesn’t work for you, we’re here to make it right.
          </p>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        
        {/* Return Window */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <Clock className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Integrity Window</h2>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-display font-bold tracking-tight">48 HOURS</p>
            <p className="text-neutral-500 text-sm leading-relaxed uppercase tracking-widest font-medium">
              To ensure accurate verification and maintain product integrity standards, return requests must be initiated within 48 hours of delivery. This protocol helps us maintain the quality standards we build by.
            </p>
          </div>
        </motion.section>

        {/* Eligible Reasons */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <Package className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Eligible Reasons</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border border-neutral-900 bg-black hover:border-accent/30 transition-colors cursor-default">
                <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-2">Primary</p>
                <p className="text-sm">Size or fit issues</p>
            </div>
            <div className="p-4 border border-neutral-900 bg-black space-y-2 hover:border-neutral-700 transition-colors cursor-default">
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-2">Secondary</p>
                <ul className="text-sm space-y-1 text-neutral-400 uppercase tracking-wider text-[11px]">
                    <li>• Damaged product</li>
                    <li>• Wrong item received</li>
                    <li>• Genuine quality concerns</li>
                </ul>
            </div>
            <p className="text-[10px] text-neutral-600 italic uppercase">All non-size-related requests are reviewed individually.</p>
          </div>
        </motion.section>

        {/* Before You Request */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 p-8 border border-neutral-900 bg-black space-y-6 hover:border-neutral-800 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className="p-2 bg-neutral-900 rounded">
                    <Brain className="text-accent" size={20} />
                </div>
                <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Before You Request a Return</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-sm text-neutral-400 leading-relaxed uppercase tracking-wider text-[11px]">
                    <p>Every Chils & Co piece goes through multiple stages of testing — including wash, color consistency, and overall finish.</p>
                    <p>What you see on our site is what we aim to deliver — as accurately as possible.</p>
                    <p>If your concern is related to sizing, we completely understand and will help you through it.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/5 font-serif italic text-lg leading-relaxed">
                    "For other reasons, we kindly ask you to consider the intention, time, and care behind the product before proceeding. Your support allows us to keep building with the same level of thought."
                </div>
            </div>
        </motion.section>

        {/* How to Request */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <FileText className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">How to Request</h2>
          </div>
          <ol className="space-y-4">
            {[
              "Go to Orders Archive",
              "Select your order",
              "Click “Initiate Reversal”",
              "Provide: Reason, Description, Images"
            ].map((step, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex gap-4 items-center group cursor-pointer"
              >
                <span className="text-xs font-mono text-accent">0{i+1}</span>
                <span className="text-sm uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">{step}</span>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Image Requirements */}
        <motion.section 
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <Camera className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Image Requirements</h2>
          </div>
          <div className="space-y-4 text-sm text-neutral-400 uppercase tracking-widest text-[11px]">
            <p>To help us process your request faster:</p>
            <ul className="space-y-2">
                <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent" />
                    <span>Upload up to 3 images</span>
                </li>
                <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-accent mt-1" />
                    <span className="text-white">Mandatory for: Damaged items, Wrong items, Quality concerns</span>
                </li>
            </ul>
          </div>
        </motion.section>

        {/* Review & Process */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-neutral-900">
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-neutral-900 rounded">
                        <Search className="text-accent" size={20} />
                    </div>
                    <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Outcome Options</h2>
                </div>
                <div className="space-y-4">
                    <ul className="text-sm text-neutral-400 space-y-3 uppercase tracking-widest text-[11px]">
                        <li>• Eligible requests may be processed as a Refund, Exchange, or Store Credit.</li>
                        <li>• Final outcome depends on issue type and product availability.</li>
                        <li>• All requests are reviewed manually by our quality team.</li>
                    </ul>
                </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-neutral-900 rounded">
                        <IndianRupee className="text-accent" size={20} />
                    </div>
                    <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Refund Process</h2>
                </div>
                <div className="p-6 bg-black border border-neutral-900 space-y-4 hover:border-accent/10 transition-colors">
                    <p className="text-sm">Refunds are initiated after the returned item passes rigorous inspection and validation.</p>
                    <div className="flex justify-between items-center border-t border-neutral-900 pt-4">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600">Method</span>
                        <span className="text-xs font-bold text-accent">PhonePe / Original Source</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600">Timeline</span>
                        <span className="text-xs font-bold">3–7 Business Days</span>
                    </div>
                </div>
            </motion.section>
        </div>

        {/* Conditions & Non-Returnables */}
        <section className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-neutral-900 rounded">
                    <AlertTriangle className="text-accent" size={20} />
                </div>
                <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Conditions for Return</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['Unused', 'Original Condition', 'Retain Packaging', 'Tags Intact'].map((cond, i) => (
                    <motion.div 
                      key={cond} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -5, borderColor: 'rgba(212, 175, 55, 0.3)' }}
                      className="p-4 border border-neutral-900 text-center flex flex-col items-center justify-center gap-2 cursor-default transition-colors"
                    >
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">{cond}</span>
                    </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-neutral-900 rounded">
                        <Package className="text-neutral-500" size={20} />
                    </div>
                    <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-500">Non-Returnable State</h2>
                </div>
                <ul className="text-[10px] text-neutral-500 space-y-3 uppercase tracking-widest font-medium">
                    <li className="flex items-center gap-3">
                        <div className="w-1 h-1 bg-red-900" />
                        <span>Used or washed products</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1 h-1 bg-red-900" />
                        <span>Missing original tags or trims</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1 h-1 bg-red-900" />
                        <span>Damaged after delivery (Physical damage)</span>
                    </li>
                    <li className="flex items-center gap-3 text-red-900">
                        <div className="w-1 h-1 bg-red-900" />
                        <span>Requests made outside the 48-hour window</span>
                    </li>
                </ul>
            </div>
        </section>

        {/* Fulfillment & Cancellation */}
        <section className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-y border-neutral-900">
            <div className="space-y-6">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Reverse Logistics</h3>
                <p className="text-sm text-neutral-400 leading-relaxed uppercase tracking-wider text-[11px]">
                    If your return request is approved, reverse pickup instructions will be shared via email. Availability for reverse pickup depends on logistics serviceability at your specific coordinates.
                </p>
            </div>
            <div className="space-y-6">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Order Cancellation</h3>
                <p className="text-sm text-neutral-400 leading-relaxed uppercase tracking-wider text-[11px]">
                    Orders can only be cancelled before dispatch. Once shipped, cancellations are no longer possible. After dispatch, the return policy applies instead.
                </p>
            </div>
        </section>

        {/* Packaging */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 p-12 bg-accent/5 border border-accent/20 flex flex-col md:flex-row gap-12 items-center overflow-hidden relative group"
        >
            <motion.div 
              whileHover="hover"
              className="flex-shrink-0 cursor-pointer w-[120px] h-[120px] flex items-center justify-center"
            >
                <motion.div
                   variants={{
                    hover: {
                      x: [0, -1, 1, -1, 150, -150, 0],
                      opacity: [1, 1, 1, 1, 0, 0, 1],
                      transition: { 
                        duration: 0.8,
                        times: [0, 0.05, 0.1, 0.15, 0.5, 0.51, 1],
                        ease: "easeInOut"
                      }
                    }
                  }}
                >
                  <Package className="text-accent" size={80} strokeWidth={1} />
                </motion.div>
            </motion.div>
            <div className="space-y-4 relative z-10">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">A Note on Packaging</h3>
                <p className="text-sm text-neutral-300 leading-relaxed uppercase tracking-wider">
                    Your order arrives in a reusable packaging unit. It’s designed for a second life — as a storage module for socks, stationery, or everyday essentials.
                </p>
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest italic">
                    We encourage you to keep it in use, beyond delivery.
                </p>
            </div>
        </motion.section>

        {/* Team Note */}
        <section className="md:col-span-2 py-16 flex flex-col items-center text-center space-y-8">
            <Handshake className="text-accent" size={48} strokeWidth={1} />
            <div className="max-w-xl space-y-4">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">A Note from Us</h3>
                <p className="text-2xl font-display font-bold tracking-tighter uppercase italic">
                    "We’re building more than products. Every piece and every detail is created with intention."
                </p>
                <p className="text-sm text-neutral-500 uppercase tracking-widest leading-loose">
                    If something truly doesn’t work, we’ll support you. If it does, we hope you experience it fully — as it was designed to be.
                </p>
            </div>
        </section>

        {/* Need Help */}
        <section className="md:col-span-2 flex flex-col items-center pt-12 border-t border-neutral-900">
            <div className="bg-black border border-neutral-900 p-8 flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="p-4 bg-accent/10 rounded-full">
                    <Mail className="text-accent" size={24} />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest mb-1">Need Assistance?</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Our support team is active and ready to assist you root-to-end.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                      to="/console/orders" 
                      className="whitespace-nowrap flex items-center gap-2 group text-[11px] font-bold uppercase tracking-[0.3em] text-white hover:text-accent transition-colors"
                  >
                      Orders Archive <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a 
                      href={`mailto:${settings.email}`} 
                      className="whitespace-nowrap flex items-center gap-2 group text-[11px] font-bold uppercase tracking-[0.3em] text-accent hover:text-white transition-colors"
                  >
                      Contact: {settings.email} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Returns;
