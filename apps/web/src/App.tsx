import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DevModeBanner } from './components/DevModeBanner';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { DevPayPage } from './pages/DevPayPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderLookupPage } from './pages/OrderLookupPage';
import { AdminPage } from './pages/AdminPage';
import { FloatingCart } from './components/FloatingCart';
import { useLanguageStore } from './store/languageStore';

export const App: React.FC = () => {
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-bg text-ink relative">
        <DevModeBanner />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pay/:orderNumber" element={<DevPayPage />} />
            <Route path="/dev/pay/:orderNumber" element={<DevPayPage />} />
            <Route path="/order/:orderNumber" element={<OrderTrackingPage />} />
            <Route path="/check-order" element={<OrderLookupPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
        <FloatingCart />
      </div>
    </BrowserRouter>
  );
};

export default App;
