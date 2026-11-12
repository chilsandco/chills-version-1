import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../AuthContext';
import SEO from '../components/SEO';
import Snowflake from '../components/Snowflake';

const HERO = 'https://res.cloudinary.com/ddatd5ruz/image/upload/v1780123415/the_bespoke_2_eypwhw.png';
const MODEL = 'https://sketchfab.com/models/f66aba2a49064ae7a66afe9bf1613a32/embed?autostart=1&ui_controls=0&ui_infos=0&ui_inspector=0&ui_watermark=0&ui_hint=0&transparent=1';

const STEPS = [
  { title: 'Start with the fabric', text: 'Every shirt begins with carefully chosen material.' },
  { title: 'Build it step by step', text: 'Choose the details one at a time, and see the shirt come together.' },
  { title: 'Made to fit you', text: 'Cut to your measurements for a clean, comfortable fit.' },
];

const SPECS = [
  { label: 'Collar', value: 'Spread' },
  { label: 'Buttons', value: 'Matte resin' },
  { label: 'Fabric', value: 'Oxford weave' },
  { label: 'Stitching', value: '18 per inch' },
];

/** Bespoke: made-to-measure shirts, coming soon, with an early-access list. */
const Bespoke: React.FC = () => {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [found, setFound] = useState<boolean | null>(() => (sessionStorage.getItem('chils_bespoke_waitlist') === 'true' ? true : null));
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('chils_bespoke_unlocked') === 'true');
  const [waiting, setWaiting] = useState<number | null>(null);

  const onList = !!user?.onWaitlist || found === true;
  const approved = !!user?.bespokeUnlocked || unlocked;

  useEffect(() => {
    const load = () => fetch('/api/stats').then(r => r.json()).then(d => { if (d?.waitlistPool != null) setWaiting(d.waitlistPool); }).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const check = async (address: string) => {
    if (!address) return;
    setChecking(true);
    setError('');
    try {
      const res = await fetch('/api/bespoke/check-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: address }) });
      const data = await res.json();
      if (data.onWaitlist) {
        setFound(true);
        setUnlocked(!!data.bespokeUnlocked);
        sessionStorage.setItem('chils_bespoke_waitlist', 'true');
        if (data.bespokeUnlocked) sessionStorage.setItem('chils_bespoke_unlocked', 'true');
        updateUser({ onWaitlist: true, bespokeUnlocked: !!data.bespokeUnlocked });
      } else {
        setFound(false);
      }
    } catch {
      setError('We couldn’t check right now. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  // signed-in shoppers: fill in their email and check straight away
  useEffect(() => {
    if (!user?.email) return;
    setEmail(user.email);
    check(user.email);
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const join = async () => {
    if (!email) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/bespoke/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'We couldn’t add you just now. Please try again.'); return; }
      setFound(true);
      sessionStorage.setItem('chils_bespoke_waitlist', 'true');
      if (!data.isExisting) setWaiting(w => (w == null ? w : w + 1));
      updateUser(data.user ?? { onWaitlist: true });
    } catch {
      setError('We couldn’t reach the server. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#f3f2ee] text-ink pt-24 md:pt-32 pb-20 min-h-screen">
      <SEO
        title="Bespoke"
        description="Shirts made to your measurements, coming soon from CHILS & CO. Join the list for early access."
        canonical="https://chilsandco.com/bespoke"
      />
      <div className="max-w-[1180px] mx-auto px-3 md:px-6">
        {/* hero */}
        <section className="grid md:grid-cols-2 gap-2 mb-2">
          <div className="bg-[#fff] rounded-2xl p-6 md:p-10 flex flex-col justify-center">
            <p className="eyebrow text-neutral-500 mb-3 inline-flex items-center gap-2"><Snowflake className="w-3 h-3.5" /> Bespoke · Coming soon</p>
            <h1 className="text-[38px] md:text-[clamp(40px,5vw,60px)] leading-[1.02] font-semibold tracking-[-0.035em] [overflow-wrap:anywhere] [hyphens:auto]" lang="en">Shirts made to your measurements.</h1>
            <p className="mt-4 text-neutral-600 md:text-lg">Built around your body, your fit and your taste, instead of off the rack. Join the list for early access.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#join" className="inline-flex items-center gap-2 bg-ink text-[#fff] rounded-full px-6 py-3.5 text-sm font-medium">
                {onList ? 'You’re on the list' : 'Join the list'} <ArrowRight size={15} />
              </a>
              {/* like the original page, the count only shows once it is meaningful */}
              {waiting != null && waiting >= 100 && <span className="text-sm text-neutral-500">{waiting} people waiting</span>}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-[#fff] p-3 md:p-5 flex items-center justify-center">
            <img src={HERO} alt="The CHILS & CO. bespoke shirt and its details" className="w-full h-auto max-h-[560px] object-contain" />
          </div>
        </section>

        {/* how it will work */}
        <section className="bg-[#fff] rounded-2xl p-5 md:p-8 mb-2">
          <h2 className="text-xl md:text-2xl font-semibold mb-5 md:mb-7">How it will work</h2>
          <ol className="grid md:grid-cols-3 gap-5 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex md:flex-col gap-4 md:gap-3">
                <span className="w-8 h-8 shrink-0 rounded-full bg-ink text-[#fff] text-sm font-medium flex items-center justify-center">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* the shirt, in 3D */}
        <section className="bg-[#fff] rounded-2xl overflow-hidden mb-2 grid md:grid-cols-[1.4fr_1fr]">
          <div className="relative h-[380px] md:h-[560px] bg-[#f6f6f4]">
            <iframe title="The bespoke shirt in 3D" src={MODEL} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; xr-spatial-tracking" loading="lazy" />
          </div>
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-semibold leading-tight">Turn it around. See how it’s made.</h2>
            <p className="text-neutral-600 mt-3 leading-relaxed">This is the shirt’s actual structure. Every stitch, angle and detail is planned before the first cut.</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
              {SPECS.map(s => (
                <div key={s.label}>
                  <dd className="text-lg font-semibold">{s.value}</dd>
                  <dt className="text-sm text-neutral-500">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* promises */}
        <section className="grid md:grid-cols-2 gap-2 mb-2">
          <div className="bg-[#fff] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold">If it doesn’t fit, we fix it</h2>
            <p className="text-neutral-600 mt-2 leading-relaxed">A made-to-measure shirt sometimes needs a small adjustment. If yours doesn’t fit right, we’ll put it right.</p>
          </div>
          <div className="bg-[#fff] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold">Made with care, in small numbers</h2>
            <p className="text-neutral-600 mt-2 leading-relaxed">Every shirt is cut, stitched and finished carefully, not mass produced. We take a limited number of orders each round.</p>
          </div>
        </section>

        {/* the list */}
        <section id="join" className="bg-ink text-[#fff] rounded-2xl p-6 md:p-10 scroll-mt-24">
          {checking || authLoading ? (
            <p className="text-[#fff]/70">Checking your place on the list…</p>
          ) : approved ? (
            <div>
              <span className="inline-flex w-11 h-11 rounded-full bg-[#fff] text-ink items-center justify-center"><Check size={20} /></span>
              <h2 className="text-2xl md:text-4xl font-semibold mt-4">You’re in.</h2>
              <p className="text-[#fff]/60 mt-2">You’ve been approved for early access. We’re getting the shirt builder ready and will be in touch.</p>
            </div>
          ) : onList ? (
            <div>
              <span className="inline-flex w-11 h-11 rounded-full bg-[#fff] text-ink items-center justify-center"><Check size={20} /></span>
              <h2 className="text-2xl md:text-4xl font-semibold mt-4">You’re on the list.</h2>
              <p className="text-[#fff]/60 mt-2">We’ll email {email || 'you'} as soon as bespoke opens.</p>
              {!user && (
                <button onClick={() => { setFound(null); setEmail(''); sessionStorage.removeItem('chils_bespoke_waitlist'); }} className="mt-4 text-sm border-b border-[#fff]/40 pb-0.5 cursor-pointer">Check a different email</button>
              )}
            </div>
          ) : user ? (
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold">Join the list</h2>
              <p className="text-[#fff]/60 mt-2">We’ll add <span className="text-[#fff]">{user.email}</span> and email you when bespoke opens.</p>
              <button onClick={join} disabled={sending} className="mt-6 h-12 px-7 rounded-full bg-[#fff] text-ink text-sm font-medium disabled:opacity-60 cursor-pointer">
                {sending ? 'Adding you…' : 'Join the list'}
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold">Early access</h2>
              <p className="text-[#fff]/60 mt-2">Already joined? Check with your email. New here? Sign in to join the list.</p>
              <form onSubmit={e => { e.preventDefault(); check(email); }} className="mt-6 grid md:grid-cols-[1fr_auto_auto] gap-2">
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input required type="email" value={email} onChange={e => { setEmail(e.target.value); setFound(null); }} placeholder="Email" autoComplete="email" className="w-full h-12 px-4 rounded-full bg-[#fff] text-ink text-[16px] outline-none placeholder:text-neutral-400" />
                </label>
                <button type="submit" className="h-12 px-6 rounded-full bg-[#fff] text-ink text-sm font-medium cursor-pointer">Check my place</button>
                <Link to="/auth?redirect=/bespoke" className="h-12 px-6 rounded-full border border-[#fff]/30 text-sm font-medium inline-flex items-center justify-center">Sign in to join</Link>
              </form>
              {found === false && email && (
                <p className="mt-4 text-sm text-[#fff]/80">We couldn’t find {email} on the list. <Link to="/auth?redirect=/bespoke" className="underline underline-offset-4">Sign in to join</Link>.</p>
              )}
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </section>
      </div>
    </div>
  );
};

export default Bespoke;
