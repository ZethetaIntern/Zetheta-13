describe('02 - Home Loan Happy Path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('completes home loan flow including mandatory Step 6 Co-Applicant and Property Docs', () => {
    // Step 1: Home Loan Selection
    cy.fillStep1({
      loanType: 'home',
      loanAmount: 4500000,
      loanTenure: 120,
      loanPurpose: 'Purchase of Ready-to-Move Flat/House',
    });
    cy.contains('Continue').click();

    // Step 2: Personal Info
    cy.fillStep2({
      fullName: 'Amit Verma',
      email: 'amit.verma@example.com',
      mobileNumber: '9811223344',
      maritalStatus: 'Married',
    });
    cy.contains('Continue').click();

    // Step 3: Identity & KYC
    cy.fillStep3();
    cy.contains('Continue').click();

    // Step 4: Address
    cy.fillStep4({
      addressLine1: 'B-12, Green Park Extension',
      pinCode: '110016',
      residenceType: 'Owned',
      yearsAtCurrentAddress: 5,
    });
    cy.contains('Continue').click();

    // Step 5: Employment
    cy.fillStep5Salaried({
      companyName: 'Infosys Limited',
      designation: 'Principal Consultant',
      monthlyIncome: 160000,
      yearsOfExperience: 10,
    });
    cy.contains('Continue').click();

    // Step 6: Co-Applicant MUST be present for Home Loan
    cy.contains('Co-Applicant & Guarantor Details').should('be.visible');
    cy.fillStep6CoApplicant({
      coApplicantName: 'Pooja Verma',
      coApplicantRelationship: 'Spouse',
      coApplicantPAN: 'AAAPP1234F',
      coApplicantIncome: 75000,
    });
    cy.contains('Continue').click();

    // Step 7: Documents (Property documents required for Home Loan)
    cy.get('#doc-aadhaarCard').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-photograph').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    cy.get('#doc-bankStatements').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('#doc-salarySlips').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('#doc-propertyDocs').selectFile('cypress/fixtures/sample.pdf', { force: true });

    cy.signPrimaryApplicant();
    cy.contains('Continue').click();

    // Step 8: Review & Consents
    cy.contains('Key Fact Statement (KFS)').should('be.visible');
    cy.contains('45,00,000').should('be.visible');
    cy.contains('Pooja Verma').should('be.visible'); // Co-applicant listed

    cy.get('#consentAccuracy').check({ force: true });
    cy.get('#consentCreditBureau').check({ force: true });
    cy.get('#consentTerms').check({ force: true });
    cy.get('#consentCommunication').check({ force: true });

    cy.contains('Submit Loan Application').click();
    cy.contains('Sanction In-Principle Approved!').should('be.visible');
  });
});
