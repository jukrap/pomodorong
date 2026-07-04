import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './Toast.css';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastProps {
  toast: ToastMessage | null;
}

export function Toast({ toast }: ToastProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className={`toast toast--${toast.tone}`}
          role={toast.tone === 'error' ? 'alert' : 'status'}
          aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
          initial={
            shouldReduceMotion
              ? { opacity: 0, x: '-50%' }
              : { opacity: 0, x: '-50%', y: -8, scale: 0.98 }
          }
          animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0, x: '-50%' }
              : { opacity: 0, x: '-50%', y: -6, scale: 0.98 }
          }
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.18 }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
