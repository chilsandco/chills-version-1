import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useProducts } from '../hooks/useProducts';
import { small } from '../data/studio';
import SEO from '../components/SEO';
import Snowflake from '../components/Snowflake';

/** Where approved Co-Creators send their designs. */
const SUBMIT_FORM = 'https://forms.gle/mL3jdNzUnwXsSbWp8';

const STEPS = [
  { title: 'Pick a creator name', text: 'It goes on every tee you design, like a signature.' },
  { title: 'Design it', text: 'Use AI, a tablet or pen and paper. The tools are up to you.' },
  { title: 'Send it to us', text: 'We review every design for fit with the brand and how well it will print.' },
  { title: 'We make it', text: 'Approved designs go into limited runs. We handle printing, quality checks and delivery.' },
  { title: 'You earn', text: '5% of every tee sold, tracked and visible to you.' },
];

const FACTS = [
  { value: '5%', label: 'Of every tee sold' },
  { value: 'Your name', label: 'On every design' },
  { value: 'Any tools', label: 'AI or by hand' },
  { value: 'No contracts', label: 'No middlemen' },
];

/** Co-Creators: design a tee, we make and sell it, you earn from every one sold. */
const CoCreator: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { products } = useProducts();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [joinedNow, setJoinedNow] = useState(() => sessionStorage.getItem('chils_cocreator_interest') === 'true');
  const [stats, setStats] = useState<{ coCreators: number } | null>(null);

  const joined = !!user?.coCreatorInterest || joinedNow;

  useEffect(() => {
    const load = () => fetch('/api/stats').then(r => r.json()).then(d => { if (d) setStats(d); }).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  // signed-in shoppers: fill the form and check whether they've already joined
  useEffect(() => {
    if (!user?.email) return;
    setEmail(e => e || user.email);
    if (user.pseudoName) setName(n => n || user.pseudoName!);
    fetch('/api/cocreator/check-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email }) })
      .then(r => r.json())
      .then(d => {
        if (d.pseudoName) setName(d.pseudoName);
        if (d.coCreatorInterest) {
          setJoinedNow(true);
          sessionStorage.setItem('chils_cocreator_interest', 'true');
          updateUser({ coCreatorInterest: true, pseudoName: d.pseudoName });
        }
      })
      .catch(() => {});
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/cocreator/interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, pseudoName: name }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong. Please try again.'); return; }
      setJoinedNow(true);
      sessionStorage.setItem('chils_cocreator_interest', 'true');
      setStats(s => (s ? { ...s, coCreators: s.coCreators + 1 } : s));
      updateUser(data.user ?? { coCreatorInterest: true, pseudoName: name });
    } catch {
      setError('We couldn’t reach the server. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  // tees already designed by Co-Creators, as proof it's real
  const coCreated = useMemo(
    () => products.filter(p => p.coCreator && p.type !== 'grouped' && p.status === 'Available' && p.images?.length).slice(0, 4),
    [products]
  );

  return (
    <div className="bg-[#f3f2ee] text-ink pt-24 md:pt-32 pb-20 min-h-screen">
      <SEO
        title="Co-Creator"
        description="Design a tee with CHILS & CO. We make it and sell it, and you earn 5% of every one sold. No contracts, any tools."
        canonical="https://chilsandco.com/co-creator"
      />
      <div className="max-w-[1080px] mx-auto px-3 md:px-6">
        {/* hero */}
        <header className="px-2 md:text-center md:max-w-[760px] md:mx-auto mb-8 md:mb-12">
          <p className="eyebrow text-neutral-500 mb-3 inline-flex items-center gap-2"><Snowflake className="w-3 h-3.5" /> Co-Creator</p>
          <h1 className="text-[38px] md:text-[64px] leading-[1.02] font-semibold tracking-[-0.035em]">Design a tee with us.</h1>
          <p className="mt-3 md:mt-5 text-neutral-600 md:text-lg">You design it. We make it and sell it. You earn 5% of every one sold.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 md:justify-center">
            <a href="#join" className="inline-flex items-center gap-2 bg-ink text-[#fff] rounded-full px-6 py-3.5 text-sm font-medium">
              {joined ? 'You’re a Co-Creator' : 'Become a Co-Creator'} <ArrowRight size={15} />
            </a>
            {stats && <span className="text-sm text-neutral-500">{stats.coCreators} creators so far</span>}
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {FACTS.map(f => (
            <div key={f.label} className="bg-[#fff] rounded-2xl p-5">
              <p className="text-[22px] md:text-[28px] font-semibold leading-tight tracking-[-0.02em]">{f.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{f.label}</p>
            </div>
          ))}
        </div>

        {/* how it works */}
        <section className="bg-[#fff] rounded-2xl p-5 md:p-8 mb-2">
          <h2 className="text-xl md:text-2xl font-semibold mb-5 md:mb-7">How it works</h2>
          <ol className="grid md:grid-cols-5 gap-5 md:gap-6">
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

        {/* proof */}
        {coCreated.length > 0 && (
          <section className="bg-[#fff] rounded-2xl p-5 md:p-8 mb-2">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <h2 className="text-xl md:text-2xl font-semibold">Already in the store</h2>
              <Link to="/collection" className="text-sm border-b border-ink pb-0.5 shrink-0">Shop all</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-4">
              {coCreated.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="block min-w-0">
                  <span className="block aspect-[3/4] rounded-lg overflow-hidden bg-[#e4e3df]">
                    <img src={small(p.images[0])} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                  </span>
                  <span className="block text-[13px] font-medium truncate mt-2 px-1">{p.name}</span>
                  <span className="block text-xs text-neutral-500 px-1">Designed by {p.coCreator}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* send a design */}
        <section className="bg-[#fff] rounded-2xl p-5 md:p-8 mb-2 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold">Send us a design</h2>
            <p className="text-neutral-600 mt-1 max-w-[560px]">
              {joined
                ? 'Share your creator name, the idea behind the design and your artwork or renders. We read every one.'
                : 'Join as a Co-Creator first. Once you have, you can send us designs straight away.'}
            </p>
          </div>
          {joined ? (
            <a href={SUBMIT_FORM} target="_blank" rel="noopener noreferrer" className="mt-4 md:mt-0 shrink-0 inline-flex items-center gap-2 bg-ink text-[#fff] rounded-full px-6 py-3.5 text-sm font-medium">
              Submit a design <ArrowRight size={15} />
            </a>
          ) : (
            <a href="#join" className="mt-4 md:mt-0 shrink-0 inline-flex items-center gap-2 border border-ink rounded-full px-6 py-3.5 text-sm font-medium">Join first <ArrowRight size={15} /></a>
          )}
        </section>

        {/* join */}
        <section id="join" className="bg-ink text-[#fff] rounded-2xl p-6 md:p-10 scroll-mt-24">
          {joined ? (
            <div className="md:text-center">
              <span className="inline-flex w-11 h-11 rounded-full bg-[#fff] text-ink items-center justify-center"><Check size={20} /></span>
              <h2 className="text-2xl md:text-4xl font-semibold mt-4">You’re a Co-Creator{name ? `, ${name}` : ''}.</h2>
              <p className="text-[#fff]/60 mt-2">Send us your first design whenever you’re ready. We’ll be in touch by email.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-4xl font-semibold">Become a Co-Creator</h2>
              <p className="text-[#fff]/60 mt-2">It’s free and takes a few seconds.</p>
              <form onSubmit={join} className="mt-6 grid md:grid-cols-[1fr_1fr_auto] gap-2">
                <label className="block">
                  <span className="sr-only">Creator name</span>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Creator name" autoComplete="nickname" className="w-full h-12 px-4 rounded-full bg-[#fff] text-ink text-[16px] outline-none placeholder:text-neutral-400" />
                </label>
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className="w-full h-12 px-4 rounded-full bg-[#fff] text-ink text-[16px] outline-none placeholder:text-neutral-400" />
                </label>
                <button type="submit" disabled={sending} className="h-12 px-7 rounded-full bg-[#fff] text-ink text-sm font-medium disabled:opacity-60 cursor-pointer">
                  {sending ? 'Joining…' : 'Join'}
                </button>
              </form>
              {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default CoCreator;
