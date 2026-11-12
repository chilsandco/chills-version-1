import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import { useAuth } from '../AuthContext';
import writeXlsxFile from 'write-excel-file';
import { OrderPage, Card, Spinner, shortDate, btnInk } from '../components/OrderUi';

const ADMIN_EMAILS = ['chilsandco@gmail.com', 'chilsandco.com@gmail.com'];

/** The Bespoke waitlist, for the team: who signed up, and an Excel export. */
const BespokeSignals: React.FC = () => {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const { token, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    fetch('/api/bespoke/list', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setWaitlist(data); })
      .catch(err => console.error('Failed to fetch the bespoke waitlist:', err))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? waitlist.filter(c => [c.email, c.billing_email, c.pseudo_name].some((v: string) => v?.toLowerCase().includes(t))) : waitlist;
  }, [waitlist, q]);

  const exportToExcel = async () => {
    if (waitlist.length === 0) return;
    const schema = [
      { column: 'ID', type: Number, value: (c: any) => c.id, width: 10 },
      { column: 'Registered Email', type: String, value: (c: any) => c.email, width: 30 },
      { column: 'Billing/Waitlist Email', type: String, value: (c: any) => c.billing_email || c.email, width: 30 },
      { column: 'Pseudo Name', type: String, value: (c: any) => c.pseudo_name || 'N/A', width: 20 },
      { column: 'Co-Creator', type: String, value: (c: any) => (c.is_co_creator ? 'Yes' : 'No'), width: 12 },
      { column: 'Registration Date', type: String, value: (c: any) => new Date(c.date_created).toLocaleDateString(), width: 20 },
      { column: 'Status', type: String, value: () => 'Waitlisted', width: 12 },
    ];
    await writeXlsxFile(waitlist, { schema, fileName: `Chils_Bespoke_Waitlist_${new Date().toISOString().split('T')[0]}.xlsx` });
  };

  if (loading || authLoading) return <Spinner label="Loading the waitlist…" />;

  const canAccess = user && ADMIN_EMAILS.some(e => e.toLowerCase() === user.email.toLowerCase());
  if (!canAccess) {
    return (
      <OrderPage eyebrow="Team only" title="This page is for the CHILS team" intro={user ? `You’re signed in as ${user.email}, which doesn’t have access.` : 'Sign in with a team account to see it.'}>
        <div className="px-2"><Link to={user ? '/' : '/auth'} className={btnInk}>{user ? 'Back to home' : 'Sign in'}</Link></div>
      </OrderPage>
    );
  }

  const coCreators = waitlist.filter(c => c.is_co_creator).length;

  return (
    <OrderPage
      width="max-w-[1080px]"
      eyebrow="Team · The Bespoke"
      title="Bespoke waitlist"
      intro="Everyone who asked for early access to The Bespoke, newest first."
      aside={<button onClick={exportToExcel} disabled={waitlist.length === 0} className={btnInk}><Download size={15} /> Export to Excel</button>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        {[{ v: waitlist.length, l: 'On the waitlist' }, { v: coCreators, l: 'Also co-creators' }].map(f => (
          <div key={f.l} className="bg-[#fff] rounded-2xl p-5">
            <p className="text-[26px] font-semibold tracking-[-0.02em] leading-tight">{f.v}</p>
            <p className="text-sm text-neutral-500 mt-1">{f.l}</p>
          </div>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-[#eeece6]">
          <label className="flex items-center gap-2 bg-paper rounded-full px-4 py-2.5 max-w-sm">
            <Search size={15} className="text-neutral-500" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search email or name" className="bg-transparent outline-none text-sm flex-1" />
          </label>
        </div>
        {shown.length === 0 ? (
          <p className="p-8 text-center text-neutral-500">{waitlist.length ? 'No one matches that search.' : 'No one on the waitlist yet.'}</p>
        ) : (
          <ul className="divide-y divide-[#eeece6]">
            {shown.map(c => (
              <li key={c.id} className="px-4 md:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {c.pseudo_name || c.email}
                    {c.is_co_creator && <span className="ml-2 align-middle text-[11px] bg-ink text-[#fff] rounded-full px-2 py-0.5">Co-creator</span>}
                  </p>
                  <p className="text-sm text-neutral-500 truncate">
                    {c.pseudo_name ? c.email : ''}{c.billing_email && c.billing_email !== c.email ? `${c.pseudo_name ? ' · ' : ''}waitlist: ${c.billing_email}` : ''}
                  </p>
                </div>
                <p className="text-sm text-neutral-500 shrink-0"><span className="font-mono">B-{c.id}</span> · {shortDate(c.date_created)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </OrderPage>
  );
};

export default BespokeSignals;
