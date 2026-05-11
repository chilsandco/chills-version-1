import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Clock, MapPin, ArrowRight, ShieldCheck, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const Support: React.FC = () => {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 selection:bg-accent selection:text-black">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-accent" />
            <span className="text-[10px] tracking-[0.5em] text-accent font-bold uppercase">System Integrity</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase mb-8">
            Support <br /> <span className="text-neutral-800 italic">& Assistance</span>
          </h1>
          <p className="text-neutral-500 text-sm md:text-base max-w-2xl leading-relaxed uppercase tracking-widest font-light">
            At Chils & Co, support is not an afterthought — it is an extension of our engineering philosophy. 
            Root-to-end assistance for every builder in our ecosystem.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
          {/* Direct Communication */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 border border-neutral-900 overflow-hidden"
          >
            {/* Email Support */}
            <div className="bg-black p-10 flex flex-col justify-between group hover:bg-neutral-950 transition-colors duration-500">
              <div className="mb-12">
                <Mail className="text-accent mb-6" size={32} strokeWidth={1} />
                <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-4 text-neutral-400">Electronic Mail</h3>
                <p className="text-2xl font-display font-bold tracking-tight mb-2">hello.chilsandco@gmail.com</p>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest leading-relaxed">
                  For order queries, technical support, and partnership requests.
                </p>
              </div>
              <a 
                href="mailto:hello.chilsandco@gmail.com"
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:text-accent transition-colors group"
              >
                Initiate Transmission <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Voice Support */}
            <div className="bg-black p-10 flex flex-col justify-between group hover:bg-neutral-950 transition-colors duration-500">
              <div className="mb-12">
                <Phone className="text-accent mb-6" size={32} strokeWidth={1} />
                <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-4 text-neutral-400">Voice Link</h3>
                <p className="text-2xl font-display font-bold tracking-tight mb-2">+91 7842 07 0404</p>
                <div className="flex items-center gap-2 mt-4">
                  <Clock className="text-neutral-700" size={14} />
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                    Mon–Sat · 10 AM – 6 PM IST
                  </p>
                </div>
              </div>
              <a 
                href="tel:+917842070404"
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:text-accent transition-colors group"
              >
                Open Connection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Physical Location */}
            <div className="bg-black p-10 col-span-1 md:col-span-2 group hover:bg-neutral-950 transition-colors duration-500 border-t border-neutral-900">
              <div className="flex flex-col md:flex-row justify-between gap-12">
                <div className="max-w-md">
                  <MapPin className="text-accent mb-6" size={32} strokeWidth={1} />
                  <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-4 text-neutral-400">Physical Coordinates</h3>
                  <p className="text-xl font-display font-bold tracking-tight uppercase leading-relaxed mb-4">
                    3rd Floor, Plot No. 38 & 39<br />
                    Matrusri Nagar, Miyapur<br />
                    Hyderabad, Telangana – 500049<br />
                    India
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-end">
                   <div className="p-8 border border-neutral-900 rounded-full opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700">
                      <ShieldCheck size={80} strokeWidth={0.5} />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Support Links */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="p-8 border border-neutral-900 bg-black flex flex-col justify-between min-h-[300px] hover:border-neutral-700 transition-colors">
              <div>
                 <Headphones className="text-neutral-700 mb-6" size={24} />
                 <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-6 text-neutral-400 font-mono italic">Quick Ops</h3>
                 <div className="space-y-4">
                    <Link to="/shipping-delivery" className="flex items-center justify-between group py-2 border-b border-neutral-900">
                      <span className="text-[10px] uppercase font-bold tracking-widest group-hover:text-accent transition-colors">Shipping Protocol</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                    <Link to="/returns-refunds" className="flex items-center justify-between group py-2 border-b border-neutral-900">
                      <span className="text-[10px] uppercase font-bold tracking-widest group-hover:text-accent transition-colors">Return Policy</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                    <Link to="/auth" className="flex items-center justify-between group py-2 border-b border-neutral-900">
                      <span className="text-[10px] uppercase font-bold tracking-widest group-hover:text-accent transition-colors">Account Access</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                 </div>
              </div>
              <div className="mt-8 pt-6 border-t border-neutral-900">
                <p className="text-[9px] text-neutral-700 uppercase tracking-widest italic">
                  Operational clearance: 24/7 Monitoring
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-center pt-24 border-t border-neutral-900"
        >
          <p className="text-[10px] text-neutral-700 uppercase tracking-[0.5em] mb-8 italic">
            Essential by Design. Built for the Builder.
          </p>
          <div className="flex justify-center gap-12">
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold text-accent mb-2">INTEGRITY</span>
               <div className="w-1 h-1 bg-accent rounded-full" />
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold text-neutral-700 mb-2">PRECISION</span>
               <div className="w-1 h-1 bg-neutral-800 rounded-full" />
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold text-neutral-700 mb-2">TRANSPARENCY</span>
               <div className="w-1 h-1 bg-neutral-800 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;
