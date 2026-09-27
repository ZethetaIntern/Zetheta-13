import { z } from 'zod';
import { calculateAge } from '../utils/validators';

export const LOAN_LIMITS = {
  personal: { min: 50000, max: 1000000, minTenure: 12, maxTenure: 60 },
  home: { min: 50000, max: 10000000, minTenure: 60, maxTenure: 360 },
  business: { min: 50000, max: 5000000, minTenure: 12, maxTenure: 120 },
};

export const LOAN_PURPOSES = {
  personal: [
    'Debt Consolidation',
    'Home Renovation',
    'Medical Emergency',
    'Wedding & Family Function',
    'Higher Education',
    'Travel & Vacation',
    'Vehicle Purchase',
    'Other Personal Expenses',
  ],
  home: [
    'Purchase of Ready-to-Move Flat/House',
    'Purchase of Under-Construction Property',
    'Home Construction on Owned Plot',
    'Plot Purchase plus Construction',
    'Home Improvement / Extension',
  ],
  business: [
    'Working Capital Requirement',
    'Plant & Machinery Purchase',
    'Office / Factory Expansion',
    'Inventory Procurement',
    'Technology & Infrastructure Upgrade',
  ],
};

export const getStep1Schema = (allFormData = {}) => {
  return z
    .object({
      loanType: z.enum(['personal', 'home', 'business'], {
        required_error: 'Please select a loan product',
      }),
      loanAmount: z
        .number({ invalid_type_error: 'Please enter a valid loan amount' })
        .min(50000, 'Minimum loan amount is ₹ 50,000'),
      loanTenure: z
        .number({ invalid_type_error: 'Please select loan tenure' })
        .min(12, 'Minimum tenure is 12 months'),
      loanPurpose: z
        .string()
        .min(1, 'Please select a loan purpose'),
      referralCode: z
        .string()
        .optional()
        .refine(
          (val) => !val || /^[a-zA-Z0-9]{6,10}$/.test(val),
          'Referral code must be 6 to 10 alphanumeric characters'
        ),
    })
    .superRefine((data, ctx) => {
      const limits = LOAN_LIMITS[data.loanType];
      if (limits) {
        // Max Amount Check
        if (data.loanAmount > limits.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanAmount'],
            message: `Maximum amount for ${data.loanType} loan is ₹ ${new Intl.NumberFormat('en-IN').format(
              limits.max
            )}`,
          });
        }

        // Base Tenure Limits Check
        if (data.loanTenure < limits.minTenure || data.loanTenure > limits.maxTenure) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanTenure'],
            message: `Tenure for ${data.loanType} loan must be between ${limits.minTenure} and ${limits.maxTenure} months`,
          });
        }
      }

      // Cross-step dependency: Age + tenure <= 65 years
      if (allFormData.dateOfBirth) {
        const age = calculateAge(allFormData.dateOfBirth);
        if (age !== null) {
          const maxAllowedMonths = Math.max(0, (65 - age) * 12);
          if (data.loanTenure > maxAllowedMonths) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['loanTenure'],
              message: `Applicant age (${age} yrs) + tenure cannot exceed 65 years. Max allowed tenure: ${maxAllowedMonths} months.`,
            });
          }
        }
      }
    });
};
