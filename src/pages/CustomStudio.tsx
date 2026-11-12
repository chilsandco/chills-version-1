import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Sparkles, HelpCircle, ChevronDown, Upload, Eye, Layers, ChevronLeft } from 'lucide-react';
import SEO from '../components/SEO';
import { btnInk, btnLine } from '../components/OrderUi';

interface CustomProduct {
  id: string;
  name: string;
  images: string[];
  tagline: string;
  category: string;
  basePrice: number;
  bulkStartPrice: number;
  specs: string[];
  colors: { name: string; hex: string }[];
  placements: { name: string; coord: string; desc: string }[];
}

const CUSTOM_PRODUCTS: CustomProduct[] = [
  {
    id: 'tshirt',
    name: 'T-Shirts',
    category: 'Apparel',
    tagline: 'Front, back & sleeve prints',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781952420/ChatGPT_Image_Apr_19_2026_01_02_46_PM_1_cwxgof.png',
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781952421/ChatGPT_Image_Apr_19_2026_01_00_15_PM_1_ysa1ie.png'
    ],
    basePrice: 799,
    bulkStartPrice: 399,
    specs: ['100% Premium Cotton', '220 GSM Heavyweight Jersey', 'Boxy Streetwear Fit', 'Double-Needle Stitched'],
    colors: [
      { name: 'Matte Black', hex: '#0a0a0a' },
      { name: 'Off White', hex: '#f7f7f7' },
      { name: 'Charcoal Grey', hex: '#2b2b2b' },
      { name: 'Classic Navy', hex: '#16222f' }
    ],
    placements: [
      { name: 'Chest Center', coord: 'X: 0.00 / Y: 12.00', desc: 'Standard central placement' },
      { name: 'Left Chest', coord: 'X: -14.50 / Y: 15.00', desc: 'Minimalist branding run' },
      { name: 'Large Back Print', coord: 'X: 0.00 / Y: -8.00', desc: 'Streetwear graphic zone' },
      { name: 'Sleeve Panel', coord: 'X: 28.00 / Y: 10.00', desc: 'Subtle sleeve coordinates' }
    ]
  },
  {
    id: 'hoodie',
    name: 'Hoodies',
    category: 'Apparel',
    tagline: 'Premium oversized customization',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781951761/ChatGPT_Image_Jun_20_2026_04_04_35_PM_hscckf.png',
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781951762/ChatGPT_Image_Jun_20_2026_04_03_02_PM_p2gssc.png'
    ],
    basePrice: 1799,
    bulkStartPrice: 999,
    specs: ['Premium Cotton Fleece', '400 GSM Heavyweight Fabric', 'Drop Shoulder Fit', 'Double-Lined Hood'],
    colors: [
      { name: 'Matte Black', hex: '#0a0a0a' },
      { name: 'Off White', hex: '#f7f7f7' },
      { name: 'Charcoal Grey', hex: '#2b2b2b' },
      { name: 'Desert Sand', hex: '#c5b59b' }
    ],
    placements: [
      { name: 'Chest Center', coord: 'X: 0.00 / Y: 10.00', desc: 'Standard central placement' },
      { name: 'Large Back Print', coord: 'X: 0.00 / Y: -5.00', desc: 'Streetwear graphic zone' },
      { name: 'Sleeve Run', coord: 'X: -32.00 / Y: -8.00', desc: 'Full length sleeve text' },
      { name: 'Hood Crest', coord: 'X: 0.00 / Y: 38.00', desc: 'Minimalist logo overlay' }
    ]
  },
  {
    id: 'cap',
    name: 'Caps',
    category: 'Apparel',
    tagline: 'Minimal branding and logos',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781931355/ChatGPT_Image_Jun_20_2026_10_16_21_AM_xfwieh.png'
    ],
    basePrice: 499,
    bulkStartPrice: 249,
    specs: ['Structured 6-Panel Snapback', 'Premium Cotton Twill', 'Adjustable Brass Buckle', 'Breathable Eyelets'],
    colors: [
      { name: 'Matte Black', hex: '#0a0a0a' },
      { name: 'Off White', hex: '#f7f7f7' },
      { name: 'Navy Blue', hex: '#111b24' }
    ],
    placements: [
      { name: 'Front Embroidery', coord: 'X: 0.00 / Y: 8.00', desc: 'High-density puff stitch zone' },
      { name: 'Side Logo', coord: 'X: 20.00 / Y: -2.00', desc: 'Subtle corporate insignia' },
      { name: 'Back Strap Arch', coord: 'X: 0.00 / Y: -18.00', desc: 'Curve above adjustable clasp' }
    ]
  },
  {
    id: 'bottle',
    name: 'Glass Bottles',
    category: 'Drinkware',
    tagline: 'Premium UV and vinyl customization',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781931355/ChatGPT_Image_Jun_20_2026_10_06_44_AM_ubpxub.png',
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781931356/ChatGPT_Image_Jun_20_2026_10_03_50_AM_mgp5w3.png'
    ],
    basePrice: 799,
    bulkStartPrice: 399,
    specs: ['Food-Grade Heat Resistant Glass', 'Protective Anti-slip Sleeve', 'Eco-friendly Bamboo Cap', 'Leak-proof Design'],
    colors: [
      { name: 'Matte Black', hex: '#0a0a0a' },
      { name: 'Transparent Clear', hex: 'rgba(200,200,200,0.3)' },
      { name: 'Amber Smoked', hex: '#634c3e' }
    ],
    placements: [
      { name: 'Vertical Silhouette', coord: 'X: 0.00 / Y: -4.00', desc: 'Tall vertical screenprint' },
      { name: 'Lower Base Stamp', coord: 'X: 0.00 / Y: -15.00', desc: 'Laser engraved base emblem' },
      { name: 'Lid Engrave', coord: 'X: 0.00 / Y: 28.00', desc: 'Laser etched bamboo cap' }
    ]
  },
  {
    id: 'tumbler',
    name: 'Tumblers',
    category: 'Drinkware',
    tagline: 'Insulated travel containers',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781931355/ChatGPT_Image_Jun_20_2026_10_20_34_AM_ltvf60.png'
    ],
    basePrice: 699,
    bulkStartPrice: 349,
    specs: ['Food-Grade Stainless Steel', 'Double-wall Vacuum Insulated', '450ml Capacity', 'Splash-Resistant Slider Lid'],
    colors: [
      { name: 'Matte Black', hex: '#0a0a0a' },
      { name: 'Brushed Silver', hex: '#a1a1a1' },
      { name: 'Pure White', hex: '#f5f5f5' }
    ],
    placements: [
      { name: 'Center Stamp', coord: 'X: 0.00 / Y: 5.00', desc: 'Centered placement' },
      { name: 'Lower Rim Print', coord: 'X: 0.00 / Y: -12.00', desc: 'Lower rim branding strip' },
      { name: 'Custom Engraving', coord: 'X: 0.00 / Y: 0.00', desc: 'Laser carved metal detail' }
    ]
  },
  {
    id: 'mug',
    name: 'Coffee Mugs',
    category: 'Drinkware',
    tagline: 'High-quality print finishes',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781931356/ChatGPT_Image_Jun_20_2026_10_19_08_AM_gcwahf.png'
    ],
    basePrice: 399,
    bulkStartPrice: 199,
    specs: ['Premium Ceramic Grade', 'Matte Velvet Outer Glaze', '330ml Capacity', 'Microwave & Dishwasher Safe'],
    colors: [
      { name: 'Matte Black', hex: '#0a0a0a' },
      { name: 'Pure White', hex: '#f5f5f5' },
      { name: 'Olive Green', hex: '#3d4a3e' }
    ],
    placements: [
      { name: 'Front Portrait', coord: 'X: -8.00 / Y: 0.00', desc: 'Facing right-handed drinkers' },
      { name: 'Wrap Around', coord: 'X: 0.00 / Y: 0.00', desc: 'Continuous wide graphic wrap' },
      { name: 'Double-Sided', coord: 'X: 18.00 / Y: 0.00', desc: 'Identical prints on both faces' }
    ]
  },
  {
    id: 'pouch',
    name: 'Mobile Pouches & Stickers',
    category: 'Stickers',
    tagline: 'Personalized phone cases and accessories.',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781937543/ChatGPT_Image_Jun_20_2026_12_08_09_PM_cqrxdc.png'
    ],
    basePrice: 249,
    bulkStartPrice: 99,
    specs: ['Premium Silicon/PC Build', 'Full-surface UV Print', 'Shock-absorbent structure', 'Gloss or Matte finish option'],
    colors: [
      { name: 'Matte Black', hex: '#0a0a0a' },
      { name: 'Frost Clear', hex: 'rgba(200,200,200,0.3)' }
    ],
    placements: [
      { name: 'Back Wrap Graphic', coord: 'SIZE: Phone Template', desc: 'Full print coverage across case body' },
      { name: 'Center Logo', coord: 'SIZE: 2" x 2"', desc: 'Clean centered logo block' }
    ]
  },
  {
    id: 'sticker',
    name: 'Laptop Stickers',
    category: 'Stickers',
    tagline: 'Precision contour-cut stickers',
    images: [
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781938018/ChatGPT_Image_Jun_20_2026_12_15_26_PM_oue9rm.png',
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781938019/ChatGPT_Image_Jun_20_2026_12_16_28_PM_dui2qz.png'
    ],
    basePrice: 99,
    bulkStartPrice: 29,
    specs: ['Premium Thick Vinyl', 'UV Protection Matte Laminate', '100% Water Resistant', 'Zero-Residue Adhesive'],
    colors: [
      { name: 'Custom CMYK', hex: '#d4af37' },
      { name: 'Holographic', hex: '#9d4edd' },
      { name: 'Die-Cut Clear', hex: 'rgba(200,200,200,0.2)' }
    ],
    placements: [
      { name: 'Standard Die-Cut', coord: 'SIZE: 3" × 3"', desc: 'Precision contour-cut edge' },
      { name: 'Mini Sheet', coord: 'SIZE: 6" × 4"', desc: 'Grid of 6 mini die-cut stickers' },
      { name: 'Device Skin', coord: 'SIZE: Custom fit', desc: 'Tailored exactly to template' }
    ]
  }
];

