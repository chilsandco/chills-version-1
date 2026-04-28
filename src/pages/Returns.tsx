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
  CircleDollarSign, 
  AlertTriangle, 
  Handshake, 
  Mail,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Returns: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto min-h-screen bg-black">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-20 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-accent/10 rounded-full">
            <RotateCcw className="text-accent" size={40} strokeWidth={1.5} />
          </div>
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
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-24 p-8 md:p-12 border border-neutral-900 bg-black relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <RotateCcw size={120} />
        </div>
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
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <Clock className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Return Window</h2>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-display font-bold tracking-tight">48 HOURS</p>
            <p className="text-neutral-500 text-sm leading-relaxed uppercase tracking-widest font-medium">
              You can request a return within 48 hours of delivery. After this window, return requests will no longer be accepted.
            </p>
          </div>
        </section>

        {/* Eligible Reasons */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <Package className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Eligible Reasons</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border border-neutral-900 bg-black">
                <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-2">Primary</p>
                <p className="text-sm">Size or fit issues</p>
            </div>
            <div className="p-4 border border-neutral-900 bg-black space-y-2">
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-2">Secondary</p>
                <ul className="text-sm space-y-1 text-neutral-400 uppercase tracking-wider text-[11px]">
                    <li>• Damaged product</li>
                    <li>• Wrong item received</li>
                    <li>• Genuine quality concerns</li>
                </ul>
            </div>
            <p className="text-[10px] text-neutral-600 italic uppercase">All non-size-related requests are reviewed individually.</p>
          </div>
        </section>

        {/* Before You Request */}
        <section className="md:col-span-2 p-8 border border-neutral-900 bg-black space-y-6">
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
        </section>

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
              <li key={i} className="flex gap-4 items-center group">
                <span className="text-xs font-mono text-accent">0{i+1}</span>
                <span className="text-sm uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Image Requirements */}
        <section className="space-y-6">
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
        </section>

        {/* Review & Process */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-neutral-900">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-neutral-900 rounded">
                        <Search className="text-accent" size={20} />
                    </div>
                    <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Review & Approval</h2>
                </div>
                <ul className="text-sm text-neutral-400 space-y-3 uppercase tracking-widest text-[11px]">
                    <li>• All return requests are reviewed manually</li>
                    <li>• Once approved, we will guide you with the next steps</li>
                    <li>• We may reach out if additional details are required</li>
                </ul>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-neutral-900 rounded">
                        <CircleDollarSign className="text-accent" size={20} />
                    </div>
                    <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Refund Process</h2>
                </div>
                <div className="p-6 bg-black border border-neutral-900 space-y-4">
                    <p className="text-sm">Refunds are initiated after approval and inspection.</p>
                    <div className="flex justify-between items-center border-t border-neutral-900 pt-4">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600">Method</span>
                        <span className="text-xs font-bold text-accent">PhonePe / Original Source</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600">Timeline</span>
                        <span className="text-xs font-bold">3–7 Business Days</span>
                    </div>
                </div>
            </section>
        </div>

        {/* Conditions */}
        <section className="md:col-span-2 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <AlertTriangle className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Conditions for Return</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Unused', 'Original Condition', 'Retain Packaging', 'Tags Intact'].map(cond => (
                <div key={cond} className="p-4 border border-neutral-900 text-center flex flex-col items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{cond}</span>
                </div>
            ))}
          </div>
        </section>

        {/* Packaging */}
        <section className="md:col-span-2 p-12 bg-accent/5 border border-accent/20 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-shrink-0">
                <Package className="text-accent" size={80} strokeWidth={1} />
            </div>
            <div className="space-y-4">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">A Note on Packaging</h3>
                <p className="text-sm text-neutral-300 leading-relaxed uppercase tracking-wider">
                    Your order arrives in a reusable packaging unit. It’s designed for a second life — as a storage module for socks, stationery, or everyday essentials.
                </p>
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest italic">
                    We encourage you to keep it in use, beyond delivery.
                </p>
            </div>
        </section>

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
                <Link 
                    to="/console/orders" 
                    className="whitespace-nowrap flex items-center gap-2 group text-[11px] font-bold uppercase tracking-[0.3em] text-white hover:text-accent transition-colors"
                >
                    Orders Archive <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Returns;
