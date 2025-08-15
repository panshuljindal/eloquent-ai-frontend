import { useEffect, useState } from 'react';
import { getFromLocalStorage, setInLocalStorage } from '../utils/storage';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => getFromLocalStorage<T>(key, initial));
  useEffect(() => {
    setInLocalStorage(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}
