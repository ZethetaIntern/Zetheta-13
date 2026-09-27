import { useEffect, useRef, useState, useCallback } from 'react';
import { encryptData } from '../utils/encryption';

const DRAFT_PREFIX = 'lendswift_draft_';

/**
 * Custom hook to auto-save application draft every 30 seconds with AES-256-GCM encryption.
 */
export function useAutoSave(formData, currentStep, interval = 30000) {
  const [lastSaved, setLastSaved] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  const saveDraft = useCallback(
    async (_manual = false) => {
      if (!formData || !formData.loanType) return;

      try {
        const payloadToEncrypt = {
          formData,
          currentStep,
          updatedAt: new Date().toISOString(),
        };

        const encryptedString = await encryptData(payloadToEncrypt);
        const storageKey = `${DRAFT_PREFIX}${formData.loanType}`;

        const metadata = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          step: currentStep,
          loanType: formData.loanType,
        };

        localStorage.setItem(storageKey, encryptedString);
        localStorage.setItem(`${storageKey}_meta`, JSON.stringify(metadata));

        const timeStr = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        if (isMountedRef.current) {
          setLastSaved(timeStr);
          setToastMessage(`Draft saved at ${timeStr}`);

          // Auto-dismiss toast after 2 seconds
          setTimeout(() => {
            if (isMountedRef.current) {
              setToastMessage(null);
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    },
    [formData, currentStep]
  );

  // Debounced auto-save on state change
  useEffect(() => {
    isMountedRef.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveDraft(false);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [formData, currentStep, interval, saveDraft]);

  return {
    lastSaved,
    toastMessage,
    saveNow: () => saveDraft(true),
  };
}