const FAQS = [
  { q: 'What design file formats do you accept?', a: 'Vector files (SVG, AI, PDF) give the sharpest print results. High-resolution transparent PNG or PSD files are also accepted. If your file is low-res, our team will flag it before production starts.' },
  { q: 'How long does production take?', a: 'Single runs are processed and shipped in 3–5 business days. Bulk orders (10+ pieces) take 7–14 days depending on print complexity and volume.' },
  { q: 'Can I see a sample before bulk production?', a: 'Yes. For 50+ unit commitments, we can print a single pre-production prototype for your approval before kicking off the full run.' },
  { q: 'What is your exchange policy on custom orders?', a: 'Custom items are made to your specification, so standard exchanges don\'t apply. However, any printing defect or structural garment issue is replaced immediately under our Fit Guarantee.' }
];

const SectionHead: React.FC<{ eyebrow: string; title: string; sub?: string }> = ({ eyebrow, title, sub }) => (
  <div className="mb-6 md:mb-8 max-w-xl">
    <p className="eyebrow text-neutral-500 mb-2">{eyebrow}</p>
    <h2 className="text-[28px] md:text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]">{title}</h2>
    {sub && <p className="mt-2 text-neutral-600 md:text-lg">{sub}</p>}
  </div>
);

const choice = (on: boolean) =>
  `rounded-xl border transition-colors cursor-pointer ${on ? 'border-ink bg-ink text-[#fff]' : 'border-[#e3e0d8] bg-[#fff] hover:border-ink/40'}`;

