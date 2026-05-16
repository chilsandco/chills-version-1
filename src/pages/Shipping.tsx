import React from 'react';
import { motion } from 'motion/react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  CreditCard, 
  AlertTriangle, 
  Leaf, 
  RefreshCcw, 
  Handshake, 
  Mail,
  ArrowRight,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Shipping: React.FC = () => {
  const [settings, setSettings] = React.useState({
    email: "hello.chilsandco@gmail.com"
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.email) setSettings(data);
      })
      .catch(err => console.error("Failed to sync global nodes:", err));
  }, []);

  return (
    <div className="pt-36 md:pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto min-h-screen bg-black">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-20 text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            whileHover="hover"
            className="p-4 bg-accent/10 rounded-full overflow-hidden w-[72px] h-[72px] flex items-center justify-center relative cursor-pointer"
          >
            <motion.div 
              variants={{
                hover: {
                  x: [0, -1, 1, -1, 100, -100, 0],
                  opacity: [1, 1, 1, 1, 0, 0, 1],
                  transition: { 
                    duration: 0.8,
                    times: [0, 0.05, 0.1, 0.15, 0.5, 0.51, 1],
                    ease: "easeInOut"
                  }
                }
              }}
            >
              <Truck className="text-accent" size={40} strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-6">
          Shipping & Delivery
        </h1>
        <p className="text-xl text-neutral-400 font-medium tracking-tight">
          Built to reach you, as intended.
        </p>
      </motion.div>

      {/* Main Philosophy */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-24 p-8 md:p-12 border border-neutral-900 bg-black relative overflow-hidden"
      >
        <motion.div 
          whileHover="hover"
          className="absolute top-0 right-0 p-8 opacity-5 overflow-hidden w-[200px] h-[200px] flex items-center justify-center cursor-pointer"
        >
            <motion.div
              variants={{
                hover: {
                  x: [0, -1, 1, -1, 250, -250, 0],
                  opacity: [1, 1, 1, 1, 0, 0, 1],
                  transition: { 
                    duration: 0.8,
                    times: [0, 0.05, 0.1, 0.15, 0.5, 0.51, 1],
                    ease: "easeInOut"
                  }
                }
              }}
            >
              <Truck size={120} />
            </motion.div>
        </motion.div>
        <div className="relative z-10 space-y-6 max-w-2xl leading-relaxed text-neutral-300 italic">
          <p>
            Every Chils & Co order is prepared with the same level of attention that goes into the product itself — carefully packed, verified, and dispatched to reach you exactly as designed.
          </p>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        
        {/* Where We Ship */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <MapPin className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Coverage & Cost</h2>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-display font-bold tracking-tight uppercase">PAN INDIA</p>
            <p className="text-neutral-500 text-sm leading-relaxed uppercase tracking-widest font-medium">
              We currently offer free shipping across India. No hidden protocols.
            </p>
          </div>
        </section>

        {/* Order Processing */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <Clock className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Order Processing</h2>
          </div>
          <div className="space-y-4">
            <ul className="text-sm text-neutral-400 space-y-3 uppercase tracking-widest text-[11px]">
                <li>• Orders are processed within 24–48 hours</li>
                <li>• Business days exclude Sundays and public holidays</li>
            </ul>
            <p className="text-[10px] text-neutral-600 italic uppercase">Once processed, your order is handed over to our verified logistics partners.</p>
          </div>
        </section>

        {/* Delivery Timelines */}
        <section className="md:col-span-2 p-8 border border-neutral-900 bg-black space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-neutral-900 rounded">
                    <Truck className="text-accent" size={20} />
                </div>
                <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Delivery Timelines</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400">Metro Cities</span>
                        <span className="text-xs font-bold text-accent">2–4 Business Days</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400">Other Locations</span>
                        <span className="text-xs font-bold text-accent">3–7 Business Days</span>
                    </div>
                </div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest leading-loose self-center">
                    Delivery timelines may vary slightly based on your location and external factors.
                </div>
            </div>
        </section>

        {/* Tracking */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <Search className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Transmission & Tracking</h2>
          </div>
          <div className="space-y-4 text-sm text-neutral-400 uppercase tracking-widest text-[11px]">
            <p>Once dispatched, coordinates will be shared:</p>
            <ul className="space-y-2">
                <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent" />
                    <span>Tracking details via SMS/Email</span>
                </li>
                <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-accent" />
                    <span>Accessible via <Link to="/console/orders" className="text-white border-b border-white/20">Customer Order History</Link></span>
                </li>
            </ul>
          </div>
        </section>

        {/* Payment */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-neutral-900 rounded">
                <CreditCard className="text-accent" size={20} />
            </div>
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Payment & Confirmation</h2>
          </div>
          <div className="space-y-4 text-sm text-neutral-400 uppercase tracking-widest text-[11px]">
            <p>All payments are securely processed via <span className="text-white italic">PhonePe</span>.</p>
            <ul className="space-y-1">
                <li>• Confirmed only after successful payment</li>
                <li>• Confirmation sent once verified</li>
            </ul>
          </div>
        </section>

        {/* Delivery Notes */}
        <section className="md:col-span-2 bg-white/5 border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-neutral-900 rounded">
                    <AlertTriangle className="text-accent" size={20} />
                </div>
                <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Delivery Notes</h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] text-neutral-400 uppercase tracking-widest font-medium">
                <li className="space-y-2">
                    <span className="text-white">Accuracy</span>
                    <p>Please ensure your address and contact details are accurate</p>
                </li>
                <li className="space-y-2">
                    <span className="text-white">Contact</span>
                    <p>Delivery partners may contact you before delivery</p>
                </li>
                <li className="space-y-2">
                    <span className="text-white">Attempts</span>
                    <p>In case of failed delivery attempts, re-delivery will be initiated</p>
                </li>
            </ul>
        </section>

        {/* Packaging */}
        <section className="md:col-span-2 p-12 bg-accent/5 border border-accent/20 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-shrink-0">
                <Package className="text-accent" size={80} strokeWidth={1} />
            </div>
            <div className="space-y-4">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Packaging</h3>
                <p className="text-sm text-neutral-300 leading-relaxed uppercase tracking-wider">
                    Your order arrives in a reusable packaging unit. Designed to go beyond delivery — repurpose it for storage, organization, or everyday use.
                </p>
                <p className="text-[10px] uppercase tracking-widest italic font-bold">
                  <span className="text-white">Built for a </span>
                  <Link to="/#second-life" className="text-accent hover:underline decoration-accent/30 underline-offset-4 transition-all">
                    second life
                  </Link>.
                </p>
            </div>
        </section>

        {/* Built Without Waste */}
        <section className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-neutral-900 rounded">
                    <Leaf className="text-accent" size={20} />
                </div>
                <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Built Without Waste</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6 text-sm text-neutral-400 leading-relaxed uppercase tracking-wider text-[11px]">
                    <p>Every Chils & Co shipment is designed to minimize waste and extend utility beyond delivery.</p>
                    <ul className="space-y-2">
                        <li>• No plastic is used in our packaging</li>
                        <li>• Durable cardboard box with recyclable outer wrap</li>
                        <li>• Internal partitions designed for secondary use</li>
                        <li>• Hem tag doubles as a bookmark</li>
                    </ul>
                </div>
                <div className="p-8 border border-neutral-900 bg-black flex flex-col justify-center items-center text-center">
                    <p className="text-lg font-display italic leading-tight">
                        "This isn’t just packaging — it’s a system <span className="text-white">built for a </span>
                        <Link to="/#second-life" className="text-accent hover:underline transition-all">
                          second life
                        </Link>."
                    </p>
                </div>
            </div>
        </section>

        {/* Delays */}
        <section className="md:col-span-2 p-8 border border-neutral-900 bg-black space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                    <RefreshCcw className="text-neutral-700" size={24} />
                    <h3 className="text-[11px] tracking-[0.5em] font-bold uppercase text-neutral-500">Operational Exceptions</h3>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    {['Weather', 'Logistics', 'Restrictions', 'High Volume'].map(reason => (
                        <span key={reason} className="text-[9px] px-3 py-1 border border-neutral-800 rounded-full text-neutral-600 uppercase tracking-widest">{reason}</span>
                    ))}
                </div>
            </div>
            <div className="pt-4 border-t border-neutral-900 text-center">
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] leading-relaxed max-w-2xl mx-auto italic">
                    Delivery timelines are estimates. Dispatch may occasionally be affected by weather conditions, logistics disruptions, public restrictions, or high order volumes. We will keep you updated through every phase.
                </p>
            </div>
        </section>

        {/* Team Note */}
        <section className="md:col-span-2 py-16 flex flex-col items-center text-center space-y-8">
            <Handshake className="text-accent" size={48} strokeWidth={1} />
            <div className="max-w-xl space-y-4">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">A Note from Us</h3>
                <p className="text-2xl font-display font-bold tracking-tighter uppercase italic">
                    "From the moment you place an order to the moment it reaches you, every step is handled with care."
                </p>
                <p className="text-sm text-neutral-500 uppercase tracking-widest leading-loose">
                    We don’t just ship products — we deliver something that’s been thought through, tested, and built with intention.<br/>
                    Thank you for your patience and trust.
                </p>
            </div>
        </section>

        {/* Need Help */}
        <section className="md:col-span-2 flex flex-col items-center pt-12 border-t border-neutral-900">
            <div className="bg-black border border-neutral-900 p-8 flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="p-4 bg-accent/10 rounded-full">
                    <Mail className="text-accent" size={24} />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest mb-1">Need Help?</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Our support team is here to help root-to-end.</p>
                </div>
                <a 
                    href={`mailto:${settings.email}`} 
                    className="whitespace-nowrap flex items-center gap-2 group text-[11px] font-bold uppercase tracking-[0.3em] text-white hover:text-accent transition-colors"
                >
                    Contact: {settings.email} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Shipping;
