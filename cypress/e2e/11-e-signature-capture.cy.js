describe('11 - E-Signature Capture and Validation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.fillStep1({ loanPurpose: 'Debt Consolidation' });
    cy.contains('Continue').click();
    cy.fillStep2();
    cy.contains('Continue').click();
    cy.fillStep3();
    cy.contains('Continue').click();
    cy.fillStep4();
    cy.contains('Continue').click();
    cy.fillStep5Salaried();
    cy.contains('Continue').click();

    // Upload required docs to allow step advancement
    cy.get('#doc-aadhaarCard').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-photograph').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-bankStatements').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('#doc-salarySlips').selectFile('cypress/fixtures/sample.pdf', { force: true });
  });

  it('validates signature canvas drawing, clearing, and preview in Step 8', () => {
    // 1. Attempt to proceed without signature
    cy.contains('Continue').click();
    cy.contains('Please provide your digital signature before continuing').should('be.visible');

    // 2. Draw signature on canvas
    cy.signPrimaryApplicant();
    cy.contains('Signature Captured').should('be.visible');

    // 3. Clear signature
    cy.contains('Clear').click();
    cy.contains('Signature Captured').should('not.exist');

    // 4. Attempt to proceed after clearing
    cy.contains('Continue').click();
    cy.contains('Please provide your digital signature before continuing').should('be.visible');

    // 5. Draw again and proceed
    cy.signPrimaryApplicant();
    cy.contains('Continue').click();

    // 6. Verify signature preview in Step 8 Review
    cy.contains('Application Review & Final Consent').should('be.visible');
    cy.get('img[alt="Applicant Signature"]').should('be.visible');
  });
});
