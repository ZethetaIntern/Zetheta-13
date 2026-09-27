describe('04 - Step 1 Validation Errors', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('validates required fields, limits, and invalid inputs in Step 1', () => {
    // Attempting to continue without selecting purpose
    cy.contains('Continue').click();
    cy.contains('Please select a loan purpose').should('be.visible');

    // Test exceeding maximum loan amount for Personal Loan (Max 10L)
    cy.get('#loanAmount').clear().type('1500000');
    cy.contains('Continue').click();
    cy.contains('Maximum amount for personal loan is ₹ 10,00,000').should('be.visible');

    // Test below minimum loan amount (Min 50,000)
    cy.get('#loanAmount').clear().type('20000');
    cy.contains('Continue').click();
    cy.contains('Minimum loan amount is ₹ 50,000').should('be.visible');

    // Test invalid referral code format
    cy.get('#referralCode').type('ABC');
    cy.contains('Continue').click();
    cy.contains('Referral code must be 6 to 10 alphanumeric characters').should('be.visible');
  });
});
