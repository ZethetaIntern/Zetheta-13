/**
 * LendSwift Validation Utilities
 * Compliant with RBI guidelines and Indian tax/identity formats.
 */

// --- VERHOEFF ALGORITHM IMPLEMENTATION FOR AADHAAR ---
// Multiplication table d
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Permutation table p
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

// Inverse table inv
export const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates 12-digit Aadhaar number using Verhoeff checksum algorithm.
 * Checksum of entire 12-digit number should equal 0.
 */
export function validateAadhaar(aadhaar) {
  if (!aadhaar) return { valid: false, message: 'Aadhaar number is required' };
  const clean = String(aadhaar).replace(/\s+/g, '');
  
  if (!/^\d{12}$/.test(clean)) {
    return { valid: false, message: 'Aadhaar must be exactly 12 digits' };
  }

  let c = 0;
  const reversedArray = clean.split('').reverse().map(Number);

  for (let i = 0; i < reversedArray.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][reversedArray[i]]];
  }

  if (c !== 0) {
    return { valid: false, message: 'Invalid Aadhaar number (checksum failed)' };
  }

  return { valid: true, message: '' };
}

/**
 * Validates Indian PAN card format: AAAAA9999A
 * Validates 4th character entity type according to loan category:
 * - Personal / Home loans: only 'P' (Individual)
 * - Business loans: 'P', 'C' (Company), or 'F' (Firm)
 */
export function validatePAN(pan, loanType = 'personal') {
  if (!pan) return { valid: false, message: 'PAN is required' };
  const cleanPan = pan.trim().toUpperCase();

  if (cleanPan.length !== 10) {
    return { valid: false, message: 'PAN must be exactly 10 characters in format AAAAA9999A' };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleanPan)) {
    return { valid: false, message: 'Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)' };
  }

  const fourthChar = cleanPan[3];
  const validEntityChars = ['P', 'C', 'H', 'A', 'B', 'G', 'J', 'L', 'F', 'T'];

  if (!validEntityChars.includes(fourthChar)) {
    return {
      valid: false,
      message: 'PAN 4th character must indicate entity type (P for Individual, C for Company, etc.)',
    };
  }

  const normalizedType = (loanType || 'personal').toLowerCase();
  if (normalizedType === 'personal' || normalizedType === 'home') {
    if (fourthChar !== 'P') {
      return {
        valid: false,
        message: 'Personal & Home loans require an Individual PAN (4th character must be P)',
      };
    }
  } else if (normalizedType === 'business') {
    if (!['P', 'C', 'F'].includes(fourthChar)) {
      return {
        valid: false,
        message: 'Business loans require Individual (P), Company (C), or Firm (F) PAN',
      };
    }
  }

  return { valid: true, message: '', pan: cleanPan };
}

/**
 * Validates 15-character Indian GST Number.
 * Format: [0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}
 */
export function validateGST(gst) {
  if (!gst) return { valid: false, message: 'GST number is required for business entities' };
  const clean = gst.trim().toUpperCase();

  if (clean.length !== 15) {
    return { valid: false, message: 'GSTIN must be exactly 15 characters' };
  }

  const stateCode = parseInt(clean.substring(0, 2), 10);
  if (isNaN(stateCode) || stateCode < 1 || stateCode > 38) {
    return { valid: false, message: 'First 2 digits must be a valid Indian state code (01-38)' };
  }

  const panPart = clean.substring(2, 12);
  const panCheck = validatePAN(panPart, 'business');
  if (!panCheck.valid) {
    return { valid: false, message: 'Characters 3 to 12 must be a valid business PAN' };
  }

  if (clean[13] !== 'Z') {
    return { valid: false, message: '14th character of GSTIN must be "Z"' };
  }

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(clean)) {
    return { valid: false, message: 'Invalid GSTIN format' };
  }

  return { valid: true, message: '' };
}

/**
 * Validates Applicant Age from Date of Birth.
 * Range: 21 to 65 years.
 * Exactly 21 years old today is valid; 20 years and 364 days is rejected.
 */
export function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function validateDOB(dobString) {
  if (!dobString) return { valid: false, message: 'Date of birth is required' };
  const age = calculateAge(dobString);
  
  if (age === null) return { valid: false, message: 'Invalid date format' };
  
  if (age < 21) {
    return { valid: false, message: 'Applicant must be at least 21 years old', age };
  }
  if (age > 65) {
    return { valid: false, message: 'Applicant age cannot exceed 65 years', age };
  }

  return { valid: true, message: '', age };
}

/**
 * Computes maximum allowable loan tenure based on DOB.
 * Age + tenure (in years) must not exceed 65 years.
 */
export function getMaxTenureForAge(dobString, baseMaxTenureMonths) {
  const age = calculateAge(dobString);
  if (age === null) return baseMaxTenureMonths;
  
  const remainingYears = Math.max(0, 65 - age);
  const maxMonths = remainingYears * 12;
  return Math.min(baseMaxTenureMonths, maxMonths);
}
