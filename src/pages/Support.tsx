import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import InfoPage, { Section, useContact, whatsappLink } from '../components/InfoPage';

/** How to reach a real person, in plain words. */
const Support: React.FC = () => {
  const contact = useContact();
  return (
    <InfoPage
      seo={{ title: 'Support', description: 'Talk to the CHILS & CO. team on WhatsApp, email or phone, Monday to Saturday, 10 AM to 6 PM. Based in Miyapur, Hyderabad.', canonical: 'https://chilsandco.com/support' }}
      eyebrow="Support"
      title="We’re here to help"
      intro="Questions about an order, a size or anything else? Message the team directly. Real people, every time."
    >
      <div className="grid md:grid-cols-3 gap-2">
        <a href={whatsappLink(contact.mobileLink)} target="_blank" rel="noopener noreferrer" className="bg-[#fff] rounded-2xl p-5 block">
          <p className="text-sm text-neutral-500">Quickest</p>
          <p className="text-lg font-semibold mt-1">WhatsApp</p>
          <p className="text-sm text-neutral-600 mt-1">{contact.mobileLink}</p>
        </a>
        <a href={`mailto:${contact.email}`} className="bg-[#fff] rounded-2xl p-5 block">
          <p className="text-sm text-neutral-500">For orders and partnerships</p>
          <p className="text-lg font-semibold mt-1">Email</p>
          <p className="text-sm text-neutral-600 mt-1 break-all">{contact.email}</p>
        </a>
        <a href={`tel:${contact.mobileLink.replace(/\s+/g, '')}`} className="bg-[#fff] rounded-2xl p-5 block">
          <p className="text-sm text-neutral-500">Mon–Sat, 10 AM – 6 PM</p>
          <p className="text-lg font-semibold mt-1">Call</p>
          <p className="text-sm text-neutral-600 mt-1">{contact.mobileLink}</p>
        </a>
      </div>
      <Section title="Visit or pick up">
        <p className="whitespace-pre-line">{contact.address}</p>
        <p>Store pickup is free. Choose it at checkout.</p>
      </Section>
      <Section title="Quick answers">
        <div className="flex flex-col gap-2.5 text-ink">
          {[
            { to: '/shipping-delivery', label: 'Delivery times and costs' },
            { to: '/returns-refunds', label: 'Returns, exchanges and refunds' },
            { to: '/console/orders', label: 'Track an order' },
            { to: '/auth', label: 'Your account' },
          ].map(l => (
            <Link key={l.to} to={l.to} className="inline-flex items-center gap-2 w-fit border-b border-ink pb-0.5">{l.label} <ArrowRight size={13} /></Link>
          ))}
        </div>
      </Section>
    </InfoPage>
  );
};

export default Support;
