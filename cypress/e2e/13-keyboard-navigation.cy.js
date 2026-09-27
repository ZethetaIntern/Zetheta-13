describe('13 - Keyboard-Only Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('supports Tab navigation and focus progression through inputs and buttons', () => {
    // 1. Focus on loan purpose dropdown and select via keyboard
    cy.get('#loanPurpose').focus().select('Debt Consolidation');

    // 2. Tab to Continue button and press Enter
    cy.contains('Continue').focus().type('{enter}');

    // 3. Focus automatically moves to the first input on Step 2 (fullName)
    cy.focused().should('have.id', 'fullName');
  });
});
