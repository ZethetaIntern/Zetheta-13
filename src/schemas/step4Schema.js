import { z } from 'zod';

export const getStep4Schema = () => {
  return z
    .object({
      addressLine1: z
        .string()
        .min(5, 'Address line 1 must be at least 5 characters')
        .max(200, 'Address line 1 cannot exceed 200 characters'),
      addressLine2: z.string().optional(),
      pinCode: z
        .string()
        .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      residenceType: z.enum(
        ['Owned', 'Rented', 'Company Provided', 'Living with Family'],
        { required_error: 'Please select residence type' }
      ),
      monthlyRent: z.union([z.number(), z.string()]).optional(),
      yearsAtCurrentAddress: z
        .number({ invalid_type_error: 'Please enter years at current address' })
        .min(0, 'Years cannot be negative')
        .max(50, 'Years cannot exceed 50'),
      // Previous address fields (conditional if years < 1)
      prevAddressLine1: z.string().optional(),
      prevPinCode: z.string().optional(),
      prevCity: z.string().optional(),
      prevState: z.string().optional(),
      // Permanent address toggle
      sameAsPermanent: z.boolean().default(true),
      // Permanent address fields (conditional if sameAsPermanent is false)
      permanentAddressLine1: z.string().optional(),
      permanentAddressLine2: z.string().optional(),
      permanentPinCode: z.string().optional(),
      permanentCity: z.string().optional(),
      permanentState: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // 1. If residence is Rented, monthly rent is mandatory
      if (data.residenceType === 'Rented') {
        const rentNum = Number(data.monthlyRent);
        if (!data.monthlyRent || isNaN(rentNum) || rentNum <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['monthlyRent'],
            message: 'Monthly rent amount is required for rented residence',
          });
        }
      }

      // 2. If years at current address < 1, previous address is mandatory
      if (data.yearsAtCurrentAddress < 1) {
        if (!data.prevAddressLine1 || data.prevAddressLine1.trim().length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevAddressLine1'],
            message: 'Previous address is required when living at current address for less than 1 year (min 5 chars)',
          });
        }
        if (!data.prevPinCode || !/^\d{6}$/.test(data.prevPinCode.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevPinCode'],
            message: 'Valid 6-digit PIN code is required for previous address',
          });
        }
        if (!data.prevCity || data.prevCity.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevCity'],
            message: 'City is required for previous address',
          });
        }
        if (!data.prevState || data.prevState.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['prevState'],
            message: 'State is required for previous address',
          });
        }
      }

      // 3. If sameAsPermanent is false, permanent address fields are mandatory
      if (!data.sameAsPermanent) {
        if (!data.permanentAddressLine1 || data.permanentAddressLine1.trim().length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentAddressLine1'],
            message: 'Permanent address line 1 is required (min 5 chars)',
          });
        }
        if (!data.permanentPinCode || !/^\d{6}$/.test(data.permanentPinCode.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentPinCode'],
            message: 'Valid 6-digit PIN code is required for permanent address',
          });
        }
        if (!data.permanentCity || data.permanentCity.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentCity'],
            message: 'Permanent city is required',
          });
        }
        if (!data.permanentState || data.permanentState.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['permanentState'],
            message: 'Permanent state is required',
          });
        }
      }
    });
};
