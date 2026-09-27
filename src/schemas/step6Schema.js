import { z } from 'zod';
import { validatePAN } from '../utils/validators';

/**
 * Determines whether Step 6 (Co-Applicant & Guarantor) is active:
 * - Personal Loan: loanAmount > 5,00,000 (strictly greater)
 * - Home Loan: Always active
 * - Business Loan: loanAmount > 20,00,000 (strictly greater)
 */
export function isStep6Required(loanType, loanAmount) {
  const type = (loanType || 'personal').toLowerCase();
  const amt = Number(loanAmount) || 0;

  if (type === 'home') return true;
  if (type === 'personal') return amt > 500000;
  if (type === 'business') return amt > 2000000;
  return false;
}

export const getStep6Schema = (allFormData = {}) => {
  const required = isStep6Required(allFormData.loanType, allFormData.loanAmount);

  // If Step 6 is not required, schema can be empty or passthrough
  if (!required) {
    return z.object({}).passthrough();
  }

  return z
    .object({
      coApplicantName: z
        .string()
        .min(2, "Co-applicant's name must be at least 2 characters")
        .max(100, "Co-applicant's name cannot exceed 100 characters")
        .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and periods'),
      coApplicantRelationship: z.enum(
        ['Spouse', 'Parent', 'Sibling', 'Business Partner'],
        { required_error: 'Please select relationship with primary applicant' }
      ),
      coApplicantPAN: z
        .string()
        .min(1, "Co-applicant's PAN is required")
        .superRefine((val, ctx) => {
          const res = validatePAN(val, 'personal'); // Co-applicant is an individual
          if (!res.valid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: res.message,
            });
          }
        }),
      coApplicantPanVerified: z.boolean().refine((val) => val === true, {
        message: "Co-applicant's PAN must be verified",
      }),
      coApplicantIncome: z
        .number({ invalid_type_error: "Co-applicant's monthly income is required" })
        .min(10000, 'Minimum monthly income must be ₹ 10,000'),
      coApplicantConsent: z.boolean().refine((val) => val === true, {
        message: 'Co-applicant must provide explicit consent for credit verification',
      }),
      coApplicantSignature: z
        .string()
        .min(1, "Co-applicant's digital signature is mandatory"),
    });
};
