import { z } from 'zod';
import { validateDOB } from '../utils/validators';

const nameRegex = /^[a-zA-Z\s.]+$/;

export const step2Schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .refine((val) => !val || nameRegex.test(val), 'Name can only contain letters, spaces, and periods'),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine(
        (dob) => {
          if (!dob) return true;
          const res = validateDOB(dob);
          return res.valid;
        },
        (dob) => {
          const res = validateDOB(dob);
          return { message: res.message || 'Applicant must be between 21 and 65 years old' };
        }
      ),
    gender: z
      .string()
      .min(1, 'Please select gender')
      .refine((val) => ['Male', 'Female', 'Other'].includes(val), 'Please select gender'),
    maritalStatus: z
      .string()
      .min(1, 'Please select marital status')
      .refine(
        (val) => ['Single', 'Married', 'Divorced', 'Widowed'].includes(val),
        'Please select marital status'
      ),
    fatherName: z
      .string()
      .min(2, "Father's name must be at least 2 characters")
      .max(100, "Father's name cannot exceed 100 characters")
      .refine((val) => !val || nameRegex.test(val), "Father's name can only contain letters, spaces, and periods"),
    motherName: z
      .string()
      .min(2, "Mother's name must be at least 2 characters")
      .max(100, "Mother's name cannot exceed 100 characters")
      .refine((val) => !val || nameRegex.test(val), "Mother's name can only contain letters, spaces, and periods"),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
    mobileNumber: z
      .string()
      .min(1, 'Enter valid 10-digit Indian mobile number')
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val),
        'Enter valid 10-digit Indian mobile number'
      ),
    alternateMobile: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val),
        'Alternate mobile must be a valid 10-digit number'
      ),
  })
  .superRefine((data, ctx) => {
    if (data.alternateMobile && data.alternateMobile === data.mobileNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobile'],
        message: 'Alternate mobile number must differ from primary mobile number',
      });
    }
  });
