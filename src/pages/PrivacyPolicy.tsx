import React from 'react';
import InfoPage, { Section } from '../components/InfoPage';

/** Privacy policy. Same terms as before (last updated 11 May 2026), in the help-page layout. */
const PrivacyPolicy: React.FC = () => (
  <InfoPage
    seo={{
      title: 'Privacy policy',
      description: 'How CHILS & CO. (Chilamkuri Ventures) collects, uses, stores and protects your information when you shop with us.',
      canonical: 'https://chilsandco.com/privacy-policy',
    }}
    eyebrow="Privacy policy · Last updated 11 May 2026"
    title="Your information, handled with care"
    intro="How we collect, use, store and protect your information when you visit our website, place an order or talk to us."
    facts={[
      { value: 'Never', label: 'We sell your data' },
      { value: 'PhonePe', label: 'Handles your payment' },
      { value: 'No card data', label: 'Stored on our servers' },
      { value: 'Ask any time', label: 'To see or delete your data' },
    ]}
    related={[{ to: '/terms-conditions', label: 'Terms & conditions' }, { to: '/returns-refunds', label: 'Returns & refunds' }, { to: '/shipping-delivery', label: 'Shipping & delivery' }]}
  >
    <Section title="Who we are">
      <p>CHILS & CO. is a brand operated by <strong>Chilamkuri Ventures</strong>. At CHILS & CO., privacy is treated with the same intention as the products we build.</p>
      <p>By using our website, you agree to the practices described in this policy.</p>
    </Section>

    <Section title="What we collect">
      <p><strong>When you order or contact us:</strong></p>
      <ul>
        <li>Full name and mobile number</li>
        <li>Email address</li>
        <li>Shipping and billing address</li>
        <li>Payment-related details</li>
        <li>Order history</li>
      </ul>
      <p><strong>Automatically, while you browse:</strong></p>
      <ul>
        <li>IP address and browser type</li>
        <li>Device and operating system</li>
        <li>How you use the website</li>
        <li>Cookies and usage analytics</li>
      </ul>
    </Section>

    <Section title="How we use it">
      <ul>
        <li>To process and deliver your orders</li>
        <li>To send shipping and tracking updates</li>
        <li>To help you when you contact support</li>
        <li>To improve how the website works</li>
        <li>To detect fraud or unauthorised activity</li>
        <li>For messages about your orders</li>
        <li>To meet legal and operational obligations</li>
      </ul>
      <p><strong>We do not sell your personal information.</strong></p>
    </Section>

    <Section title="Payments">
      <p>Payments are processed through <strong>PhonePe</strong> and its infrastructure. We do not store complete debit or credit card numbers, UPI PINs or banking credentials on our servers.</p>
    </Section>

    <Section title="Delivery partners">
      <p>We share only what’s needed to deliver your order (name, address and contact number) with our delivery partners.</p>
    </Section>

    <Section title="Cookies and analytics">
      <p>We use cookies to keep the website working and to improve its performance. You can turn cookies off in your browser settings, though some features may not work as well.</p>
    </Section>

    <Section title="Keeping your data safe">
      <p>We use technical safeguards to protect against unauthorised access. We work hard to keep your data secure, but no method of sending data over the internet is completely safe.</p>
    </Section>

    <Section title="How we contact you">
      <p>We contact you about order confirmations, shipping, returns and support. We don’t send excessive promotional messages.</p>
    </Section>

    <Section title="Your rights">
      <p>You can ask to <strong>see, correct or delete</strong> your personal information. We make reasonable efforts to handle such requests, subject to operational requirements.</p>
      <p>We review this policy from time to time. The date at the top shows when it last changed.</p>
    </Section>

    <Section title="Our address">
      <p>Chilamkuri Ventures<br />3rd Floor, Plot No. 38 & 39, Matrusri Nagar, Miyapur<br />Hyderabad, Telangana – 500049, India</p>
    </Section>
  </InfoPage>
);

export default PrivacyPolicy;
