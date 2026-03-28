import { useState } from 'react';
import { useCart } from '../CartContext';

export const useCheckout = () => {
  const { totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerCheckout = async (customAmount?: number) => {
    const amountToPay = customAmount || totalPrice;
    if (amountToPay <= 0) return;

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountToPay })
      });
      const order = await response.json();

      // 2. Trigger Razorpay Placeholder Modal
      // In a real app, you'd load Razorpay script and call window.Razorpay
      alert(`RAZORPAY MOCK MODAL\n\nOrder ID: ${order.id}\nAmount: ₹${amountToPay}\n\nProceeding with mock payment...`);

      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          alert("Payment Successful (Test Mode)");
          clearCart();
          setIsProcessing(false);
          resolve(true);
        }, 1500);
      });

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      return false;
    }
  };

  return { triggerCheckout, isProcessing };
};
