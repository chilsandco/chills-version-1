import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Snowflake from './Snowflake';

/** Between pages: a turning snowflake instead of a blank screen. Waits a moment so quick loads don't flash it. */
const PageLoader: React.FC = () => {
  const still = useReducedMotion();
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), 180); return () => clearTimeout(t); }, []);
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      {shown && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={still ? { opacity: 0.5 } : { opacity: [0.35, 0.8, 0.35], rotate: 360 }}
          transition={still ? { duration: 0.3 } : { opacity: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 2.4, repeat: Infinity, ease: 'linear' } }}
          className="inline-flex text-ink"
        >
          <Snowflake className="w-7 h-8" />
        </motion.span>
      )}
    </div>
  );
};

export default PageLoader;
