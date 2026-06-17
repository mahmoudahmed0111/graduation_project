import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

/** Route enter/exit transitions — a faithful port of the Real Estate CRM's
 *  AppLayout motion: each navigation fades + slides the page in (and the old
 *  page out) with the CRM's signature easing. `mode="wait"` finishes the exit
 *  before the next page enters, so it feels deliberate, not janky. */
export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
