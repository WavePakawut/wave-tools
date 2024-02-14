import { useState, useEffect, Dispatch } from "react";

function getStorageValue(key: string, defaultValue: string) {
  // getting stored value
  if (typeof window === "undefined") return defaultValue;
  const saved = localStorage.getItem(key);
  if (!saved) return defaultValue;
  const initial = JSON.parse(saved);
  return initial || defaultValue;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: any
): [T, Dispatch<T>] {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
