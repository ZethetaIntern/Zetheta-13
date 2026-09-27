describe('15 - Cross-Step Validation Dependencies', () => {
  it('updates dependent steps when source fields in Step 1 and Step 2 change', () => {
    cy.visit('/');

    // 1. Start with Personal Loan
    cy.fillStep1({ loanType: 'personal', loanAmount: 300000, loanPurpose: 'Debt Consolidation' });
    cy.contains('Continue').click();

    // 2. Fill Step 2 with Married marital status
    cy.fillStep2({ maritalStatus: 'Married' });
    cy.contains('Continue').click();

    // 3. Complete Step 3 & Step 4
    cy.fillStep3();
    cy.contains('Continue').click();
    cy.fillStep4();
    cy.contains('Continue').click();

    // 4. In Step 5, Salaried is currently allowed for Personal Loan
    cy.get('input[name="employmentType"][value="salaried"]').should('not.be.disabled');

    // 5. Navigate back to Step 1 and change Loan Type to Business Loan
    cy.contains('Previous').click(); // Step 4
    cy.contains('Previous').click(); // Step 3
    cy.contains('Previous').click(); // Step 2
    cy.contains('Previous').click(); // Step 1

    cy.get('input[name="loanType"][value="business"]').check({ force: true });
    cy.get('#loanPurpose').select('Working Capital Requirement');

    // 6. Navigate forward to Step 5 again
    cy.contains('Continue').click(); // Step 2
    cy.contains('Continue').click(); // Step 3
    cy.contains('Continue').click(); // Step 4
    cy.contains('Continue').click(); // Step 5

    // 7. Verify Cross-step dependency: Salaried is now DISABLED for Business Loan!
    cy.get('input[name="employmentType"][value="salaried"]').should('be.disabled');
    cy.contains('Business loans are restricted to registered Business Owners and Self-Employed professionals').should(
      'be.visible'
    );
  });
});
