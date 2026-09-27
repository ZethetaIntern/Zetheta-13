import { useState, useEffect } from 'react';
import pinData from '../utils/pinCodeData.json';

/**
 * Hook to lookup Indian PIN Code details (City, State, Post Office)
 */
export function usePinCodeLookup(pincode) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cleanPin = String(pincode || '').trim();

    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setData(null);
      setError(cleanPin.length > 0 && cleanPin.length !== 6 ? 'PIN code must be 6 digits' : null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate network lookup
    const timer = setTimeout(() => {
      const match = pinData[cleanPin];
      if (match) {
        setData(match);
        setError(null);
      } else {
        // Fallback for unlisted 6-digit pin codes
        setData(null);
        setError('PIN code not found in postal directory. Please enter city & state manually.');
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pincode]);

  return { ...data, isLoading, error };
}
