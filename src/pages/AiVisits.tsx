import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bot, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface CatalogBot { name: string; company: string; purpose: 'search' | 'assistant' | 'training'; note: string }
interface Visit { t: string; bot: string; path: string; status: number }
interface Data {
  since: string;
  now: string;
  total: number;
  bots: Record<string, { count: number; first: string; last: string; blocked: number }>;
  days: Record<string, Record<string, number>>;
  paths: Record<string, Record<string, number>>;
  recent: Visit[];
  catalog: CatalogBot[];
}

const ADMIN_EMAILS = ['chilsandco@gmail.com', 'chilsandco.com@gmail.com'];

const PURPOSE_LABEL: Record<CatalogBot['purpose'], string> = {
  search: 'AI search',
  assistant: 'Opened for a user',
  training: 'Model training',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const ago = (iso: string, now: string) => {
  const mins = Math.round((new Date(now).getTime() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 0)} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
};

const AiVisits: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [botFilter, setBotFilter] = useState('');

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const load = async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ai-visits', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(res.status === 403 ? 'This page is for admins only.' : `Could not load the visits (${res.status}).`);
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, token]);

  const last14 = useMemo(() => {
    if (!data) return [] as { day: string; total: number }[];
    const out: { day: string; total: number }[] = [];
    const end = new Date(data.now);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10);
      const counts = data.days[d] || {};
      const total = botFilter ? counts[botFilter] || 0 : (Object.values(counts) as number[]).reduce((a, b) => a + b, 0);
      out.push({ day: d, total });
    }
    return out;
  }, [data, botFilter]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 text-center">
      <p className="text-neutral-400">This page is for admins only. <Link to="/auth" className="text-accent underline">Sign in</Link> with an admin account.</p>
    </div>
  );

  type BotTally = Data['bots'][string];
  const seen = data ? (Object.entries(data.bots) as [string, BotTally][]).sort((a, b) => b[1].count - a[1].count) : [];
  const catalogOf = (name: string) => data?.catalog.find(c => c.name === name);
  const oai = data?.bots['OAI-SearchBot'];
  const maxDay = Math.max(1, ...last14.map(d => d.total));
  const recent = (data?.recent || []).filter(v => !botFilter || v.bot === botFilter).slice(0, 60);
  const topPaths = botFilter && data?.paths[botFilter]
    ? (Object.entries(data.paths[botFilter]) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 15)
    : [];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/admin/config" className="inline-flex items-center gap-2 text-neutral-500 hover:text-accent transition-colors mb-12 uppercase text-[10px] font-bold tracking-widest">
          <ArrowLeft size={14} /> Back to admin
        </Link>

        <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Bot className="text-accent" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tighter uppercase">AI visits</h1>
              <p className="text-xs text-neutral-500 mt-1">
                ChatGPT, Claude, Perplexity and other AI bots opening chilsandco.com
                {data && <> · counting since {when(data.since)}</>}
              </p>
            </div>
          </div>
          <button onClick={load} disabled={busy} className="inline-flex items-center gap-2 border border-neutral-800 px-4 py-2 text-xs uppercase tracking-widest font-bold hover:border-accent disabled:opacity-50">
            <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && <p className="mb-8 p-4 border border-red-900 text-red-400 text-sm">{error}</p>}

        {data && (
          <>
            <div className={`mb-10 p-6 border ${oai ? (oai.blocked ? 'border-amber-700' : 'border-emerald-800') : 'border-neutral-800'} bg-neutral-950`}>
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-2">OAI-SearchBot (ChatGPT search)</p>
              {oai ? (
                <p className="text-lg">
                  Seen <b>{oai.count}</b> {oai.count === 1 ? 'time' : 'times'}, last {ago(oai.last, data.now)} ({when(oai.last)}).
                  {oai.blocked > 0
                    ? <span className="text-amber-400"> {oai.blocked} of those visits were turned away (403, 429 or 503). Check Hostinger's security settings.</span>
                    : <span className="text-emerald-400"> It is getting through.</span>}
                </p>
              ) : (
                <p className="text-lg text-neutral-300">Not seen yet. It can take days to weeks after launch for ChatGPT's crawler to visit.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-neutral-950 border border-neutral-900">
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-4">Bots seen · {data.total} visits</p>
                {seen.length === 0 && <p className="text-neutral-500 text-sm">No AI bot visits recorded yet.</p>}
                <ul className="space-y-1">
                  {seen.map(([name, b]) => {
                    const c = catalogOf(name);
                    return (
                      <li key={name}>
                        <button
                          onClick={() => setBotFilter(botFilter === name ? '' : name)}
                          className={`w-full text-left flex items-baseline justify-between gap-3 px-2 py-2 hover:bg-neutral-900 ${botFilter === name ? 'bg-neutral-900 outline outline-1 outline-accent' : ''}`}
                          title={c?.note}
                        >
                          <span>
                            <span className="font-bold">{name}</span>
                            <span className="text-neutral-500 text-xs"> · {c?.company} · {c ? PURPOSE_LABEL[c.purpose] : ''}</span>
                            {b.blocked > 0 && <span className="text-amber-400 text-xs"> · {b.blocked} turned away</span>}
                          </span>
                          <span className="font-mono text-sm tabular-nums">{b.count}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {seen.length > 0 && <p className="text-neutral-600 text-xs mt-3">Click a bot to filter the chart and the list.</p>}
              </div>

              <div className="p-6 bg-neutral-950 border border-neutral-900">
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-4">
                  Last 14 days{botFilter ? ` · ${botFilter}` : ''}
                </p>
                <div className="flex items-end gap-1 h-40" role="img" aria-label="Visits per day for the last 14 days">
                  {last14.map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.day}: ${d.total}`}>
                      <span className="text-[9px] text-neutral-500 mb-1 tabular-nums">{d.total || ''}</span>
                      <div className="w-full bg-accent rounded-t-sm" style={{ height: `${(d.total / maxDay) * 100}%`, minHeight: d.total ? 2 : 0 }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-neutral-600 mt-2">
                  <span>{last14[0]?.day.slice(5)}</span><span>today</span>
                </div>
              </div>
            </div>

            {topPaths.length > 0 && (
              <div className="mb-10 p-6 bg-neutral-950 border border-neutral-900">
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-4">Pages {botFilter} opened most</p>
                <ul className="space-y-1 text-sm">
                  {topPaths.map(([p, n]) => (
                    <li key={p} className="flex justify-between gap-4"><span className="font-mono truncate">{p}</span><span className="tabular-nums">{n}</span></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-6 bg-neutral-950 border border-neutral-900">
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-4">Latest visits{botFilter ? ` · ${botFilter}` : ''}</p>
              {recent.length === 0 ? <p className="text-neutral-500 text-sm">Nothing yet.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500 text-xs">
                        <th className="py-2 pr-4 font-normal">When</th>
                        <th className="py-2 pr-4 font-normal">Bot</th>
                        <th className="py-2 pr-4 font-normal">Page</th>
                        <th className="py-2 font-normal text-right">Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((v, i) => (
                        <tr key={i} className="border-t border-neutral-900">
                          <td className="py-2 pr-4 whitespace-nowrap text-neutral-400">{when(v.t)}</td>
                          <td className="py-2 pr-4 whitespace-nowrap">{v.bot}</td>
                          <td className="py-2 pr-4 font-mono truncate max-w-xs">{v.path}</td>
                          <td className={`py-2 text-right tabular-nums ${v.status >= 400 ? 'text-amber-400' : 'text-neutral-400'}`}>{v.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-neutral-600 text-xs mt-6">
              Bots are recognised by the name they send (their User-Agent). Anyone can pretend to be a bot, so treat the numbers as a
              good guide, not proof. Answer 200 means the page was served; 403, 429 or 503 means the bot was turned away.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AiVisits;
