import React from 'react';
import InfoPage, { Section } from '../components/InfoPage';

/** Returns, in plain words. The rules are unchanged from the original page. */
const Returns: React.FC = () => (
  <InfoPage
    seo={{ title: 'Returns & refunds', description: 'Return within 7 days of delivery for a refund, exchange or store credit. Refunds reach your PhonePe or original payment method in 3–7 business days.', canonical: 'https://chilsandco.com/returns-refunds' }}
    eyebrow="Returns & refunds"
    title="If something isn’t right"
    intro="Size not quite right, or something wrong with your order? Here’s how we’ll sort it out."
    facts={[
      { value: '7 days', label: 'From delivery to ask' },
      { value: '3 options', label: 'Refund, exchange or credit' },
      { value: '3–7 days', label: 'Business days for a refund' },
      { value: 'Before dispatch', label: 'To cancel an order' },
    ]}
    related={[{ to: '/console/orders', label: 'My orders' }, { to: '/shipping-delivery', label: 'Shipping & delivery' }]}
  >
    <Section title="What you can return">
      <ul>
        <li><strong>Size or fit</strong> that isn’t right for you. We’re always happy to help with this.</li>
        <li>A <strong>damaged</strong> product</li>
        <li>The <strong>wrong item</strong></li>
        <li>A genuine <strong>quality concern</strong></li>
      </ul>
      <p>Requests that aren’t about size are looked at one by one.</p>
    </Section>
    <Section title="What we can’t take back">
      <ul>
        <li>Tees that have been worn or washed</li>
        <li>Tees with the tags or trims removed</li>
        <li>Damage that happened after delivery</li>
        <li>Requests made more than 7 days after delivery</li>
      </ul>
    </Section>
    <Section title="How to ask for a return">
      <ul>
        <li>Go to <strong>My orders</strong> and choose the order.</li>
        <li>Tap <strong>Return item</strong>.</li>
        <li>Tell us the reason, add a short description and up to <strong>3 photos</strong>.</li>
      </ul>
      <p>Photos are needed for damaged items, wrong items and quality concerns. They help us sort it out faster.</p>
    </Section>
    <Section title="What happens next">
      <p>Our team reviews every request. Depending on the issue and what’s in stock, we’ll offer a <strong>refund, an exchange or store credit</strong>.</p>
      <p>If your return is approved, we’ll email you the pickup details. Pickup depends on the courier serving your area.</p>
    </Section>
    <Section title="Refunds">
      <p>Once the tee is back with us and checked, we refund it to your <strong>PhonePe or original payment method</strong>. It usually arrives in <strong>3–7 business days</strong>.</p>
    </Section>
    <Section title="Cancelling an order">
      <p>You can cancel any time <strong>before we dispatch it</strong>. Once it has shipped, it can’t be cancelled, but you can still return it under the rules above.</p>
    </Section>
  </InfoPage>
);

export default Returns;
