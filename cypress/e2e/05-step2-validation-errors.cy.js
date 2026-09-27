describe('05 - Step 2 Validation Errors', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.fillStep1({ loanPurpose: 'Debt Consolidation' });
    cy.contains('Continue').click();
  });

  it('validates empty submission and underage DOB boundaries', () => {
    // Submit empty Step 2
    cy.contains('Continue').click();

    cy.contains('Full name must be at least 2 characters').should('be.visible');
    cy.contains('Date of birth is required').should('be.visible');
    cy.contains('Please select gender').should('be.visible');
    cy.contains('Please select marital status').should('be.visible');
    cy.contains("Father's name must be at least 2 characters").should('be.visible');
    cy.contains("Mother's name must be at least 2 characters").should('be.visible');
    cy.contains('Email address is required').should('be.visible');
    cy.contains('Enter valid 10-digit Indian mobile number').should('be.visible');

    // Test underage applicant (e.g. 18 years old)
    cy.get('#dateOfBirth').type('2008-01-01');
    cy.contains('Continue').click();
    cy.contains('Applicant must be at least 21 years old').should('be.visible');

    // Test overage applicant (e.g. 70 years old)
    cy.get('#dateOfBirth').type('1950-01-01');
    cy.contains('Continue').click();
    cy.contains('Applicant age cannot exceed 65 years').should('be.visible');

    // Test alternate mobile identical to primary mobile
    cy.get('#mobileNumber').type('9876543210');
    cy.get('#alternateMobile').type('9876543210');
    cy.contains('Continue').click();
    cy.contains('Alternate mobile number must differ from primary mobile number').should('be.visible');
  });
});
