describe('Profile Change Request Flow', () => {
  const testEmail = 'test@test.com';
  const testPassword = 'Helloworld1';

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should login, create profile change request, and approve it', () => {
    // Step 1: Login
    cy.visit('http://localhost:3000/employee/login');

    // Wait for the login form to be visible
    cy.get('#email').should('be.visible');

    // Enter credentials
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);

    // Submit the form
    cy.get('button[type="submit"]').contains('Sign in').click();

    // Wait for navigation to dashboard
    cy.url().should('include', '/employee/dashboard', { timeout: 10000 });

    // Step 2: Navigate to Settings in sidebar
    cy.contains('Settings').click();
    cy.url().should('include', '/employee/settings');

    // Step 3: Go to New Request tab
    cy.contains('New Request').click();

    // Wait for the form to load
    cy.contains('Request Description').should('be.visible');

    // Step 4: Fill out the form - Name Change and Marital Status Change
    // Enter request description
    cy.get('input[placeholder="Enter description"]').type('Profile update request - Name and marital status change');

    // Enter reason
    cy.get('textarea[placeholder="Enter reason"]').type('Updating personal information due to life changes');

    // Check Name Change checkbox
    cy.contains('Name Change').parent().find('input[type="checkbox"]').check();

    // Fill in name fields (wait for them to appear)
    cy.get('input[placeholder="First Name"]').should('be.visible').type('John');
    cy.get('input[placeholder="Middle Name"]').type('William');
    cy.get('input[placeholder="Last Name"]').type('Smith');

    // Check Marital Status Change checkbox
    cy.contains('Marital Status Change').parent().find('input[type="checkbox"]').check();

    // Select marital status from dropdown
    cy.contains('New Marital Status').should('be.visible');
    cy.get('.MuiSelect-select').click();
    cy.get('li[data-value="MARRIED"]').click();

    // Step 5: Submit the request
    cy.contains('button', 'Submit Request').click();

    // Verify success message
    cy.contains('Request submitted successfully!').should('be.visible');

    // Step 6: Navigate to Employee Requests in sidebar
    cy.contains('Employee Requests').click();
    cy.url().should('include', '/employee/manage-requests');

    // Step 7: Wait for the table to load and click the first PENDING entry
    cy.get('table').should('be.visible');

    // Wait for loading to complete - ensure no "Loading..." text
    cy.contains('Loading...').should('not.exist');

    // Wait a bit for the table data to fully render
    cy.wait(1000);

    // Find and click the first row with PENDING status (our newly created request)
    cy.get('tbody tr').first().should('be.visible').click({ force: true });

    // Step 8: Wait for request details panel to load
    cy.contains('Request Details', { timeout: 10000 }).should('be.visible');

    // Wait for the Approve button to appear and click it
    cy.contains('button', 'Approve', { timeout: 10000 }).should('be.visible').click();

    // Verify success message
    cy.contains('Request approved successfully', { timeout: 10000 }).should('be.visible');
  });
});