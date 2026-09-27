import { z } from 'zod';

export function getRequiredDocuments(loanType = 'personal', employmentType = 'salaried', panVerified = false) {
  const normalizedLoan = (loanType || 'personal').toLowerCase();
  const normalizedEmp = (employmentType || 'salaried').toLowerCase();

  const docs = [];

  // PAN Card (Mandatory unless PAN was already verified in Step 3)
  docs.push({
    id: 'panCard',
    name: 'PAN Card Copy',
    required: !panVerified,
    optionalNote: panVerified ? 'Waived (PAN verified online in KYC step)' : null,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    description: 'Front copy of your PAN card.',
  });

  // Aadhaar Card
  docs.push({
    id: 'aadhaarCard',
    name: 'Aadhaar Card (Front & Back)',
    required: true,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 2,
    description: 'Both front and back copies of Aadhaar card.',
  });

  // Photograph
  docs.push({
    id: 'photograph',
    name: 'Passport Size Photograph',
    required: true,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxSize: 2 * 1024 * 1024,
    maxFiles: 1,
    description: 'Recent clear color passport-size photo.',
  });

  // Bank Statements (All loan types)
  docs.push({
    id: 'bankStatements',
    name: 'Bank Statements (Last 6 Months)',
    required: true,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 3,
    description: 'Latest 6 months bank account statements in PDF format.',
  });

  // Salary Slips (Salaried only)
  if (normalizedEmp === 'salaried') {
    docs.push({
      id: 'salarySlips',
      name: 'Salary Slips (Last 3 Months)',
      required: true,
      accept: { 'application/pdf': ['.pdf'] },
      maxSize: 5 * 1024 * 1024,
      maxFiles: 3,
      description: 'Recent 3 months salary slips provided by employer.',
    });
  }

  // ITR Documents (Self-Employed and Business Owner)
  if (normalizedEmp === 'self_employed' || normalizedEmp === 'business_owner') {
    docs.push({
      id: 'itrDocuments',
      name: 'Income Tax Returns (Last 2 Years)',
      required: true,
      accept: { 'application/pdf': ['.pdf'] },
      maxSize: 5 * 1024 * 1024,
      maxFiles: 2,
      description: 'ITR-V and computation of income for past 2 assessment years.',
    });
  }

  // Property Documents (Home Loan only)
  if (normalizedLoan === 'home') {
    docs.push({
      id: 'propertyDocs',
      name: 'Property Title / Allotment Documents',
      required: true,
      accept: { 'application/pdf': ['.pdf'] },
      maxSize: 10 * 1024 * 1024,
      maxFiles: 3,
      description: 'Sale agreement, title deed, or builder allotment letter.',
    });
  }

  // Business Registration & GST Returns (Business Loan only)
  if (normalizedLoan === 'business') {
    docs.push({
      id: 'businessRegistration',
      name: 'Business Registration Certificate',
      required: true,
      accept: { 'application/pdf': ['.pdf'] },
      maxSize: 5 * 1024 * 1024,
      maxFiles: 1,
      description: 'Certificate of Incorporation, MSME/Udyam, or Partnership Deed.',
    });

    docs.push({
      id: 'gstReturns',
      name: 'GST Returns (Last 4 Quarters)',
      required: true,
      accept: { 'application/pdf': ['.pdf'] },
      maxSize: 5 * 1024 * 1024,
      maxFiles: 4,
      description: 'GSTR-3B or GSTR-1 filed returns for the last 4 quarters.',
    });
  }

  return docs;
}

export const getStep7Schema = (allFormData = {}) => {
  const panVerified = !!allFormData.panVerified;
  const docs = getRequiredDocuments(allFormData.loanType, allFormData.employmentType, panVerified);

  return z
    .object({
      documents: z.record(z.any()).default({}),
      signature: z
        .string({ required_error: 'Digital signature is mandatory' })
        .min(1, 'Please provide your digital signature before continuing'),
    })
    .superRefine((data, ctx) => {
      const uploadedDocs = data.documents || {};

      docs.forEach((doc) => {
        if (doc.required) {
          const files = uploadedDocs[doc.id];
          if (!files || !Array.isArray(files) || files.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['documents', doc.id],
              message: `${doc.name} is required to proceed`,
            });
          }
        }
      });
    });
};
