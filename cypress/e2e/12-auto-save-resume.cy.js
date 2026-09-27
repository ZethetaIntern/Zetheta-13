describe('12 - Auto-Save and Resume Functionality', () => {
  it('encrypts form draft and allows resuming or starting fresh upon reload', () => {
    cy.visit('/');

    // 1. Fill Step 1
    cy.fillStep1({
      loanType: 'personal',
      loanAmount: 450000,
      loanTenure: 36,
      loanPurpose: 'Debt Consolidation',
    });
    cy.contains('Continue').click();

    // 2. Fill Step 2
    cy.get('#fullName').type('Rajesh Kumar Sharma');
    cy.get('#dateOfBirth').type('1994-05-15');

    // 3. Click Save Draft to save immediately
    cy.contains('Save Draft').click();
    cy.contains('Draft saved').should('be.visible');

    // 4. Reload the page
    cy.reload();

    // 5. Resume Modal should pop up
    cy.contains('Resume Previous Application?').should('be.visible');
    cy.contains('Personal Loan').should('be.visible');

    // 6. Click Resume Application
    cy.contains('Resume Application').click();

    // 7. Verify restored values
    cy.get('#fullName').should('have.value', 'Rajesh Kumar Sharma');
    cy.get('#dateOfBirth').should('have.value', '1994-05-15');
  });
});
