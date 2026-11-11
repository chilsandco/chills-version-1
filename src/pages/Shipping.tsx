import React from 'react';
import InfoPage, { Section } from '../components/InfoPage';

/** Delivery, in plain words. The rules are unchanged from the original page. */
const Shipping: React.FC = () => (
  <InfoPage
    seo={{ title: 'Shipping & delivery', description: 'Delivery across India from ₹80. Packed within 24–48 hours, delivered in 2–7 business days, tracked by SMS and email. Free store pickup.', canonical: 'https://chilsandco.com/shipping-delivery' }}
    eyebrow="Shipping & delivery"
    title="How your order gets to you"
    intro="We deliver across India. Here’s what happens from the moment you order to the moment it reaches your door."
    facts={[
      { value: 'All India', label: 'Delivery coverage' },
      { value: 'From ₹80', label: 'Delivery cost' },
      { value: '2–7 days', label: 'Business days to arrive' },
      { value: 'Free', label: 'Pickup from our store' },
    ]}
    related={[{ to: '/returns-refunds', label: 'Returns & refunds' }, { to: '/support', label: 'Support' }]}
  >
    <Section title="When we pack it">
      <p>We pack and hand your order to our courier within <strong>24–48 hours</strong>. Business days don’t include Sundays or public holidays.</p>
    </Section>
    <Section title="How long delivery takes">
      <ul>
        <li><strong>Metro cities:</strong> 2–4 business days</li>
        <li><strong>Everywhere else:</strong> 3–7 business days</li>
      </ul>
      <p>These are estimates. Weather, courier delays, local restrictions or very busy periods can occasionally slow things down, and we’ll keep you posted if that happens.</p>
    </Section>
    <Section title="What delivery costs">
      <p>Delivery starts at <strong>₹80</strong> for up to two items, with a little more for bigger orders. You’ll always see the exact amount at checkout, before you pay.</p>
      <p>Prefer to collect it yourself? <strong>Store pickup in Hyderabad is free.</strong></p>
    </Section>
    <Section title="Paying and confirmation">
      <p>All payments are handled securely by <strong>PhonePe</strong>. Your order is confirmed once the payment goes through, and we send you a confirmation straight away.</p>
    </Section>
    <Section title="Tracking your order">
      <p>Once it’s on its way, we send tracking details by <strong>SMS and email</strong>. You can also find them anytime in <strong>My orders</strong>.</p>
    </Section>
    <Section title="On delivery day">
      <ul>
        <li>Please double-check your address and phone number at checkout.</li>
        <li>The courier may call you before delivering.</li>
        <li>If a delivery attempt fails, the courier will try again.</li>
      </ul>
    </Section>
    <Section title="Our packaging">
      <p>Your tees arrive in a sturdy, reusable box with <strong>no plastic</strong> and a recyclable outer wrap. The partitions inside make it a handy organiser for socks, stationery or cables, and the hem tag works as a bookmark.</p>
    </Section>
  </InfoPage>
);

export default Shipping;
