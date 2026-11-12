import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MessageCircle, Phone } from 'lucide-react';
import SEO from './SEO';

export type Contact = { email: string; mobileLink: string; address: string };

const DEFAULT_CONTACT: Contact = {
  email: 'hello.chilsandco@gmail.com',
  mobileLink: '+91 7842 07 0404',
  address: '3rd Floor, Plot No. 38 & 39\nMatrusri Nagar, Miyapur\nHyderabad, Telangana – 500049\nIndia',
};

/** The store's contact details, kept in one place on the server. */
export function useContact() {
  const [contact, setContact] = useState<Contact>(DEFAULT_CONTACT);
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d?.mobileLink) setContact(c => ({ ...c, ...d })); })
      .catch(() => {});
  }, []);
  return contact;
}

export const whatsappLink = (phone: string, text = 'Hi CHILS & CO., I have a question.') =>
  `https://wa.me/${phone.replace(/\D/g, '').replace(/^(?!91)/, '91')}?text=${encodeURIComponent(text)}`;

/** A short fact shown as a card at the top of a help page. */
export const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-[#fff] rounded-2xl p-5">
    <p className="text-[22px] md:text-[26px] font-semibold leading-tight tracking-[-0.02em]">{value}</p>
    <p className="text-sm text-neutral-500 mt-1">{label}</p>
  </div>
);

/** One topic on a help page: a heading and plain sentences or a short list. */
export const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-[#fff] rounded-2xl p-5 md:p-7">
    <h2 className="text-lg md:text-xl font-semibold mb-3">{title}</h2>
    <div className="text-[15px] leading-relaxed text-neutral-600 space-y-2 [&_ul]:space-y-1.5 [&_li]:pl-4 [&_li]:relative [&_li]:before:content-['·'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-ink [&_strong]:text-ink [&_strong]:font-medium">
      {children}
    </div>
  </section>
);

/** The ways to reach a real person, shown at the end of every help page. */
export const HelpBox: React.FC<{ contact: Contact }> = ({ contact }) => (
  <section className="bg-ink text-[#fff] rounded-2xl p-6 md:p-8">
    <h2 className="text-xl md:text-2xl font-semibold">Still have a question?</h2>
    <p className="text-[#fff]/60 mt-1">Real people, Monday to Saturday, 10 AM to 6 PM.</p>
    <div className="mt-5 flex flex-wrap gap-2">
      <a href={whatsappLink(contact.mobileLink)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#fff] text-ink rounded-full px-5 py-3 text-sm font-medium"><MessageCircle size={15} /> WhatsApp us</a>
      <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 border border-[#fff]/30 rounded-full px-5 py-3 text-sm"><Mail size={15} /> Email</a>
      <a href={`tel:${contact.mobileLink.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 border border-[#fff]/30 rounded-full px-5 py-3 text-sm"><Phone size={15} /> Call</a>
    </div>
  </section>
);

/** Plain, friendly help pages: what you need to know, in the order you need it. */
const InfoPage: React.FC<{
  seo: { title: string; description: string; canonical: string };
  eyebrow: string;
  title: string;
  intro: string;
  facts?: { label: string; value: string }[];
  related?: { to: string; label: string }[];
  children: React.ReactNode;
}> = ({ seo, eyebrow, title, intro, facts, related, children }) => {
  const contact = useContact();
  return (
    <div className="bg-paper text-ink pt-24 md:pt-32 pb-20 min-h-screen">
      <SEO title={seo.title} description={seo.description} canonical={seo.canonical} />
      <div className="max-w-[880px] mx-auto px-3 md:px-6">
        <header className="px-2 mb-6 md:mb-10">
          <p className="eyebrow text-neutral-500 mb-3">{eyebrow}</p>
          <h1 className="text-[34px] md:text-[56px] leading-[1.04] font-semibold tracking-[-0.03em]">{title}</h1>
          <p className="mt-3 md:mt-4 text-neutral-600 md:text-lg max-w-[620px]">{intro}</p>
        </header>
        {facts && <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">{facts.map(f => <Fact key={f.label} {...f} />)}</div>}
        <div className="space-y-2">
          {children}
          <HelpBox contact={contact} />
        </div>
        {related && (
          <nav className="px-2 mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {related.map(r => <Link key={r.to} to={r.to} className="link-brass inline-flex items-center gap-1.5">{r.label} <ArrowRight size={13} /></Link>)}
          </nav>
        )}
      </div>
    </div>
  );
};

export default InfoPage;
