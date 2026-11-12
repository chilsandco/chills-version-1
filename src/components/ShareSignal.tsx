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
      setCopyFeedback(type === 'link' ? 'Link copied' : 'Caption copied');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: (
        <img 
          src="/whatsapp.png" 
          alt="WhatsApp" 
          className="w-[18px] h-[18px] object-contain brightness-90 hover:brightness-100 transition-all" 
        />
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
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-ink border border-ink/15 rounded-full hover:border-ink transition-colors group cursor-pointer"
        >
          <Share2 size={14} className="group-hover:scale-110 transition-transform" />
          Share
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 bottom-full mb-2 z-30 w-[300px] max-w-[calc(100vw-2rem)] bg-[#fff] text-ink rounded-2xl p-5 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Share</h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-sm text-neutral-500 hover:text-ink transition-colors"
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
                className="text-neutral-500 hover:text-ink hover:scale-110 transition-all"
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
                className="flex items-center justify-center gap-2 py-2.5 border border-[#e3e0d8] rounded-full text-[13px] font-medium hover:bg-ink hover:text-[#fff] hover:border-ink transition-colors"
              >
                <Copy size={12} />
                Copy link
              </button>
              <button
                onClick={() => copyToClipboard(caption, 'caption')}
                className="flex items-center justify-center gap-2 py-2.5 border border-[#e3e0d8] rounded-full text-[13px] font-medium hover:bg-ink hover:text-[#fff] hover:border-ink transition-colors"
              >
                <div className="w-3 h-3 flex items-center justify-center">#</div>
                Copy caption
              </button>
            </div>
            
            <p className="text-xs text-neutral-500 text-center">
              Paste it on Instagram, Threads or Snapchat
            </p>
          </div>

          {/* Feedback Toast */}
          <AnimatePresence>
            {copyFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-[#2f5130] text-xs"
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
