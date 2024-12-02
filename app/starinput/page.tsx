"use client";

import { useEffect, useState } from 'react';
import StarInputClient from './StarInputClient'

// Create a custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with the initial value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Use useEffect to load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log('Error reading from localStorage:', error);
    }
  }, [key]); // Only re-run if key changes

  // Return a wrapped version of useState's setter that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

export default function StarInputPage() {
  const [experiences, setExperiences] = useLocalStorage<any[]>('starExperiences', []);

  return <StarInputClient />
}
