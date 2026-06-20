import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, MessageSquare, Sparkles, HelpCircle, ChevronDown, Upload, Eye, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

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
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781931358/ChatGPT_Image_Jun_20_2026_09_38_14_AM_e5iqrl.png',
      'https://res.cloudinary.com/ddatd5ruz/image/upload/v1781931357/ChatGPT_Image_Jun_20_2026_10_22_21_AM_rieewh.png'
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

  // Train progress timeline loop in Hero
  const [activeStop, setActiveStop] = useState<number>(1);
  const [trainProgress, setTrainProgress] = useState<number>(0);

  useEffect(() => {
    let timer1: number;
    let timer2: number;
    let timer3: number;
    let timer4: number;
    let timer5: number;

    const runCycle = () => {
      // Reached Node 1 immediately at start of cycle
      setActiveStop(1);
      setTrainProgress(0);

      // Travel to Node 2 at 2s
      timer1 = window.setTimeout(() => {
        setTrainProgress(50);
      }, 2000);

      // Reached Node 2 (800ms travel time)
      timer2 = window.setTimeout(() => {
        setActiveStop(2);
      }, 2800);

      // Travel to Node 3 at 5s
      timer3 = window.setTimeout(() => {
        setTrainProgress(100);
      }, 5000);

      // Reached Node 3 (800ms travel time)
      timer4 = window.setTimeout(() => {
        setActiveStop(3);
      }, 5800);

      // Travel back to Node 1 at 8s
      timer5 = window.setTimeout(() => {
        setTrainProgress(0);
        setActiveStop(1);
      }, 8000);
    };

    runCycle();
    const interval = setInterval(runCycle, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearInterval(interval);
    };
  }, []);

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
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-accent/25 stroke-current fill-none stroke-[0.8]">
            <path d="M20,25 C25,23 35,22 50,25 C65,22 75,23 80,25 L88,38 L78,44 L76,38 L76,82 L24,82 L24,38 L22,44 L12,38 Z" />
            <path d="M38,23.5 C42,27 58,27 62,23.5" />
            {activePlacement.includes('Chest Center') && <rect x="38" y="32" width="24" height="14" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Left Chest') && <rect x="34" y="32" width="8" height="8" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Back') && <rect x="28" y="38" width="44" height="38" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Sleeve') && <path d="M12,38 L22,44 L17,41 Z" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Hood') && <path d="M35,22 C35,10 65,10 65,22 Z" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'mug':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-accent/25 stroke-current fill-none stroke-[0.8]">
            <rect x="25" y="25" width="40" height="50" rx="3" />
            <path d="M65,35 C78,35 78,65 65,65" />
            {activePlacement.includes('Front') && <rect x="29" y="32" width="16" height="36" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Wrap') && <rect x="25" y="32" width="40" height="36" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Double') && <><rect x="28" y="32" width="12" height="36" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" /><rect x="48" y="32" width="12" height="36" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" /></>}
          </svg>
        );
      case 'cap':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-accent/25 stroke-current fill-none stroke-[0.8]">
            <path d="M15,62 C15,20 85,20 85,62 Z" />
            <path d="M10,63 C20,78 80,78 90,63 L80,62 C70,72 30,72 20,62 Z" />
            {activePlacement.includes('Front') && <ellipse cx="50" cy="42" rx="14" ry="10" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Side') && <ellipse cx="26" cy="48" rx="8" ry="6" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Back') && <rect x="42" y="55" width="16" height="6" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'bottle':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-accent/25 stroke-current fill-none stroke-[0.8]">
            <path d="M38,20 L62,20 L62,28 L58,35 L58,82 L42,82 L42,35 L38,28 Z" />
            <rect x="45" y="14" width="10" height="6" />
            {activePlacement.includes('Vertical') && <rect x="46" y="38" width="8" height="36" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Lower') && <rect x="44" y="66" width="12" height="12" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Lid') && <rect x="45" y="14" width="10" height="6" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'pouch':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-accent/25 stroke-current fill-none stroke-[0.8]">
            <rect x="32" y="15" width="36" height="70" rx="8" />
            <rect x="36" y="19" width="10" height="10" rx="2" />
            <circle cx="41" cy="24" r="2" />
            {activePlacement.includes('Back Wrap') && <rect x="32" y="15" width="36" height="70" rx="8" className="fill-accent/20 stroke-accent stroke-[1] stroke-dasharray-[2] animate-pulse" />}
            {activePlacement.includes('Center Logo') && <rect x="42" y="42" width="16" height="16" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
          </svg>
        );
      case 'sticker':
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-accent/25 stroke-current fill-none stroke-[0.8]">
            <rect x="25" y="25" width="50" height="50" rx="6" strokeDasharray="3 3" />
            <path d="M30,35 C35,32 50,45 60,35 C70,25 70,55 60,65 C50,75 35,62 30,65 Z" className="fill-accent/15 stroke-accent stroke-[1]" />
            {activePlacement.includes('Standard') && <circle cx="50" cy="50" r="16" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />}
            {activePlacement.includes('Mini') && (
              <>
                <circle cx="38" cy="38" r="8" className="fill-accent/25 stroke-accent" />
                <circle cx="62" cy="38" r="8" className="fill-accent/25 stroke-accent" />
                <circle cx="38" cy="62" r="8" className="fill-accent/25 stroke-accent" />
                <circle cx="62" cy="62" r="8" className="fill-accent/25 stroke-accent" />
              </>
            )}
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-48 h-48 text-accent/25 stroke-current fill-none stroke-[0.8]">
            <rect x="30" y="20" width="40" height="60" rx="4" />
            <rect x="38" y="35" width="24" height="30" className="fill-accent/20 stroke-accent stroke-[1] animate-pulse" />
          </svg>
        );
    }
  };

  const stepLabels = ['Configure', 'Your Design', 'Contact'];

  return (
    <div className="bg-black min-h-screen pt-28 md:pt-36 pb-24 text-white font-sans selection:bg-accent selection:text-black">
      <SEO
        title="Custom Studio | CHILS & CO."
        description="Design bespoke apparel and items for teams, occasions or singles. Heavyweight premium fabrics, design assistance, and instant WhatsApp customization consultation."
        keywords="custom tshirts, custom hoodies, custom mugs, bespoke gifting Miyapur, custom caps, custom bottles Hyderabad"
      />

      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_600px_at_50%_-80px,rgba(212,175,55,0.07),transparent)] pointer-events-none -z-10" />

      <div className="max-w-[1600px] mx-auto px-5 md:px-10">

        {/* ─── HERO ─── */}
        <section className="pt-4 pb-20 md:pb-28 border-b border-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Brand Text & CTA */}
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[8px] font-mono font-bold tracking-[0.3em] text-accent uppercase">Chils Lab</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter uppercase leading-[0.85]">
                  Custom<br />
                  <span className="text-accent italic">Studio</span>
                </h1>
                <h3 className="text-lg md:text-xl font-display text-accent/80 font-medium tracking-tight">
                  Your Idea. Professionally Crafted.
                </h3>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-lg font-light">
                  From a single personalized gift to hundreds of pieces for your event, startup, wedding, or community. Premium customization across apparel, drinkware, and stickers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-4">
                <button
                  onClick={scrollToConfigurator}
                  className="px-8 py-4 bg-accent text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2.5 hover:bg-white hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all cursor-pointer"
                >
                  Start Designing <ArrowRight size={12} />
                </button>
                <a href="https://wa.me/917842070404" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-mono text-neutral-500 hover:text-accent transition-colors uppercase tracking-widest flex items-center gap-2 group">
                  Or WhatsApp us <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>

            {/* Right Column: Sleek Git-Pipeline Timeline with Train Animation */}
            <div className="lg:col-span-6 relative pl-0 lg:pl-8 py-4">
              {/* Vertical track line (background) */}
              <div className="absolute left-[16px] top-[22px] bottom-[22px] w-px bg-neutral-900 hidden lg:block" />

              {/* Glowing active train track line */}
              <motion.div 
                className="absolute left-[16px] top-[22px] w-px bg-accent shadow-[0_0_8px_#d4af37] hidden lg:block"
                style={{ originY: 0 }}
                animate={{ height: `${trainProgress}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              {/* Premium Custom Sci-Fi Train Vehicle */}
              <motion.div 
                className="absolute left-[8px] w-4 h-8 hidden lg:block z-20 select-none pointer-events-none"
                animate={{ top: `calc(${trainProgress}% + 22px - 16px)` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <svg viewBox="0 0 12 24" className="w-full h-full text-accent fill-accent/20 stroke-accent filter drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]">
                  {/* Sleek aerodynamic nose pointing downwards */}
                  <path d="M2,2 L10,2 L10,14 C10,18 7,22 6,22 C5,22 2,18 2,14 Z" strokeWidth="0.8" />
                  {/* Dark tech windshield/windows */}
                  <rect x="4" y="5" width="4" height="2" rx="0.5" className="fill-black/90 stroke-none" />
                  <rect x="4" y="9" width="4" height="2" rx="0.5" className="fill-black/90 stroke-none" />
                  <rect x="4" y="13" width="4" height="2" rx="0.5" className="fill-black/90 stroke-none" />
                  {/* Micro side detail lines */}
                  <path d="M1,6 L2,8 L2,12 L1,14" strokeWidth="0.5" />
                  <path d="M11,6 L10,8 L10,12 L11,14" strokeWidth="0.5" />
                </svg>
              </motion.div>

              <div className="space-y-12">
                {[
                  { n: '01', title: 'You send the design', sub: 'Upload SVG, PNG, AI, or briefly describe your concept in text.' },
                  { n: '02', title: 'We show you a mockup', sub: 'Review our digital placement and color blueprint preview.' },
                  { n: '03', title: 'We print & ship', sub: 'Premium boxed packaging, dispatched locally in 3–5 days.' }
                ].map((s, idx) => {
                  const isNodeActive = activeStop >= (idx + 1);

                  return (
                    <div key={s.n} className="relative pl-8 lg:pl-12 group">
                      {/* Node Dot (Stops) */}
                      <div 
                        className={`absolute left-[6px] lg:left-[11px] top-1.5 w-[11px] h-[11px] rounded-full bg-black border-[2px] transition-all duration-300 z-10 ${
                          isNodeActive 
                            ? 'border-accent bg-accent shadow-[0_0_10px_#d4af37]' 
                            : 'border-neutral-800'
                        }`} 
                      />
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-mono font-bold transition-colors duration-300 ${
                            isNodeActive ? 'text-accent' : 'text-neutral-500'
                          }`}>
                            {s.n}
                          </span>
                          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-300 ${
                            isNodeActive ? 'text-accent' : 'text-white'
                          }`}>
                            {s.title}
                          </h3>
                        </div>
                        <p className={`text-xs font-light leading-relaxed max-w-md transition-colors duration-300 ${
                          isNodeActive ? 'text-neutral-200' : 'text-neutral-400'
                        }`}>
                          {s.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ─── OCCASIONS ─── */}
        <section className="py-20 border-b border-neutral-900">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em]">Curation</span>
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Built For Every Occasion</h2>
            <p className="text-neutral-400 text-xs font-light">
              Premium custom items tailored for your squad, company, event, or special moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: '🎂',
                title: 'Birthdays',
                desc: 'Personalized gifts, custom t-shirts, mugs, and thermal bottles.'
              },
              {
                emoji: '💍',
                title: 'Weddings & Anniversaries',
                desc: 'Bride squad coordinates, groom squad details, custom family merch, and keepsakes.'
              },
              {
                emoji: '🎵',
                title: 'Mehendi & Sangeet',
                desc: 'Matching celebration apparel, custom graphics, and event giveaways.'
              },
              {
                emoji: '🏢',
                title: 'Corporate Gifting',
                desc: 'Premium bottles, mugs, apparel, and merchandise for employees, clients, and events.'
              },
              {
                emoji: '🎓',
                title: 'Clubs & Communities',
                desc: 'College events, regional meetups, and dedicated brand merchandise.'
              },
              {
                emoji: '🎁',
                title: 'Personal Gifts',
                desc: 'One-of-one custom pieces designed from scratch for someone special.'
              }
            ].map((o, idx) => (
              <div
                key={idx}
                className="group relative bg-neutral-950/40 border border-white/5 p-6 rounded-sm hover:border-accent/30 transition-all duration-300 flex items-start gap-4"
              >
                <div className="absolute top-0 right-0 h-[2px] w-0 bg-accent group-hover:w-12 transition-all duration-500" />
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-xl shrink-0 group-hover:border-accent/40 group-hover:bg-accent/5 transition-all">
                  {o.emoji}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors">
                    {o.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    {o.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRODUCT GRID ─── */}
        <section className="py-20 border-b border-neutral-900">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] block mb-1">Products</span>
              <h2 className="text-xl font-display font-bold uppercase tracking-tight">Choose what to customize</h2>
            </div>
            <button onClick={scrollToConfigurator} className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest hover:text-accent transition-colors hidden md:block">
              Jump to Project Builder ↓
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CUSTOM_PRODUCTS.map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleProductSelect(prod)}
                className={`group text-left bg-neutral-950/60 border rounded-sm overflow-hidden transition-all duration-300 hover:border-accent/40 ${
                  selectedProduct.id === prod.id ? 'border-accent animate-pulse-subtle' : 'border-white/5'
                }`}
              >
                <div className="aspect-square w-full bg-black relative overflow-hidden">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-0.5 border border-white/10 rounded-full">
                    <span className="text-[8px] font-mono text-neutral-400">{prod.category}</span>
                  </div>
                  {selectedProduct.id === prod.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <Check size={10} className="text-black" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide transition-colors ${selectedProduct.id === prod.id ? 'text-accent' : 'text-white group-hover:text-accent'}`}>
                      {prod.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5 font-light">{prod.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ─── DESIGN ASSISTANCE ─── */}
        <section className="py-20 border-b border-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em]">Studio Support</span>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Need Help With The Design?</h2>
              <p className="text-neutral-400 text-xs font-light leading-relaxed">
                Whether you have print-ready vector files or just a rough sketch, our dedicated design desk is here to help prepare your project for production.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative bg-neutral-950/40 border border-white/5 p-6 rounded-sm space-y-4 hover:border-white/10 transition-colors">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  <span className="text-[7px] font-mono font-bold tracking-wider text-accent uppercase">Adjustments Included</span>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Already Have Artwork?</h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Upload your artwork and we will prepare it for production. Minor adjustments and print optimization are included at no extra charge.
                </p>
              </div>
              <div className="relative bg-neutral-950/40 border border-white/5 p-6 rounded-sm space-y-4 hover:border-white/10 transition-colors">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-neutral-400" />
                  <span className="text-[7px] font-mono font-bold tracking-wider text-neutral-400 uppercase">Premium Custom Work</span>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Need a Design from Scratch?</h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Our team can help create one based on your idea. Additional design charges may apply.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-10">
            <a
              href="https://wa.me/917842070404"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-mono text-neutral-500 hover:text-accent uppercase tracking-widest transition-colors group"
            >
              Need help deciding? Chat with us on WhatsApp <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </section>

        {/* ─── PROJECT BUILDER ─── */}
        <section ref={configuratorRef} className="py-20 border-b border-neutral-900 scroll-mt-24">
          <div className="mb-10">
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] block mb-1">Project Builder</span>
            <h2 className="text-xl font-display font-bold uppercase tracking-tight">Project Builder</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* ─── LEFT: Product viewer ─── */}
            <div className="lg:col-span-6 space-y-5">

              {/* View toggle */}
              <div className="flex items-center gap-3">
                <div className="flex bg-neutral-950 border border-white/5 rounded-sm p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('mockup')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all ${viewMode === 'mockup' ? 'bg-accent text-black' : 'text-neutral-500 hover:text-white'}`}
                  >
                    <Eye size={10} /> Mockup
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('blueprint')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all ${viewMode === 'blueprint' ? 'bg-accent text-black' : 'text-neutral-500 hover:text-white'}`}
                  >
                    <Layers size={10} /> Blueprint
                  </button>
                </div>
                <span className="text-[9px] font-mono text-neutral-600 uppercase">{selectedProduct.name}</span>
              </div>

              {/* Viewer box */}
              <div className="relative aspect-[4/3] w-full bg-neutral-950 border border-white/5 rounded-sm overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Scanning laser line overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent shadow-[0_0_15px_#d4af37] animate-scan" />
                </div>

                <AnimatePresence mode="wait">
                  {viewMode === 'mockup' ? (
                    <motion.img
                      key={`mockup-${activeImageIndex}`}
                      src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <motion.div
                      key="blueprint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070a]"
                    >
                      {renderBlueprintSchematic()}
                      <div className="absolute top-4 left-4 font-mono text-[8px] text-accent/50 space-y-0.5">
                        <div>PRODUCT: {selectedProduct.id.toUpperCase()}</div>
                        <div>SCALE: 1:1 METRIC</div>
                      </div>
                      <div className="absolute bottom-4 right-4 font-mono text-[8px] text-neutral-600 text-right space-y-0.5">
                        <div className="text-accent/60">PLACEMENT ZONE</div>
                        <div>{selectedPlacement.coord}</div>
                        <div>{selectedPlacement.name.toUpperCase()}</div>
                      </div>
                      {/* Specs overlay */}
                      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border border-white/5 p-4 max-w-[180px]">
                        <div className="text-[7px] text-accent uppercase font-bold tracking-widest mb-2 font-mono">Specs</div>
                        {selectedProduct.specs.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-mono mb-0.5">
                            <span className="w-1 h-1 rounded-full bg-accent/60 shrink-0" />{s}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image angle tabs */}
                {viewMode === 'mockup' && selectedProduct.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex gap-1.5 bg-black/80 backdrop-blur-md border border-white/5 p-1 rounded-sm">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-9 h-9 border rounded-sm overflow-hidden transition-all ${activeImageIndex === idx ? 'border-accent' : 'border-white/10 opacity-50 hover:opacity-80'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs & Volume status under viewer */}
              <div className="bg-neutral-950/40 border border-white/5 rounded-sm p-5 flex items-center justify-between">
                <div>
                  <div className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest mb-1">
                    Order Volume
                  </div>
                  <div className="text-2xl font-display font-bold text-accent">
                    {quantity} {quantity === 1 ? 'Piece' : 'Pieces'}
                  </div>
                  {isBulk && <div className="text-[9px] text-accent/60 font-mono mt-0.5">Volume discounts will apply</div>}
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest mb-1">
                    Project Estimate
                  </div>
                  <div className="text-2xl font-display font-bold text-white uppercase tracking-wider">
                    Custom Quote
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-0.5">Finalized via WhatsApp</div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: 3-step form ─── */}
            <div className="lg:col-span-6 bg-neutral-950/20 border border-white/5 rounded-sm p-8 md:p-10 backdrop-blur-md relative min-h-[500px]">
              <div className="absolute top-0 right-0 h-px w-20 bg-accent" />

              {/* Step indicator */}
              <div className="flex items-center gap-0 mb-8 border-b border-neutral-900 pb-6">
                {([1, 2, 3] as Step[]).map((s, i) => (
                  <React.Fragment key={s}>
                    <button
                      type="button"
                      onClick={() => step > s && setStep(s)}
                      className={`flex items-center gap-2 ${step > s ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold font-mono transition-all border ${
                        step === s ? 'bg-accent text-black border-accent shadow-[0_0_10px_rgba(212,175,55,0.2)]' :
                        step > s ? 'bg-transparent text-accent border-accent/50' :
                        'bg-transparent text-neutral-600 border-neutral-800'
                      }`}>
                        {step > s ? <Check size={10} strokeWidth={3} /> : s}
                      </div>
                      <span className={`text-[9px] font-mono uppercase tracking-wider hidden sm:block ${
                        step === s ? 'text-accent font-bold' : step > s ? 'text-neutral-400' : 'text-neutral-700'
                      }`}>
                        {stepLabels[i]}
                      </span>
                    </button>
                    {i < 2 && <div className={`flex-1 mx-3 h-px transition-colors ${step > s + 1 ? 'bg-accent/40' : 'bg-neutral-800'}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* ── STEP 1: Configure ── */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-7"
                  >
                    {/* Color selector */}
                    <div className="space-y-3">
                      <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Color</div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.colors.map((color) => {
                          const isSelected = selectedColor === color.name;
                          return (
                            <button
                              key={color.name}
                              type="button; submit"
                              onClick={() => setSelectedColor(color.name)}
                              className={`text-left p-3 rounded-sm border flex items-center gap-2.5 transition-all duration-200 cursor-pointer ${
                                isSelected ? 'border-accent bg-accent/5' : 'border-white/5 bg-neutral-950/30 hover:border-white/15'
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-white/10 shrink-0"
                                style={{ background: color.hex }}
                              />
                              <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-accent' : 'text-white'}`}>
                                {color.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Placement */}
                    <div className="space-y-3">
                      <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Print placement</div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.placements.map((place) => {
                          const isSelected = selectedPlacement.name === place.name;
                          return (
                            <button
                              key={place.name}
                              type="button"
                              onClick={() => setSelectedPlacement(place)}
                              className={`p-3 rounded-sm border text-left transition-all duration-200 cursor-pointer ${
                                isSelected ? 'border-accent bg-accent/5' : 'border-white/5 bg-neutral-950/30 hover:border-white/15'
                              }`}
                            >
                              <div className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${isSelected ? 'text-accent' : 'text-white'}`}>
                                {place.name}
                              </div>
                              <div className="text-[8px] font-mono text-neutral-500">{place.coord}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Quantity</div>
                        <div className="flex items-center gap-2 bg-neutral-950 border border-white/10 px-3 py-1 rounded-sm">
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={quantity || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              setQuantity(isNaN(v) || v < 1 ? 1 : v);
                            }}
                            className="w-12 text-center text-xs font-mono font-bold bg-transparent text-white focus:outline-none"
                          />
                          <span className="text-[9px] text-neutral-500 font-mono uppercase">pcs</span>
                        </div>
                      </div>
                      <input
                        type="range" min="1" max="100"
                        value={quantity > 100 ? 100 : quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-neutral-900 accent-accent rounded-lg appearance-none cursor-pointer"
                      />
                      <AnimatePresence mode="wait">
                        {isBulk ? (
                          <motion.div
                            key="bulk"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-2.5 items-start p-3 bg-accent/5 border border-accent/20 rounded-sm"
                          >
                            <Sparkles size={12} className="text-accent shrink-0 mt-0.5" />
                            <p className="text-[10px] text-neutral-300 leading-relaxed">
                              Volume discounts unlocked. We will calculate a tailored quote for your project and send it on WhatsApp.
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="single"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-2.5 items-start p-3 bg-neutral-950 border border-white/5 rounded-sm"
                          >
                            <HelpCircle size={12} className="text-neutral-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-neutral-600 leading-relaxed">
                              Add 10+ pieces to unlock volume discounts.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-accent text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white transition-colors cursor-pointer"
                    >
                      Continue to Design <ArrowRight size={12} />
                    </button>
                  </motion.div>
                )}

                {/* ── STEP 2: Design upload ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-7"
                  >
                    {/* Upload area */}
                    <div className="space-y-3">
                      <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Upload Your Design</div>
                      <p className="text-[9px] text-neutral-500 font-light leading-relaxed">
                        Your artwork remains yours. Files are used only for mockups, production, and project communication.
                      </p>
                      <label className="flex flex-col items-center justify-center w-full h-36 bg-neutral-950 hover:bg-neutral-900 border border-dashed border-white/10 hover:border-accent/30 rounded-sm cursor-pointer transition-all group p-4">
                        {fileName ? (
                          <div className="flex flex-col items-center gap-2">
                            <Check size={20} className="text-accent" />
                            <span className="text-[10px] font-mono text-accent truncate max-w-[200px]">{fileName}</span>
                            <span className="text-[8px] text-neutral-500 font-mono uppercase">Click to change file</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={20} className="text-neutral-500 group-hover:text-accent transition-colors" />
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Drag & Drop</span>
                            <div className="flex flex-wrap justify-center gap-1.5 px-4 mt-1">
                              {['SVG', 'PNG', 'PDF', 'AI', 'PSD'].map(fmt => (
                                <span key={fmt} className="text-[8px] font-mono bg-white/5 border border-white/10 px-1 py-0.5 rounded text-neutral-500">{fmt}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" accept="image/*,application/pdf,.ai,.psd" onChange={handleFileChange} className="hidden" />
                      </label>
                      <div className="text-center font-mono text-[9px] text-neutral-600 uppercase py-0.5">or</div>
                      <p className="text-[9px] text-neutral-600 leading-relaxed font-light text-center">
                        Describe your idea and we'll help create it.
                      </p>
                    </div>

                    {/* Design brief */}
                    <div className="space-y-3">
                      <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Design brief</div>

                      {/* Quick preset pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'Startup swag', text: 'Company logo on left chest, clean and minimal.' },
                          { label: 'Event merch', text: 'Large graphic on back, event name and date on front.' },
                          { label: 'College club', text: 'Club name embroidered on front, member year on sleeve.' },
                          { label: 'Gift set', text: 'Custom text and illustration — personal gift, 1 piece.' }
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setDesignDescription(p.text)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-accent/10 border border-white/8 hover:border-accent/30 rounded-full text-[8px] font-mono text-neutral-400 hover:text-accent transition-all cursor-pointer"
                          >
                            + {p.label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={designDescription}
                        onChange={(e) => setDesignDescription(e.target.value)}
                        placeholder="Describe your design — colors, text, logo placement, style, mood..."
                        rows={4}
                        className="w-full bg-neutral-950 border border-white/5 rounded-sm p-4 text-xs placeholder-neutral-700 focus:outline-none focus:border-accent/30 text-neutral-200 transition-colors resize-none focus:ring-1 focus:ring-accent/10 font-sans"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-none px-5 py-4 border border-white/10 text-neutral-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:border-white/25 hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={11} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 py-4 bg-accent text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white transition-colors cursor-pointer"
                      >
                        Continue <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: Contact + Submit ── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {quoteSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-16 flex flex-col items-center text-center space-y-5 border border-accent/20 bg-accent/[0.02] rounded-sm"
                      >
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                          <Check className="text-black" size={22} strokeWidth={3} />
                        </div>
                        <div>
                          <h4 className="text-base font-display font-bold text-white uppercase tracking-tight mb-2">Request sent</h4>
                          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                            Redirecting you to WhatsApp so we can review your design and finalize everything together.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setQuoteSuccess(false); setStep(1); }}
                          className="text-[9px] text-neutral-500 underline hover:text-white font-mono uppercase tracking-wider cursor-pointer"
                        >
                          Start another request
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Summary card */}
                        <div className="bg-neutral-950 border border-white/5 rounded-sm p-4 space-y-2.5 font-mono text-[10px]">
                          <div className="text-[8px] text-accent uppercase tracking-widest mb-3">Order summary</div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Product</span><span className="text-white">{selectedProduct.name}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Color</span><span className="text-white">{selectedColor}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Placement</span><span className="text-white">{selectedPlacement.name}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Quantity</span><span className="text-white">{quantity} pcs</span>
                          </div>
                          {fileName && (
                            <div className="flex justify-between text-neutral-500">
                              <span>File</span><span className="text-accent truncate max-w-[140px]">{fileName}</span>
                            </div>
                          )}
                          <div className="border-t border-white/5 pt-2 flex justify-between items-baseline">
                            <span className="text-neutral-500">Project Estimate</span>
                            <span className="text-sm font-bold text-accent uppercase tracking-wider">Custom Quote</span>
                          </div>
                        </div>

                        {/* Contact fields */}
                        <div className="space-y-3">
                          <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Your contact info</div>
                          <input
                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-neutral-950 border border-white/5 rounded-sm px-4 py-3 text-xs placeholder-neutral-700 focus:outline-none focus:border-accent/30 text-neutral-200 transition-colors"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email address"
                              className="w-full bg-neutral-950 border border-white/5 rounded-sm px-4 py-3 text-xs placeholder-neutral-700 focus:outline-none focus:border-accent/30 text-neutral-200 transition-colors"
                            />
                            <input
                              type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                              placeholder="Phone number"
                              className="w-full bg-neutral-950 border border-white/5 rounded-sm px-4 py-3 text-xs placeholder-neutral-700 focus:outline-none focus:border-accent/30 text-neutral-200 transition-colors"
                            />
                          </div>
                        </div>

                        {quoteError && (
                          <div className="text-[10px] text-red-500 font-mono tracking-wider">{quoteError}</div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="flex-none px-5 py-4 border border-white/10 text-neutral-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:border-white/25 hover:text-white transition-colors cursor-pointer"
                          >
                            <ChevronLeft size={11} /> Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-accent text-black text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-55 cursor-pointer"
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit to WhatsApp'} <ArrowRight size={12} />
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        </section>

        {/* ─── GROUP ORDERS & BULK DETAILS ─── */}

        {/* ─── WHY CHILS & CO ─── */}
        <section className="py-20 border-b border-neutral-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em]">Quality Assured</span>
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Not Just Another Print Shop</h2>
              <p className="text-neutral-400 text-xs font-light leading-relaxed">
                We are a design-focused studio partnering with premium production facilities to craft goods that last. Every detail is reviewed, customized, and checked by human hands.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Premium materials',
                'Individual and bulk orders',
                'Design assistance available',
                'Mockup approval before production',
                'Sustainable packaging',
                'Carefully curated production partners',
                'Dedicated support through WhatsApp'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-neutral-950/30 border border-white/5 p-4 rounded-sm">
                  <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] text-accent shrink-0">
                    ✓
                  </div>
                  <span className="text-xs text-neutral-300 font-light tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BOTTOM EMOTIONAL TAGLINE ─── */}
        <div className="py-24 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight uppercase">
            Not Made For Seasons.<br />
            <span className="text-accent">Made For Reasons.</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-mono uppercase tracking-widest text-neutral-400">
            <span>Built for milestones</span>
            <span className="text-accent/30">•</span>
            <span>Designed for memories</span>
            <span className="text-accent/30">•</span>
            <span>Crafted to last</span>
          </div>
        </div>

        {/* FAQs */}
        <section className="py-20">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em]">RESOLUTIONS</span>
            <h3 className="text-3xl font-display font-bold uppercase tracking-tight">NEED HELP?</h3>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-neutral-900 pb-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center text-left py-3 group cursor-pointer"
                  >
                    <span className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors">{faq.q}</span>
                    <ChevronDown size={14} className={`text-neutral-500 transition-transform ${isOpen ? 'rotate-180 text-accent' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-neutral-400 font-light leading-relaxed pt-2 pb-4 pr-6">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center pt-12">
            <a
              href="https://wa.me/917842070404"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-mono text-neutral-500 hover:text-accent uppercase tracking-widest transition-colors group"
            >
              Need help deciding? Chat with us on WhatsApp <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CustomStudio;
