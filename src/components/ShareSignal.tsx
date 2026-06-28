import React, { useState } from 'react';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Copy, 
  Share2, 
  Check
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
      icon: (
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="currentColor"
        >
          <path d="M20.1 3.9C17.9 1.7 15 .5 12 .5 5.8.5.7 5.6.7 11.9c0 2 .5 3.9 1.5 5.6L.6 23.5l6.3-1.6c1.6.9 3.5 1.4 5.4 1.4 6.3 0 11.4-5.1 11.4-11.4-.1-2.8-1.2-5.7-3.6-8zM12 21.4c-1.7 0-3.4-.5-4.8-1.3l-.4-.2-3.5.9 1-3.4-.3-.4c-1.8-2.6-1.8-5.7 0-8.3 1.6-2.2 4.1-3.4 6.8-3.4 1.8 0 3.5.7 4.8 2 1.3 1.3 2 3 2 4.8 0 3.8-3.1 6.9-6.9 6.9zm3.8-5.1c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.2.2-.7.9-.9 1.1-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.2-1.3-.8-.7-1.4-1.6-1.6-1.8-.2-.2 0-.3.1-.5.1-.1.3-.4.4-.6.1-.2.1-.4 0-.5s-.5-1.2-.7-1.6c-.2-.4-.4-.3-.5-.3h-.4s-.4.1-.7.4c-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.2-.7 1.3-1.4.1-.7.1-1.2.1-1.3-.1-.2-.3-.3-.5-.4z" />
        </svg>
      ),
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
