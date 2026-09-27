// ***********************************************
// Custom Cypress Commands for LendSwift
// ***********************************************

Cypress.Commands.add('fillStep1', (options = {}) => {
  const type = options.loanType || 'personal';
  cy.get(`input[name="loanType"][value="${type}"]`).check({ force: true });
  if (options.loanAmount) {
    cy.get('#loanAmount').clear().type(String(options.loanAmount));
  }
  if (options.loanTenure) {
    cy.get('#loanTenure').select(String(options.loanTenure));
  }
  if (options.loanPurpose) {
    cy.get('#loanPurpose').select(options.loanPurpose);
  }
});

Cypress.Commands.add('fillStep2', (data = {}) => {
  cy.get('#fullName').type(data.fullName || 'Rajesh Kumar Sharma');
  cy.get('#dateOfBirth').type(data.dateOfBirth || '1994-05-15');
  cy.get(`input[name="gender"][value="${data.gender || 'Male'}"]`).check({ force: true });
  cy.get('#maritalStatus').select(data.maritalStatus || 'Married');
  cy.get('#fatherName').type(data.fatherName || 'Suresh Chandra Sharma');
  cy.get('#motherName').type(data.motherName || 'Sunita Sharma');
  cy.get('#email').type(data.email || 'rajesh.sharma@example.com');
  cy.get('#mobileNumber').type(data.mobileNumber || '9876543210');
  if (data.alternateMobile) {
    cy.get('#alternateMobile').type(data.alternateMobile);
  }
});

Cypress.Commands.add('fillStep3', (data = {}) => {
  const pan = data.panNumber || 'ABCPE1234F';
  const aadhaar = data.aadhaarNumber || '367598342159';

  cy.get('#panNumber').type(pan).blur();
  // Wait for 1.5s simulated verification
  cy.wait(1600);

  cy.get('#aadhaarNumber').type(aadhaar).blur();
  // Wait for 1.5s simulated verification
  cy.wait(1600);

  cy.get('#aadhaarConsent').check({ force: true });

  if (data.voterId) {
    cy.get('#voterId').type(data.voterId);
  }
  if (data.passport) {
    cy.get('#passport').type(data.passport);
  }
});

Cypress.Commands.add('fillStep4', (data = {}) => {
  cy.get('#addressLine1').type(data.addressLine1 || 'Flat 402, Sunshine Apartments');
  cy.get('#pinCode').type(data.pinCode || '110001');
  // Wait for PIN auto lookup
  cy.wait(500);

  cy.get('#residenceType').select(data.residenceType || 'Owned');
  cy.get('#yearsAtCurrentAddress').type(String(data.yearsAtCurrentAddress ?? 3));
});

Cypress.Commands.add('fillStep5Salaried', (data = {}) => {
  cy.get('input[name="employmentType"][value="salaried"]').check({ force: true });
  cy.get('#companyName').type(data.companyName || 'Tata Consultancy Services (TCS)');
  cy.get('#designation').type(data.designation || 'Lead System Engineer');
  cy.get('#monthlyIncome').clear().type(String(data.monthlyIncome || 85000));
  cy.get('#yearsOfExperience').type(String(data.yearsOfExperience ?? 6));
});

Cypress.Commands.add('fillStep5Business', (data = {}) => {
  cy.get('input[name="employmentType"][value="business_owner"]').check({ force: true });
  cy.get('#businessName').type(data.businessName || 'Malhotra Precision Engineering Pvt Ltd');
  cy.get('#businessType').select(data.businessType || 'Private Limited');
  cy.get('#gstNumber').type(data.gstNumber || '27ABCCE1234F1Z5');
  cy.get('#annualTurnover').clear().type(String(data.annualTurnover || 8000000));
  cy.get('#yearsInBusiness').type(String(data.yearsInBusiness ?? 5));
  cy.get('#monthlyIncome').clear().type(String(data.monthlyIncome || 250000));
  cy.get('#officeAddress').type(data.officeAddress || 'Plot 14, MIDC Industrial Area, Mumbai');
});

Cypress.Commands.add('fillStep6CoApplicant', (data = {}) => {
  cy.get('#coApplicantName').type(data.coApplicantName || 'Anjali Sharma');
  cy.get('#coApplicantRelationship').select(data.coApplicantRelationship || 'Spouse');
  cy.get('#coApplicantPAN').type(data.coApplicantPAN || 'AAAPP1234F').blur();
  cy.wait(1600);
  cy.get('#coApplicantIncome').clear().type(String(data.coApplicantIncome || 60000));
  cy.get('#coApplicantConsent').check({ force: true });

  // Draw signature on canvas
  cy.get('#coApplicantSignature')
    .trigger('mousedown', { which: 1, clientX: 100, clientY: 50 })
    .trigger('mousemove', { which: 1, clientX: 200, clientY: 80 })
    .trigger('mouseup', { force: true });
});

Cypress.Commands.add('signPrimaryApplicant', () => {
  cy.get('#primarySignature')
    .trigger('mousedown', { which: 1, clientX: 80, clientY: 40 })
    .trigger('mousemove', { which: 1, clientX: 220, clientY: 90 })
    .trigger('mouseup', { force: true });
});

Cypress.Commands.add('uploadDummyFiles', (documentIds = []) => {
  documentIds.forEach((id) => {
    cy.get(`#doc-${id}`).selectFile('cypress/fixtures/sample-image.jpg', {
      force: true,
      action: 'drag-drop',
    });
  });
});
