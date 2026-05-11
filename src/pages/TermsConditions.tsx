import React from 'react';
import { motion } from 'motion/react';
import { Shield, Book, UserCheck, Package, CreditCard, Truck, RefreshCcw, Layout, UserX, Globe, AlertCircle, Mail, MapPin, Phone, Clock } from 'lucide-react';

const TermsConditions: React.FC = () => {
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
            <span className="text-[10px] tracking-[0.5em] text-accent font-bold uppercase">Operational Framework</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase mb-8">
            Terms & <br /> <span className="text-neutral-800 italic">Conditions</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between border-b border-neutral-900 pb-8">
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold font-mono">
              Last Updated: May 11, 2026
            </p>
            <p className="text-neutral-400 text-sm italic">
              "Essential by Design. Elevated by Intent."
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
            <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase flex items-center gap-3">
                <Book className="text-accent" size={16} /> 01 // Introduction
            </h2>
            <p className="text-neutral-300 leading-relaxed uppercase tracking-wider text-xs md:text-sm max-w-3xl">
              Welcome to Chils & Co. These Terms & Conditions govern your access to and use of the Chils & Co. website, products, services, and related experiences.
              By accessing or using this website, you agree to be bound by these Terms & Conditions, along with our Privacy Policy, Shipping & Delivery Policy, and Returns & Refunds Policy.
            </p>
            <div className="p-6 bg-neutral-900/30 border border-neutral-900">
               <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-neutral-500 mb-2">Legal Context</p>
               <p className="text-sm font-display tracking-tight text-white uppercase italic">Chils & Co. is a brand operated by Chilamkuri Ventures.</p>
            </div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest leading-relaxed">
              If you do not agree with any part of these terms, please refrain from using the platform.
            </p>
          </section>

          {/* Eligibility */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-neutral-900 rounded">
                <UserCheck className="text-accent" size={18} />
              </div>
              <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">02 // Eligibility</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    "Legally capable of binding agreements",
                    "Provided accurate and complete data",
                    "Adherence to applicable laws"
                ].map((item, idx) => (
                    <div key={idx} className="p-6 border border-neutral-900 bg-black/40 hover:border-accent/20 transition-all group">
                        <span className="text-[9px] text-neutral-600 block mb-2 font-mono">CRITERION_0{idx+1}</span>
                        <p className="text-[10px] text-white uppercase tracking-widest leading-relaxed font-medium">{item}</p>
                    </div>
                ))}
            </div>
          </section>

          {/* Products & Pricing */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 border border-neutral-900 rounded-sm overflow-hidden">
             <div className="bg-black p-10 space-y-6">
                <div className="flex items-center gap-3">
                   <Package className="text-accent" size={18} />
                   <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">03 // Products & Availability</h3>
                </div>
                <div className="space-y-4 text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">
                    <p>• Minor variations in color may occur due to display differences.</p>
                    <p>• Availability is subject to change without notice.</p>
                    <p>• We reserve the right to modify or discontinue lines at any time.</p>
                </div>
             </div>
             <div className="bg-black p-10 space-y-6 border-t md:border-t-0 md:border-l border-neutral-900">
                <div className="flex items-center gap-3">
                   <CreditCard className="text-accent" size={18} />
                   <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">04 // Pricing & Payments</h3>
                </div>
                <div className="space-y-4 text-[10px] text-neutral-400 uppercase tracking-widest leading-relaxed">
                    <p>• Prices in INR unless stated otherwise.</p>
                    <p>• Secure processing via PhonePe infrastructure.</p>
                    <p>• Rights reserved to cancel orders with technical pricing errors.</p>
                </div>
             </div>
          </section>

          {/* Logistics & Returns */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Truck className="text-accent" size={20} />
                  <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">05 // Shipping & Delivery</h2>
                </div>
                <p className="text-neutral-400 text-[10px] leading-relaxed uppercase tracking-[0.15em]">
                    Timelines and estimates are detailed in our Shipping Policy. While we aim for precision, external factors (weather, logistics partners) may occasionally cause delays.
                </p>
             </div>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <RefreshCcw className="text-accent" size={20} />
                  <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">06 // Returns & Refunds</h2>
                </div>
                <p className="text-neutral-400 text-[10px] leading-relaxed uppercase tracking-[0.15em]">
                    Governed by our Returns Policy. Requests must be initiated within 48 hours of delivery. Orders can only be cancelled prior to dispatch.
                </p>
             </div>
          </section>

          {/* Intellectual Property */}
          <section className="p-12 border border-neutral-900 bg-[#050505] relative overflow-hidden group">
             <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Layout size={240} />
             </div>
             <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                   <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase italic">07 // Intellectual Property</h2>
                </div>
                <p className="text-neutral-300 text-xs md:text-sm leading-relaxed uppercase tracking-wider max-w-3xl">
                    All content, including branding, product concepts, designs, and visual assets, are the intellectual property of Chils & Co. / Chilamkuri Ventures. 
                    Unauthorized reproduction or commercial use is strictly prohibited.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                    {["Concepts", "Designs", "Logos", "Direction"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-neutral-900 text-[9px] text-neutral-500 uppercase tracking-widest font-mono">
                            {tag}_PROTECTED
                        </span>
                    ))}
                </div>
             </div>
          </section>

          {/* Conduct & Liability */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-neutral-900">
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <UserX className="text-neutral-600" size={16} />
                    <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase text-neutral-500">08 // User Conduct</h3>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-[0.15em]">
                    You agree not to misuse the platform, attempt unauthorized access, or interfere with security. We reserve the right to restrict access if misuse is detected.
                </p>
             </div>
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-neutral-600" size={16} />
                    <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase text-neutral-500">10 // Limitation of Liability</h3>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-[0.15em]">
                    Chils & Co. shall not be liable for indirect damages, technical interruptions, or loss arising from platform misuse. Use is at your own discretion.
                </p>
             </div>
          </section>

          {/* Legal Governance */}
          <section className="p-10 border border-neutral-900 bg-black space-y-8">
             <div className="flex items-center gap-4">
               <Globe className="text-accent" size={18} />
               <h2 className="text-[11px] tracking-[0.3em] font-bold uppercase">13 // Governing Law & Jurisdiction</h2>
             </div>
             <p className="text-neutral-300 text-[10px] md:text-xs leading-relaxed uppercase tracking-[0.2em] max-w-2xl">
                 These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts located in Hyderabad, Telangana.
             </p>
          </section>

          {/* Contact Section */}
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

          {/* System Footer Bar */}
          <div className="py-16 border-y border-neutral-900 flex flex-col md:flex-row justify-between gap-12 font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-700 italic">
             <p>CHILAMKURI VENTURES // POLICY OPS</p>
             <p>TERMS_VER_1.0_2026</p>
             <p>ACC_REQUIRED</p>
          </div>
        </motion.div>

        {/* Brand Signoff */}
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

export default TermsConditions;
