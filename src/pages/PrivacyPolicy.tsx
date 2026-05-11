import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, Server, RefreshCcw, Mail, MapPin, Phone, Clock } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 selection:bg-accent selection:text-black font-sans">
      <div className="max-w-[1000px] mx-auto">
        {/* Header Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-accent" />
            <span className="text-[10px] tracking-[0.5em] text-accent font-bold uppercase">Data Security Protocol</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase mb-8">
            Privacy <br /> <span className="text-neutral-800 italic">Policy</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between border-b border-neutral-900 pb-8">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold font-mono">
              Last Updated: May 11, 2026
            </p>
            <p className="text-neutral-400 text-sm italic">
              "Built with intention. Protected with responsibility."
            </p>
          </div>
        </motion.section>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-20"
        >
          <section className="space-y-6">
            <p className="text-neutral-300 leading-relaxed uppercase tracking-wider text-xs md:text-sm max-w-3xl">
              At Chils & Co., privacy is treated with the same level of intention as the products we build.
              This Privacy Policy explains how we collect, use, store, and protect your information when you access our website, place an order, interact with our services, or communicate with us.
            </p>
            <div className="p-6 bg-neutral-900/30 border border-neutral-900">
               <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-500 mb-2">Legal Entity</p>
               <p className="text-sm font-display tracking-tight text-white uppercase italic">Chils & Co. is a brand operated by Chilamkuri Ventures.</p>
            </div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest leading-relaxed">
              By accessing or using our website, you agree to the practices described in this policy.
            </p>
          </section>

          {/* Collection */}
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-neutral-900 rounded">
                <Eye className="text-accent" size={20} />
              </div>
              <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">Information We Collect</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 border border-neutral-900 overflow-hidden">
                <div className="bg-black p-8 space-y-6 hover:bg-neutral-950 transition-colors">
                    <h3 className="text-[10px] text-accent uppercase font-bold tracking-widest">Personal Information</h3>
                    <p className="text-neutral-400 text-xs leading-relaxed uppercase tracking-widest">
                       Data collected during order placement or support interaction:
                    </p>
                    <ul className="text-xs text-white space-y-2 uppercase tracking-[0.15em] font-medium">
                        <li>• Full name & Mobile Number</li>
                        <li>• Email address</li>
                        <li>• Shipping & billing address</li>
                        <li>• Payment-related details</li>
                        <li>• Order history</li>
                    </ul>
                </div>
                <div className="bg-black p-8 space-y-6 hover:bg-neutral-950 transition-colors">
                    <h3 className="text-[10px] text-accent uppercase font-bold tracking-widest">Technical Information</h3>
                    <p className="text-neutral-400 text-xs leading-relaxed uppercase tracking-widest">
                       Data collected automatically during browsing:
                    </p>
                    <ul className="text-xs text-white space-y-2 uppercase tracking-[0.15em] font-medium">
                        <li>• IP address & Browser type</li>
                        <li>• Device & Operating system</li>
                        <li>• Website interaction data</li>
                        <li>• Cookies & usage analytics</li>
                    </ul>
                </div>
            </div>
          </section>

          {/* Utilization */}
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-neutral-900 rounded">
                <RefreshCcw className="text-accent" size={20} />
              </div>
              <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">How We Use Your Information</h2>
            </div>
            <div className="p-8 border border-neutral-900 bg-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        "Process and fulfill orders",
                        "Shipping and tracking updates",
                        "Support and technical assistance",
                        "Improvement of website functionality",
                        "Detection of fraud or unauthorized activity",
                        "Transactional communication",
                        "Legal and operational obligations"
                    ].map(use => (
                        <div key={use} className="flex items-center gap-3">
                            <div className="w-1 h-1 bg-accent" />
                            <span className="text-[10px] text-neutral-300 uppercase tracking-widest font-medium">{use}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-8 border-t border-neutral-900">
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white italic">
                        We do not sell your personal information.
                    </p>
                </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-neutral-900 rounded">
                    <Lock className="text-accent" size={20} />
                  </div>
                  <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">Transaction Security</h2>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed uppercase tracking-[0.15em]">
                    Payments are processed through PhonePe and associated infrastructure. We do not store complete debit/credit card, UPI PIN, or banking credentials on our servers.
                </p>
             </div>
             <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-neutral-900 rounded">
                    <Server className="text-accent" size={20} />
                  </div>
                  <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">Logistics Protocol</h2>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed uppercase tracking-[0.15em]">
                    Necessary shipping information is shared with delivery partners solely to complete operational requirements (Name, Address, Contact).
                </p>
             </div>
          </section>

          {/* Cookies & Data */}
          <section className="p-10 border border-neutral-900 bg-black space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Shield size={120} strokeWidth={0.5} />
             </div>
             <div className="relative z-10 space-y-6">
                <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase italic">Cookies & Analytics</h2>
                <p className="text-neutral-300 text-xs md:text-sm leading-relaxed uppercase tracking-wider max-w-2xl">
                    We use cookies to maintain functionality and optimize performance. You may disable cookies through browser settings, though some functionality may be limited.
                </p>
                <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase italic pt-6">Data Security</h2>
                <p className="text-neutral-300 text-xs md:text-sm leading-relaxed uppercase tracking-wider max-w-2xl">
                    We implement technical safeguards to protect against unauthorized access. While we strive for absolute security, no method of transmission is 100% immune to breach.
                </p>
             </div>
          </section>

          {/* Communication & Rights */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-neutral-900">
             <div className="space-y-6">
                <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase text-neutral-500">Communication</h3>
                <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-[0.15em]">
                    We contact you regarding order confirmations, shipping, returns, and support. We do not send excessive promotional communication.
                </p>
             </div>
             <div className="space-y-6">
                <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase text-neutral-500">Your Rights</h3>
                <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-[0.15em]">
                    You may request access, correction, or deletion of your personal information. We make reasonable efforts to address such requests subject to operational requirements.
                </p>
             </div>
          </section>

          {/* Support Section */}
          <section className="pt-12 border-t border-neutral-900">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-8">Support Contact</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Mail size={16} className="text-accent" />
                            <a href="mailto:hello.chilsandco@gmail.com" className="text-sm font-display font-medium border-b border-white/10 pb-1">hello.chilsandco@gmail.com</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone size={16} className="text-accent" />
                            <p className="text-sm font-display font-medium">+91 7842 07 0404</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Clock size={16} className="text-neutral-700" />
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Mon–Sat · 10 AM – 6 PM IST</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-8">Physical Base</h2>
                    <div className="flex gap-4">
                        <MapPin size={16} className="text-accent flex-shrink-0" />
                        <p className="text-sm font-display font-medium uppercase tracking-tight leading-relaxed">
                            3rd Floor, Plot No. 38 & 39<br />
                            Matrusri Nagar<br />
                            Miyapur<br />
                            Hyderabad, Telangana – 500049<br />
                            India
                        </p>
                    </div>
                </div>
             </div>
          </section>

          {/* Children & Updates */}
          <div className="py-20 border-y border-neutral-900 flex flex-col md:flex-row justify-between gap-12 font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-700 italic">
             <p>CHILAMKURI VENTURES // SYSTEM OPS</p>
             <p>REVISED PERIODICALLY // VERSION 1.0</p>
             <p>ADHERENCE MANDATORY</p>
          </div>
        </motion.div>

        {/* Footer Brand */}
        <div className="pt-24 text-center">
           <div className="inline-block p-4 border border-accent/20 rounded-full mb-8">
              <Shield size={32} className="text-accent" strokeWidth={1} />
           </div>
           <p className="text-[10px] text-neutral-600 uppercase tracking-[1em] italic">
             Integrity by Default.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