const field = 'w-full rounded-xl border border-[#e3e0d8] bg-[#fff] px-4 py-3 text-[15px] outline-none focus:border-ink placeholder:text-neutral-400';

type Step = 1 | 2 | 3;

const CustomStudio: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<CustomProduct>(CUSTOM_PRODUCTS[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'mockup' | 'blueprint'>('mockup');

  // Step-based form state
  const [step, setStep] = useState<Step>(1);
  const [selectedColor, setSelectedColor] = useState(CUSTOM_PRODUCTS[0].colors[0].name);
  const [selectedPlacement, setSelectedPlacement] = useState(CUSTOM_PRODUCTS[0].placements[0]);
  const [quantity, setQuantity] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designDescription, setDesignDescription] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const configuratorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedColor(selectedProduct.colors[0].name);
    setSelectedPlacement(selectedProduct.placements[0]);
    setActiveImageIndex(0);
  }, [selectedProduct]);

  const isBulk = quantity >= 10;

  const getUnitPrice = () => {
    if (isBulk) {
      if (quantity >= 50) return Math.round(selectedProduct.bulkStartPrice * 0.85);
      if (quantity >= 25) return Math.round(selectedProduct.bulkStartPrice * 0.92);
      return selectedProduct.bulkStartPrice;
    }
    return selectedProduct.basePrice;
  };

  const getEstimatedTotal = () => {
    if (quantity >= 25) return 'Custom Quote';
    return `₹${(getUnitPrice() * quantity).toLocaleString('en-IN')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setFileBase64(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToConfigurator = () => {
    configuratorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProductSelect = (prod: CustomProduct) => {
    setSelectedProduct(prod);
    setStep(1);
    setQuoteSuccess(false);
    setQuoteError('');
    scrollToConfigurator();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setQuoteError('Please fill in your name, email, and phone number.');
      return;
    }
    setIsSubmitting(true);
    setQuoteError('');
    try {
      const response = await fetch('/api/custom/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone,
          productType: selectedProduct.name,
          quantity,
          designFile: fileBase64,
          additionalNotes: `Color: ${selectedColor} | Placement: ${selectedPlacement.name} | Note: ${designDescription}`
        })
      });
      const resData = await response.json();
      if (response.ok) {
        setQuoteSuccess(true);
        setIsSubmitting(false);
        const whatsappNumber = '917842070404';
        const fileUrl = resData.quote?.designFile ? `\n• *Uploaded File:* https://chilsandco.com${resData.quote.designFile}` : '';
        const text = `Hey CHILS & CO., I submitted a Custom Studio request!\n\n⚡ *Specs*\n• *Name:* ${name}\n• *Product:* ${selectedProduct.name}\n• *Quantity:* ${quantity} pcs\n• *Color:* ${selectedColor}\n• *Placement:* ${selectedPlacement.name} (${selectedPlacement.coord})${fileUrl}\n• *Price Estimate:* Requesting Quote\n\n📝 *Brief:*\n"${designDescription || 'Will share on chat'}"\n\nCan we finalize the blueprint and get a quote?`;
        setTimeout(() => {
          window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
        }, 1500);
      } else {
        setQuoteError(resData.message || 'Failed to submit. Please try again.');
        setIsSubmitting(false);
      }
    } catch {
      setQuoteError('Connection error. Redirecting to WhatsApp...');
      setIsSubmitting(false);
      const wa = '917842070404';
      const text = `Hey CHILS & CO., custom quote request:\n• Product: ${selectedProduct.name}\n• Qty: ${quantity}\n• Color: ${selectedColor}\n• Placement: ${selectedPlacement.name}\n• Brief: ${designDescription}`;
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const renderBlueprintSchematic = () => {
    const pId = selectedProduct.id;
    const activePlacement = selectedPlacement.name;
    switch (pId) {
      case 'tshirt':
      case 'hoodie':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-neutral-400 stroke-current fill-none stroke-[0.8]">
            <path d="M20,25 C25,23 35,22 50,25 C65,22 75,23 80,25 L88,38 L78,44 L76,38 L76,82 L24,82 L24,38 L22,44 L12,38 Z" />
            <path d="M38,23.5 C42,27 58,27 62,23.5" />
            {activePlacement.includes('Chest Center') && <rect x="38" y="32" width="24" height="14" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Left Chest') && <rect x="34" y="32" width="8" height="8" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Back') && <rect x="28" y="38" width="44" height="38" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Sleeve') && <path d="M12,38 L22,44 L17,41 Z" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Hood') && <path d="M35,22 C35,10 65,10 65,22 Z" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'mug':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-neutral-400 stroke-current fill-none stroke-[0.8]">
            <rect x="25" y="25" width="40" height="50" rx="3" />
            <path d="M65,35 C78,35 78,65 65,65" />
            {activePlacement.includes('Front') && <rect x="29" y="32" width="16" height="36" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Wrap') && <rect x="25" y="32" width="40" height="36" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Double') && <><rect x="28" y="32" width="12" height="36" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" /><rect x="48" y="32" width="12" height="36" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" /></>}
          </svg>
        );
      case 'cap':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-neutral-400 stroke-current fill-none stroke-[0.8]">
            <path d="M15,62 C15,20 85,20 85,62 Z" />
            <path d="M10,63 C20,78 80,78 90,63 L80,62 C70,72 30,72 20,62 Z" />
            {activePlacement.includes('Front') && <ellipse cx="50" cy="42" rx="14" ry="10" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Side') && <ellipse cx="26" cy="48" rx="8" ry="6" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Back') && <rect x="42" y="55" width="16" height="6" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'bottle':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-neutral-400 stroke-current fill-none stroke-[0.8]">
            <path d="M38,20 L62,20 L62,28 L58,35 L58,82 L42,82 L42,35 L38,28 Z" />
            <rect x="45" y="14" width="10" height="6" />
            {activePlacement.includes('Vertical') && <rect x="46" y="38" width="8" height="36" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Lower') && <rect x="44" y="66" width="12" height="12" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Lid') && <rect x="45" y="14" width="10" height="6" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'pouch':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-neutral-400 stroke-current fill-none stroke-[0.8]">
            <rect x="32" y="15" width="36" height="70" rx="8" />
            <rect x="36" y="19" width="10" height="10" rx="2" />
            <circle cx="41" cy="24" r="2" />
            {activePlacement.includes('Back Wrap') && <rect x="32" y="15" width="36" height="70" rx="8" className="fill-ink/15 stroke-ink stroke-[1] stroke-dasharray-[2] animate-pulse" />}
            {activePlacement.includes('Center Logo') && <rect x="42" y="42" width="16" height="16" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'sticker':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-neutral-400 stroke-current fill-none stroke-[0.8]">
            <rect x="25" y="25" width="50" height="50" rx="6" strokeDasharray="3 3" />
            <path d="M30,35 C35,32 50,45 60,35 C70,25 70,55 60,65 C50,75 35,62 30,65 Z" className="fill-ink/10 stroke-ink stroke-[1]" />
            {activePlacement.includes('Standard') && <circle cx="50" cy="50" r="16" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />}
            {activePlacement.includes('Mini') && (
              <>
                <circle cx="38" cy="38" r="8" className="fill-ink/20 stroke-ink" />
                <circle cx="62" cy="38" r="8" className="fill-ink/20 stroke-ink" />
                <circle cx="38" cy="62" r="8" className="fill-ink/20 stroke-ink" />
                <circle cx="62" cy="62" r="8" className="fill-ink/20 stroke-ink" />
              </>
            )}
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-neutral-400 stroke-current fill-none stroke-[0.8]">
            <rect x="30" y="20" width="40" height="60" rx="4" />
            <rect x="38" y="35" width="24" height="30" className="fill-ink/15 stroke-ink stroke-[1] animate-pulse" />
          </svg>
        );
    }
  };

  const stepLabels = ['Choose', 'Design', 'Send'];

  return (
    <div className="bg-paper text-ink min-h-screen pt-24 md:pt-32 pb-24 font-sans">
      <SEO
        title="Custom Studio | CHILS & CO."
        description="Custom tees, hoodies, drinkware, caps and stickers for teams, events and gifts. Upload your design or describe your idea, and get a quote on WhatsApp."
        keywords="custom tshirts, custom hoodies, custom mugs, bespoke gifting Miyapur, custom caps, custom bottles Hyderabad"
      />


      <div className="max-w-[1600px] mx-auto px-5 md:px-10">

        {/* ─── HERO ─── */}
        <section className="pt-2 pb-10 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <p className="eyebrow text-neutral-500 mb-3">Custom Studio</p>
              <h1 className="text-[38px] md:text-[64px] leading-[1.02] font-semibold tracking-[-0.035em]">Custom pieces for your team, event or gift.</h1>
              <p className="mt-4 text-neutral-600 md:text-lg max-w-lg">
                From one personalised gift to hundreds of pieces for your startup, event, wedding or community. Tees, hoodies, drinkware, caps and stickers.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={scrollToConfigurator} className="btn-primary items-center gap-2 px-6 py-3.5 text-sm cursor-pointer">
                  Start designing <ArrowRight size={15} />
                </button>
                <a href="https://wa.me/917842070404" target="_blank" rel="noopener noreferrer" className="btn-secondary items-center gap-2 px-6 py-3.5 text-sm">
                  WhatsApp us
                </a>
              </div>
            </div>
            <ol className="lg:col-span-6 grid gap-2">
              {[
                { title: 'You send the design', sub: 'Upload SVG, PNG or AI files, or just describe your idea.' },
                { title: 'We show you a mockup', sub: 'See where it sits and how the colours look before anything is printed.' },
                { title: 'We print and ship', sub: 'Packed in our reusable box and dispatched in 3–5 days.' },
              ].map((s, i) => (
                <li key={s.title} className="bg-[#fff] rounded-2xl flex gap-4 items-start p-5">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-ink text-[#fff] text-sm font-medium flex items-center justify-center">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-neutral-600 mt-1">{s.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── OCCASIONS ─── */}
        <section className="py-10 md:py-16">
          <SectionHead eyebrow="Made for" title="Every kind of occasion" sub="Custom pieces for your team, your company, your event or someone special." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { emoji: '🎂', title: 'Birthdays', desc: 'Personalised gifts, custom tees, mugs and bottles.' },
              { emoji: '💍', title: 'Weddings & anniversaries', desc: 'Bride and groom squad tees, family merch and keepsakes.' },
              { emoji: '🎵', title: 'Mehendi & sangeet', desc: 'Matching outfits, custom graphics and giveaways.' },
              { emoji: '🏢', title: 'Corporate gifting', desc: 'Bottles, mugs, apparel and merch for your team, clients and events.' },
              { emoji: '🎓', title: 'Clubs & communities', desc: 'College events, meetups and community merch.' },
              { emoji: '🎁', title: 'Personal gifts', desc: 'One-of-a-kind pieces designed for someone special.' },
            ].map((o) => (
              <div key={o.title} className="bg-[#fff] rounded-2xl p-5 flex items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-paper grid place-items-center text-xl shrink-0">{o.emoji}</span>
                <div>
                  <h3 className="font-semibold">{o.title}</h3>
                  <p className="text-[15px] text-neutral-600 mt-0.5 leading-relaxed">{o.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRODUCT GRID ─── */}
        <section className="py-10 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <SectionHead eyebrow="Products" title="Choose what to customise" />
            <button onClick={scrollToConfigurator} className="link-brass hidden md:inline-flex items-center gap-1.5 text-sm mb-8 cursor-pointer">Go to the builder <ArrowRight size={13} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {CUSTOM_PRODUCTS.map((prod) => {
              const on = selectedProduct.id === prod.id;
              return (
                <button key={prod.id} onClick={() => handleProductSelect(prod)}
                  className={`group text-left bg-[#fff] rounded-2xl overflow-hidden transition-shadow duration-300 cursor-pointer ${on ? 'ring-2 ring-ink' : 'hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,.35)]'}`}>
                  <div className="aspect-square w-full bg-bone relative overflow-hidden">
                    <img src={prod.images[0]} alt={prod.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute top-3 left-3 bg-[#fff]/90 px-2.5 py-1 rounded-full text-[11px] text-neutral-600">{prod.category}</span>
                    {on && <span className="absolute top-3 right-3 w-6 h-6 bg-ink text-[#fff] rounded-full grid place-items-center"><Check size={12} strokeWidth={3} /></span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold leading-snug">{prod.name}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{prod.tagline}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── DESIGN ASSISTANCE ─── */}
        <section className="py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            <div className="lg:col-span-5">
              <SectionHead eyebrow="Design help" title="Need help with the design?" sub="Print-ready files or a rough sketch, our design desk gets it ready for production." />
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-[#fff] rounded-2xl p-5 md:p-6">
                <span className="inline-block text-xs bg-[#e8efe6] text-[#2f5130] rounded-full px-2.5 py-1 mb-3">Adjustments included</span>
                <h3 className="font-semibold text-lg">Already have artwork?</h3>
                <p className="text-[15px] text-neutral-600 mt-1 leading-relaxed">Upload it and we’ll prepare it for print. Small fixes and print tuning are free.</p>
              </div>
              <div className="bg-[#fff] rounded-2xl p-5 md:p-6">
                <span className="inline-block text-xs bg-paper text-neutral-600 rounded-full px-2.5 py-1 mb-3">Custom design work</span>
                <h3 className="font-semibold text-lg">Need a design from scratch?</h3>
                <p className="text-[15px] text-neutral-600 mt-1 leading-relaxed">Our team can create one from your idea. Design charges may apply.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PROJECT BUILDER ─── */}
        <section ref={configuratorRef} className="py-10 md:py-16 scroll-mt-24">
          <SectionHead eyebrow="Builder" title="Build your request" sub="Three quick steps. We reply on WhatsApp with a mockup and a quote." />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
            {/* LEFT: product viewer */}
            <div className="lg:col-span-6 space-y-2 min-w-0">
              <div className="bg-[#fff] rounded-2xl p-3 md:p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="inline-flex bg-paper rounded-full p-1">
                    {([['mockup', 'Photo', Eye], ['blueprint', 'Placement', Layers]] as const).map(([k, l, I]) => (
                      <button key={k} type="button" onClick={() => setViewMode(k)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors cursor-pointer ${viewMode === k ? 'bg-ink text-[#fff]' : 'text-neutral-600 hover:text-ink'}`}>
                        <I size={13} /> {l}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-neutral-500 truncate">{selectedProduct.name}</span>
                </div>

                <div className="relative aspect-[4/3] w-full bg-bone rounded-xl overflow-hidden">
                  <AnimatePresence mode="wait">
                    {viewMode === 'mockup' ? (
                      <motion.img key={`mockup-${activeImageIndex}`} src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]} alt={selectedProduct.name}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        className="absolute inset-0 w-full h-full object-contain" />
                    ) : (
                      <motion.div key="blueprint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#f7f6f3]">
                        {renderBlueprintSchematic()}
                        <div className="absolute bottom-3 left-3 bg-[#fff] rounded-xl px-3 py-2 text-xs text-neutral-600 max-w-[200px]">
                          <p className="font-medium text-ink mb-1">Print area: {selectedPlacement.name}</p>
                          {selectedProduct.specs.slice(0, 3).map((s, i) => <p key={i}>· {s}</p>)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {viewMode === 'mockup' && selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {selectedProduct.images.map((img, idx) => (
                      <button key={idx} type="button" onClick={() => setActiveImageIndex(idx)} aria-label={`Photo ${idx + 1}`}
                        className={`w-14 h-14 rounded-lg overflow-hidden bg-bone cursor-pointer ${activeImageIndex === idx ? 'ring-2 ring-ink' : 'ring-1 ring-black/5'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#fff] rounded-2xl p-5">
                  <p className="text-sm text-neutral-500">Quantity</p>
                  <p className="text-2xl font-semibold tracking-[-0.02em] mt-0.5">{quantity} {quantity === 1 ? 'piece' : 'pieces'}</p>
                  {isBulk && <p className="text-xs text-[#2f5130] mt-1">Volume pricing applies</p>}
                </div>
                <div className="bg-[#fff] rounded-2xl p-5">
                  <p className="text-sm text-neutral-500">Price</p>
                  <p className="text-2xl font-semibold tracking-[-0.02em] mt-0.5">Custom quote</p>
                  <p className="text-xs text-neutral-500 mt-1">Confirmed on WhatsApp</p>
                </div>
              </div>
            </div>

            {/* RIGHT: 3-step form */}
            <div className="lg:col-span-6 bg-[#fff] rounded-2xl p-5 md:p-7 min-h-[480px]">
              <ol className="flex items-center mb-6 pb-5 border-b border-[#eeece6]">
                {([1, 2, 3] as Step[]).map((s, i) => (
                  <React.Fragment key={s}>
                    <li>
                      <button type="button" onClick={() => step > s && setStep(s)} className={`flex items-center gap-2 ${step > s ? 'cursor-pointer' : 'cursor-default'}`}>
                        <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-medium ${step >= s ? 'bg-ink text-[#fff]' : 'border-2 border-[#e6e3dc] text-neutral-400'} ${step === s ? 'ring-4 ring-ink/10' : ''}`}>
                          {step > s ? <Check size={13} strokeWidth={3} /> : s}
                        </span>
                        <span className={`text-sm hidden sm:block ${step === s ? 'font-medium' : step > s ? 'text-neutral-600' : 'text-neutral-400'}`}>{stepLabels[i]}</span>
                      </button>
                    </li>
                    {i < 2 && <li aria-hidden className={`flex-1 mx-3 h-[2px] rounded-full ${step > s ? 'bg-ink' : 'bg-[#e6e3dc]'}`} />}
                  </React.Fragment>
                ))}
              </ol>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-6">
                    <div>
                      <p className="text-sm text-neutral-600 mb-2">Colour</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.colors.map((color) => (
                          <button key={color.name} type="button" onClick={() => setSelectedColor(color.name)} className={`${choice(selectedColor === color.name)} p-3 flex items-center gap-2.5 text-left`}>
                            <span className={`w-4 h-4 rounded-full shrink-0 ring-1 ${selectedColor === color.name ? 'ring-[#fff]/60' : 'ring-black/10'}`} style={{ background: color.hex }} />
                            <span className="text-sm font-medium">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 mb-2">Where to print</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.placements.map((place) => (
                          <button key={place.name} type="button" onClick={() => setSelectedPlacement(place)} className={`${choice(selectedPlacement.name === place.name)} p-3 text-left`}>
                            <span className="block text-sm font-medium">{place.name}</span>
                            <span className={`block text-xs mt-0.5 line-clamp-2 ${selectedPlacement.name === place.name ? 'text-[#fff]/70' : 'text-neutral-500'}`}>{place.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-neutral-600">How many?</p>
                        <div className="inline-flex items-center rounded-full border border-[#e3e0d8]">
                          <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Fewer" className="w-9 h-9 grid place-items-center text-lg cursor-pointer">−</button>
                          <input type="number" min="1" max="1000" value={quantity || ''} aria-label="Quantity"
                            onChange={(e) => { const v = parseInt(e.target.value, 10); setQuantity(isNaN(v) || v < 1 ? 1 : Math.min(v, 1000)); }}
                            className="w-12 text-center text-sm font-medium bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                          <button type="button" onClick={() => setQuantity(q => Math.min(1000, q + 1))} aria-label="More" className="w-9 h-9 grid place-items-center text-lg cursor-pointer">+</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 10, 25, 50, 100].map(n => (
                          <button key={n} type="button" onClick={() => setQuantity(n)} className={`${choice(quantity === n)} !rounded-full px-3.5 py-1.5 text-sm`}>{n}{n === 100 ? '+' : ''}</button>
                        ))}
                      </div>
                      <p className={`mt-3 text-sm rounded-xl px-4 py-3 flex gap-2 items-start ${isBulk ? 'bg-[#e8efe6] text-[#2f5130]' : 'bg-[#f7f6f3] text-neutral-600'}`}>
                        {isBulk ? <Sparkles size={15} className="shrink-0 mt-0.5" /> : <HelpCircle size={15} className="shrink-0 mt-0.5" />}
                        {isBulk ? 'Volume pricing unlocked. We’ll send a tailored quote on WhatsApp.' : 'Order 10 or more pieces for volume pricing.'}
                      </p>
                    </div>

                    <button type="button" onClick={() => setStep(2)} className={`${btnInk} w-full`}>Continue <ArrowRight size={15} /></button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-6">
                    <div>
                      <p className="text-sm text-neutral-600 mb-2">Your design <span className="text-neutral-400">(optional)</span></p>
                      <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-[#d8d4cb] hover:border-ink/50 bg-[#fbfaf8] cursor-pointer transition-colors p-4 text-center">
                        {fileName ? (
                          <>
                            <span className="w-9 h-9 rounded-full bg-ink text-[#fff] grid place-items-center mb-2"><Check size={16} /></span>
                            <span className="text-sm font-medium truncate max-w-[240px]">{fileName}</span>
                            <span className="text-xs text-neutral-500 mt-0.5">Tap to change</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-neutral-500 mb-2" />
                            <span className="text-sm font-medium">Upload a file</span>
                            <span className="text-xs text-neutral-500 mt-0.5">SVG, PNG, PDF, AI or PSD</span>
                          </>
                        )}
                        <input type="file" accept="image/*,application/pdf,.ai,.psd" onChange={handleFileChange} className="hidden" />
                      </label>
                      <p className="text-xs text-neutral-500 mt-2">Your artwork stays yours. We use it only for mockups, printing and talking to you about the order.</p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-600 mb-2">Describe what you want</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          { label: 'Startup swag', text: 'Company logo on left chest, clean and minimal.' },
                          { label: 'Event merch', text: 'Large graphic on back, event name and date on front.' },
                          { label: 'College club', text: 'Club name on front, member year on sleeve.' },
                          { label: 'Gift', text: 'Custom text and illustration, personal gift, 1 piece.' },
                        ].map((p) => (
                          <button key={p.label} type="button" onClick={() => setDesignDescription(p.text)}
                            className="px-3 py-1.5 rounded-full bg-paper hover:bg-ink hover:text-[#fff] text-xs transition-colors cursor-pointer">+ {p.label}</button>
                        ))}
                      </div>
                      <textarea value={designDescription} onChange={(e) => setDesignDescription(e.target.value)} rows={4}
                        placeholder="Colours, text, logo position, style, mood…"
                        className="w-full rounded-xl border border-[#e3e0d8] bg-[#fbfaf8] p-4 text-[15px] outline-none focus:border-ink resize-none placeholder:text-neutral-400" />
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setStep(1)} className={btnLine}><ChevronLeft size={15} /> Back</button>
                      <button type="button" onClick={() => setStep(3)} className={`${btnInk} flex-1`}>Continue <ArrowRight size={15} /></button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                    {quoteSuccess ? (
                      <div className="py-12 text-center">
                        <span className="w-12 h-12 rounded-full bg-ink text-[#fff] grid place-items-center mx-auto mb-4"><Check size={22} /></span>
                        <p className="text-xl font-semibold">Request sent</p>
                        <p className="text-[15px] text-neutral-600 mt-1 max-w-xs mx-auto">Opening WhatsApp so we can look at your design and finalise everything together.</p>
                        <button type="button" onClick={() => { setQuoteSuccess(false); setStep(1); }} className="mt-5 text-sm underline text-neutral-600 hover:text-ink cursor-pointer">Start another request</button>
                      </div>
                    ) : (
                      <form onSubmit={handleFormSubmit} className="space-y-5">
                        <div className="bg-[#f7f6f3] rounded-xl p-4 text-sm space-y-1.5">
                          <p className="font-medium mb-2">Summary</p>
                          {[
                            ['Product', selectedProduct.name],
                            ['Colour', selectedColor],
                            ['Print', selectedPlacement.name],
                            ['Quantity', `${quantity} ${quantity === 1 ? 'piece' : 'pieces'}`],
                            ...(fileName ? [['File', fileName]] : []),
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-4"><span className="text-neutral-500">{k}</span><span className="truncate">{v}</span></div>
                          ))}
                          <div className="flex justify-between gap-4 pt-2 mt-1 border-t border-[#e6e3dc]"><span className="text-neutral-500">Price</span><span className="font-medium">Custom quote</span></div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm text-neutral-600">Your contact details</p>
                          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={field} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={field} />
                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (WhatsApp)" autoComplete="tel" className={field} />
                          </div>
                        </div>

                        {quoteError && <p className="text-sm text-red-800 bg-red-50 rounded-xl px-4 py-3">{quoteError}</p>}

                        <div className="flex gap-2">
                          <button type="button" onClick={() => setStep(2)} className={btnLine}><ChevronLeft size={15} /> Back</button>
                          <button type="submit" disabled={isSubmitting} className={`${btnInk} flex-1`}>{isSubmitting ? 'Sending…' : 'Send on WhatsApp'} <ArrowRight size={15} /></button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ─── WHY CHILS & CO ─── */}
        <section className="py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            <div className="lg:col-span-5">
              <SectionHead eyebrow="Why us" title="Not just another print shop" sub="A design-led studio working with carefully chosen production partners. Every order is checked by hand." />
            </div>
            <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['Premium materials', 'Single pieces and bulk orders', 'Design help available', 'Mockup approval before printing', 'Reusable packaging', 'Carefully chosen production partners', 'Real people on WhatsApp'].map((item) => (
                <li key={item} className="bg-[#fff] rounded-2xl px-4 py-3.5 flex items-center gap-3 text-[15px]">
                  <span className="w-6 h-6 rounded-full bg-ink text-[#fff] grid place-items-center shrink-0"><Check size={12} strokeWidth={3} /></span>{item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── TAGLINE ─── */}
        <div className="py-14 md:py-20 text-center">
          <h2 className="text-[32px] md:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]">Not made for seasons.<br /><span className="text-neutral-400">Made for reasons.</span></h2>
          <p className="mt-4 text-neutral-500">Built for milestones · Designed for memories · Made to last</p>
        </div>

        {/* ─── FAQs ─── */}
        <section className="py-10 md:py-16">
          <SectionHead eyebrow="Questions" title="Good to know" />
          <div className="max-w-3xl space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-[#fff] rounded-2xl">
                  <button type="button" onClick={() => setOpenFaq(isOpen ? null : idx)} aria-expanded={isOpen} className="w-full flex justify-between items-center gap-4 text-left px-5 py-4 cursor-pointer">
                    <span className="font-medium">{faq.q}</span>
                    <ChevronDown size={16} className={`text-neutral-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <p className="text-[15px] text-neutral-600 leading-relaxed px-5 pb-5">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          <a href="https://wa.me/917842070404" target="_blank" rel="noopener noreferrer" className="link-brass inline-flex items-center gap-1.5 text-sm mt-8">
            Still deciding? Chat with us on WhatsApp <ArrowRight size={13} />
          </a>
        </section>

      </div>
    </div>
  );
};

export default CustomStudio;
