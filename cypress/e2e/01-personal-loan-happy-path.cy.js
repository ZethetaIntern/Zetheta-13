describe('01 - Personal Loan Happy Path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('completes personal loan flow from Step 1 to Step 8 submission modal', () => {
    // Step 1: Loan Selection (₹4,00,000 <= 5L so Step 6 is skipped)
    cy.fillStep1({
      loanType: 'personal',
      loanAmount: 400000,
      loanTenure: 24,
      loanPurpose: 'Debt Consolidation',
    });
    cy.contains('Continue').click();

    // Step 2: Personal Information
    cy.fillStep2();
    cy.contains('Continue').click();

    // Step 3: Identity & KYC
    cy.fillStep3();
    cy.contains('Continue').click();

    // Step 4: Residential Address
    cy.fillStep4();
    cy.contains('Continue').click();

    // Step 5: Employment & Income
    cy.fillStep5Salaried();
    cy.contains('Continue').click();

    // Step 6 should be skipped (amount <= 500,000) -> lands on Step 7 Documents
    cy.contains('Document Upload & E-Signature').should('be.visible');

    // Step 7: Documents & Signature
    // PAN card upload is waived because PAN was verified in Step 3!
    cy.get('#doc-aadhaarCard').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-photograph').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-bankStatements').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('#doc-salarySlips').selectFile('cypress/fixtures/sample.pdf', { force: true });

    cy.signPrimaryApplicant();
    cy.contains('Continue').click();

    // Step 8: Review & Consent
    cy.contains('Key Fact Statement (KFS)').should('be.visible');
    cy.contains('Application Review & Final Consent').should('be.visible');

    // Check all 4 mandatory RBI consents
    cy.get('#consentAccuracy').check({ force: true });
    cy.get('#consentCreditBureau').check({ force: true });
    cy.get('#consentTerms').check({ force: true });
    cy.get('#consentCommunication').check({ force: true });

    // Submit Application
    cy.contains('Submit Loan Application').click();

    // Success Modal
    cy.contains('Sanction In-Principle Approved!').should('be.visible');
    cy.contains('Application Reference No:').should('be.visible');
    cy.contains('LS-2026-').should('be.visible');
  });
});
