/**
 * LendSwift EMI and Financial Calculator
 * Compliant with RBI Key Fact Statement (KFS) norms.
 */

export const ANNUAL_INTEREST_RATES = {
  personal: 10.5,
  home: 8.5,
  business: 14.0,
};

/**
 * Format numbers in the Indian Numbering System (e.g. 10,50,000)
 */
export function formatINR(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  const num = Math.round(Number(value));
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format currency with Rupee symbol
 */
export function formatCurrency(value) {
  return `₹ ${formatINR(value)}`;
}

/**
 * Calculates reducing-balance monthly EMI
 * Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  const P = Number(principal);
  const n = Number(tenureMonths);
  const rate = Number(annualRate);

  if (!P || !n || P <= 0 || n <= 0) return 0;
  if (!rate || rate <= 0) return Math.round(P / n);

  const r = rate / (12 * 100);
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Calculates Processing Fee: 1% of loan amount, bounded by [2000, 25000]
 */
export function calculateProcessingFee(principal) {
  const P = Number(principal) || 0;
  const rawFee = P * 0.01;
  return Math.min(25000, Math.max(2000, Math.round(rawFee)));
}

/**
 * Generates comprehensive Pre-Approval / Key Fact Statement (KFS) breakdown
 */
export function generateLoanSummary(loanType, principal, tenureMonths, monthlyIncome = 0, coApplicantIncome = 0) {
  const type = (loanType || 'personal').toLowerCase();
  const rate = ANNUAL_INTEREST_RATES[type] || 10.5;
  const P = Number(principal) || 0;
  const n = Number(tenureMonths) || 12;

  const monthlyEMI = calculateEMI(P, rate, n);
  const totalRepayment = monthlyEMI * n;
  const totalCostOfBorrowing = Math.max(0, totalRepayment - P);
  const processingFee = calculateProcessingFee(P);
  const netDisbursal = Math.max(0, P - processingFee);

  const totalIncome = Number(monthlyIncome || 0) + Number(coApplicantIncome || 0);
  const emiRatio = totalIncome > 0 ? (monthlyEMI / totalIncome) * 100 : 0;
  const isHighRisk = emiRatio > 50;

  return {
    loanType: type,
    principal: P,
    formattedPrincipal: formatCurrency(P),
    tenureMonths: n,
    tenureYears: (n / 12).toFixed(1),
    interestRate: rate,
    monthlyEMI,
    formattedEMI: formatCurrency(monthlyEMI),
    totalCostOfBorrowing,
    formattedInterest: formatCurrency(totalCostOfBorrowing),
    processingFee,
    formattedProcessingFee: formatCurrency(processingFee),
    totalRepayment,
    formattedTotalRepayment: formatCurrency(totalRepayment),
    netDisbursal,
    formattedNetDisbursal: formatCurrency(netDisbursal),
    emiRatio: Number(emiRatio.toFixed(1)),
    isHighRisk,
  };
}
