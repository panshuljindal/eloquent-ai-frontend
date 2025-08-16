import { useEffect, useState } from 'react';
import { getFromLocalStorage, setInLocalStorage } from '../utils/storage';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => getFromLocalStorage<T>(key, initial));
  useEffect(() => {
    setInLocalStorage(key, value);
  }, [key, value]);
  
  useEffect(() => {
    function onCustom(e: Event) {
      const ce = e as CustomEvent<{ key: string }>;
      if (ce.detail?.key === key) {
        setValue(getFromLocalStorage<T>(key, initial));
      }
    }
    function onStorage(ev: StorageEvent) {
      if (ev.key === key) {
        setValue(getFromLocalStorage<T>(key, initial));
      }
    }
    window.addEventListener('local-storage', onCustom as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('local-storage', onCustom as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, [key, initial]);
  return [value, setValue] as const;
}
