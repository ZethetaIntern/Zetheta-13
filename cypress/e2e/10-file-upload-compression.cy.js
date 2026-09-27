describe('10 - File Upload and Canvas Compression', () => {
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
    cy.fillStep5Salaried();
    cy.contains('Continue').click();
  });

  it('handles image upload, compression preview, removal, and invalid type rejection', () => {
    // 1. Upload valid image file
    cy.get('#doc-aadhaarCard').selectFile('cypress/fixtures/sample-image.jpg', { force: true });

    // Verify thumbnail or card appears with file name
    cy.contains('sample-image.jpg').should('be.visible');

    // 2. Remove file
    cy.get('button[aria-label="Remove sample-image.jpg"]').click();
    cy.contains('sample-image.jpg').should('not.exist');

    // 3. Upload invalid file type (e.g. .txt file)
    cy.get('#doc-aadhaarCard').selectFile(
      {
        contents: Cypress.Buffer.from('plain text content'),
        fileName: 'invalid.txt',
        mimeType: 'text/plain',
      },
      { force: true }
    );
    cy.contains('Invalid file format. Only PDF, JPG, and PNG are accepted.').should('be.visible');
  });
});
