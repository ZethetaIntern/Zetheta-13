describe('06 - Step 3 KYC Validation & Verhoeff Algorithm', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.fillStep1({ loanPurpose: 'Debt Consolidation' });
    cy.contains('Continue').click();
    cy.fillStep2();
    cy.contains('Continue').click();
  });

  it('validates PAN 4th character entity rule and Aadhaar Verhoeff checksum', () => {
    // 1. Submit empty Step 3
    cy.contains('Continue').click();
    cy.contains('PAN number is required').should('be.visible');
    cy.contains('Aadhaar number is required').should('be.visible');
    cy.contains('Explicit consent for Aadhaar e-KYC verification is mandatory').should('be.visible');

    // 2. Test Invalid PAN 4th character (e.g. ABCDE1234F where 4th char is D)
    cy.get('#panNumber').type('ABCDE1234F').blur();
    cy.contains('PAN 4th character must indicate entity type').should('be.visible');

    // 3. Test Invalid Aadhaar (e.g. 12 identical digits failing Verhoeff checksum)
    cy.get('#aadhaarNumber').type('111111111111').blur();
    cy.contains('Invalid Aadhaar number (checksum failed)').should('be.visible');

    // 4. Test Valid Aadhaar with Verhoeff passing (367598342159)
    cy.get('#aadhaarNumber').clear().type('367598342159').blur();
    cy.contains('Verifying...').should('be.visible');
    cy.wait(1600);
    cy.contains('Verified').should('be.visible');
  });
});
