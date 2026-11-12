import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { btnInk, btnLine } from '../components/OrderUi';

/** Shown once, right after someone creates an account. */
const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const name = user?.first_name || user?.firstName;

  const perks = [
    { icon: Zap, t: 'Faster checkout', d: 'Your details are filled in for you next time.' },
    { icon: Package, t: 'Track every order', d: 'Delivery updates, returns and exchanges, all in My orders.' },
    { icon: Sparkles, t: 'First to know', d: 'Early access to limited drops before they go public.' },
  ];

  return (
    <div className="bg-paper text-ink pt-24 md:pt-32 pb-20 min-h-screen">
      <div className="max-w-[880px] mx-auto px-3 md:px-6">
        <header className="px-2 mb-8 md:mb-12">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="w-14 h-14 rounded-full bg-ink text-[#fff] grid place-items-center mb-6">
            <Check size={26} strokeWidth={2.2} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <p className="eyebrow text-neutral-500 mb-3">Account created</p>
            <h1 className="text-[34px] md:text-[56px] leading-[1.04] font-semibold tracking-[-0.03em]">Welcome to CHILS & CO.{name ? `, ${name}` : ''}</h1>
            <p className="mt-3 md:mt-4 text-neutral-600 md:text-lg max-w-[560px]">Premium tees, designed in Hyderabad for people who build. Here’s what your account gets you.</p>
          </motion.div>
        </header>

        <div className="grid md:grid-cols-3 gap-2">
          {perks.map(({ icon: I, t, d }, i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }} className="bg-[#fff] rounded-2xl p-5 md:p-6">
              <span className="w-10 h-10 rounded-full bg-paper grid place-items-center mb-4"><I size={18} /></span>
              <p className="font-semibold text-lg">{t}</p>
              <p className="text-[15px] text-neutral-600 mt-1 leading-relaxed">{d}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6 px-0">
          <Link to="/collection" className={`${btnInk} sm:flex-1`}>Start shopping <ArrowRight size={15} /></Link>
          <Link to="/pick-your-three" className={`${btnLine} sm:flex-1`}>Pick your three</Link>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
