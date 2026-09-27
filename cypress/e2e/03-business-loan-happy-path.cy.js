describe('03 - Business Loan Happy Path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('completes business loan flow with Company PAN, GST verification, and business docs', () => {
    // Step 1: Business Loan Selection (> 20L triggers Step 6)
    cy.fillStep1({
      loanType: 'business',
      loanAmount: 2500000,
      loanTenure: 36,
      loanPurpose: 'Working Capital Requirement',
    });
    cy.contains('Continue').click();

    // Step 2: Personal Info
    cy.fillStep2({
      fullName: 'Vikram Malhotra',
      email: 'vikram@malhotratech.com',
      mobileNumber: '9988776655',
    });
    cy.contains('Continue').click();

    // Step 3: Identity & KYC with Company PAN (4th character 'C')
    cy.fillStep3({
      panNumber: 'ABCCE1234F',
    });
    cy.contains('Continue').click();

    // Step 4: Address
    cy.fillStep4({
      addressLine1: 'Unit 501, Business Park, Andheri East',
      pinCode: '400069',
      residenceType: 'Owned',
      yearsAtCurrentAddress: 4,
    });
    cy.contains('Continue').click();

    // Step 5: Business Owner Sub-Form
    cy.fillStep5Business();
    cy.contains('Continue').click();

    // Step 6: Co-Applicant / Guarantor (Triggered because Business Loan > 20L)
    cy.contains('Co-Applicant & Guarantor Details').should('be.visible');
    cy.fillStep6CoApplicant({
      coApplicantName: 'Sneha Malhotra',
      coApplicantRelationship: 'Business Partner',
      coApplicantPAN: 'AAAPP1234F',
      coApplicantIncome: 120000,
    });
    cy.contains('Continue').click();

    // Step 7: Documents (Business Registration, GST Returns, ITR)
    cy.get('#doc-aadhaarCard').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-photograph').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-bankStatements').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('#doc-itrDocuments').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('#doc-businessRegistration').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('#doc-gstReturns').selectFile('cypress/fixtures/sample.pdf', { force: true });

    cy.signPrimaryApplicant();
    cy.contains('Continue').click();

    // Step 8: Review & Consents
    cy.contains('Key Fact Statement (KFS)').should('be.visible');
    cy.contains('25,00,000').should('be.visible');
    cy.contains('Sneha Malhotra').should('be.visible');

    cy.get('#consentAccuracy').check({ force: true });
    cy.get('#consentCreditBureau').check({ force: true });
    cy.get('#consentTerms').check({ force: true });
    cy.get('#consentCommunication').check({ force: true });

    cy.contains('Submit Loan Application').click();
    cy.contains('Sanction In-Principle Approved!').should('be.visible');
  });
});
