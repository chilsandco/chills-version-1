import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgress from './components/ScrollProgress';
import CustomCursor from './components/CustomCursor';

export default function App() {
  return (
    <CartProvider>
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
              </Routes>
            </main>
            <Footer />
          </div>
        </SmoothScroll>
      </Router>
    </CartProvider>
  );
}
