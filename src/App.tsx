import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import { WishlistProvider } from './WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderSignals from './pages/OrderSignals';
import SignalDetails from './pages/SignalDetails';
import Onboarding from './pages/Onboarding';
import Wishlist from './pages/Wishlist';
import ReturnRequest from './pages/ReturnRequest';
import Returns from './pages/Returns';
import Shipping from './pages/Shipping';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Auth from './pages/Auth';
import Bespoke from './pages/Bespoke';
import BespokeSignals from './pages/BespokeSignals';
import CoCreator from './pages/CoCreator';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgress from './components/ScrollProgress';
import CustomCursor from './components/CustomCursor';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <SmoothScroll>
            <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black lg:cursor-none">
              <CustomCursor />
              <ScrollProgress />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/collection" element={<Collection />} />
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
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/bespoke" element={<Bespoke />} />
                  <Route path="/co-creator" element={<CoCreator />} />
                  <Route path="/console/bespoke" element={<BespokeSignals />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </SmoothScroll>
        </Router>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
);
}
