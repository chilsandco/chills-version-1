import React from 'react';
import { metaPageView } from './lib/track';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import { WishlistProvider } from './WishlistContext';
import Navbar from './components/Navbar';
import PromoBar from './components/PromoBar';
import { Deferred } from './components/Deferred';
import PageLoader from './components/PageLoader';
import Footer from './components/Footer';
import SmoothScroll from './components/SmoothScroll';
import Home from './pages/Home';

/** Pages load on demand so a phone only downloads the screen it opens. A tab left open
 *  across a deploy can ask for an old file, so it refreshes once instead of going blank. */
const page = (load: () => Promise<{ default: React.ComponentType<any> }>) =>
  React.lazy(() => load().then(m => { sessionStorage.removeItem('page-retry'); return m; }).catch(err => {
    if (sessionStorage.getItem('page-retry')) throw err;
    sessionStorage.setItem('page-retry', '1');
    window.location.reload();
    return new Promise<never>(() => {});
  }));

const Collection = page(() => import('./pages/Collection'));
const Combos = page(() => import('./pages/Combos'));
const Runway = page(() => import('./pages/Runway'));
const OurPromise = page(() => import('./pages/OurPromise'));
const ProductDetail = page(() => import('./pages/ProductDetail'));
const Checkout = page(() => import('./pages/Checkout'));
const OrderSuccess = page(() => import('./pages/OrderSuccess'));
const OrderSignals = page(() => import('./pages/OrderSignals'));
const SignalDetails = page(() => import('./pages/SignalDetails'));
const Onboarding = page(() => import('./pages/Onboarding'));
const Wishlist = page(() => import('./pages/Wishlist'));
const ReturnRequest = page(() => import('./pages/ReturnRequest'));
const Returns = page(() => import('./pages/Returns'));
const Shipping = page(() => import('./pages/Shipping'));
const Support = page(() => import('./pages/Support'));
const PrivacyPolicy = page(() => import('./pages/PrivacyPolicy'));
const TermsConditions = page(() => import('./pages/TermsConditions'));
const Auth = page(() => import('./pages/Auth'));
const Bespoke = page(() => import('./pages/Bespoke'));
const BespokeSignals = page(() => import('./pages/BespokeSignals'));
const AdminConfig = page(() => import('./pages/AdminConfig'));
const AiVisits = page(() => import('./pages/AiVisits'));
const AmazonConsole = page(() => import('./pages/AmazonConsole'));
const CoCreator = page(() => import('./pages/CoCreator'));
const SocialVault = page(() => import('./pages/SignalNetwork'));
const CustomStudio = page(() => import('./pages/CustomStudio'));

// Internal admin tools keep the original dark console look
const DARK_PREFIXES = ['/console/amazon', '/admin'];

function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const dark = DARK_PREFIXES.some(p => pathname.startsWith(p));
  React.useEffect(() => { metaPageView(); }, [pathname]);
  return (
    <div className={`${dark ? 'bg-black text-white selection:bg-white selection:text-black' : 'theme-light'} min-h-screen flex flex-col overflow-x-clip w-full max-w-full`} style={{ paddingTop: 'var(--promo-h, 0px)' }}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <SmoothScroll>
            <Shell>
              <PromoBar />
              <Navbar />
              <main className="flex-grow">
                <React.Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/collection" element={<Collection />} />
                  <Route path="/combos" element={<Combos />} />
                  <Route path="/pick-your-three" element={<Runway />} />
                  <Route path="/our-promise" element={<OurPromise />} />
                  <Route path="/shop-the-look" element={<Navigate to="/pick-your-three" replace />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/console/orders" element={<OrderSignals />} />
                  <Route path="/console/orders/:id" element={<SignalDetails />} />
                  <Route path="/console/orders/:id/return" element={<ReturnRequest />} />
                  <Route path="/returns-refunds" element={<Returns />} />
                  <Route path="/shipping-delivery" element={<Shipping />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/bespoke" element={<Bespoke />} />
                  <Route path="/co-creator" element={<CoCreator />} />
                  <Route path="/customize" element={<CustomStudio />} />
                  <Route path="/social-vault" element={<SocialVault />} />
                  <Route path="/console/bespoke" element={<BespokeSignals />} />
                  <Route path="/console/amazon" element={<AmazonConsole />} />
                  <Route path="/admin/config" element={<AdminConfig />} />
                  <Route path="/admin/ai-visits" element={<AiVisits />} />
                </Routes>
                </React.Suspense>
              </main>
              <Footer />
              {/* not needed for the first paint: loaded when first opened, or once the page is idle */}
              <Deferred load={() => import('./components/QuickView')} wakeOn={['quick-view']} />
              <Deferred load={() => import('./components/BagDrawer')} wakeOn={['bag-open']} />
              <Deferred load={() => import('./components/Assistant')} />
            </Shell>
          </SmoothScroll>
        </Router>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
);
}
