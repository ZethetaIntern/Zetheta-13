describe('07 - Step 4 Address PIN Code Auto-Lookup', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.fillStep1({ loanPurpose: 'Debt Consolidation' });
    cy.contains('Continue').click();
    cy.fillStep2();
    cy.contains('Continue').click();
    cy.fillStep3();
    cy.contains('Continue').click();
  });

  it('auto-populates city and state upon entering 6-digit PIN code', () => {
    // 1. Enter valid PIN code (110001)
    cy.get('#pinCode').type('110001');
    cy.wait(600);

    // City and State should auto-fill
    cy.get('#city').should('have.value', 'New Delhi');
    cy.get('#state').should('have.value', 'Delhi');
    cy.contains('Located').should('be.visible');

    // 2. Select Rented residence -> Monthly Rent input activates
    cy.get('#residenceType').select('Rented');
    cy.get('#monthlyRent').should('be.visible');

    // 3. Set years at current address to 0.5 (< 1 year) -> Previous address activates
    cy.get('#yearsAtCurrentAddress').type('0.5');
    cy.contains('Previous Address (Required since current residence < 1 yr)').should('be.visible');
    cy.get('#prevAddressLine1').should('be.visible');

    // 4. Uncheck 'Same as permanent address' -> Permanent address inputs activate
    cy.get('#sameAsPermanent').uncheck({ force: true });
    cy.contains('Permanent Address').should('be.visible');
    cy.get('#permanentAddressLine1').should('be.visible');
  });
});
