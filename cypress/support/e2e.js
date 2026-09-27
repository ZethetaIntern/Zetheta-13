import './commands';

// Prevent uncaught exception from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
