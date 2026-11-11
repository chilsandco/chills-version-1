import { useEffect, useState } from 'react';

/** True on phone-width screens. */
export function useNarrow(limit = 768) {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < limit);
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < limit);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [limit]);
  return narrow;
}
