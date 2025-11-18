describe('Accessibility smoke - core flows', () => {
  it('home redirects and main landmarks are accessible', () => {
    cy.visit('/')
    cy.injectAndCheckA11y('body')
  })

  it('search page is accessible', () => {
    cy.visit('/search')
    cy.injectAndCheckA11y('body')
  })

  it('anime detail is accessible', () => {
    // Use a known slug if available; fallback to route to avoid test flakiness
    cy.visit('/anime/one-piece', { failOnStatusCode: false })
    cy.injectAndCheckA11y('body')
  })

  it('signin and signup are accessible', () => {
    cy.visit('/signin', { failOnStatusCode: false })
    cy.injectAndCheckA11y('body')
    cy.visit('/signup', { failOnStatusCode: false })
    cy.injectAndCheckA11y('body')
  })
})


