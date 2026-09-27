describe('09 - Step 6 Conditional Visibility Rules', () => {
  it('skips Step 6 for Personal Loan <= 5,00,000 but inserts Step 6 for > 5,00,000', () => {
    cy.visit('/');

    // 1. Personal loan of exactly 5,00,000 (boundary test: should NOT trigger Step 6)
    cy.fillStep1({
      loanType: 'personal',
      loanAmount: 500000,
      loanTenure: 24,
      loanPurpose: 'Debt Consolidation',
    });
    cy.contains('Continue').click();

    cy.fillStep2();
    cy.contains('Continue').click();

    cy.fillStep3();
    cy.contains('Continue').click();

    cy.fillStep4();
    cy.contains('Continue').click();

    cy.fillStep5Salaried();
    cy.contains('Continue').click();

    // Directly jumps to Step 7 (Step 6 skipped)
    cy.contains('Document Upload & E-Signature').should('be.visible');

    // 2. Navigate back to Step 1 and increase loan amount to 6,00,000 (> 5L)
    cy.contains('Previous').click(); // to Step 5
    cy.contains('Previous').click(); // to Step 4
    cy.contains('Previous').click(); // to Step 3
    cy.contains('Previous').click(); // to Step 2
    cy.contains('Previous').click(); // to Step 1

    cy.get('#loanAmount').clear().type('600000');
    cy.contains('Continue').click(); // to Step 2
    cy.contains('Continue').click(); // to Step 3
    cy.contains('Continue').click(); // to Step 4
    cy.contains('Continue').click(); // to Step 5
    cy.contains('Continue').click(); // to Step 6!

    // Step 6 Co-Applicant should now be active and visible!
    cy.contains('Co-Applicant & Guarantor Details').should('be.visible');
    cy.contains('Personal loans exceeding ₹ 5,00,000').should('be.visible');
  });
});
