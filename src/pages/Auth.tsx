import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { ArrowRight, Check, AlertCircle, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SEO from '../components/SEO';
import { Signal } from '../types';
import { Card, StatusPill, Thumb, inr, shortDate, btnInk, btnLine } from '../components/OrderUi';

/** Show/hide password toggle with a small blink while hidden. */
const WinkingEye: React.FC<{ isVisible: boolean; onClick: () => void }> = ({ isVisible, onClick }) => {
  const controls = useAnimation();
  useEffect(() => {
    if (isVisible) return;
    const interval = setInterval(async () => {
      await controls.start({ d: 'M2 11C6 16 18 16 22 11', transition: { duration: 0.12, ease: 'easeInOut' } });
      await controls.start({ d: 'M2 12C5 6 19 6 22 12C19 18 5 18 2 12Z', transition: { duration: 0.12, ease: 'easeInOut' } });
    }, 4500);
    return () => clearInterval(interval);
  }, [isVisible, controls]);
  return (
    <button type="button" onClick={onClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink p-1.5" aria-label={isVisible ? 'Hide password' : 'Show password'}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <motion.circle cx="12" cy="12" r="3" fill="currentColor" animate={isVisible ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }} transition={{ duration: 0.15 }} />
        <motion.path animate={isVisible ? { d: 'M2 11C6 16 18 16 22 11' } : controls} initial={{ d: 'M2 12C5 6 19 6 22 12C19 18 5 18 2 12Z' }} transition={{ duration: 0.2, ease: 'easeInOut' }} />
      </svg>
    </button>
  );
};

const inputCls = 'w-full bg-[#fff] border border-[#e3e0d8] rounded-xl px-4 py-3.5 text-[15px] outline-none focus:border-ink transition-colors placeholder:text-neutral-400';

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <label className="block">
    <span className="block text-sm text-neutral-600 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-xs text-neutral-500 mt-1.5">{hint}</span>}
  </label>
);

