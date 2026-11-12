import React, { useEffect, useRef, useState } from 'react';

const idle = (cb: () => void) => {
  const w = window as any;
  return w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 3000 }) : window.setTimeout(cb, 1500);
};

/** Runs after the loaded component's own effects (parents' effects run after children's),
 *  so the component is already listening when the event that woke it is sent again. */
const Replay: React.FC<{ event: Event | null; children: React.ReactNode }> = ({ event, children }) => {
  useEffect(() => {
    if (event) window.dispatchEvent(new CustomEvent(event.type, { detail: (event as CustomEvent).detail }));
  }, [event]);
  return <>{children}</>;
};

/**
 * Keeps a heavy, not-yet-needed piece of UI (bag drawer, quick view, assistant) out of the first
 * download. It loads when the page goes idle, or straight away when one of `wakeOn` is sent;
 * that event is then replayed to it, so the first click still works.
 */
export function Deferred({ load, wakeOn = [] }: { load: () => Promise<{ default: React.ComponentType }>; wakeOn?: string[] }) {
  const [on, setOn] = useState(false);
  const [first, setFirst] = useState<Event | null>(null);
  const Lazy = useRef(React.lazy(load)).current;

  useEffect(() => {
    if (on) return;
    const handle = idle(() => setOn(true));
    const wake = (e: Event) => { setFirst(e); setOn(true); };
    wakeOn.forEach(t => window.addEventListener(t, wake, { once: true }));
    return () => {
      ((window as any).cancelIdleCallback ?? clearTimeout)(handle);
      wakeOn.forEach(t => window.removeEventListener(t, wake));
    };
  }, [on]);

  if (!on) return null;
  return (
    <React.Suspense fallback={null}>
      <Replay event={first}><Lazy /></Replay>
    </React.Suspense>
  );
}
