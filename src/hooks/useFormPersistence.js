import { useState, useEffect, useCallback } from 'react';
import { decryptData } from '../utils/encryption';

const DRAFT_PREFIX = 'lendswift_draft_';
const TTL_HOURS = 72;

export function useFormPersistence() {
  const [savedDraft, setSavedDraft] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Check for existing drafts across loan types on initial load
  useEffect(() => {
    const loanTypes = ['personal', 'home', 'business'];
    const now = Date.now();

    for (const type of loanTypes) {
      const key = `${DRAFT_PREFIX}${type}`;
      const metaStr = localStorage.getItem(`${key}_meta`);

      if (metaStr) {
        try {
          const meta = JSON.parse(metaStr);
          const savedTime = new Date(meta.timestamp).getTime();
          const ageHours = (now - savedTime) / (1000 * 60 * 60);

          // 72-hour TTL purge
          if (ageHours > TTL_HOURS) {
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_meta`);
            continue;
          }

          // Found valid draft within TTL
          const encryptedPayload = localStorage.getItem(key);
          if (encryptedPayload) {
            setSavedDraft({
              key,
              loanType: meta.loanType,
              step: meta.step,
              timestamp: meta.timestamp,
              version: meta.version,
            });
            setShowResumeModal(true);
            break; // Show most recent active draft
          }
        } catch (e) {
          // Corrupted meta; purge
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_meta`);
        }
      }
    }
  }, []);

  const discardDraft = useCallback(() => {
    if (savedDraft) {
      localStorage.removeItem(savedDraft.key);
      localStorage.removeItem(`${savedDraft.key}_meta`);
    }
    setSavedDraft(null);
    setShowResumeModal(false);
  }, [savedDraft]);

  const resumeDraft = useCallback(async () => {
    if (!savedDraft) return null;
    try {
      const encrypted = localStorage.getItem(savedDraft.key);
      const decrypted = await decryptData(encrypted);

      if (decrypted && decrypted.formData) {
        setShowResumeModal(false);
        return {
          formData: decrypted.formData,
          step: decrypted.currentStep || 1,
        };
      }
    } catch (err) {
      console.error('Failed to decrypt saved draft:', err);
    }
    // If decryption fails (corrupted data attack defense)
    discardDraft();
    return null;
  }, [savedDraft, discardDraft]);

  const clearCurrentDraft = useCallback((loanType) => {
    if (!loanType) return;
    const key = `${DRAFT_PREFIX}${loanType}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_meta`);
  }, []);

  return {
    savedDraft,
    showResumeModal,
    resumeDraft,
    discardDraft,
    clearCurrentDraft,
  };
}
