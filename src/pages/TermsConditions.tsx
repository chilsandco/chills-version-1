import React from 'react';
import { Link } from 'react-router-dom';
import InfoPage, { Section } from '../components/InfoPage';

/** Terms & conditions. Same terms as before (last updated 11 May 2026), in the help-page layout. */
const TermsConditions: React.FC = () => (
  <InfoPage
    seo={{
      title: 'Terms & conditions',
      description: 'The terms for using the CHILS & CO. website and buying from us, set by Chilamkuri Ventures.',
      canonical: 'https://chilsandco.com/terms-conditions',
    }}
    eyebrow="Terms & conditions · Last updated 11 May 2026"
    title="The terms, in plain sight"
    intro="These terms cover your use of the CHILS & CO. website and everything you buy from us."
    facts={[
      { value: 'INR', label: 'All prices' },
      { value: '7 days', label: 'To ask for a return' },
      { value: 'Before dispatch', label: 'To cancel an order' },
      { value: 'Hyderabad', label: 'Jurisdiction' },
    ]}
    related={[{ to: '/privacy-policy', label: 'Privacy policy' }, { to: '/returns-refunds', label: 'Returns & refunds' }, { to: '/shipping-delivery', label: 'Shipping & delivery' }]}
  >
    <Section title="1. Introduction">
      <p>Welcome to CHILS & CO. These Terms & Conditions govern your access to and use of the CHILS & CO. website, products, services and related experiences.</p>
      <p>By using this website, you agree to these terms, along with our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>, <Link to="/shipping-delivery" className="underline">Shipping & Delivery Policy</Link> and <Link to="/returns-refunds" className="underline">Returns & Refunds Policy</Link>.</p>
      <p>CHILS & CO. is a brand operated by <strong>Chilamkuri Ventures</strong>. If you don’t agree with any part of these terms, please don’t use the website.</p>
    </Section>

    <Section title="2. Who can use the website">
      <p>By using the website, you confirm that you:</p>
      <ul>
        <li>Are legally able to enter into a binding agreement</li>
        <li>Have given accurate and complete information</li>
        <li>Will follow all applicable laws</li>
      </ul>
    </Section>

    <Section title="3. Products and availability">
      <ul>
        <li>Colours may look slightly different because of screen differences.</li>
        <li>Availability can change without notice.</li>
        <li>We may change or discontinue products at any time.</li>
      </ul>
    </Section>

    <Section title="4. Pricing and payments">
      <ul>
        <li>Prices are in <strong>Indian Rupees (INR)</strong> unless stated otherwise.</li>
        <li>Payments are processed securely through <strong>PhonePe</strong>.</li>
        <li>We may cancel orders placed at a price shown in error because of a technical problem.</li>
      </ul>
    </Section>

    <Section title="5. Shipping and delivery">
      <p>Timelines and estimates are in our <Link to="/shipping-delivery" className="underline">Shipping & Delivery Policy</Link>. We aim to be accurate, but things outside our control, such as weather or courier delays, can occasionally slow a delivery.</p>
    </Section>

    <Section title="6. Returns and refunds">
      <p>Covered by our <Link to="/returns-refunds" className="underline">Returns & Refunds Policy</Link>. Requests must be made <strong>within 7 days of delivery</strong>. Orders can only be cancelled <strong>before dispatch</strong>.</p>
    </Section>

    <Section title="7. Intellectual property">
      <p>All content, including branding, product concepts, designs, logos, creative direction and visual assets, is the intellectual property of CHILS & CO. / Chilamkuri Ventures. Copying it or using it commercially without permission is strictly prohibited.</p>
    </Section>

    <Section title="8. Using the website fairly">
      <p>You agree not to misuse the website, try to gain unauthorised access, or interfere with its security. We may restrict access if we detect misuse.</p>
    </Section>

    <Section title="9. Limitation of liability">
      <p>CHILS & CO. is not liable for indirect damages, technical interruptions, or loss arising from misuse of the website. You use the website at your own discretion.</p>
    </Section>

    <Section title="10. Governing law">
      <p>These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of the courts in <strong>Hyderabad, Telangana</strong>.</p>
    </Section>

    <Section title="Our address">
      <p>Chilamkuri Ventures<br />3rd Floor, Plot No. 38 & 39, Matrusri Nagar, Miyapur<br />Hyderabad, Telangana – 500049, India</p>
    </Section>
  </InfoPage>
);

export default TermsConditions;
