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
import Auth from './pages/Auth';
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
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/auth" element={<Auth />} />
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
