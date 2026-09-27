import { z } from 'zod';
import { validatePAN, validateAadhaar } from '../utils/validators';

export const getStep3Schema = (allFormData = {}) => {
  const loanType = allFormData.loanType || 'personal';
  const isHighValueHomeLoan =
    loanType === 'home' && Number(allFormData.loanAmount || 0) > 5000000;

  return z
    .object({
      panNumber: z
        .string()
        .min(1, 'PAN number is required')
        .superRefine((val, ctx) => {
          if (!val || val.trim().length === 0) return;
          const res = validatePAN(val, loanType);
          if (!res.valid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: res.message,
            });
          }
        }),
      aadhaarNumber: z
        .string()
        .min(1, 'Aadhaar number is required')
        .superRefine((val, ctx) => {
          if (!val || val.trim().length === 0) return;
          const res = validateAadhaar(val);
          if (!res.valid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: res.message,
            });
          }
        }),
      aadhaarConsent: z.boolean().refine((val) => val === true, {
        message: 'Explicit consent for Aadhaar e-KYC verification is mandatory',
      }),
      voterId: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^[A-Z]{3}\d{7}$/.test(val.trim().toUpperCase()),
          'Voter ID must be 3 letters followed by 7 digits (e.g. ABC1234567)'
        ),
      passport: z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val) return !isHighValueHomeLoan; // required if home loan > 50L
            return /^[A-Z]{1}\d{7}$/.test(val.trim().toUpperCase());
          },
          isHighValueHomeLoan
            ? 'Passport is mandatory for Home Loans exceeding ₹ 50 Lakh (1 letter + 7 digits)'
            : 'Passport must be 1 letter followed by 7 digits (e.g. A1234567)'
        ),
      panVerified: z.boolean().refine((val) => val === true, {
        message: 'PAN verification must be completed successfully to proceed',
      }),
      aadhaarVerified: z.boolean().refine((val) => val === true, {
        message: 'Aadhaar verification must be completed successfully to proceed',
      }),
    });
};
