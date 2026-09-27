describe('08 - Step 5 Employment Switching & Data Isolation', () => {
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
  });

  it('switches between employment sub-forms and clears obsolete fields without leaks', () => {
    // 1. Initially Salaried: Fill company name
    cy.get('#companyName').type('Tata Consultancy Services (TCS)');
    cy.get('#designation').type('Software Engineer');

    // 2. Switch to Self-Employed: Company fields should unmount, profession fields appear
    cy.get('input[name="employmentType"][value="self_employed"]').check({ force: true });
    cy.contains('Self-Employed Professional Details').should('be.visible');
    cy.get('#companyName').should('not.exist');
    cy.get('#businessName').should('be.visible');

    // 3. Switch to Business Owner: GST field appears
    cy.get('input[name="employmentType"][value="business_owner"]').check({ force: true });
    cy.contains('Enterprise & Business Details').should('be.visible');
    cy.get('#gstNumber').should('be.visible');

    // 4. Switch back to Salaried: Verify company name was reset and is empty (no stale leaks)
    cy.get('input[name="employmentType"][value="salaried"]').check({ force: true });
    cy.get('#companyName').should('have.value', '');
  });
});
