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
      const token = localStorage.getItem('chils_auth_token');
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

      // 2. Initiate PhonePe Payment
      const phonePeResponse = await fetch('/api/checkout/phonepe/pay', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          amount: amountToPay,
          merchantTransactionId: order.id,
          merchantUserId: localStorage.getItem('chils_user_id') || 'GUEST',
          mobileNumber: customerDetails.phone
        })
      });

      const paymentData = await phonePeResponse.json();

      if (phonePeResponse.ok && paymentData.success && paymentData.url) {
        // Redirect to PhonePe
        window.location.href = paymentData.url;
        return; // Navigation happens via redirect
      } else {
        throw new Error(paymentData.message || "Payment initialization failed");
      }

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Payment System Offline. Please try again.");
      setIsProcessing(false);
      return false;
    }
  };

  return { triggerCheckout, isProcessing };
};
