import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Fingerprint, Palette, Send, Rocket, IndianRupee, Cpu, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HandshakeScene = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
      <motion.div 
        className="flex items-center gap-4 relative z-10"
        initial="initial"
        whileInView="animate"
      >
        {/* Left hand abstraction */}
        <motion.div 
          className="w-32 h-[2px] bg-gradient-to-r from-transparent to-accent relative"
          variants={{
            initial: { x: -100, opacity: 0 },
            animate: { x: 0, opacity: 1 }
          }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full animate-pulse" />
        </motion.div>

        {/* Sync Point */}
        <motion.div
          className="w-20 h-20 border border-accent/20 rounded-full flex items-center justify-center relative"
          variants={{
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 1 }
          }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="absolute inset-0 border border-accent/10 rounded-full animate-ping" />
          <Cpu className="text-accent" size={24} />
        </motion.div>

        {/* Right hand abstraction */}
        <motion.div 
          className="w-32 h-[2px] bg-gradient-to-l from-transparent to-accent relative"
          variants={{
            initial: { x: 100, opacity: 0 },
            animate: { x: 0, opacity: 1 }
          }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Connection lines / Pulse */}
      <motion.div 
        className="absolute top-1/2 left-0 w-full h-[1px] bg-accent/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      />
    </div>
  );
};

const SubmissionProtocolTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const terminalLines = [
    "[SYSTEM] SEARCHING FOR EXTERNAL INPUT MODULE...",
    "[SYSTEM] MODULE LOCATED: CHILS_CREATOR_SUBMISSION_V1",
    "[DEBUG] CHECKING SECTOR ALIGNMENT... OK",
    "[SECURITY] CRYPTOGRAPHIC HANDSHAKE INITIATED",
    "[PROTOCOL] REDIRECTING SIGNAL TO SECURE LAYER...",
    "[SYSTEM] REDIRECTION AUTHORIZED. ENTERING PROTOCOL..."
  ];

  const handleInitiate = () => {
    setIsTransitioning(true);
  };

  React.useEffect(() => {
    if (isTransitioning) {
      if (currentLineIndex < terminalLines.length) {
        const timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, 600 + Math.random() * 600); // Faster sequence
        return () => clearTimeout(timer);
      } else {
        // Final redirect
        const finalTimer = setTimeout(() => {
          const formUrl = 'https://forms.gle/mL3jdNzUnwXsSbWp8';
          const newWindow = window.open(formUrl, '_blank');
          
          // If popup is blocked (often happens in iframes or setTimeouts), fallback to same tab
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            window.location.href = formUrl;
          }
          
          setIsTransitioning(false);
          setCurrentLineIndex(0);
        }, 1000);
        return () => clearTimeout(finalTimer);
      }
    }
  }, [isTransitioning, currentLineIndex, terminalLines.length]);

  return (
    <>
      <button 
        onClick={handleInitiate}
        className="w-full max-w-sm py-6 bg-accent text-black text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.15)] flex items-center justify-center gap-3 active:scale-95 group"
      >
        Initiate Submission Protocol
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-900 rounded-sm p-8 md:p-12 space-y-10 relative overflow-hidden">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px] pointer-events-none opacity-20" />
              
              <div className="flex justify-between items-center border-b border-neutral-900 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-[10px] text-accent font-bold uppercase tracking-[0.4em]">Secure Handshake Protocol</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-600">ID: {(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}</span>
              </div>

              <div className="font-mono text-[11px] md:text-xs space-y-4 min-h-[160px]">
                {terminalLines.slice(0, currentLineIndex + 1).map((line, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={i === currentLineIndex ? "text-white" : "text-neutral-500"}
                  >
                    <span className="text-neutral-700 mr-4">[{new Date().toLocaleTimeString('en-GB')}]</span>
                    {line}
                    {i === currentLineIndex && currentLineIndex < terminalLines.length && (
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-accent ml-2 translate-y-1"
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="pt-6 border-t border-neutral-900 flex justify-between items-center">
                 <div className="flex gap-1">
                    {[0, 1, 2].map(dot => (
                      <div key={dot} className={`w-1 h-3 ${currentLineIndex > dot * 1.5 ? 'bg-accent' : 'bg-neutral-800'}`} />
                    ))}
                 </div>
                 <p className="text-[9px] uppercase tracking-widest text-neutral-600 italic">
                    {currentLineIndex < terminalLines.length ? "Processing payload..." : "Success. Handover complete."}
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const CoCreator = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const morphWords = [
    "COLLABORATION",
    "CO-OWNERSHIP",
    "CO-AUTHORSHIP",
    "CO-SIGNAL",
    "CO-EXECUTION"
  ];
  const [wordIndex, setWordIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % morphWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { number: "01", title: "Identity", description: "Define your pseudo-identity. This becomes your creator signature.", icon: Fingerprint },
    { number: "02", title: "Create", description: "Translate intent into form. AI or manual—tooling is irrelevant.", icon: Palette },
    { number: "03", title: "Submit", description: "Your work enters the internal gate. Reviewed for alignment and feasibility.", icon: Send },
    { number: "04", title: "Launch", description: "Approved artifacts move to production. Limited runs. Global exposure.", icon: Rocket },
    { number: "05", title: "Earn", description: "5% per unit. Fully visible. System tracked.", icon: IndianRupee }
  ];

  return (
    <div className="bg-black min-h-screen pt-28 md:pt-32 pb-24 overflow-hidden selection:bg-accent selection:text-black uppercase">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Hero Section */}
        <section className="mb-40 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center gap-2 mb-4">
              <span className="text-accent text-[10px] font-bold tracking-[0.8em] uppercase">Protocol: Co-Creation</span>
              <div className="w-12 h-[1px] bg-accent/30" />
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter uppercase leading-[0.85]">
              Co in Chils & Co <br />
              <span className="text-neutral-500 text-6xl md:text-8xl lg:text-9xl">isn't a suffix.</span> <br />
              It's a system.
            </h1>

            <div className="max-w-xl mx-auto space-y-4">
              <p className="text-neutral-400 text-lg font-light leading-relaxed normal-case">
                You don’t just wear the brand. <br />
                <span className="text-white uppercase font-bold tracking-tighter text-2xl">You build it.</span>
              </p>
              <div className="flex items-center justify-center gap-4 text-[11px] text-accent font-bold uppercase tracking-[0.4em]">
                <span>Intent</span>
                <ArrowRight size={12} />
                <span>Artifact</span>
              </div>
              <p className="text-neutral-600 text-sm uppercase tracking-widest italic">
                Distributed across a global network.
              </p>
            </div>
            
            <div className="pt-12">
              <Link 
                to="/auth" 
                className="inline-flex flex-col items-center group no-underline"
              >
                <div className="px-12 py-5 bg-accent text-black text-[11px] font-bold uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                  Request Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="mt-4 text-[9px] text-neutral-600 uppercase tracking-widest italic font-light">Authentication required to enter the system</span>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Morphing CO Section */}
        <section className="mb-40 py-24 border-y border-white/5">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start lg:items-center">
            <div className="w-full lg:w-3/5">
              <div className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-accent uppercase tracking-tighter flex items-center gap-x-4 md:gap-x-8 flex-wrap">
                <span className="shrink-0">CO =</span>
                <div className="relative min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={morphWords[wordIndex]}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="text-white whitespace-nowrap inline-block"
                    >
                      {morphWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-2/5 space-y-6">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold uppercase tracking-tight text-white leading-tight">Every design carries a mind behind it. <br /><span className="text-accent underline decoration-accent/30 underline-offset-8">We’re opening the system to yours.</span></h2>
              <p className="text-neutral-400 font-light leading-relaxed max-w-lg normal-case text-sm md:text-base">
                The co-creation protocol bridges the gap between individual vision and industrial production. A recursive loop of shared intent.
              </p>
            </div>
          </div>
        </section>

        {/* Manifesto Section */}
        <section className="mb-40">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white">The Open Core Architecture</h2>
              <div className="space-y-6 text-xl md:text-2xl text-neutral-400 font-light leading-relaxed normal-case">
                <p>Fashion is typically a closed loop—</p>
                <p className="text-white italic uppercase font-bold tracking-tighter">a few minds deciding for the masses.</p>
                <p>This is an open system.</p>
                <p>We provide infrastructure: <span className="text-accent uppercase font-bold tracking-widest">supply chain, production, quality control.</span></p>
                <p>You provide the only thing that matters— <span className="text-white font-bold uppercase tracking-tighter text-4xl">vision.</span></p>
              </div>
            </div>

            <div className="flex items-center gap-24 pt-12 border-t border-white/5">
              <div className="flex flex-col">
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-6xl font-display font-bold text-white flex items-baseline"
                >
                  5%
                </motion.div>
                <span className="text-[10px] text-accent font-bold uppercase tracking-[0.3em]">Global royalty per unit</span>
              </div>
              <div className="flex flex-col">
                <motion.div 
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="text-6xl font-display font-bold text-white leading-none inline-block origin-center"
                >
                  ∞
                </motion.div>
                <span className="text-[10px] text-accent font-bold uppercase tracking-[0.3em]">Creative autonomy</span>
              </div>
            </div>
          </div>
        </section>

        {/* System Pipeline (Horizontal) */}
        <section className="mb-40 pt-24 border-t border-white/5 relative">
           <div className="absolute top-0 right-0 p-8">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className={`w-1 h-3 transition-all duration-700 ${activeStep === i ? 'bg-accent h-6' : 'bg-white/10'}`} />
                ))}
              </div>
           </div>

          <div className="mb-24">
            <h2 className="text-4xl font-display font-bold uppercase tracking-tighter text-white mb-2">The Build Pipeline</h2>
            <p className="text-neutral-500 text-[10px] uppercase tracking-[0.5em] font-bold italic">End-to-end artifact lifecycle</p>
          </div>

          <div className="relative">
            {/* Thread Line */}
            <div className="absolute top-5 left-0 w-full h-[1px] bg-white/10 hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 relative z-10">
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  onViewportEnter={() => setActiveStep(index)}
                  className="space-y-8 group"
                >
                  <div className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center relative z-20 group-hover:border-accent group-hover:scale-110 transition-all duration-500 overflow-hidden">
                    {activeStep === index && (
                      <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-accent/20 blur-sm"
                      />
                    )}
                    <step.icon size={16} className={`${activeStep === index ? 'text-accent' : 'text-neutral-500'} transition-colors duration-500 relative z-10`} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-accent text-[9px] font-bold font-mono tracking-widest">{step.number}</span>
                      <h3 className="text-sm text-white font-bold uppercase tracking-[0.2em]">{step.title}</h3>
                    </div>
                    <p className="text-neutral-400 text-[13px] leading-relaxed font-light normal-case group-hover:text-white transition-colors duration-500">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Signal Alignment (Handshake) */}
        <section className="mb-40 text-center py-40 bg-white/[0.01] rounded-sm border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)]" />
          <HandshakeScene />
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-xl mx-auto space-y-8 -mt-16 relative z-20"
          >
            <div className="space-y-4">
              <h3 className="text-5xl font-display font-bold uppercase tracking-tighter text-white">No contracts. No noise.</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-12 bg-accent/30" />
                <p className="text-accent text-[11px] font-bold uppercase tracking-[0.6em] italic">Signal Alignment</p>
                <div className="h-[1px] w-12 bg-accent/30" />
              </div>
            </div>
            <p className="text-neutral-400 font-light leading-relaxed normal-case px-4">
              If your intent fits the system—we build. No bureaucracy. No middlemen. Direct artifact realization from vision to fabric.
            </p>
          </motion.div>
        </section>

        {/* Authorship Section */}
        <section className="mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-white leading-[0.9]">Artifact <br />Authorship</h2>
              <div className="space-y-8 text-neutral-400 font-light leading-relaxed text-xl normal-case">
                <p>Your identity is embedded into every artifact.</p>
                <p className="text-white italic uppercase font-bold tracking-tighter text-2xl">Not as credit—but as authorship.</p>
                <p>Over time, your name doesn’t just appear. <br /><span className="text-accent font-bold uppercase tracking-widest block mt-4 border-b-2 border-accent/20 pb-2 w-fit">It compounds.</span></p>
              </div>

              <div className="p-8 border border-white/5 bg-white/[0.02] rounded-sm space-y-8 backdrop-blur-sm">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-accent text-[10px] font-bold uppercase tracking-[0.4em]">
                      <Globe size={14} />
                      <span>Network Node Status</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                      <span className="text-[9px] text-accent font-bold uppercase tracking-widest">Live Integration</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <span className="text-[10px] text-neutral-600 uppercase tracking-widest block">Active Creator Node</span>
                       <span className="text-lg text-white font-mono tracking-tight">@VOID_SYNTAX</span>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[10px] text-neutral-600 uppercase tracking-widest block">Lifetime Extraction</span>
                       <span className="text-lg text-white font-mono tracking-tight">₹14,20,208.50 <span className="text-xs text-neutral-500">INR</span></span>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="relative flex justify-center">
               <motion.div 
                whileHover={{ y: -15, scale: 1.02 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative group w-full max-w-md"
              >
                <div className="aspect-[3/4] bg-neutral-900 border border-white/10 relative overflow-hidden group-hover:border-accent transition-colors duration-700 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1598033129183-c4f50c717658?q=80&w=2000&auto=format&fit=crop" 
                    alt="Co-Created Artifact" 
                    className="w-full h-full object-cover grayscale brightness-50 group-hover:brightness-90 scale-110 group-hover:scale-100 transition-all duration-1000"
                  />
                  
                  {/* Meta Overlay */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="px-5 py-2 bg-accent text-black text-[10px] font-bold uppercase tracking-[0.4em] skew-x-[-12deg] shadow-lg">
                        CO-CREATED
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/40 font-mono tracking-[0.3em] block mb-1">ID // ARTIFACT_99X</span>
                        <div className="w-12 h-[1px] bg-white/20 ml-auto" />
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <h4 className="text-5xl font-display font-bold text-white uppercase tracking-tighter leading-[0.8]">SIGNAL <br />FADE</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-[1px] bg-accent" />
                          <p className="text-[12px] text-accent font-bold uppercase tracking-[0.5em]">AUTH: @ALIAS_01</p>
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/10 flex justify-between items-center text-[10px] text-neutral-500 uppercase tracking-[0.3em]">
                        <span className="flex items-center gap-2.5">
                          <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                          182 DISTRIBUTIONS
                        </span>
                        <span className="text-white font-bold italic">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Creator Submission Interface */}
        <section className="mb-40">
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <h2 className="text-[11px] tracking-[0.5em] font-bold uppercase text-accent">Protocol: Artifact Submission</h2>
            </div>
            <h3 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-white">The Submission Interface</h3>
            <p className="text-neutral-500 text-sm mt-4 uppercase tracking-[0.2em] font-light italic">Only verified signals will proceed to activation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border border-white/5 bg-white/5">
            {[
              { title: "Declare Identity", desc: "Define your creator alias and technical background.", status: "REQUIRED" },
              { title: "Define Philosophy", desc: "Articulate the intent behind the artifact.", status: "REQUIRED" },
              { title: "Upload Artifact", desc: "Initial blueprint or high-fidelity renders.", status: "AWAITING SOURCE" }
            ].map((box, i) => (
              <div key={i} className="bg-black p-10 space-y-6 hover:bg-neutral-900/40 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[1px] h-0 bg-accent group-hover:h-full transition-all duration-700" />
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-neutral-700">0{i + 1}</span>
                  <span className="text-[9px] font-bold text-accent/40 group-hover:text-accent font-mono tracking-widest">{box.status}</span>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-bold uppercase tracking-widest text-white group-hover:text-accent transition-colors">{box.title}</h4>
                  <p className="text-neutral-500 text-sm leading-relaxed lowercase">{box.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-1 flex justify-center">
            <SubmissionProtocolTransition />
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
                <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">Low-effort submissions filtered</span>
             </div>
             <div className="w-1 h-1 bg-neutral-800 rounded-full" />
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
                <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">Encrypted Handshake Required</span>
             </div>
          </div>
        </section>

        {/* Final Hook / Waitlist */}
        <section className="text-center py-24 pb-60">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <div className="inline-block p-6 border border-accent/20 bg-accent/5 rounded-full mb-10 shadow-[0_0_40px_rgba(212,175,55,0.05)] text-accent">
                  <Fingerprint size={48} strokeWidth={1} />
                </div>
                <h2 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter text-white mb-8">Unlock Creator Mode</h2>
                <div className="space-y-2 mb-16">
                  <p className="text-neutral-500 uppercase text-[12px] tracking-[0.6em] font-bold">Phase 01 access is strictly limited</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-64 h-[1px] bg-white/5" />
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="email" 
                      required
                      placeholder="ENTER PROTOCOL EMAIL" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 px-8 py-5 text-white rounded-sm outline-none focus:border-accent transition-colors text-[12px] tracking-[0.3em] uppercase placeholder:text-neutral-700"
                    />
                    <button 
                      type="submit"
                      className="px-12 py-5 bg-accent text-black font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                      Transmit
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-[0.4em] italic font-light">Secure your unique position in the co-creation network</p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
              >
                <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_80px_rgba(212,175,55,0.3)]">
                  <Send className="text-black" size={48} />
                </div>
                <div className="space-y-6">
                  <h2 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter text-white uppercase italic leading-none">Signal Received</h2>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-[1px] bg-accent/30" />
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                      <span className="text-[13px] text-accent font-bold uppercase tracking-[0.8em]">Sector 04 // Priority Secured</span>
                    </div>
                    <div className="w-12 h-[1px] bg-accent/30" />
                  </div>
                </div>
                <p className="text-neutral-500 font-light max-w-xl mx-auto text-xl leading-relaxed normal-case px-6">
                  Your identity has been queued for recursive verification. An encrypted signal will be dispatched once the co-creation system initializes for your sector.
                </p>
                <div className="pt-12 border-t border-white/5 max-w-md mx-auto space-y-2">
                   <p className="text-[10px] text-neutral-600 uppercase tracking-[0.5em] font-mono leading-relaxed">
                     Monitoring node:
                   </p>
                   <p className="text-white text-xs font-mono uppercase tracking-widest">chils_and_co.internal.alpha_node_01</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>
    </div>
  );
};

export default CoCreator;
