import React, { useState } from 'react';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Copy, 
  Share2, 
  Check,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareSignalProps {
  productName: string;
  productUrl: string;
  productImage?: string;
  isOrderSuccess?: boolean;
}

const ShareSignal: React.FC<ShareSignalProps> = ({ productName, productUrl, productImage, isOrderSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const brandLine = "Not made for seasons. Made for reasons. — Chils & Co";
  const fullMessage = `${brandLine}\n\n${productUrl}`;
  const caption = `${brandLine}\n\n#ChilsAndCo #SignalTee`;

  const copyToClipboard = async (text: string, type: 'link' | 'caption') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(type === 'link' ? 'Link Copied ✓' : 'Caption Copied ✓');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: <Smartphone size={18} strokeWidth={1.5} />,
      url: `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
    },
    {
      name: 'X',
      icon: <Twitter size={18} strokeWidth={1.5} />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(brandLine)}&url=${encodeURIComponent(productUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={18} strokeWidth={1.5} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook size={18} strokeWidth={1.5} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    },
  ];

  return (
    <div className="w-full">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-3 py-4 text-[11px] tracking-[0.3em] font-bold uppercase text-neutral-400 border border-neutral-900 hover:border-neutral-700 hover:text-white transition-all group"
        >
          <Share2 size={14} className="group-hover:scale-110 transition-transform" />
          {isOrderSuccess ? 'Share Your Signal' : 'Share Your Signal'}
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-neutral-900 bg-neutral-950/50 p-6 space-y-6"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] tracking-[0.4em] font-bold uppercase text-accent">Transmit Signal</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] tracking-[0.2em] uppercase text-neutral-600 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>

          {/* Direct Share Icons */}
          <div className="flex justify-center gap-6">
            {platforms.map(platform => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white hover:scale-110 transition-all"
                title={`Share on ${platform.name}`}
              >
                {platform.icon}
              </a>
            ))}
          </div>

          {/* Copy Actions */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => copyToClipboard(fullMessage, 'link')}
                className="flex items-center justify-center gap-2 py-3 border border-neutral-800 text-[9px] tracking-[0.2em] uppercase font-bold hover:bg-white hover:text-black transition-all"
              >
                <Copy size={12} />
                Copy Link
              </button>
              <button
                onClick={() => copyToClipboard(caption, 'caption')}
                className="flex items-center justify-center gap-2 py-3 border border-neutral-800 text-[9px] tracking-[0.2em] uppercase font-bold hover:bg-white hover:text-black transition-all"
              >
                <div className="w-3 h-3 flex items-center justify-center">#</div>
                Copy Caption
              </button>
            </div>
            
            <p className="text-[9px] text-neutral-600 text-center uppercase tracking-widest">
              Paste this on Instagram / Threads / Snapchat
            </p>
          </div>

          {/* Feedback Toast */}
          <AnimatePresence>
            {copyFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-accent text-[9px] font-bold uppercase tracking-[0.2em]"
              >
                <Check size={10} />
                {copyFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default ShareSignal;
