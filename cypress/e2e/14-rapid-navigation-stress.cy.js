describe('14 - Rapid Navigation & Stress Test', () => {
  it('resists rapid button spamming and maintains form stability', () => {
    cy.visit('/');
    cy.fillStep1({ loanPurpose: 'Debt Consolidation' });

    // Spam click Continue 10 times rapidly
    for (let i = 0; i < 10; i++) {
      cy.contains('Continue').click({ force: true });
    }

    // Must cleanly arrive at Step 2 without crashing or skipping ahead
    cy.contains('Personal & Contact Information').should('be.visible');
    cy.get('#fullName').should('be.visible');
  });
});
