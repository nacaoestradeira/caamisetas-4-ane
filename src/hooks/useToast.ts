import { useState, useCallback, useRef } from 'react';

export function useAppToast() {
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string, type = 'success', dur = 2800) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ msg, type });
    timer.current = setTimeout(() => setToast(null), dur);
  }, []);

  return { toast, showToast };
}
