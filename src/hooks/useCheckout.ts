import { useState } from 'react';
import { useCart } from '../CartContext';

export const useCheckout = () => {
  const { totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerCheckout = async (customerDetails: any, cartItems: any[], customAmount?: number) => {
    const amountToPay = customAmount || totalPrice;
    if (amountToPay <= 0) return;

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const token = localStorage.getItem('token');
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          amount: amountToPay,
          customerDetails,
          lineItems: cartItems
        })
      });
      const order = await response.json();
      
      if (!response.ok) {
        throw new Error(order.message || "Checkout failed");
      }

      // 2. Trigger Razorpay Placeholder Modal
      // In a real app, you'd load Razorpay script and call window.Razorpay
      alert(`RAZORPAY MOCK MODAL\n\nOrder ID: ${order.id}\nAmount: ₹${amountToPay}\n\nProceeding with mock payment...`);

      return new Promise<any>((resolve) => {
        setTimeout(() => {
          clearCart();
          setIsProcessing(false);
          resolve(order);
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
