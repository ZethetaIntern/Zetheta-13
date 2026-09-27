import { z } from 'zod';
import { generateLoanSummary } from '../utils/emiCalculator';

export const getStep8Schema = (allFormData = {}) => {
  const summary = generateLoanSummary(
    allFormData.loanType,
    allFormData.loanAmount,
    allFormData.loanTenure,
    allFormData.monthlyIncome,
    allFormData.coApplicantIncome
  );

  return z
    .object({
      consentAccuracy: z.boolean().refine((val) => val === true, {
        message: 'You must confirm that all details provided are true and accurate',
      }),
      consentCreditBureau: z.boolean().refine((val) => val === true, {
        message: 'Credit Bureau inquiry authorization is required by RBI norms',
      }),
      consentTerms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the Terms and Conditions',
      }),
      consentCommunication: z.boolean().refine((val) => val === true, {
        message: 'Communication consent is required for application status updates',
      }),
      riskAcknowledgement: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      // If EMI exceeds 50% of monthly income, risk acknowledgement is mandatory
      if (summary.isHighRisk && !data.riskAcknowledgement) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['riskAcknowledgement'],
          message:
            'Estimated EMI exceeds 50% of your net monthly income. Please acknowledge the financial commitment to submit.',
        });
      }
    });
};
