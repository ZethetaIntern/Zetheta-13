import { useState, useCallback } from 'react';
import { validatePAN, validateAadhaar } from '../utils/validators';

/**
 * Custom hook to simulate real-time API verification for PAN, Aadhaar, and Mobile OTP
 * Simulates 1.5-second NSDL/UIDAI latency with real format & checksum validation
 */
export function useVerification(type = 'PAN', loanType = 'personal', initialVerified = false) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(Boolean(initialVerified));
  const [error, setError] = useState(null);

  const verify = useCallback(
    async (value) => {
      if (!value) {
        setError(`${type} is required`);
        setIsVerified(false);
        return false;
      }

      // 1. Synchronous validation check first
      if (type === 'PAN') {
        const res = validatePAN(value, loanType);
        if (!res.valid) {
          setError(res.message);
          setIsVerified(false);
          return false;
        }
      } else if (type === 'Aadhaar') {
        const res = validateAadhaar(value);
        if (!res.valid) {
          setError(res.message);
          setIsVerified(false);
          return false;
        }
      } else if (type === 'OTP') {
        if (!/^\d{6}$/.test(value)) {
          setError('Enter valid 6-digit OTP');
          setIsVerified(false);
          return false;
        }
      }

      // 2. Format passed, trigger simulated 1.5s API verification call
      setIsVerifying(true);
      setError(null);

      return new Promise((resolve) => {
        setTimeout(() => {
          setIsVerifying(false);
          setIsVerified(true);
          setError(null);
          resolve(true);
        }, 1500);
      });
    },
    [type, loanType]
  );

  const reset = useCallback(() => {
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  }, []);

  return {
    isVerifying,
    isVerified,
    error,
    verify,
    reset,
    setIsVerified,
  };
}