const Notice: React.FC<{ tone: 'error' | 'ok'; children: React.ReactNode }> = ({ tone, children }) => (
  <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2.5 ${tone === 'error' ? 'bg-red-50 text-red-800' : 'bg-[#e8efe6] text-[#2f5130]'}`}>
    {tone === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <Check size={16} className="mt-0.5 shrink-0" />}
    <span>{children}</span>
  </div>
);

/** The three most recent orders, with a link to all of them. */
const RecentOrders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => { if (ok && Array.isArray(d)) setOrders(d); })
      .catch(err => console.error('Failed to fetch orders:', err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-sm text-neutral-500">Getting your orders…</p>;
  if (orders.length === 0) {
    return (
      <div>
        <p className="text-[15px] text-neutral-600">No orders yet. When you buy something, it’ll show up here with its tracking.</p>
        <Link to="/collection" className={`${btnInk} mt-4`}>Shop the collection <ArrowRight size={15} /></Link>
      </div>
    );
  }
  return (
    <div>
      <div className="divide-y divide-[#eeece6]">
        {orders.slice(0, 3).map(o => (
          <Link key={o.id} to={`/console/orders/${o.id}`} className="group flex items-center gap-4 py-3 first:pt-0">
            <Thumb src={o.items[0]?.image} alt={o.items[0]?.name || 'Order'} className="w-12 h-16" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{o.items.map(i => i.name).join(', ') || o.signalId}</p>
              <p className="text-sm text-neutral-500">{shortDate(o.date)} · {inr(o.total)}</p>
            </div>
            <span className="hidden sm:block"><StatusPill status={o.status} /></span>
            <ChevronRight size={18} className="text-neutral-400 group-hover:text-ink" />
          </Link>
        ))}
      </div>
      <Link to="/console/orders" className="link-brass inline-flex items-center gap-1.5 text-sm mt-4">
        All orders ({orders.length}) <ArrowRight size={13} />
      </Link>
    </div>
  );
};

const ADMIN_EMAILS = ['chilsandco@gmail.com', 'chilsandco.com@gmail.com'];

const isFlagActive = (val: any, sessionKey?: string) => {
  if (val === true || val === 1 || val === '1') return true;
  if (typeof val === 'string' && ['true', 'yes', 'active', 'on'].includes(val.trim().toLowerCase())) return true;
  return !!(sessionKey && sessionStorage.getItem(sessionKey) === 'true');
};

const Auth: React.FC = () => {
  const { login: authLogin, user, logout, isAuthenticated, token, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  // Most people arriving here already have an account; ?mode=register opens the sign-up form.
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [formData, setFormData] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      const googleResponse = await fetch('/api/auth/google', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await googleResponse.json();
      if (!googleResponse.ok) throw new Error(data.message || 'Google sign-in didn’t work. Please try again.');
      if (!data.token || !data.user) throw new Error('Google sign-in didn’t work. Please try again.');
      authLogin(data.token, data.user);
      navigate(redirectTo || '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      const g = (window as any).google?.accounts?.id;
      if (!g) return;
      g.initialize({ client_id: '162390818288-j2fcothougcpmok54mojqmn7fq2i5goc.apps.googleusercontent.com', callback: handleGoogleCallback });
      const el = document.getElementById('google-btn-container');
      if (el) g.renderButton(el, { theme: 'outline', size: 'large', shape: 'pill', width: Math.min(el.clientWidth || 384, 400), text: isRegister ? 'signup_with' : 'signin_with' });
    };
    if ((window as any).google?.accounts?.id) initializeGoogle();
    else document.querySelector('script[src*="gsi/client"]')?.addEventListener('load', initializeGoogle);
  }, [isRegister, isAuthenticated]);

  // --- Store contact settings (team only) ---
  const [showSettingsEditor, setShowSettingsEditor] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({ mobileLink: '', address: '', coordinates: '', email: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);

  // --- My details ---
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        email: user.email || '',
        phone: user.billing?.phone || (user as any).phone || '',
      });
    }
  }, [user]);

  const isAdmin = user ? ADMIN_EMAILS.some(e => e.toLowerCase() === user.email.toLowerCase()) : false;

  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      fetch('/api/settings').then(r => r.json()).then(d => setGlobalSettings(s => ({ ...s, ...d }))).catch(err => console.error('Failed to load settings:', err));
    }
  }, [isAdmin, isAuthenticated]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'We couldn’t save your details. Please try again.');
      updateUser(data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      let data: any;
      const text = await response.text();
      try { data = text ? JSON.parse(text) : {}; } catch { throw new Error('Something went wrong on our side. Please try again in a minute.'); }

      if (!response.ok) {
        const m = (data.message || '').toLowerCase();
        if (m.includes('password') && m.includes('incorrect')) throw new Error('That password doesn’t match this email. Try again, or reset it below.');
        if (data.code === 'registration-error-email-exists') throw new Error('There’s already an account with this email. Sign in instead.');
        throw new Error(data.message?.replace(/<[^>]+>/g, '') || 'We couldn’t reach the store. Please check your connection.');
      }

      if (isRegister) {
        setSuccess(true);
        try {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, password: formData.password }),
          });
          const loginData = await loginResponse.json();
          if (loginResponse.ok && loginData.token && loginData.user) {
            authLogin(loginData.token, {
              ...loginData.user,
              first_name: loginData.user.first_name || formData.first_name,
              last_name: loginData.user.last_name || formData.last_name,
              firstName: loginData.user.firstName || formData.first_name,
              lastName: loginData.user.lastName || formData.last_name,
            });
            setTimeout(() => navigate(redirectTo || '/onboarding'), 1200);
          } else {
            setTimeout(() => { setIsRegister(false); setSuccess(false); }, 2000);
          }
        } catch {
          setTimeout(() => setIsRegister(false), 2000);
        }
      } else {
        if (!data.token || !data.user) throw new Error('Sign-in didn’t work. Please try again.');
        authLogin(data.token, data.user);
        if (redirectTo) navigate(redirectTo);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    setSettingsMsg(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(globalSettings),
      });
      if (response.ok) setSettingsMsg({ tone: 'ok', text: 'Saved. The site shows the new details now.' });
      else setSettingsMsg({ tone: 'error', text: (await response.json()).message || 'Couldn’t save the settings.' });
    } catch {
      setSettingsMsg({ tone: 'error', text: 'Couldn’t reach the server. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  // ---------- Signed in: the account page ----------
  if (isAuthenticated && user) {
    const name = user.first_name || user.firstName || user.pseudoName || user.username || '';
    const hasCoCreator = isFlagActive(user.coCreatorInterest, 'chils_cocreator_interest');
    const hasWaitlist = isFlagActive(user.onWaitlist, 'chils_bespoke_waitlist');

    return (
      <div className="bg-paper text-ink pt-24 md:pt-32 pb-20 min-h-screen">
        <SEO title="Your account" description="Your CHILS & CO. account: orders, tracking and your details." canonical="https://chilsandco.com/auth" keywords="chils and co account, my orders, track order" />
        <div className="max-w-[1080px] mx-auto px-3 md:px-6">
          <header className="px-2 mb-6 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-ink text-[#fff] grid place-items-center text-2xl font-semibold shrink-0">
                {(name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="eyebrow text-neutral-500 mb-1.5">Your account</p>
                <h1 className="text-[32px] md:text-[48px] leading-[1.04] font-semibold tracking-[-0.03em] truncate">{name ? `Hi ${name}.` : 'Welcome back.'}</h1>
                <p className="text-neutral-500 text-sm mt-1 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={() => logout()} className={`${btnLine} self-start md:self-end`}><LogOut size={15} /> Sign out</button>
          </header>

          {(hasCoCreator || hasWaitlist) && (
            <div className="px-2 mb-4 flex flex-wrap gap-2">
              {hasCoCreator && <span className="text-xs bg-ink text-[#fff] rounded-full px-3 py-1.5">Co-creator{user.pseudoName ? ` · ${user.pseudoName}` : ''}</span>}
              {hasWaitlist && <span className="text-xs bg-[#fff] rounded-full px-3 py-1.5">On The Bespoke waitlist</span>}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-2 items-start">
            <div className="space-y-2 min-w-0">
              <Card title="Recent orders"><RecentOrders /></Card>

              {isAdmin && (
                <Card title="Team">
                  <div className="flex flex-wrap gap-2">
                    <Link to="/console/bespoke" className={btnLine}>Bespoke waitlist</Link>
                    <Link to="/console/amazon" className={btnLine}>Amazon</Link>
                    <Link to="/admin/config" className={btnLine}>Site config</Link>
                    <button onClick={() => { setShowSettingsEditor(v => !v); setSettingsMsg(null); }} className={btnLine}>{showSettingsEditor ? 'Close contact settings' : 'Contact settings'}</button>
                  </div>
                  {showSettingsEditor && (
                    <div className="mt-6 pt-6 border-t border-[#eeece6] space-y-4">
                      <p className="text-sm text-neutral-600">The phone, email and address shown across the site and in the help boxes.</p>
                      <Field label="Phone"><input className={inputCls} value={globalSettings.mobileLink} onChange={e => setGlobalSettings({ ...globalSettings, mobileLink: e.target.value })} placeholder="+91 1234 56 7890" /></Field>
                      <Field label="Support email"><input type="email" className={inputCls} value={globalSettings.email} onChange={e => setGlobalSettings({ ...globalSettings, email: e.target.value })} placeholder="hello@chilsandco.com" /></Field>
                      <Field label="Address"><textarea rows={4} className={`${inputCls} resize-none`} value={globalSettings.address} onChange={e => setGlobalSettings({ ...globalSettings, address: e.target.value })} /></Field>
                      <Field label="Map coordinates" hint="Latitude, longitude"><input className={inputCls} value={globalSettings.coordinates} onChange={e => setGlobalSettings({ ...globalSettings, coordinates: e.target.value })} placeholder="17.4948, 78.3444" /></Field>
                      {settingsMsg && <Notice tone={settingsMsg.tone}>{settingsMsg.text}</Notice>}
                      <button onClick={handleSaveSettings} disabled={saveLoading} className={btnInk}>{saveLoading ? 'Saving…' : 'Save settings'}</button>
                    </div>
                  )}
                </Card>
              )}
            </div>

            <Card title="My details">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name"><input required className={inputCls} value={profileForm.first_name} onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })} autoComplete="given-name" /></Field>
                  <Field label="Last name"><input required className={inputCls} value={profileForm.last_name} onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })} autoComplete="family-name" /></Field>
                </div>
                <Field label="Email"><input type="email" required className={inputCls} value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} autoComplete="email" /></Field>
                <Field label="Phone" hint="Used for delivery updates."><input type="tel" inputMode="tel" placeholder="10-digit mobile" className={inputCls} value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} autoComplete="tel" /></Field>
                {profileError && <Notice tone="error">{profileError}</Notice>}
                {profileSuccess && <Notice tone="ok">Your details are saved.</Notice>}
                <button type="submit" disabled={profileLoading} className={`${btnInk} w-full`}>{profileLoading ? 'Saving…' : 'Save details'}</button>
                <a href="https://api.chilsandco.com/wp-login.php?action=lostpassword" target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-neutral-500 hover:text-ink">Change password</a>
              </form>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Signed out: sign in or create an account ----------
  return (
    <div className="min-h-screen bg-paper text-ink pt-16 md:pt-20 flex flex-col md:flex-row">
      <SEO
        title="Sign in"
        description="Sign in or create a CHILS & CO. account for faster checkout, order tracking and early access to limited drops."
        canonical="https://chilsandco.com/auth"
        keywords="login, sign up, chils and co account"
      />
      <div className="hidden md:flex flex-1 seamless relative overflow-hidden flex-col px-12 lg:px-16 pt-12 lg:pt-16">
        <div className="max-w-md relative z-10 pt-12">
          <p className="eyebrow text-neutral-500 mb-3">CHILS & CO.</p>
          <h2 className="text-5xl lg:text-6xl font-semibold leading-none tracking-[-0.03em]">Welcome in.</h2>
          <ul className="mt-6 space-y-2.5 text-stone text-lg">
            {['Early access to limited drops', 'Faster checkout', 'Every order and its tracking in one place'].map(t => (
              <li key={t} className="flex items-center gap-2.5"><Check size={17} className="text-ink" /> {t}</li>
            ))}
          </ul>
        </div>
        <div className="flex-1 min-h-0 relative mt-8">
          <img src="/looks/1683_3.webp" alt="" className="absolute inset-0 w-full h-full object-contain object-bottom" />
        </div>
      </div>

      <div className="flex-1 flex items-start md:items-center justify-center px-4 py-10 md:p-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
          <div className="mb-6 px-1">
            <h1 className="text-[34px] md:text-[44px] leading-[1.04] font-semibold tracking-[-0.03em]">{isRegister ? 'Create your account' : 'Sign in'}</h1>
            <p className="text-neutral-600 mt-2">{isRegister ? 'Takes a minute. You’ll check out faster next time.' : 'Use the email you ordered with. Your past orders are all here.'}</p>
          </div>

          <div className="bg-[#fff] rounded-2xl p-5 md:p-7">
            <div className="grid grid-cols-2 bg-paper rounded-full p-1 mb-6" role="tablist">
              {[{ k: false, l: 'Sign in' }, { k: true, l: 'Create account' }].map(t => (
                <button key={t.l} type="button" role="tab" aria-selected={isRegister === t.k} onClick={() => { setIsRegister(t.k); setError(null); }}
                  className={`rounded-full py-2.5 text-sm font-medium transition-colors ${isRegister === t.k ? 'bg-ink text-[#fff]' : 'text-neutral-600 hover:text-ink'}`}>
                  {t.l}
                </button>
              ))}
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-ink text-[#fff] grid place-items-center mx-auto mb-4"><Check size={22} /></div>
                <p className="text-lg font-semibold">You’re in.</p>
                <p className="text-[15px] text-neutral-600 mt-1">Setting up your account…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name"><input required className={inputCls} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} autoComplete="given-name" /></Field>
                    <Field label="Last name"><input required className={inputCls} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} autoComplete="family-name" /></Field>
                  </div>
                )}
                <Field label="Email"><input type="email" required className={inputCls} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} autoComplete="email" /></Field>
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm text-neutral-600">Password</span>
                    {!isRegister && (
                      <a href="https://api.chilsandco.com/wp-login.php?action=lostpassword" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-ink">Forgot password?</a>
                    )}
                  </div>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required aria-label="Password" className={`${inputCls} pr-12`} value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })} autoComplete={isRegister ? 'new-password' : 'current-password'} />
                    <WinkingEye isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} />
                  </div>
                </div>

                {error && <Notice tone="error">{error}</Notice>}

                <button type="submit" disabled={loading} className={`${btnInk} w-full`}>
                  {loading ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'} {!loading && <ArrowRight size={15} />}
                </button>

                <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
                  <span className="h-px flex-1 bg-[#eeece6]" /> or <span className="h-px flex-1 bg-[#eeece6]" />
                </div>
                <div id="google-btn-container" className="w-full flex justify-center min-h-[44px]" />
              </form>
            )}
          </div>

          <p className="text-xs text-neutral-500 mt-4 px-1">
            By continuing you agree to our <Link to="/terms-conditions" className="underline">terms</Link> and <Link to="/privacy-policy" className="underline">privacy policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
