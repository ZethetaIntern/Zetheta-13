import { z } from 'zod';
import { validateGST } from '../utils/validators';

export const getStep5Schema = (allFormData = {}) => {
  const loanType = allFormData.loanType || 'personal';

  return z
    .object({
      employmentType: z.enum(['salaried', 'self_employed', 'business_owner'], {
        required_error: 'Please select an employment type',
      }),
      // Salaried fields
      companyName: z.string().optional(),
      designation: z.string().optional(),
      monthlyIncome: z.any().optional(),
      yearsOfExperience: z.any().optional(),
      // Self-employed & Business Owner common fields
      businessName: z.string().optional(),
      businessType: z.string().optional(),
      annualTurnover: z.any().optional(),
      yearsInBusiness: z.any().optional(),
      officeAddress: z.string().optional(),
      // Business Owner specific field
      gstNumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Cross-step dependency: Business loans mandate Business Owner or Self-Employed
      if (loanType === 'business' && data.employmentType === 'salaried') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['employmentType'],
          message: 'Business Loan requires Business Owner or Self-Employed employment type',
        });
      }

      // Branch 1: Salaried
      if (data.employmentType === 'salaried') {
        if (!data.companyName || data.companyName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['companyName'],
            message: 'Company name is required (min 2 characters)',
          });
        }
        if (!data.designation || data.designation.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['designation'],
            message: 'Designation is required',
          });
        }
        const salary = Number(data.monthlyIncome);
        if (!data.monthlyIncome || isNaN(salary) || salary < 15000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['monthlyIncome'],
            message: 'Minimum monthly net salary must be ₹ 15,000',
          });
        }
        const exp = Number(data.yearsOfExperience);
        if (data.yearsOfExperience === undefined || data.yearsOfExperience === '' || isNaN(exp) || exp < 0 || exp > 50) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['yearsOfExperience'],
            message: 'Years of experience must be between 0 and 50',
          });
        }
      }

      // Branch 2: Self-Employed
      if (data.employmentType === 'self_employed') {
        if (!data.businessName || data.businessName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessName'],
            message: 'Business/Profession name is required (min 2 characters)',
          });
        }
        if (!data.businessType || data.businessType.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessType'],
            message: 'Please select business type',
          });
        }
        const turnover = Number(data.annualTurnover);
        if (!data.annualTurnover || isNaN(turnover) || turnover < 300000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['annualTurnover'],
            message: 'Minimum annual turnover is ₹ 3,00,000',
          });
        }
        const yrs = Number(data.yearsInBusiness);
        if (data.yearsInBusiness === undefined || data.yearsInBusiness === '' || isNaN(yrs) || yrs < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['yearsInBusiness'],
            message: 'Minimum 2 years in business/profession required',
          });
        }
        const inc = Number(data.monthlyIncome);
        if (!data.monthlyIncome || isNaN(inc) || inc <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['monthlyIncome'],
            message: 'Monthly income is required',
          });
        }
        if (!data.officeAddress || data.officeAddress.trim().length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['officeAddress'],
            message: 'Office or business address is required (min 5 characters)',
          });
        }
      }

      // Branch 3: Business Owner
      if (data.employmentType === 'business_owner') {
        if (!data.businessName || data.businessName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessName'],
            message: 'Business entity name is required (min 2 characters)',
          });
        }
        if (!data.businessType || data.businessType.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['businessType'],
            message: 'Please select business constitution',
          });
        }
        const turnover = Number(data.annualTurnover);
        if (!data.annualTurnover || isNaN(turnover) || turnover < 300000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['annualTurnover'],
            message: 'Minimum annual turnover is ₹ 3,00,000',
          });
        }
        const yrs = Number(data.yearsInBusiness);
        if (data.yearsInBusiness === undefined || data.yearsInBusiness === '' || isNaN(yrs) || yrs < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['yearsInBusiness'],
            message: 'Minimum 2 years of business vintage required',
          });
        }
        const gstCheck = validateGST(data.gstNumber);
        if (!gstCheck.valid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['gstNumber'],
            message: gstCheck.message,
          });
        }
        if (!data.officeAddress || data.officeAddress.trim().length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['officeAddress'],
            message: 'Registered business address is required (min 5 characters)',
          });
        }
      }
    });
};
