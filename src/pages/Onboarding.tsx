import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Cpu, Database, Network, ShieldCheck, Activity } from 'lucide-react';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "System Initialization",
      subtitle: "Parsing identity protocols",
      icon: <Database className="text-accent" size={32} />,
      content: "Registering origin coordinates and establishing secure channel."
    },
    {
      title: "Signal Tuning",
      subtitle: "Calibrating community output",
      icon: <Network className="text-accent" size={32} />,
      content: "Synchronizing with nearest Hub 01. Optimizing for limited hardware releases."
    },
    {
      title: "Profile Verified",
      subtitle: "Access level: Essential",
      icon: <ShieldCheck className="text-accent" size={32} />,
      content: "Identification complete. You are now a registered part of the CHILS & CO. system."
    }
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      // Final delay before redirect
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate, steps.length]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 sm:p-12 overflow-hidden">
      <AnimatePresence mode="wait">
        {step < steps.length ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md w-full text-center space-y-12"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div
                initial={{ rotate: -20, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="w-20 h-20 rounded-full border border-neutral-800 flex items-center justify-center bg-neutral-950"
              >
                {steps[step].icon}
              </motion.div>
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">{steps[step].subtitle}</p>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase">{steps[step].title}</h1>
              </div>
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mx-auto uppercase tracking-widest leading-loose">
              {steps[step].content}
            </p>

            <div className="flex items-center justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 transition-all duration-500 ${i === step ? 'w-8 bg-accent' : 'w-2 bg-neutral-800'}`} 
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl w-full text-center space-y-16"
          >
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <CheckCircle2 className="mx-auto text-accent mb-8" size={80} strokeWidth={1} />
                <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter uppercase leading-none">
                  WELCOME TO THE COMMUNITY
                </h2>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="space-y-4"
              >
                <p className="text-[12px] tracking-[0.4em] uppercase">Status: Initialized</p>
                <p className="text-[10px] tracking-[0.2em] uppercase italic px-12">
                  "The build begins now. Your presence has been registered in the archive."
                </p>
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-[1px] bg-neutral-800" />
              <p className="text-[8px] tracking-[0.8em] text-neutral-600 uppercase">Redirecting to System Root</p>
              <Activity className="text-accent animate-pulse" size={16} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[160px]" />
      </div>
    </div>
  );
};

export default Onboarding;
