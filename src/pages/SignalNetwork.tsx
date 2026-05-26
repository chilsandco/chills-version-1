// src/pages/SignalNetwork.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, MessageSquare, Facebook, Youtube, Music, Compass, Mail, Volume2, VolumeX } from 'lucide-react';
import SEO from '../components/SEO';

// ----- Simple social node definitions -----
interface SocialNode {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  link: string;
}

const socialNodes: SocialNode[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, link: 'https://instagram.com/chilsandco' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, link: 'https://twitter.com/chilsandco' },
  { id: 'discord', name: 'Discord', icon: MessageSquare, link: 'https://discord.gg/chils' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, link: 'https://facebook.com/chilsandco' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, link: 'https://youtube.com/@chilsandco' },
  { id: 'spotify', name: 'Spotify', icon: Music, link: 'https://spotify.com' },
  { id: 'pinterest', name: 'Pinterest', icon: Compass, link: 'https://pinterest.com/chilsandco' },
  { id: 'email', name: 'Email', icon: Mail, link: 'mailto:hello.chilsandco@gmail.com' },
  { id: 'threads', name: 'Threads', icon: MessageSquare, link: 'https://www.threads.net/@chilsandco' }
];

const SocialVault: React.FC = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const humOscRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // ----- Ambient hum (55Hz) -----
  const startAmbientHum = () => {
    if (audioCtxRef.current) return; // already running
    const AudioClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioClass) return;
    const ctx = new AudioClass();
    audioCtxRef.current = ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, ctx.currentTime);
    gain.gain.setValueAtTime(0.006, ctx.currentTime);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    humOscRef.current = osc;
    humGainRef.current = gain;
    filterNodeRef.current = filter;
  };

  const stopAmbientHum = () => {
    humOscRef.current?.stop();
    humOscRef.current?.disconnect();
    humGainRef.current?.disconnect();
    filterNodeRef.current?.disconnect();
    humOscRef.current = null;
    humGainRef.current = null;
    filterNodeRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  };

  useEffect(() => {
    audioEnabled ? startAmbientHum() : stopAmbientHum();
    return () => stopAmbientHum();
  }, [audioEnabled]);

  // ----- 3D wireframe globe (canvas) -----
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = (canvas.width = 400);
    let height = (canvas.height = 400);
    const points: { x: number; y: number; z: number; px: number; py: number; size: number }[] = [];
    const radius = 130;
    for (let i = 0; i < 60; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        px: 0,
        py: 0,
        size: Math.random() * 1.5 + 0.5
      });
    }
    let angleY = 0.003;
    let angleX = 0.0015;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const fov = 350;
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);
      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      points.forEach(p => {
        // Y rotation
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;
        // X rotation
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;
        p.x = x1; p.y = y2; p.z = z2;
        const scale = fov / (fov + z2);
        p.px = cx + p.x * scale;
        p.py = cy + p.y * scale;
      });
      // background grid lines
      ctx.strokeStyle = 'rgba(217, 246, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }
      // draw points
      points.forEach(p => {
        const alpha = Math.max(0.1, (radius - p.z) / (radius * 2));
        ctx.fillStyle = `rgba(217, 246, 255, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      angleY += 0.003; angleX += 0.0015;
      requestAnimationFrame(render);
    };
    render();
  }, []);

  // ----- Neural connection overlay (canvas) -----
  useEffect(() => {
    const canvas = networkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      targetNode: Math.random() > 0.8
    }));
    const mouse = { x: -1000, y: -1000 };
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouse);
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      // grid background
      ctx.strokeStyle = 'rgba(255,255,255,0.01)';
      ctx.lineWidth = 0.5;
      const step = 40;
      for (let x = 0; x < width; x += step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
      for (let y = 0; y < height; y += step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }
      // particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.fillStyle = p.targetNode ? 'rgba(217,246,255,0.35)' : 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.targetNode ? 2 : 1, 0, Math.PI*2); ctx.fill();
        // connect nearby particles
        particles.forEach(p2 => {
          if (p === p2) return;
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(217,246,255,${(100-dist)/100 * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        });
        // connect to mouse
        if (mouse.x > 0 && mouse.y > 0) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200) {
            ctx.strokeStyle = `rgba(217,246,255,${(200-dist)/200 * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
            p.x -= dx * 0.008; p.y -= dy * 0.008;
          }
        }
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // ----- Easter Egg: type CHILS to reveal hidden overlay -----
  const [secret, setSecret] = useState(false);
  const [buffer, setBuffer] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z0-9]$/.test(key)) {
        setBuffer(prev => {
          const next = (prev + key).slice(-5);
          if (next.includes('CHILS')) {
            setSecret(true);
            return '';
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCardClick = (node: SocialNode) => {
    window.open(node.link, '_blank');
  };

  return (
    <div className="relative bg-[#000] text-[#F5F5F5] min-h-screen font-mono overflow-x-hidden">
      <SEO title="Social Vault" description="Explore Chils & Co. social channels in a sleek cyber‑minimal interface." />
      {/* Ambient particle canvas */}
      <canvas ref={networkCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top‑right audio toggle */}
      <button
        onClick={() => setAudioEnabled(!audioEnabled)}
        className={`fixed top-4 right-4 z-10 px-3 py-1 text-xs border ${audioEnabled ? 'border-[#D9F6FF] text-[#D9F6FF]' : 'border-white/10 text-[#7E7E7E]'} bg-black/30 backdrop-blur-sm rounded`}
      >
        {audioEnabled ? <><Volume2 size={12} /> AUDIO: ON</> : <><VolumeX size={12} /> AUDIO: OFF</>}
      </button>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 md:px-12 text-center z-10">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-[#D4AF37] tracking-wider mb-4"
        >
          SOCIAL VAULT
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm md:text-base text-[#7E7E7E] max-w-2xl"
        >
          Connect with Chils &amp; Co. across Instagram, Twitter, Discord, Facebook, YouTube, Spotify, Pinterest, Threads, and direct email. Hover to explore, click to visit.
        </motion.p>
        {/* Globe canvas */}
        <canvas ref={mapCanvasRef} className="mt-8 w-80 h-80 md:w-[400px] md:h-[400px]" />
      </section>

      {/* Social Nodes Grid */}
      <section className="relative py-12 px-4 md:px-12 z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {socialNodes.map(node => (
            <div
              key={node.id}
              data-node-card="true"
              onClick={() => handleCardClick(node)}
              className="cursor-pointer p-4 border border-white/5 rounded hover:border-[#D9F6FF] transition-all duration-300 hover:scale-105 bg-[#0A0A0A] text-center group"
            >
              <node.icon size={24} className="mx-auto mb-2 text-[#D9F6FF] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              <span className="block text-sm font-medium text-[#F5F5F5]">{node.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Easter Egg Overlay */}
      {secret && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-[#0A0A0A] border border-[#D9F6FF] p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4 text-[#D9F6FF]">ACCESS GRANTED</h2>
            <p className="text-[#F5F5F5]">Discount Code: <strong>ARCHITECT_20</strong></p>
            <button
              onClick={() => setSecret(false)}
              className="mt-4 px-4 py-2 bg-[#D9F6FF]/10 border border-[#D9F6FF] text-[#D9F6FF] rounded"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialVault;
